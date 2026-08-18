import { getEvents } from "./db";

export type CalendarFeedEvent = {
  id: number;
  title: string;
  description?: string | null;
  startAt: Date;
  endAt?: Date | null;
  location?: string | null;
  formUrl?: string | null;
  updatedAt?: Date;
};

const DEFAULT_EVENT_DURATION_MS = 60 * 60 * 1000;

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function toIcsUtc(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eventToIcs(event: CalendarFeedEvent) {
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  const description = [event.description, event.formUrl ? `申込み・詳細: ${event.formUrl}` : null]
    .filter(Boolean)
    .join("\n\n");

  return [
    "BEGIN:VEVENT",
    `UID:natulabo-event-${event.id}@natulabo-jgdafshb.manus.space`,
    `DTSTAMP:${toIcsUtc(event.updatedAt ?? new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : null,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : null,
    event.formUrl ? `URL:${event.formUrl}` : null,
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ].filter(Boolean).join("\r\n");
}

export function createCalendarIcs(events: CalendarFeedEvent[], calendarName = "NatuLaboイベント") {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NatuLabo Portal//Events//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    "X-WR-TIMEZONE:Asia/Tokyo",
    ...events.map(eventToIcs),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export async function getNatuLaboCalendarIcs() {
  const events = await getEvents();
  return createCalendarIcs(events);
}

export async function getNatuLaboEventIcs(id: number) {
  const events = await getEvents();
  const event = events.find((item) => item.id === id);
  return event ? createCalendarIcs([event], event.title) : null;
}

export function getGoogleCalendarEventUrl(event: CalendarFeedEvent) {
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
  const description = [event.description, event.formUrl ? `申込み・詳細: ${event.formUrl}` : null]
    .filter(Boolean)
    .join("\n\n");
  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
  });
  if (description) query.set("details", description);
  if (event.location) query.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}
