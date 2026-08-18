import { describe, expect, it } from "vitest";
import { createCalendarIcs, getGoogleCalendarEventUrl } from "./calendarFeed";

const event = {
  id: 42,
  title: "夏のウェルネス講座, 東京; 会員向け",
  description: "心とからだを整える\n限定イベントです。",
  startAt: new Date("2026-08-21T10:00:00.000Z"),
  location: "オンライン",
  formUrl: "https://example.com/form",
  updatedAt: new Date("2026-08-01T00:00:00.000Z"),
};

describe("共有カレンダーICS", () => {
  it("公開イベントを有効なiCalendar形式へ変換し、文字をエスケープする", () => {
    const ics = createCalendarIcs([event]);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:夏のウェルネス講座\\, 東京\\; 会員向け");
    expect(ics).toContain("DTSTART:20260821T100000Z");
    expect(ics).toContain("DTEND:20260821T110000Z");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("Googleカレンダーの個別予定追加URLを生成する", () => {
    const url = getGoogleCalendarEventUrl(event);
    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("dates=20260821T100000Z%2F20260821T110000Z");
  });
});
