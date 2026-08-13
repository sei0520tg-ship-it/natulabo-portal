import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Leaf,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

const heroLetters = ["N", "A", "T", "U", "L", "A", "B", "O", "."];

const featureCards = [
  {
    href: "/setup",
    no: "01",
    title: "はじめての方へ",
    en: "GUIDE TO START",
    description: "はじめの一歩から、日常に取り入れるための準備を丁寧にご案内します。",
    icon: Leaf,
    tone: "var(--forest-600)",
  },
  {
    href: "/videos",
    no: "02",
    title: "学びの時間",
    en: "VIDEO LIBRARY",
    description: "あなたのペースで続けられる、会員限定の学習動画ライブラリです。",
    icon: BookOpen,
    tone: "var(--gold-600)",
  },
  {
    href: "/calendar",
    no: "03",
    title: "つながりを育てる",
    en: "EVENTS & COMMUNITY",
    description: "イベントや講座の予定を確認し、心地よいつながりを広げられます。",
    icon: CalendarDays,
    tone: "var(--forest-500)",
  },
  {
    href: "/testimonials",
    no: "04",
    title: "メンバーの声",
    en: "TRUE STORIES",
    description: "日々の変化や小さな発見を、仲間のリアルな言葉から受け取れます。",
    icon: MessageCircleHeart,
    tone: "var(--gold-500)",
  },
];

function SectionKicker({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        style={{
          color: "var(--gold-500)",
          fontFamily: "var(--font-display)",
          fontSize: "0.7rem",
          letterSpacing: "0.24em",
        }}
      >
        {number}
      </span>
      <span style={{ background: "var(--gold-400)", height: "1px", width: "2.25rem" }} />
      <span
        style={{
          color: "var(--brown-500)",
          fontFamily: "var(--font-display)",
          fontSize: "0.65rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const entryHref = isAuthenticated ? "/dashboard" : "/register";
  const entryLabel = isAuthenticated ? "マイページへ進む" : "会員登録をはじめる";

  return (
    <main style={{ background: "var(--cream-50)", color: "var(--brown-800)" }}>
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(16, 31, 19, 0.28)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="container flex h-[4.75rem] items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="NatuLabo ホーム">
            <span
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
            >
              <img
                src="/manus-storage/logo-circle_08be9919.png"
                alt=""
                className="h-7 w-7 object-contain"
              />
            </span>
            <span
              className="hidden sm:block"
              style={{
                color: "white",
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                letterSpacing: "0.16em",
              }}
            >
              NATU LABO.
            </span>
          </Link>

          {!loading && (
            <div className="flex items-center gap-2 sm:gap-4">
              {!isAuthenticated && (
                <a
                  href={getLoginUrl()}
                  className="hidden text-xs sm:block"
                  style={{ color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em" }}
                >
                  ログイン
                </a>
              )}
              <Link
                href={entryHref}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-transform duration-200 hover:-translate-y-0.5 sm:px-5"
                style={{
                  background: "rgba(255,255,255,0.94)",
                  color: "var(--forest-600)",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                }}
              >
                {isAuthenticated ? "マイページ" : "会員登録"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </header>

      <section
        className="relative flex min-h-[100svh] items-center overflow-hidden pt-20"
        style={{ background: "oklch(0.20 0.04 145)" }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/manus-storage/forest_bg_loop_1b4e6054.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(105deg, rgba(8,25,12,0.86) 0%, rgba(13,37,18,0.58) 52%, rgba(8,21,11,0.5) 100%)" }}
        />
        <div
          className="natu-orbit absolute -right-[17vw] -top-[34vw] h-[68vw] w-[68vw] rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[11%] left-[7%] h-28 w-28 rounded-full opacity-80 blur-[1px]"
          style={{ border: "1px solid rgba(229,202,145,0.45)" }}
          aria-hidden="true"
        />

        <div className="container relative z-10 grid items-end gap-14 py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)] lg:py-24">
          <div className="max-w-4xl">
            <p
              className="mb-8 flex items-center gap-3"
              style={{
                color: "rgba(255,255,255,0.72)",
                fontFamily: "var(--font-display)",
                fontSize: "0.66rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
              }}
            >
              <span className="h-px w-8" style={{ background: "var(--gold-300)" }} />
              dōTERRA member&apos;s portal
            </p>

            <div
              className="mb-5 flex leading-none"
              aria-label="NATU LABO"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(4.2rem, 9vw, 8rem)", fontWeight: 300, letterSpacing: "0.035em", color: "rgba(255,255,255,0.96)", whiteSpace: "nowrap" }}
            >
              {heroLetters.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="natu-hero-letter"
                  style={{ "--letter-delay": `${200 + index * 85}ms` } as React.CSSProperties}
                >
                  {letter === "." ? letter : letter}
                </span>
              ))}
            </div>

            <h1
              className="natu-hero-word max-w-2xl"
              style={{
                "--reveal-delay": "960ms",
                color: "white",
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.7rem, 4.1vw, 3.15rem)",
                fontWeight: 400,
                letterSpacing: "0.1em",
                lineHeight: 1.55,
              } as React.CSSProperties}
            >
              自然の恵みとともに、
              <br />
              <span style={{ color: "var(--gold-300)" }}>わたしらしい毎日</span>を育てる。
            </h1>
          </div>

          <div className="natu-hero-word max-w-sm lg:justify-self-end" style={{ "--reveal-delay": "1180ms" } as React.CSSProperties}>
            <p
              className="mb-7 border-l pl-5"
              style={{
                borderColor: "rgba(226,201,146,0.75)",
                color: "rgba(255,255,255,0.78)",
                fontSize: "0.86rem",
                fontWeight: 300,
                letterSpacing: "0.08em",
                lineHeight: 2.05,
              }}
            >
              学び、つながり、日々の小さな発見を。
              <br />
              NatuLaboはあなたのウェルネスライフに寄り添う会員専用ポータルです。
            </p>
            <Link
              href={entryHref}
              className="group inline-flex items-center gap-5 rounded-full border px-6 py-3.5 text-sm transition-all duration-300 hover:bg-white hover:text-[var(--forest-600)]"
              style={{ borderColor: "rgba(255,255,255,0.65)", color: "white", letterSpacing: "0.08em" }}
            >
              {entryLabel}
              <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center">
          <span style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.3em" }}>SCROLL TO EXPLORE</span>
          <div className="mx-auto mt-2 h-9 w-px" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)" }} />
        </div>
      </section>

      <section className="overflow-hidden bg-white py-24 lg:py-36">
        <div className="container grid items-start gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4 natu-scroll-reveal">
            <SectionKicker number="01" title="Philosophy" />
          </div>
          <div className="lg:col-span-8 natu-scroll-reveal">
            <p
              className="max-w-3xl"
              style={{ color: "var(--brown-800)", fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4.2vw, 3.7rem)", fontWeight: 400, letterSpacing: "0.075em", lineHeight: 1.55 }}
            >
              本質のウェルネスを、
              <br />
              <span style={{ color: "var(--forest-500)" }}>日常の行動</span>から。
            </p>
            <div className="mt-10 grid gap-8 border-t pt-8 sm:grid-cols-[1.2fr_0.8fr]" style={{ borderColor: "var(--cream-300)" }}>
              <p style={{ color: "var(--brown-500)", fontSize: "0.9rem", fontWeight: 300, letterSpacing: "0.06em", lineHeight: 2.1 }}>
                NatuLabo Portalは、dōTERRA愛用者のための会員専用サポートサイトです。はじめての方向けのガイドから、動画、イベント、レシピ、体験談まで。毎日の選択がもっと心地よくなるための情報を、ひとつの場所に集めました。
              </p>
              <p className="natu-float self-end" style={{ color: "var(--gold-600)", fontFamily: "var(--font-display)", fontSize: "1.45rem", fontStyle: "italic", lineHeight: 1.55 }}>
                “ Live naturally,
                <br />
                live beautifully. ”
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 lg:py-36" style={{ background: "var(--cream-100)" }}>
        <div className="container">
          <div className="mb-14 flex flex-col justify-between gap-8 sm:flex-row sm:items-end natu-scroll-reveal">
            <div>
              <SectionKicker number="02" title="Member Contents" />
              <h2 className="mt-6" style={{ color: "var(--brown-800)", fontFamily: "var(--font-serif)", fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)", fontWeight: 400, letterSpacing: "0.07em" }}>
                暮らしに寄り添う、
                <br />
                会員限定コンテンツ。
              </h2>
            </div>
            <p className="max-w-sm" style={{ color: "var(--brown-500)", fontSize: "0.82rem", fontWeight: 300, letterSpacing: "0.05em", lineHeight: 1.9 }}>
              知ること、試すこと、分かち合うこと。今のあなたに必要なコンテンツへ、心地よくアクセスできます。
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border sm:grid-cols-2" style={{ borderColor: "var(--cream-300)", background: "var(--cream-300)" }}>
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={isAuthenticated ? feature.href : "/register"}
                  className="group relative min-h-[19rem] overflow-hidden bg-white p-7 transition-colors duration-300 hover:bg-[var(--cream-50)] sm:p-10 natu-scroll-reveal"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <span style={{ color: "var(--gold-500)", fontFamily: "var(--font-display)", fontSize: "0.75rem", letterSpacing: "0.2em" }}>{feature.no}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105" style={{ background: "var(--cream-100)", color: feature.tone }}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="absolute inset-x-7 bottom-8 sm:inset-x-10 sm:bottom-10">
                    <p style={{ color: "var(--gold-500)", fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.24em" }}>{feature.en}</p>
                    <h3 className="mt-3" style={{ color: "var(--brown-800)", fontFamily: "var(--font-serif)", fontSize: "1.45rem", fontWeight: 400, letterSpacing: "0.06em" }}>{feature.title}</h3>
                    <p className="mt-3 max-w-sm" style={{ color: "var(--brown-500)", fontSize: "0.78rem", fontWeight: 300, letterSpacing: "0.04em", lineHeight: 1.85 }}>{feature.description}</p>
                    <span className="mt-5 flex items-center gap-2 text-xs" style={{ color: "var(--forest-500)", letterSpacing: "0.08em" }}>
                      詳しく見る <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--brown-900)] py-24 lg:py-36">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 82% 20%, var(--forest-500), transparent 34%)" }} />
        <div className="container relative z-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="natu-scroll-reveal">
            <SectionKicker number="03" title="Invitation" />
            <h2 className="mt-6" style={{ color: "white", fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, letterSpacing: "0.09em", lineHeight: 1.55 }}>
              心地よい習慣を、
              <br />
              今日からはじめよう。
            </h2>
          </div>
          <div className="natu-scroll-reveal">
            <p style={{ color: "rgba(255,255,255,0.68)", fontSize: "0.86rem", fontWeight: 300, letterSpacing: "0.06em", lineHeight: 2 }}>
              招待コードをお持ちの方は、すぐにNatuLabo Portalの会員登録を始められます。
            </p>
            <Link href="/register" className="mt-7 inline-flex items-center gap-5 rounded-full px-6 py-3.5 text-sm transition-transform duration-300 hover:-translate-y-1" style={{ background: "var(--gold-300)", color: "var(--brown-900)", letterSpacing: "0.08em" }}>
              招待コードで登録する <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[var(--brown-900)] px-4 pb-10">
        <div className="container flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.94)" }}>
              <img src="/manus-storage/logo-circle_08be9919.png" alt="NatuLabo" className="h-7 w-7 object-contain" />
            </span>
            <span style={{ color: "rgba(255,255,255,0.86)", fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.14em" }}>NatuLabo Portal</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.68rem", fontWeight: 300, letterSpacing: "0.08em" }}>© {new Date().getFullYear()} NatuLabo. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
