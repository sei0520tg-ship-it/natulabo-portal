import { afterEach, describe, expect, it, vi } from "vitest";
import { extractYouTubeId, fetchPlaylistVideos, getYouTubeConfig } from "./youtube";

const config = {
  apiKey: "test-key",
  playlistId: "PLtest",
  defaultCategory: "学習動画",
  latestCount: 3,
};

function playlistItem(overrides: Record<string, unknown> = {}) {
  return {
    snippet: {
      title: "テスト動画",
      description: "説明",
      publishedAt: "2026-01-01T00:00:00Z",
      resourceId: { videoId: "abcdefghijk" },
      thumbnails: {
        default: { url: "https://i.ytimg.com/default.jpg" },
        maxres: { url: "https://i.ytimg.com/maxres.jpg" },
      },
    },
    contentDetails: { videoId: "abcdefghijk", videoPublishedAt: "2026-01-02T00:00:00Z" },
    status: { privacyStatus: "unlisted" },
    ...overrides,
  };
}

function mockFetchPages(pages: Array<{ items: unknown[]; nextPageToken?: string }>) {
  const fetchMock = vi.fn();
  for (const page of pages) {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => page,
    });
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("extractYouTubeId", () => {
  it("各種URL形式から動画IDを取り出せる", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=abcdefghijk")).toBe("abcdefghijk");
    expect(extractYouTubeId("https://youtu.be/abcdefghijk")).toBe("abcdefghijk");
    expect(extractYouTubeId("https://www.youtube.com/embed/abcdefghijk")).toBe("abcdefghijk");
    expect(extractYouTubeId("https://www.youtube.com/shorts/abcdefghijk")).toBe("abcdefghijk");
  });

  it("YouTube以外のURLやnullではnullを返す", () => {
    expect(extractYouTubeId("https://drive.google.com/file/d/xyz/view")).toBeNull();
    expect(extractYouTubeId(null)).toBeNull();
    expect(extractYouTubeId("")).toBeNull();
  });
});

describe("getYouTubeConfig", () => {
  it("APIキーと再生リストIDが揃っていなければnullを返す", () => {
    vi.stubEnv("YOUTUBE_API_KEY", "");
    vi.stubEnv("YOUTUBE_PLAYLIST_ID", "");
    expect(getYouTubeConfig()).toBeNull();

    vi.stubEnv("YOUTUBE_API_KEY", "key-only");
    expect(getYouTubeConfig()).toBeNull();
  });

  it("両方揃っていれば既定値つきで設定を返す", () => {
    vi.stubEnv("YOUTUBE_API_KEY", "key");
    vi.stubEnv("YOUTUBE_PLAYLIST_ID", "PLxxx");
    vi.stubEnv("YOUTUBE_DEFAULT_CATEGORY", "");
    vi.stubEnv("YOUTUBE_LATEST_COUNT", "");
    expect(getYouTubeConfig()).toEqual({
      apiKey: "key",
      playlistId: "PLxxx",
      defaultCategory: "学習動画",
      latestCount: 3,
    });
  });
});

describe("fetchPlaylistVideos", () => {
  it("限定公開の動画を取り込み、最高解像度のサムネイルを選ぶ", async () => {
    mockFetchPages([{ items: [playlistItem()] }]);
    const videos = await fetchPlaylistVideos(config);

    expect(videos).toHaveLength(1);
    expect(videos[0].videoId).toBe("abcdefghijk");
    expect(videos[0].thumbnailUrl).toBe("https://i.ytimg.com/maxres.jpg");
    // contentDetails.videoPublishedAt を優先する
    expect(videos[0].publishedAt.toISOString()).toBe("2026-01-02T00:00:00.000Z");
  });

  it("非公開・削除済みの動画は除外する", async () => {
    mockFetchPages([
      {
        items: [
          playlistItem({ status: { privacyStatus: "private" } }),
          playlistItem({ snippet: { title: "Deleted video", resourceId: { videoId: "bbbbbbbbbbb" } } }),
          playlistItem(),
        ],
      },
    ]);
    const videos = await fetchPlaylistVideos(config);
    expect(videos).toHaveLength(1);
    expect(videos[0].title).toBe("テスト動画");
  });

  it("nextPageTokenを辿って全ページ取得する", async () => {
    const fetchMock = mockFetchPages([
      { items: [playlistItem()], nextPageToken: "page2" },
      { items: [playlistItem({ contentDetails: { videoId: "ccccccccccc" } })] },
    ]);
    const videos = await fetchPlaylistVideos(config);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(videos.map((v) => v.videoId)).toEqual(["abcdefghijk", "ccccccccccc"]);
    // 2回目のリクエストに pageToken が乗っている
    expect(String(fetchMock.mock.calls[1][0])).toContain("pageToken=page2");
  });

  it("APIがエラーを返したら例外にする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => "quotaExceeded" })
    );
    await expect(fetchPlaylistVideos(config)).rejects.toThrow(/403/);
  });
});
