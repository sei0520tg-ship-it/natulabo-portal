/**
 * youtube.ts
 *
 * YouTube Data API v3 から再生リストの動画一覧を取得し、`videos` テーブルへ同期する。
 *
 * なぜ「再生リスト」なのか:
 *   チャンネルのアップロード一覧（UU...）は API キー経由だと「公開」動画しか返らない。
 *   NatuLabo の動画は限定公開のため、再生リストに入れたうえで playlistItems を叩く。
 *   再生リスト経由なら限定公開の動画も一覧取得でき、埋め込み再生も可能。
 *
 * 必要な環境変数:
 *   YOUTUBE_API_KEY      … Google Cloud で発行した YouTube Data API v3 のキー
 *   YOUTUBE_PLAYLIST_ID  … 全動画を入れた再生リストの ID（PL... で始まる）
 *   YOUTUBE_DEFAULT_CATEGORY … 新規取り込み時のカテゴリ（既定: "学習動画"）
 *   YOUTUBE_LATEST_COUNT     … 「最新動画」として扱う本数（既定: 3）
 */

import { and, eq, isNotNull, inArray, notInArray } from "drizzle-orm";
import { videos } from "../drizzle/schema";
import { getDb } from "./db";

const API_BASE = "https://www.googleapis.com/youtube/v3";

export type YouTubeConfig = {
  apiKey: string;
  playlistId: string;
  defaultCategory: string;
  latestCount: number;
};

/** 環境変数から設定を読む。未設定なら null（同期はスキップされる）。 */
export function getYouTubeConfig(): YouTubeConfig | null {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID?.trim();
  if (!apiKey || !playlistId) return null;
  return {
    apiKey,
    playlistId,
    defaultCategory: process.env.YOUTUBE_DEFAULT_CATEGORY?.trim() || "学習動画",
    latestCount: Number(process.env.YOUTUBE_LATEST_COUNT) || 3,
  };
}

export type YouTubeVideo = {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date;
};

type PlaylistItemsResponse = {
  nextPageToken?: string;
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      resourceId?: { videoId?: string };
      thumbnails?: Record<string, { url?: string }>;
    };
    contentDetails?: { videoId?: string; videoPublishedAt?: string };
    status?: { privacyStatus?: string };
  }>;
};

/** 解像度の高いサムネイルから順に採用する。 */
function pickThumbnail(thumbnails?: Record<string, { url?: string }>): string {
  if (!thumbnails) return "";
  for (const key of ["maxres", "standard", "high", "medium", "default"]) {
    const url = thumbnails[key]?.url;
    if (url) return url;
  }
  return "";
}

/**
 * 再生リストの全アイテムを取得する（ページングを最後まで辿る）。
 * 削除済み・非公開（privacyStatus === "private"）の動画は会員が再生できないため除外する。
 */
export async function fetchPlaylistVideos(config: YouTubeConfig): Promise<YouTubeVideo[]> {
  const results: YouTubeVideo[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${API_BASE}/playlistItems`);
    url.searchParams.set("part", "snippet,contentDetails,status");
    url.searchParams.set("playlistId", config.playlistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", config.apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`YouTube API ${res.status}: ${body.slice(0, 500)}`);
    }
    const data = (await res.json()) as PlaylistItemsResponse;

    for (const item of data.items ?? []) {
      const videoId = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;
      if (!videoId) continue;

      // 非公開・削除済みは会員側で再生できないので取り込まない
      const privacy = item.status?.privacyStatus;
      if (privacy === "private" || privacy === "privacyStatusUnspecified") continue;

      const title = item.snippet?.title ?? "";
      if (title === "Deleted video" || title === "Private video") continue;

      const publishedRaw =
        item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt ?? null;

      results.push({
        videoId,
        title: title.slice(0, 255),
        description: item.snippet?.description ?? "",
        thumbnailUrl: pickThumbnail(item.snippet?.thumbnails),
        publishedAt: publishedRaw ? new Date(publishedRaw) : new Date(),
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return results;
}

export type SyncResult = {
  fetched: number;
  inserted: number;
  updated: number;
  linked: number;
  unpublished: number;
  syncedAt: string;
};

/**
 * 取得した動画を `videos` テーブルへ反映する。
 *
 * 上書きの方針:
 *   - タイトル / 説明 / サムネイル / URL / 公開日 … YouTube 側を正とする（毎回上書き）
 *   - カテゴリ / 公開フラグ … 管理画面での編集を尊重する（既存行は維持）
 *   - sortOrder … 新しい動画ほど小さい値（新着順で並ぶ）
 *   - isLatest … 公開日の新しい上位 N 本に自動で付け替える
 *
 * 手動登録した動画（youtubeVideoId が null）には一切触れない。
 */
export async function syncYouTubeVideos(): Promise<SyncResult> {
  const config = getYouTubeConfig();
  if (!config) {
    throw new Error(
      "YOUTUBE_API_KEY と YOUTUBE_PLAYLIST_ID が未設定です。Manus の環境変数を確認してください。"
    );
  }

  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const fetched = await fetchPlaylistVideos(config);
  // 新しい順に並べる（sortOrder と isLatest の判定に使う）
  fetched.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const now = new Date();
  const existing = await db.select().from(videos);

  // youtubeVideoId で引ける索引
  const byYoutubeId = new Map<string, (typeof existing)[number]>();
  for (const row of existing) {
    if (row.youtubeVideoId) byYoutubeId.set(row.youtubeVideoId, row);
  }

  // 初回同期用: 過去に管理画面から手で登録した YouTube 動画を videoUrl から拾って紐付ける。
  // これをやらないと同じ動画が二重に並ぶ。
  const byUrlVideoId = new Map<string, (typeof existing)[number]>();
  for (const row of existing) {
    if (row.youtubeVideoId) continue;
    const id = extractYouTubeId(row.videoUrl);
    if (id && !byUrlVideoId.has(id)) byUrlVideoId.set(id, row);
  }

  let inserted = 0;
  let updated = 0;
  let linked = 0;

  for (let i = 0; i < fetched.length; i++) {
    const video = fetched[i];
    const isLatest = i < config.latestCount;
    const common = {
      title: video.title,
      description: video.description,
      videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
      thumbnailUrl: video.thumbnailUrl || null,
      publishedAt: video.publishedAt,
      sortOrder: i,
      isLatest,
      syncedAt: now,
    };

    const alreadySynced = byYoutubeId.get(video.videoId);
    if (alreadySynced) {
      await db.update(videos).set(common).where(eq(videos.id, alreadySynced.id));
      updated++;
      continue;
    }

    const manualRow = byUrlVideoId.get(video.videoId);
    if (manualRow) {
      // 既存の手動行を YouTube 管理下に引き取る（カテゴリと公開フラグはそのまま）
      await db
        .update(videos)
        .set({ ...common, youtubeVideoId: video.videoId })
        .where(eq(videos.id, manualRow.id));
      linked++;
      continue;
    }

    await db.insert(videos).values({
      ...common,
      youtubeVideoId: video.videoId,
      category: config.defaultCategory,
      isPublished: true,
    });
    inserted++;
  }

  // 再生リストから外された動画は非表示にする（削除はしない＝視聴履歴を残すため）。
  // 対象は YouTube 管理下の行のみ。手動登録の動画は影響を受けない。
  const liveIds = fetched.map((v) => v.videoId);
  let unpublished = 0;
  if (liveIds.length > 0) {
    const stale = await db
      .select({ id: videos.id })
      .from(videos)
      .where(
        and(
          isNotNull(videos.youtubeVideoId),
          notInArray(videos.youtubeVideoId, liveIds),
          eq(videos.isPublished, true)
        )
      );
    if (stale.length > 0) {
      await db
        .update(videos)
        .set({ isPublished: false, isLatest: false, syncedAt: now })
        .where(
          inArray(
            videos.id,
            stale.map((r) => r.id)
          )
        );
      unpublished = stale.length;
    }
  }

  return {
    fetched: fetched.length,
    inserted,
    updated,
    linked,
    unpublished,
    syncedAt: now.toISOString(),
  };
}

/** YouTube の各種 URL 形式から動画 ID を取り出す。クライアント側の実装と揃えている。 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
    /youtube\.com\/shorts\/([^&?/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
