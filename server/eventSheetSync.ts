/**
 * eventSheetSync.ts
 *
 * Googleフォーム → スプレッドシート → サイトのカレンダー を自動連携する。
 *
 * 仕組み:
 *   1. チームがGoogleフォームからイベントを登録する
 *   2. 回答が自動でスプレッドシートに溜まる
 *   3. スプレッドシートを「ウェブに公開（CSV）」しておく
 *   4. この処理が定期的にCSVを読み、events テーブルへ反映する
 *
 * Googleフォームの回答は編集・削除できる運用のため、同期は毎回洗い替えではなく
 * 「フォーム送信日時」を鍵にした冪等な upsert にしている。行が消えたイベントは
 * 削除ではなく非公開にする（過去の予定を履歴として残すため）。
 *
 * 必要な環境変数:
 *   EVENT_SHEET_CSVS … 1行に1シート。`シート名|CSVのURL` 形式。
 *     例）
 *       本社イベント|https://docs.google.com/spreadsheets/d/e/xxx/pub?gid=0&single=true&output=csv
 *       オンライン講座|https://docs.google.com/spreadsheets/d/e/yyy/pub?gid=0&single=true&output=csv
 */

import { and, eq, inArray, isNotNull, notInArray } from "drizzle-orm";
import { events } from "../drizzle/schema";
import { getDb } from "./db";

/** 日本時間。フォームに入力される日時はすべてJSTとして解釈する。 */
const JST_OFFSET_HOURS = 9;

export type SheetSource = { label: string; url: string };

export function getEventSheetSources(): SheetSource[] {
  const raw = process.env.EVENT_SHEET_CSVS?.trim();
  if (!raw) return [];
  return raw
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.indexOf("|");
      if (sep === -1) return { label: "イベント", url: line };
      return { label: line.slice(0, sep).trim() || "イベント", url: line.slice(sep + 1).trim() };
    })
    .filter((s) => /^https?:\/\//.test(s.url));
}

/**
 * RFC4180準拠のCSVパーサ。
 * イベントの説明文には改行やカンマが普通に入るため、素朴な split(",") では壊れる。
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // BOM を除去（Googleのエクスポートに付くことがある）
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === ",") { row.push(field); field = ""; continue; }
    if (c === "\r") continue;
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
    field += c;
  }
  if (field !== "" || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** 列名のゆらぎを吸収する。チームが自由に付けた見出しでも拾えるようにする。 */
const HEADER_ALIASES: Record<string, string[]> = {
  timestamp: ["タイムスタンプ", "timestamp", "送信日時", "回答日時"],
  title:     ["イベント名", "タイトル", "件名", "予定名", "title"],
  startAt:   ["開始日時", "日時", "開催日時", "開始", "start"],
  startDate: ["開催日", "開始日", "日付", "date"],
  startTime: ["開始時刻", "開始時間", "時刻", "時間"],
  endAt:     ["終了日時", "終了", "end"],
  endTime:   ["終了時刻", "終了時間"],
  category:  ["種別", "カテゴリ", "イベント種別", "分類", "category"],
  groupName: ["グループ", "対象グループ", "対象", "group"],
  location:  ["場所", "開催場所", "会場", "location"],
  description: ["詳細", "説明", "内容", "備考", "description"],
  formUrl:   ["申込フォーム", "申込フォームURL", "申込URL", "申し込み", "url", "リンク"],
  isPublished: ["公開", "掲載", "公開する", "published"],
};

function normalizeHeader(h: string): string {
  return h.replace(/\s+/g, "").replace(/[（(].*?[)）]/g, "").toLowerCase();
}

/**
 * ヘッダ行 → { 論理名: 列index }
 *
 * 完全一致を先に取り、そのあとで部分一致を見る2段構えにしている。
 * いきなり部分一致にすると「開始時刻」が短いエイリアス「開始」に 食われて
 * startAt として誤認されるため。エイリアスも長い順に照合する。
 */
export function mapHeaders(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  const pairs = Object.entries(HEADER_ALIASES)
    .flatMap(([key, aliases]) => aliases.map((a) => ({ key, alias: normalizeHeader(a) })))
    .sort((a, b) => b.alias.length - a.alias.length);

  const normalized = header.map(normalizeHeader);
  const taken = new Set<number>();

  // 1) 完全一致
  normalized.forEach((h, i) => {
    if (!h) return;
    for (const { key, alias } of pairs) {
      if (key in map) continue;
      if (h === alias) { map[key] = i; taken.add(i); return; }
    }
  });

  // 2) 部分一致（まだ使われていない列だけ）
  normalized.forEach((h, i) => {
    if (!h || taken.has(i)) return;
    for (const { key, alias } of pairs) {
      if (key in map) continue;
      if (h.includes(alias)) { map[key] = i; taken.add(i); return; }
    }
  });

  return map;
}

/**
 * 日本時間の文字列を Date（UTC内部表現）に変換する。
 * サーバのタイムゾーンに依存しないよう、Date.UTC で組み立てる。
 */
export function parseJstDateTime(dateStr: string, timeStr?: string): Date | null {
  const d = (dateStr ?? "").trim();
  if (!d) return null;

  const m = d.match(/(\d{4})[/\-年](\d{1,2})[/\-月](\d{1,2})日?(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;

  const [, y, mo, day, h, mi, s] = m;
  let hour = h ? Number(h) : 0;
  let minute = mi ? Number(mi) : 0;
  const second = s ? Number(s) : 0;

  // 時刻が別列にある場合はそちらを優先する
  const t = (timeStr ?? "").trim();
  if (t) {
    const tm = t.match(/(\d{1,2}):(\d{2})/);
    if (tm) { hour = Number(tm[1]); minute = Number(tm[2]); }
  }

  const ts = Date.UTC(Number(y), Number(mo) - 1, Number(day), hour - JST_OFFSET_HOURS, minute, second);
  return Number.isNaN(ts) ? null : new Date(ts);
}

const FALSEY = ["いいえ", "非公開", "false", "no", "0", "下書き"];

export type SheetEvent = {
  sourceKey: string;
  title: string;
  description: string | null;
  category: string;
  groupName: string | null;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  formUrl: string | null;
  isPublished: boolean;
};

/** 1シート分のCSVテキストを SheetEvent[] に変換する。壊れた行は黙って捨てず数を返す。 */
export function rowsToEvents(label: string, csv: string): { events: SheetEvent[]; skipped: number } {
  const rows = parseCsv(csv);
  if (rows.length < 2) return { events: [], skipped: 0 };

  const idx = mapHeaders(rows[0]);
  const out: SheetEvent[] = [];
  let skipped = 0;

  const cell = (r: string[], key: string): string =>
    idx[key] === undefined ? "" : (r[idx[key]] ?? "").trim();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const title = cell(r, "title");
    const startAt =
      parseJstDateTime(cell(r, "startAt"), cell(r, "startTime")) ??
      parseJstDateTime(cell(r, "startDate"), cell(r, "startTime"));

    // タイトルと開始日時が無い行はイベントとして成立しない
    if (!title || !startAt) { skipped++; continue; }

    // フォーム送信日時を鍵にする。編集されても鍵は変わらないので更新として扱える。
    const stamp = cell(r, "timestamp") || `row${i}`;
    const endAt =
      parseJstDateTime(cell(r, "endAt"), cell(r, "endTime")) ??
      (cell(r, "endTime") ? parseJstDateTime(cell(r, "startDate") || cell(r, "startAt"), cell(r, "endTime")) : null);

    const publishedRaw = cell(r, "isPublished");
    out.push({
      sourceKey: `${label}:${stamp}`.slice(0, 191),
      title: title.slice(0, 255),
      description: cell(r, "description") || null,
      category: cell(r, "category") || "online",
      groupName: cell(r, "groupName") || null,
      startAt,
      endAt,
      location: cell(r, "location").slice(0, 255) || null,
      formUrl: cell(r, "formUrl") || null,
      isPublished: publishedRaw ? !FALSEY.includes(publishedRaw.toLowerCase()) : true,
    });
  }
  return { events: out, skipped };
}

export type EventSyncResult = {
  sheets: number;
  fetched: number;
  skipped: number;
  inserted: number;
  updated: number;
  unpublished: number;
  errors: string[];
  syncedAt: string;
};

export async function syncEventSheets(): Promise<EventSyncResult> {
  const sources = getEventSheetSources();
  if (sources.length === 0) {
    throw new Error(
      "EVENT_SHEET_CSVS が未設定です。Manusの環境変数に「シート名|CSVのURL」を1行ずつ設定してください。"
    );
  }

  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const collected: SheetEvent[] = [];
  const errors: string[] = [];
  let skipped = 0;

  for (const src of sources) {
    try {
      const res = await fetch(src.url, { redirect: "follow" });
      if (!res.ok) {
        errors.push(`${src.label}: HTTP ${res.status}`);
        continue;
      }
      const text = await res.text();
      // 公開設定を忘れているとログインHTMLが返ってくる。CSVでないことを検知する。
      if (/^\s*</.test(text)) {
        errors.push(`${src.label}: CSVではなくHTMLが返りました。「ウェブに公開」の設定を確認してください`);
        continue;
      }
      const parsed = rowsToEvents(src.label, text);
      collected.push(...parsed.events);
      skipped += parsed.skipped;
    } catch (e) {
      errors.push(`${src.label}: ${(e as Error).message}`);
    }
  }

  const now = new Date();
  const existing = await db.select().from(events);
  const bySourceKey = new Map(existing.filter((e) => e.sourceKey).map((e) => [e.sourceKey as string, e]));

  let inserted = 0;
  let updated = 0;

  for (const ev of collected) {
    const common = {
      title: ev.title,
      description: ev.description,
      category: ev.category,
      groupName: ev.groupName,
      startAt: ev.startAt,
      endAt: ev.endAt,
      location: ev.location,
      formUrl: ev.formUrl,
      isPublished: ev.isPublished,
      syncedAt: now,
    };
    const found = bySourceKey.get(ev.sourceKey);
    if (found) {
      await db.update(events).set(common).where(eq(events.id, found.id));
      updated++;
    } else {
      await db.insert(events).values({ ...common, sourceKey: ev.sourceKey });
      inserted++;
    }
  }

  // シートから消えた行は非公開にする。削除しないのは、過去の予定を残すため。
  // 対象はシート由来の行のみ。管理画面から手で登録したイベントには触れない。
  let unpublished = 0;
  const liveKeys = collected.map((e) => e.sourceKey);
  if (liveKeys.length > 0 && errors.length === 0) {
    const stale = await db
      .select({ id: events.id })
      .from(events)
      .where(and(isNotNull(events.sourceKey), notInArray(events.sourceKey, liveKeys), eq(events.isPublished, true)));
    if (stale.length > 0) {
      await db.update(events).set({ isPublished: false, syncedAt: now })
        .where(inArray(events.id, stale.map((r) => r.id)));
      unpublished = stale.length;
    }
  }

  return {
    sheets: sources.length,
    fetched: collected.length,
    skipped,
    inserted,
    updated,
    unpublished,
    errors,
    syncedAt: now.toISOString(),
  };
}
