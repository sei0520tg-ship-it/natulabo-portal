/**
 * importSeed.ts
 *
 * `natulaboVideos.ts` に列挙した限定公開動画を `videos` テーブルへ一括投入する。
 * 管理画面の「YouTube動画を一括インポート」ボタンから呼ばれる。
 *
 * 何度実行しても安全（youtubeVideoId で照合する冪等な upsert）。
 */

import { eq } from "drizzle-orm";
import { videos } from "../../drizzle/schema";
import { getDb } from "../db";
import { extractYouTubeId } from "../youtube";
import { natulaboVideos } from "./natulaboVideos";

export type ImportResult = {
  seedCount: number;
  inserted: number;
  updated: number;
  linked: number;
};

/** 「最新動画」として扱う本数（ダッシュボード上部に出る） */
const LATEST_COUNT = 3;

export async function importSeedVideos(): Promise<ImportResult> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const existing = await db.select().from(videos);

  // すでに YouTube 管理下にある行
  const byYoutubeId = new Map<string, (typeof existing)[number]>();
  for (const row of existing) {
    if (row.youtubeVideoId) byYoutubeId.set(row.youtubeVideoId, row);
  }

  // 管理画面から手で登録済みの YouTube 動画。URL から照合して引き取り、二重登録を防ぐ。
  const byUrlVideoId = new Map<string, (typeof existing)[number]>();
  for (const row of existing) {
    if (row.youtubeVideoId) continue;
    const id = extractYouTubeId(row.videoUrl);
    if (id && !byUrlVideoId.has(id)) byUrlVideoId.set(id, row);
  }

  const now = new Date();
  let inserted = 0;
  let updated = 0;
  let linked = 0;

  for (let i = 0; i < natulaboVideos.length; i++) {
    const v = natulaboVideos[i];
    // タイトル・URL・サムネイル・並び順は seed を正とする。
    // カテゴリと公開フラグは管理画面での編集を尊重するため、既存行では触らない。
    const common = {
      title: v.title,
      videoUrl: `https://www.youtube.com/watch?v=${v.youtubeVideoId}`,
      // hqdefault は maxres と違い全動画で必ず存在する（限定公開でも取得可）
      thumbnailUrl: `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`,
      publishedAt: new Date(`${v.publishedAt}T00:00:00Z`),
      sortOrder: i,
      isLatest: i < LATEST_COUNT,
      syncedAt: now,
    };

    const already = byYoutubeId.get(v.youtubeVideoId);
    if (already) {
      await db.update(videos).set(common).where(eq(videos.id, already.id));
      updated++;
      continue;
    }

    const manual = byUrlVideoId.get(v.youtubeVideoId);
    if (manual) {
      await db
        .update(videos)
        .set({ ...common, youtubeVideoId: v.youtubeVideoId })
        .where(eq(videos.id, manual.id));
      linked++;
      continue;
    }

    await db.insert(videos).values({
      ...common,
      youtubeVideoId: v.youtubeVideoId,
      category: v.category,
      isPublished: true,
    });
    inserted++;
  }

  return { seedCount: natulaboVideos.length, inserted, updated, linked };
}
