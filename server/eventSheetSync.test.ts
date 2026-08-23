import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getEventSheetSources,
  mapHeaders,
  parseCsv,
  parseJstDateTime,
  rowsToEvents,
} from "./eventSheetSync";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("parseCsv", () => {
  it("引用符で囲まれたカンマと改行を1つのセルとして扱う", () => {
    const csv = 'a,b\n"1,000","二行\n目"';
    expect(parseCsv(csv)).toEqual([
      ["a", "b"],
      ["1,000", "二行\n目"],
    ]);
  });

  it("エスケープされた引用符を復元する", () => {
    expect(parseCsv('x\n"彼は""はい""と言った"')).toEqual([["x"], ['彼は"はい"と言った']]);
  });

  it("空行を捨て、BOMを除去する", () => {
    expect(parseCsv("﻿a,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("mapHeaders", () => {
  it("日本語の見出しを論理名に対応づける", () => {
    const idx = mapHeaders(["タイムスタンプ", "イベント名", "開始日時", "場所", "種別"]);
    expect(idx.timestamp).toBe(0);
    expect(idx.title).toBe(1);
    expect(idx.startAt).toBe(2);
    expect(idx.location).toBe(3);
    expect(idx.category).toBe(4);
  });

  it("表記ゆれや注釈つきの見出しでも拾う", () => {
    const idx = mapHeaders(["回答日時", "タイトル", "開催日", "開始時刻", "対象グループ", "申込フォームURL（任意）"]);
    expect(idx.timestamp).toBe(0);
    expect(idx.title).toBe(1);
    expect(idx.startDate).toBe(2);
    expect(idx.startTime).toBe(3);
    expect(idx.groupName).toBe(4);
    expect(idx.formUrl).toBe(5);
  });
});

describe("parseJstDateTime", () => {
  it("日本時間として解釈する（サーバのタイムゾーンに依存しない）", () => {
    // JST 19:00 は UTC 10:00
    expect(parseJstDateTime("2026/08/22 19:00")?.toISOString()).toBe("2026-08-22T10:00:00.000Z");
  });

  it("区切り文字のゆれを吸収する", () => {
    const expected = "2026-08-22T10:00:00.000Z";
    expect(parseJstDateTime("2026-08-22 19:00")?.toISOString()).toBe(expected);
    expect(parseJstDateTime("2026年8月22日 19:00")?.toISOString()).toBe(expected);
    expect(parseJstDateTime("2026/8/22 19:00:00")?.toISOString()).toBe(expected);
  });

  it("時刻が別列にある場合はそちらを優先する", () => {
    expect(parseJstDateTime("2026/08/22", "19:30")?.toISOString()).toBe("2026-08-22T10:30:00.000Z");
  });

  it("日付をまたぐ時刻でも正しく繰り上がる", () => {
    // JST 8/22 05:00 は UTC 8/21 20:00
    expect(parseJstDateTime("2026/08/22 05:00")?.toISOString()).toBe("2026-08-21T20:00:00.000Z");
  });

  it("解釈できない値は null を返す", () => {
    expect(parseJstDateTime("")).toBeNull();
    expect(parseJstDateTime("未定")).toBeNull();
  });
});

describe("rowsToEvents", () => {
  const csv = [
    "タイムスタンプ,イベント名,開始日時,終了日時,場所,種別,グループ,詳細,申込フォームURL,公開",
    '2026/08/01 10:00:00,8月お話会,2026/08/22 19:00,2026/08/22 20:30,オンライン,online,なちゅらぼ公式,"みんなで話します",https://example.com/form,はい',
    '2026/08/02 11:00:00,限定セミナー,2026/08/25 13:00,,渋谷,seminar,樹里エリー限定,,,いいえ',
  ].join("\n");

  it("シート名と送信日時から一意な鍵を作る", () => {
    const { events } = rowsToEvents("本社イベント", csv);
    expect(events).toHaveLength(2);
    expect(events[0].sourceKey).toBe("本社イベント:2026/08/01 10:00:00");
    expect(events[1].sourceKey).toBe("本社イベント:2026/08/02 11:00:00");
  });

  it("各列を正しく取り込む", () => {
    const { events } = rowsToEvents("本社イベント", csv);
    const [first] = events;
    expect(first.title).toBe("8月お話会");
    expect(first.startAt.toISOString()).toBe("2026-08-22T10:00:00.000Z");
    expect(first.endAt?.toISOString()).toBe("2026-08-22T11:30:00.000Z");
    expect(first.location).toBe("オンライン");
    expect(first.category).toBe("online");
    expect(first.groupName).toBe("なちゅらぼ公式");
    expect(first.description).toBe("みんなで話します");
    expect(first.formUrl).toBe("https://example.com/form");
    expect(first.isPublished).toBe(true);
  });

  it("「いいえ」を非公開として扱い、空欄は既定で公開にする", () => {
    const { events } = rowsToEvents("本社イベント", csv);
    expect(events[1].isPublished).toBe(false);
    expect(events[1].endAt).toBeNull();

    const noColumn = rowsToEvents(
      "s",
      "タイムスタンプ,イベント名,開始日時\n2026/08/01 10:00:00,予定,2026/08/22 19:00"
    );
    expect(noColumn.events[0].isPublished).toBe(true);
  });

  it("タイトルか開始日時が欠けた行は取り込まず、件数を返す", () => {
    const broken = [
      "タイムスタンプ,イベント名,開始日時",
      "2026/08/01 10:00:00,,2026/08/22 19:00",
      "2026/08/02 10:00:00,日付なし,",
      "2026/08/03 10:00:00,正常,2026/08/23 19:00",
    ].join("\n");
    const { events, skipped } = rowsToEvents("s", broken);
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("正常");
    expect(skipped).toBe(2);
  });

  it("ヘッダしかないシートでは何も返さない", () => {
    expect(rowsToEvents("s", "タイムスタンプ,イベント名,開始日時").events).toEqual([]);
  });
});

describe("getEventSheetSources", () => {
  it("未設定なら空配列を返す", () => {
    vi.stubEnv("EVENT_SHEET_CSVS", "");
    expect(getEventSheetSources()).toEqual([]);
  });

  it("1行1シートで「シート名|URL」を解釈する", () => {
    vi.stubEnv(
      "EVENT_SHEET_CSVS",
      "本社イベント|https://example.com/a.csv\nオンライン講座|https://example.com/b.csv"
    );
    expect(getEventSheetSources()).toEqual([
      { label: "本社イベント", url: "https://example.com/a.csv" },
      { label: "オンライン講座", url: "https://example.com/b.csv" },
    ]);
  });

  it("URLだけの行も受け付け、httpでない行は捨てる", () => {
    vi.stubEnv("EVENT_SHEET_CSVS", "https://example.com/a.csv\nメモ|これはURLではない");
    expect(getEventSheetSources()).toEqual([{ label: "イベント", url: "https://example.com/a.csv" }]);
  });
});
