import { describe, expect, it } from "vitest";
import { natulaboVideos } from "./natulaboVideos";

// 非公開のためサイトに載せられない動画。誤って混入していないことを確認する。
const PRIVATE_VIDEO_IDS = [
  "T3YtOhMmZr0", "mBsB_GFhXj8", "u0epA4I7m0o", "a4ArB7wAgb0", "UE2ExYF1xEc",
  "IWMAG_2QxWo", "CM7OHP9oZuo", "oin6KZJL2eQ", "y9TW5gmGeJU", "Xq73pYnrxvw",
  "fTKMDlTy4Hg", "seYMFJIfIi8", "LckF0G_qOzI", "bG5J7Nzxbeg", "f0SgIVnBj4c",
  "toizCGeJ3r4", "3k3KgsVXHq8", "xMrsYqlp2sU", "ZY1qiG8kN2k", "86Vpy9r4TZc",
  "T47uXyhtJvE", "lqnuMr_Z2cA", "5R1g82Focag", "pNfxPqeRoLY",
];

describe("natulaboVideos シードデータ", () => {
  it("限定公開180本を収録している", () => {
    expect(natulaboVideos).toHaveLength(180);
  });

  it("動画IDが重複していない", () => {
    const ids = natulaboVideos.map((v) => v.youtubeVideoId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("動画IDがYouTubeの11文字形式である", () => {
    for (const v of natulaboVideos) {
      expect(v.youtubeVideoId).toMatch(/^[A-Za-z0-9_-]{11}$/);
    }
  });

  it("非公開の動画を含んでいない", () => {
    const ids = new Set(natulaboVideos.map((v) => v.youtubeVideoId));
    const leaked = PRIVATE_VIDEO_IDS.filter((id) => ids.has(id));
    expect(leaked).toEqual([]);
  });

  it("タイトルとカテゴリが空でない", () => {
    for (const v of natulaboVideos) {
      expect(v.title.trim()).not.toBe("");
      expect(v.category.trim()).not.toBe("");
    }
  });

  it("公開日がYYYY-MM-DD形式で、Dateとして解釈できる", () => {
    for (const v of natulaboVideos) {
      expect(v.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(`${v.publishedAt}T00:00:00Z`).getTime())).toBe(false);
    }
  });

  it("公開日の新しい順に並んでいる（先頭が最新動画になる）", () => {
    for (let i = 1; i < natulaboVideos.length; i++) {
      expect(
        natulaboVideos[i - 1].publishedAt >= natulaboVideos[i].publishedAt
      ).toBe(true);
    }
  });
});
