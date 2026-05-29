import { useAuth } from "@/_core/hooks/useAuth";
import MemberLayout from "@/components/MemberLayout";
import { usePageView } from "@/hooks/usePageView";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Settings,
} from "lucide-react";
import { Link } from "wouter";

const menuItems = [
  { href: "/setup",    icon: Settings,      title: "はじめての方へ",     subtitle: "初期設定・準備フロー",       en: "GETTING STARTED" },
  { href: "/contact",  icon: MessageCircle, title: "お問い合わせ",       subtitle: "困ったときの相談窓口一覧",   en: "CONTACT" },
  { href: "/videos",   icon: BookOpen,      title: "学習動画ライブラリ", subtitle: "カテゴリ別動画コンテンツ",   en: "VIDEO LIBRARY" },
  { href: "/calendar", icon: Calendar,      title: "イベント・講座",     subtitle: "カレンダーで日程確認",       en: "EVENTS" },
  { href: "/links",    icon: ExternalLink,  title: "外部リンク集",       subtitle: "愛用に役立つサイト一覧",     en: "USEFUL LINKS" },
];

export default function Dashboard() {
  usePageView("ダッシュボード");
  const { user } = useAuth();
  const { data: events } = trpc.event.list.useQuery({});
  const { data: videos } = trpc.video.list.useQuery();

  const upcomingEvents = events
    ?.filter((e) => new Date(e.startAt) >= new Date())
    .slice(0, 3) ?? [];

  const latestVideos = videos?.filter((v) => v.isLatest).slice(0, 2) ?? [];

  return (
    <MemberLayout>
      <div className="container py-8 lg:py-10 space-y-10 max-w-3xl">

        {/* ── Greeting ─────────────────────────────────────────────── */}
        <div className="animate-fade-in-up">
          <div
            className="inline-flex items-center gap-2 mb-3"
            style={{ color: "var(--gold-500)" }}
          >
            <span style={{ width: "1.5rem", height: "1px", background: "var(--gold-400)", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Welcome
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              fontWeight: 400,
              letterSpacing: "0.05em",
              color: "var(--brown-800)",
              lineHeight: 1.4,
            }}
          >
            こんにちは、{user?.name ?? "ゲスト"}さん
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              fontWeight: 300,
              letterSpacing: "0.05em",
              color: "var(--brown-500)",
              lineHeight: 1.8,
            }}
          >
            NatuLaboポータルへようこそ。今日も素敵な一日を。
          </p>
        </div>

        {/* ── Hero banner ──────────────────────────────────────────── */}
        <div
          className="animate-fade-in-up stagger-1 rounded-2xl overflow-hidden relative"
          style={{ height: "160px" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, var(--forest-600) 0%, var(--forest-500) 60%, oklch(0.520 0.092 150) 100%)",
            }}
          />
          {/* Decorative circles */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-30%", right: "-5%",
              width: "50%", paddingBottom: "50%",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <div className="absolute inset-0 flex items-center px-8">
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "0.5rem",
                }}
              >
                NatuLabo Portal
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.2rem",
                  fontWeight: 400,
                  color: "white",
                  letterSpacing: "0.06em",
                  lineHeight: 1.5,
                }}
              >
                自然の力で、<br />毎日をもっと豊かに。
              </p>
            </div>
          </div>
        </div>

        {/* ── Menu grid ────────────────────────────────────────────── */}
        <div className="animate-fade-in-up stagger-2">
          <div className="flex items-center gap-3 mb-5">
            <span style={{ width: "1.5rem", height: "1px", background: "var(--gold-400)", display: "inline-block" }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--gold-500)",
              }}
            >
              Contents
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menuItems.map(({ href, icon: Icon, title, subtitle, en }) => (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background: "white",
                    border: "1px solid var(--cream-300)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--gold-300)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px oklch(0.200 0.030 60 / 0.08)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cream-300)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--cream-100)" }}
                  >
                    <Icon size={18} style={{ color: "var(--forest-500)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        color: "var(--brown-800)",
                        lineHeight: 1.3,
                      }}
                    >
                      {title}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        fontWeight: 300,
                        letterSpacing: "0.04em",
                        color: "var(--brown-500)",
                        marginTop: "0.2rem",
                      }}
                    >
                      {subtitle}
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--brown-300)", flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Upcoming events ──────────────────────────────────────── */}
        {upcomingEvents.length > 0 && (
          <div className="animate-fade-in-up stagger-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span style={{ width: "1.5rem", height: "1px", background: "var(--gold-400)", display: "inline-block" }} />
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    color: "var(--brown-800)",
                  }}
                >
                  直近のイベント
                </span>
              </div>
              <Link href="/calendar">
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    fontWeight: 300,
                    color: "var(--forest-500)",
                    letterSpacing: "0.04em",
                  }}
                >
                  すべて見る →
                </span>
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                const date = new Date(event.startAt);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{
                      background: "white",
                      border: "1px solid var(--cream-300)",
                    }}
                  >
                    <div
                      className="text-center w-12 shrink-0 rounded-lg py-1.5"
                      style={{ background: "var(--cream-100)" }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.55rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "var(--gold-500)",
                        }}
                      >
                        {date.getMonth() + 1}月
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "1.3rem",
                          fontWeight: 500,
                          color: "var(--forest-500)",
                          lineHeight: 1,
                        }}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: "var(--brown-800)",
                          letterSpacing: "0.04em",
                        }}
                        className="truncate"
                      >
                        {event.title}
                      </p>
                      {event.location && (
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            fontWeight: 300,
                            color: "var(--brown-500)",
                            marginTop: "0.2rem",
                          }}
                        >
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Latest videos ────────────────────────────────────────── */}
        {latestVideos.length > 0 && (
          <div className="animate-fade-in-up stagger-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span style={{ width: "1.5rem", height: "1px", background: "var(--gold-400)", display: "inline-block" }} />
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    color: "var(--brown-800)",
                  }}
                >
                  最新動画
                </span>
              </div>
              <Link href="/videos">
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    fontWeight: 300,
                    color: "var(--forest-500)",
                    letterSpacing: "0.04em",
                  }}
                >
                  すべて見る →
                </span>
              </Link>
            </div>
            <div className="space-y-2">
              {latestVideos.map((video) => (
                <Link key={video.id} href={`/videos#video-${video.id}`}>
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: "white",
                      border: "1px solid var(--cream-300)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--gold-300)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cream-300)";
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--cream-100)" }}
                    >
                      <BookOpen size={18} style={{ color: "var(--forest-500)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: "var(--brown-800)",
                          letterSpacing: "0.04em",
                        }}
                        className="truncate"
                      >
                        {video.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          fontWeight: 300,
                          color: "var(--brown-500)",
                          marginTop: "0.2rem",
                        }}
                      >
                        {video.category}
                      </p>
                    </div>
                    <span
                      className="shrink-0 px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: "var(--cream-100)",
                        color: "var(--gold-600)",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        border: "1px solid var(--gold-300)",
                      }}
                    >
                      NEW
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
