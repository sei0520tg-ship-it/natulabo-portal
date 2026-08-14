import { useAuth } from "@/_core/hooks/useAuth";
import MemberLayout from "@/components/MemberLayout";
import { usePageView } from "@/hooks/usePageView";
import { trpc } from "@/lib/trpc";
import { doterraAssets, doterraSources } from "@/lib/doterraAssets";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Leaf,
  MessageCircleHeart,
  Play,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const menuItems = [
  { href: "/setup", icon: Settings2, title: "はじめての方へ", en: "START HERE", image: doterraAssets.sourceFarmer },
  { href: "/videos", icon: BookOpen, title: "学習動画", en: "VIDEO LIBRARY", image: doterraAssets.essentialOils },
  { href: "/recipes", icon: Sparkles, title: "クラフトレシピ", en: "RECIPES", image: doterraAssets.memberRoseField },
  { href: "/testimonials", icon: MessageCircleHeart, title: "体験談", en: "STORIES", image: doterraAssets.loginGarden },
  { href: "/calendar", icon: CalendarDays, title: "イベント", en: "EVENTS", image: doterraAssets.memberRoseField },
  { href: "/links", icon: ExternalLink, title: "リンク集", en: "USEFUL LINKS", image: doterraAssets.sourceFarmer },
];

type Topic = {
  id: number;
  title: string;
  body: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  sortOrder: number;
  isPublished: "published" | "draft";
  createdAt: Date;
  updatedAt: Date;
};

const gradients = [
  "linear-gradient(125deg, oklch(0.255 0.06 145) 0%, oklch(0.43 0.09 145) 100%)",
  "linear-gradient(125deg, oklch(0.30 0.05 225) 0%, oklch(0.52 0.08 205) 100%)",
  "linear-gradient(125deg, oklch(0.38 0.07 65) 0%, oklch(0.67 0.10 75) 100%)",
  "linear-gradient(125deg, oklch(0.27 0.04 35) 0%, oklch(0.48 0.07 20) 100%)",
  "linear-gradient(125deg, oklch(0.31 0.05 285) 0%, oklch(0.50 0.07 270) 100%)",
];

function SectionHeader({ no, title, href }: { no: string; title: string; href?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div className="flex items-center gap-3">
        <span style={{ color: "var(--gold-500)", fontFamily: "var(--font-display)", fontSize: "0.64rem", letterSpacing: "0.22em" }}>{no}</span>
        <span className="h-px w-7" style={{ background: "var(--gold-400)" }} />
        <span style={{ color: "var(--brown-800)", fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 500, letterSpacing: "0.07em" }}>{title}</span>
      </div>
      {href && (
        <Link href={href} className="group flex items-center gap-1.5" style={{ color: "var(--brown-800)", fontSize: "0.72rem", fontWeight: 500, letterSpacing: "0.06em" }}>
          すべて見る <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export default function Dashboard() {
  usePageView("ダッシュボード");
  const { user } = useAuth();
  const { data: events } = trpc.event.list.useQuery({});
  const { data: videos } = trpc.video.list.useQuery();
  const now = new Date();
  const upcomingEvents = events?.filter((event) => new Date(event.startAt) >= now).slice(0, 3) ?? [];
  const latestVideos = videos?.filter((video) => video.isLatest).slice(0, 2) ?? [];

  return (
    <MemberLayout>
      <div className="px-4 py-7 sm:px-7 sm:py-10 lg:px-10 lg:py-11">
        <div className="mx-auto max-w-[1280px] space-y-14 lg:space-y-18">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.5fr)]">
            <div className="relative min-h-[21rem] overflow-hidden rounded-[1.75rem] animate-fade-in-up">
              <img src={doterraAssets.memberRoseField} alt="dōTERRA公式掲載のローズ畑" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(106deg, rgba(13,35,17,0.94) 0%, rgba(19,57,27,0.72) 58%, rgba(13,35,17,0.42) 100%)" }} />
              <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.22)" }} />
              <div className="relative flex h-full min-h-[21rem] flex-col justify-between p-7 sm:p-10">
                <div className="flex items-center justify-between">
                  <span style={{ color: "rgba(255,255,255,0.67)", fontFamily: "var(--font-display)", fontSize: "0.63rem", letterSpacing: "0.28em" }}>MEMBER&apos;S HOME</span>
                  <span className="rounded-full border px-3 py-1" style={{ borderColor: "rgba(255,255,255,0.35)", color: "rgba(255,255,255,0.82)", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.18em" }}>
                    {now.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
                  </span>
                </div>
                <div>
                  <p className="mb-3" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-display)", fontSize: "0.78rem", letterSpacing: "0.19em" }}>HELLO, {user?.name ?? "MEMBER"}</p>
                  <h1 style={{ color: "white", fontFamily: "var(--font-serif)", fontSize: "clamp(1.85rem, 3.8vw, 3.1rem)", fontWeight: 400, letterSpacing: "0.08em", lineHeight: 1.55 }}>
                    今日も、自然とともに。
                  </h1>
                  <p className="mt-4 max-w-md" style={{ color: "rgba(255,255,255,0.76)", fontSize: "0.82rem", fontWeight: 300, letterSpacing: "0.06em", lineHeight: 1.95 }}>
                    小さな心地よさを積み重ねる一日へ。気になるコンテンツから、ゆっくり始めてみましょう。
                  </p>
                  <a href={doterraSources.shop} target="_blank" rel="noreferrer" className="mt-4 inline-block" style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.62rem", letterSpacing: "0.04em" }}>
                    背景画像：dōTERRA公式掲載画像
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] p-6 animate-fade-in-up stagger-1" style={{ background: "white", border: "1px solid var(--cream-300)" }}>
              <p style={{ color: "var(--gold-500)", fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.26em" }}>YOUR PORTAL</p>
              <p className="mt-5" style={{ color: "var(--brown-800)", fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, letterSpacing: "0.06em", lineHeight: 1.6 }}>暮らしの中に、<br />学びとつながりを。</p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <Link href="/videos" className="group rounded-2xl p-4 transition-transform hover:-translate-y-0.5" style={{ background: "var(--cream-100)" }}>
                  <Play className="h-4 w-4" style={{ color: "var(--forest-600)" }} />
                  <p className="mt-5" style={{ color: "var(--brown-800)", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.04em" }}>動画を観る</p>
                  <ArrowUpRight className="mt-2 h-3.5 w-3.5" style={{ color: "var(--gold-600)" }} />
                </Link>
                <Link href="/calendar" className="group rounded-2xl p-4 transition-transform hover:-translate-y-0.5" style={{ background: "var(--cream-100)" }}>
                  <CalendarDays className="h-4 w-4" style={{ color: "var(--forest-600)" }} />
                  <p className="mt-5" style={{ color: "var(--brown-800)", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.04em" }}>予定を見る</p>
                  <ArrowUpRight className="mt-2 h-3.5 w-3.5" style={{ color: "var(--gold-600)" }} />
                </Link>
              </div>
              <Link href="/setup" className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-[var(--cream-100)]" style={{ border: "1px solid var(--cream-300)", color: "var(--brown-700)" }}>
                <span className="flex items-center gap-2 text-xs" style={{ letterSpacing: "0.04em" }}><Leaf className="h-3.5 w-3.5" style={{ color: "var(--forest-500)" }} />はじめにを確認する</span>
                <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--gold-500)" }} />
              </Link>
            </div>
          </section>

          <TopicsCarousel />

          <section>
            <SectionHeader no="01" title="あなたのためのコンテンツ" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="group relative min-h-48 overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1" style={{ boxShadow: "0 10px 24px rgba(35,44,27,0.12)", animationDelay: `${index * 60}ms` }}>
                    <img src={item.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(9,32,15,0.80) 0%, rgba(9,32,15,0.32) 65%, rgba(9,32,15,0.58) 100%)" }} />
                    <div className="relative flex h-full min-h-36 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <span style={{ color: "rgba(255,255,255,0.82)", fontFamily: "var(--font-display)", fontSize: "0.59rem", letterSpacing: "0.22em" }}>{item.en}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" style={{ background: "rgba(255,255,255,0.88)", color: "var(--forest-600)" }}><Icon className="h-4 w-4" /></span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p style={{ color: "white", fontFamily: "var(--font-serif)", fontSize: "1.12rem", fontWeight: 500, letterSpacing: "0.06em" }}>{item.title}</p>
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: "white" }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="grid gap-10 xl:grid-cols-2">
            <div>
              <SectionHeader no="02" title="直近のイベント" href="/calendar" />
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => {
                    const date = new Date(event.startAt);
                    return (
                      <div key={event.id} className="group flex items-center gap-4 rounded-2xl bg-white p-4 transition-shadow hover:shadow-md" style={{ border: "1px solid var(--cream-300)" }}>
                        <div className="w-14 shrink-0 rounded-xl py-2 text-center" style={{ background: "var(--cream-100)" }}>
                          <p style={{ color: "var(--gold-600)", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.18em" }}>{date.getMonth() + 1}月</p>
                          <p style={{ color: "var(--forest-600)", fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 500, lineHeight: 1.15 }}>{date.getDate()}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate" style={{ color: "var(--brown-800)", fontSize: "0.84rem", fontWeight: 500, letterSpacing: "0.04em" }}>{event.title}</p>
                          <p className="mt-1 flex items-center gap-1.5 truncate" style={{ color: "var(--brown-500)", fontSize: "0.7rem", fontWeight: 300 }}><Clock3 className="h-3 w-3" />{event.location ?? date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <ChevronRight className="h-4 w-4" style={{ color: "var(--brown-300)" }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyPanel label="これからのイベントは準備中です" />
              )}
            </div>

            <div>
              <SectionHeader no="03" title="最新動画" href="/videos" />
              {latestVideos.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {latestVideos.map((video) => (
                    <Link key={video.id} href={`/videos#video-${video.id}`} className="group overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1" style={{ border: "1px solid var(--cream-300)" }}>
                      <div className="relative h-28 overflow-hidden" style={{ background: "var(--forest-600)" }}>
                        {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                        <div className="absolute inset-0" style={{ background: video.thumbnailUrl ? "linear-gradient(to top, rgba(9,25,12,0.48), transparent)" : "linear-gradient(130deg, var(--forest-600), var(--forest-400))" }} />
                        <span className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.9)", color: "var(--forest-600)" }}><Play className="ml-0.5 h-3.5 w-3.5" /></span>
                      </div>
                      <div className="p-4">
                        <p style={{ color: "var(--gold-600)", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.18em" }}>{video.category}</p>
                        <p className="mt-2 line-clamp-2" style={{ color: "var(--brown-800)", fontFamily: "var(--font-serif)", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.04em", lineHeight: 1.55 }}>{video.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyPanel label="新しい動画を準備中です" />
              )}
            </div>
          </section>
        </div>
      </div>
    </MemberLayout>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="flex min-h-[8rem] items-center justify-center rounded-2xl bg-white" style={{ border: "1px dashed var(--cream-400)" }}>
      <p style={{ color: "var(--brown-500)", fontSize: "0.78rem", fontWeight: 300, letterSpacing: "0.05em" }}>{label}</p>
    </div>
  );
}

function TopicsCarousel() {
  const { data: rawTopics = [], isLoading } = trpc.topic.list.useQuery();
  const topics = rawTopics.slice(0, 5) as Topic[];
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = topics.length;

  const goTo = useCallback((index: number) => {
    if (count === 0) return;
    setCurrent(((index % count) + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const previous = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (count <= 1) return;
    autoPlayRef.current = setInterval(next, 6000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [count, next]);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (count > 1) autoPlayRef.current = setInterval(next, 6000);
  };

  const dragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    dragDeltaX.current = 0;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const dragMove = (clientX: number) => {
    if (isDragging) dragDeltaX.current = clientX - dragStartX.current;
  };

  const dragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDeltaX.current < -45) next();
    if (dragDeltaX.current > 45) previous();
    resetAutoPlay();
  };

  if (isLoading || count === 0) return null;
  const topic = topics[current];
  const topicHref = topic.buttonUrl ?? "/dashboard";
  const isExternal = /^https?:\/\//.test(topicHref);

  const content = (
    <>
        <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7">
          <div className="flex w-fit items-center gap-4 rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.84)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.72)" }}>
            <span style={{ color: "var(--forest-600)", fontFamily: "var(--font-display)", fontSize: "0.60rem", letterSpacing: "0.24em" }}>LATEST TOPICS</span>
            <span style={{ color: "var(--brown-600)", fontFamily: "var(--font-display)", fontSize: "0.58rem", letterSpacing: "0.16em" }}>{String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
          </div>
        <div className="max-w-xl rounded-2xl p-5 sm:p-6" style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.74)", boxShadow: "0 12px 34px rgba(30,48,27,0.16)" }}>
          <p style={{ color: "var(--brown-800)", fontFamily: "var(--font-serif)", fontSize: "clamp(1.35rem, 3vw, 2.2rem)", fontWeight: 400, letterSpacing: "0.065em", lineHeight: 1.5 }}>{topic.title}</p>
          {topic.body && <p className="mt-3 max-w-lg line-clamp-2" style={{ color: "var(--brown-600)", fontSize: "0.78rem", fontWeight: 400, letterSpacing: "0.05em", lineHeight: 1.85 }}>{topic.body}</p>}
          {topic.buttonText && topic.buttonUrl && <span className="mt-5 inline-flex items-center gap-2" style={{ color: "var(--forest-600)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em" }}>{topic.buttonText}<ArrowUpRight className="h-3.5 w-3.5" /></span>}
        </div>
      </div>
    </>
  );

  return (
    <section>
      <SectionHeader no="NEWS" title="お知らせ" />
      <div
        className="relative h-[20rem] select-none overflow-hidden rounded-[1.75rem] sm:h-[22rem]"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={(event) => dragStart(event.clientX)}
        onMouseMove={(event) => dragMove(event.clientX)}
        onMouseUp={dragEnd}
        onMouseLeave={dragEnd}
        onTouchStart={(event) => dragStart(event.touches[0].clientX)}
        onTouchMove={(event) => dragMove(event.touches[0].clientX)}
        onTouchEnd={dragEnd}
      >
        <div className="absolute inset-0 transition-all duration-700" style={{ background: topic.imageUrl ? `url(${topic.imageUrl}) center/cover no-repeat` : gradients[current % gradients.length] }} />
        <div className="absolute inset-0" style={{ background: topic.imageUrl ? "linear-gradient(to top, rgba(10,25,13,0.24) 0%, rgba(10,25,13,0.04) 58%, rgba(10,25,13,0.08) 100%)" : "linear-gradient(to top, rgba(0,0,0,0.20), transparent)" }} />
        <div className="absolute -right-20 -top-36 h-96 w-96 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.16)" }} />
        {topic.buttonUrl ? (
          isExternal ? <a href={topicHref} target="_blank" rel="noreferrer" className="absolute inset-0 z-10">{content}</a> : <Link href={topicHref} className="absolute inset-0 z-10">{content}</Link>
        ) : content}
        {count > 1 && (
          <>
            <button aria-label="前のお知らせ" onClick={(event) => { event.stopPropagation(); previous(); resetAutoPlay(); }} className="absolute left-4 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full sm:flex" style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.72)", color: "var(--forest-600)", backdropFilter: "blur(8px)" }}><ChevronLeft className="h-4 w-4" /></button>
            <button aria-label="次のお知らせ" onClick={(event) => { event.stopPropagation(); next(); resetAutoPlay(); }} className="absolute right-4 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full sm:flex" style={{ background: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.72)", color: "var(--forest-600)", backdropFilter: "blur(8px)" }}><ChevronRight className="h-4 w-4" /></button>
            <div className="absolute bottom-5 left-7 z-20 flex gap-1.5 rounded-full p-2 sm:left-10" style={{ background: "rgba(20,40,20,0.58)", backdropFilter: "blur(8px)" }}>
              {topics.map((item, index) => <button key={item.id} aria-label={`${index + 1}件目のお知らせを表示`} onClick={(event) => { event.stopPropagation(); goTo(index); resetAutoPlay(); }} className="rounded-full transition-all duration-300" style={{ width: index === current ? "1.45rem" : "0.42rem", height: "0.42rem", background: index === current ? "var(--gold-500)" : "rgba(255,255,255,0.82)", boxShadow: "0 1px 4px rgba(20,40,20,0.22)" }} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
