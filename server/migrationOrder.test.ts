import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Drizzleのマイグレーション履歴が壊れていないかを検証する。
 *
 * 過去に、私とManusがそれぞれ採番した結果 idx=6 が重複し、
 * 適用順が不定になる状態が発生した。構造的に再発を防ぐ。
 */
describe("マイグレーション履歴の整合性", () => {
  const journal = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "drizzle/meta/_journal.json"), "utf8")
  ) as { entries: { idx: number; tag: string }[] };

  it("idx が重複していない", () => {
    const idxs = journal.entries.map((e) => e.idx);
    expect(idxs).toEqual(Array.from(new Set(idxs)));
  });

  it("idx が 0 から連番になっている", () => {
    const idxs = journal.entries.map((e) => e.idx).sort((a, b) => a - b);
    expect(idxs).toEqual(idxs.map((_, i) => i));
  });

  it("journal の各エントリに対応する .sql が存在する", () => {
    for (const e of journal.entries) {
      const file = path.resolve(process.cwd(), "drizzle", `${e.tag}.sql`);
      expect(fs.existsSync(file), `${e.tag}.sql が見つかりません`).toBe(true);
    }
  });

  it("同じカラムを二重に追加するマイグレーションがない", () => {
    // MySQL には ADD COLUMN IF NOT EXISTS が無いため、重複すると適用時に落ちる。
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const e of journal.entries) {
      const sql = fs.readFileSync(path.resolve(process.cwd(), "drizzle", `${e.tag}.sql`), "utf8");
      for (const m of sql.matchAll(/ALTER TABLE `(\w+)` ADD `(\w+)`/g)) {
        const key = `${m[1]}.${m[2]}`;
        const prev = seen.get(key);
        if (prev) dupes.push(`${key} (${prev} と ${e.tag})`);
        else seen.set(key, e.tag);
      }
    }
    expect(dupes).toEqual([]);
  });
});
