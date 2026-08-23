import MemberLayout from "@/components/MemberLayout";
import ContentVisualHero from "@/components/ContentVisualHero";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import { doterraAssets, doterraSources } from "@/lib/doterraAssets";
import { Button } from "@/components/ui/button";
import { CalendarPlus, ChevronLeft, ChevronRight, Copy, ExternalLink, MapPin, Rss } from "lucide-react";
import { useState } from "react";

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  company: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  team: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  online: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  workshop: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  seminar: { bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-500" },
  business: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  user: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
};

const categoryLabels: Record<string, string> = {
  company: "本社", team: "チーム", online: "オンライン",
  workshop: "ワークショップ", seminar: "セミナー",
  business: "ビジネス", user: "愛用者",
};

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarPage() {
  usePageView("カレンダー");
  const { data: allEvents } = trpc.event.list.useQuery({});
  const { data: groups } = trpc.event.groups.useQuery();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("すべて");
  const [copied, setCopied] = useState(false);

  // グループ（なちゅらぼ公式 / 樹里エリー限定 など）での絞り込み。
  // グループが1つも設定されていなければタブ自体を出さない。
  const events =
    activeGroup === "すべて"
      ? allEvents
      : (allEvents ?? []).filter((e) => e.groupName === activeGroup);

  const calendarFeedUrl = `${window.location.origin}/api/calendar/natulabo.ics`;
  const googleSubscribeUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarFeedUrl)}`;
  const appleSubscribeUrl = calendarFeedUrl.replace(/^https?:/, "webcal:");

  const copyCalendarFeedUrl = async () => {
    await navigator.clipboard.writeText(calendarFeedUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return (events ?? []).filter((e) => {
      const d = new Date(e.startAt);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return ds === dateStr;
    });
  };

  const selectedEvents = selectedDate
    ? (events ?? []).filter((e) => {
        const d = new Date(e.startAt);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return ds === selectedDate;
      })
    : [];

  const upcomingEvents = (events ?? [])
    .filter((e) => new Date(e.startAt) >= new Date())
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 6);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <MemberLayout>
      <div className="container py-6 lg:py-8 space-y-6">
        <ContentVisualHero eyebrow="EVENTS & COMMUNITY" title="イベント・講座カレンダー" description="学び、つながり、日々の暮らしを豊かにする予定をカレンダーから確認できます。" imageUrl={doterraAssets.memberRoseField} imageAlt="dōTERRA公式掲載のローズ畑" sourceHref={doterraSources.japanHome} />

        <section className="rounded-3xl border border-primary/15 bg-primary/[0.055] p-5 sm:p-6 animate-fade-in-up" aria-labelledby="calendar-subscribe-title">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary">
                <Rss size={14} aria-hidden="true" /> SHARED CALENDAR
              </div>
              <h2 id="calendar-subscribe-title" className="font-serif text-xl text-foreground sm:text-2xl">NatuLaboイベントをカレンダーに購読</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">最初に一度だけ登録すれば、管理者が追加・変更した公開予定がご利用のカレンダーにも反映されます。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90">
                <a href={googleSubscribeUrl} target="_blank" rel="noopener noreferrer"><CalendarPlus size={15} aria-hidden="true" />Googleで購読</a>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-primary/25 bg-background/75 px-4 text-primary hover:bg-primary/10">
                <a href={appleSubscribeUrl}><CalendarPlus size={15} aria-hidden="true" />Apple / Outlook</a>
              </Button>
              <Button type="button" variant="ghost" onClick={copyCalendarFeedUrl} className="rounded-full px-3 text-primary hover:bg-primary/10" aria-label="共有カレンダーの購読用URLをコピー">
                <Copy size={15} aria-hidden="true" />{copied ? "コピーしました" : "URLをコピー"}
              </Button>
            </div>
          </div>
        </section>

        {/* グループ絞り込み */}
        {groups && groups.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-fade-in-up" role="tablist" aria-label="グループで絞り込み">
            {["すべて", ...groups].map((g) => (
              <button
                key={g}
                role="tab"
                aria-selected={activeGroup === g}
                onClick={() => { setActiveGroup(g); setSelectedDate(null); }}
                className={`shrink-0 rounded-pill px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeGroup === g
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Calendar */}
        <div className="bg-card rounded-2xl border border-border p-4 animate-fade-in-up stagger-1">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="前の月を表示" className="rounded-xl">
              <ChevronLeft size={18} />
            </Button>
            <h2 className="font-semibold text-base">{year}年 {month + 1}月</h2>
            <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="次の月を表示" className="rounded-xl">
              <ChevronRight size={18} />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = getEventsForDate(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const dayOfWeek = (firstDay + i) % 7;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all ${
                    isSelected
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : isToday
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className={`text-xs font-medium ${
                    isToday ? "text-primary-foreground" :
                    dayOfWeek === 0 ? "text-rose-500" :
                    dayOfWeek === 6 ? "text-blue-500" :
                    "text-foreground"
                  }`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className={`w-1.5 h-1.5 rounded-full ${categoryColors[e.category]?.dot ?? "bg-gray-400"}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date events */}
        {selectedDate && selectedEvents.length > 0 && (
          <div className="animate-fade-in-up space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {selectedDate.replace(/-/g, "/")} のイベント
            </h3>
            {selectedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Upcoming events list */}
        <div className="animate-fade-in-up stagger-2">
          <h2 className="text-base font-semibold mb-3">今後の予定</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">予定されているイベントはありません</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}

function EventCard({ event }: { event: { id: number; title: string; description?: string | null; category: string; startAt: Date; endAt?: Date | null; location?: string | null; formUrl?: string | null } }) {
  const colors = categoryColors[event.category] ?? categoryColors.online;
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + 60 * 60 * 1000);
  const googleCalendarUrl = (() => {
    const format = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const details = [event.description, event.formUrl ? `申込み・詳細: ${event.formUrl}` : null].filter(Boolean).join("\n\n");
    const query = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: `${format(start)}/${format(end)}` });
    if (details) query.set("details", details);
    if (event.location) query.set("location", event.location);
    return `https://calendar.google.com/calendar/render?${query.toString()}`;
  })();
  return (
    <div className={`bg-card rounded-2xl border p-4 ${colors.bg.replace("bg-", "border-").replace("-50", "-100")}`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex flex-col items-center justify-center shrink-0`}>
          <span className="text-xs text-muted-foreground">{start.getMonth() + 1}月</span>
          <span className={`text-lg font-bold leading-none ${colors.text}`}>{start.getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
              {categoryLabels[event.category] ?? event.category}
            </span>
          </div>
          <h3 className="font-semibold text-sm text-foreground">{event.title}</h3>
          {event.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>🕐</span>
              <span>{start.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</span>
              {event.endAt && (
                <span>〜{new Date(event.endAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </div>
            {event.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={11} />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          {event.formUrl && (
            <a
              href={event.formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 mt-3 text-xs font-medium ${colors.text} hover:underline`}
            >
              <ExternalLink size={12} />
              申込みフォームへ
            </a>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-xs font-semibold ${colors.text} hover:underline`}>
              <CalendarPlus size={13} aria-hidden="true" />Googleカレンダーに追加
            </a>
            <a href={`/api/calendar/events/${event.id}.ics`} download className={`inline-flex items-center gap-1.5 text-xs font-semibold ${colors.text} hover:underline`}>
              <CalendarPlus size={13} aria-hidden="true" />Apple / Outlookに追加
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
