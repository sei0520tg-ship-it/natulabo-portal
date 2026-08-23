#!/usr/bin/env node
/**
 * backup-db.mjs
 *
 * DBの全テーブルをJSONとCSVで丸ごと書き出す。
 * Manusに依存せず、DATABASE_URL さえあればどこからでも実行できる。
 *
 * 使い方:
 *   DATABASE_URL='mysql://user:pass@host:3306/dbname' node scripts/backup-db.mjs
 *
 * 出力先:
 *   backups/YYYY-MM-DD_HHmm/
 *     ├── users.json / users.csv
 *     ├── videos.json / videos.csv
 *     ├── ... (全テーブル)
 *     ├── _schema.sql       … CREATE TABLE 文（復元用）
 *     └── _summary.json     … 件数一覧
 *
 * 注意: backups/ は .gitignore に入れてある。個人情報を含むためコミットしないこと。
 */

import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL が未設定です。");
  console.error("   例: DATABASE_URL='mysql://user:pass@host:3306/db' node scripts/backup-db.mjs");
  process.exit(1);
}

const stamp = new Date()
  .toISOString()
  .replace(/T/, "_")
  .replace(/:/g, "")
  .slice(0, 15);
const outDir = path.resolve("backups", stamp);
fs.mkdirSync(outDir, { recursive: true });

/** CSVの1セルを安全にエスケープする（改行・カンマ・引用符を含む本文があるため）。 */
function csvCell(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows) {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const head = cols.map(csvCell).join(",");
  const body = rows.map((r) => cols.map((c) => csvCell(r[c])).join(",")).join("\n");
  return `${head}\n${body}\n`;
}

const conn = await mysql.createConnection(url);
console.log(`✓ 接続しました`);

const [tableRows] = await conn.query("SHOW TABLES");
const tables = tableRows.map((r) => Object.values(r)[0]);
console.log(`✓ テーブル ${tables.length}件を検出: ${tables.join(", ")}\n`);

const summary = {};
const schemaParts = [];

for (const t of tables) {
  const [rows] = await conn.query(`SELECT * FROM \`${t}\``);
  fs.writeFileSync(path.join(outDir, `${t}.json`), JSON.stringify(rows, null, 2), "utf8");
  fs.writeFileSync(path.join(outDir, `${t}.csv`), toCsv(rows), "utf8");

  const [[created]] = await conn.query(`SHOW CREATE TABLE \`${t}\``);
  schemaParts.push(`${created["Create Table"]};\n`);

  summary[t] = rows.length;
  console.log(`  ${String(rows.length).padStart(6)} 件  ${t}`);
}

fs.writeFileSync(path.join(outDir, "_schema.sql"), schemaParts.join("\n"), "utf8");
fs.writeFileSync(
  path.join(outDir, "_summary.json"),
  JSON.stringify({ takenAt: new Date().toISOString(), tables: summary }, null, 2),
  "utf8"
);

await conn.end();

const total = Object.values(summary).reduce((a, b) => a + b, 0);
console.log(`\n✅ バックアップ完了: ${outDir}`);
console.log(`   合計 ${total} 件 / ${tables.length} テーブル`);
console.log(`\n⚠️  個人情報を含みます。GitHubにコミットしないでください（.gitignore 済み）。`);
