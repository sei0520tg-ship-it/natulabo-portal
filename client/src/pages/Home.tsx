import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { BookOpen, Calendar, ExternalLink, Leaf, MessageCircle, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

/* ── Intersection-observer fade-in hook ───────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Section label (01 VISION) ───────────────────────────────────────── */
function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.2em", color: "var(--gold-500)" }}>
        {num}
      </span>
      <span style={{ width: "2rem", height: "1px", background: "var(--gold-400)", display: "inline-block" }} />
      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold-500)" }}>
        {label}
      </span>
    </div>
  );
}

/* ── Reveal wrapper ──────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.8s cubic-bezier(0.23,1,0.32,1) ${delay}ms, transform 0.8s cubic-bezier(0.23,1,0.32,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Feature cards data ───────────────────────────────────────────────── */
const features = [
  { icon: Settings,     label: "はじめての方へ",   en: "GETTING STARTED",  desc: "ステップ形式でスムーズにスタート",    href: "/setup" },
  { icon: BookOpen,     label: "学習動画",         en: "VIDEO LIBRARY",    desc: "カテゴリ別に動画を整理・視聴",        href: "/videos" },
  { icon: Calendar,     label: "イベント",         en: "EVENTS",           desc: "講座・イベントをカレンダーで確認",    href: "/calendar" },
  { icon: MessageCircle,label: "お問い合わせ",     en: "CONTACT",          desc: "困ったときの相談窓口一覧",            href: "/contact" },
  { icon: ExternalLink, label: "外部リンク集",     en: "USEFUL LINKS",     desc: "愛用に役立つリンクをまとめて",        href: "/links" },
];

/* ─────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "var(--cream-50)", color: "var(--brown-800)" }}>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(250,248,243,0.88)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--cream-300)",
        }}
      >
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <img
              src="/manus-storage/logo-circle_08be9919.png"
              alt="NATU LABO."
              className="w-9 h-9 rounded-full object-cover"
            />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--brown-800)" }}>
              NATU LABO.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <Link href="/dashboard">
                  <button
                    className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "var(--forest-500)",
                      color: "white",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    マイページへ
                  </button>
                </Link>
              ) : (
                <>
                  <a
                    href={getLoginUrl()}
                    className="text-sm transition-colors hidden sm:block"
                    style={{ color: "var(--brown-500)", fontFamily: "var(--font-sans)", letterSpacing: "0.04em" }}
                  >
                    ログイン
                  </a>
                  <Link href="/register">
                    <button
                      className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                      style={{
                        background: "var(--forest-500)",
                        color: "white",
                        fontFamily: "var(--font-sans)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      会員登録
                    </button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, oklch(0.960 0.018 82) 0%, oklch(0.940 0.025 78) 50%, oklch(0.920 0.030 76) 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-10%", right: "-5%",
            width: "50vw", height: "50vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, oklch(0.820 0.100 75 / 0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "5%", left: "-8%",
            width: "40vw", height: "40vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, oklch(0.540 0.090 145 / 0.08) 0%, transparent 70%)",
          }}
        />

        <div className="container relative text-center px-4 animate-fade-in-up">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-3 mb-8 px-4 py-1.5 rounded-full"
            style={{
              border: "1px solid var(--gold-300)",
              background: "rgba(255,255,255,0.5)",
            }}
          >
            <Leaf className="w-3 h-3" style={{ color: "var(--gold-500)" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold-600)" }}>
              dōTERRA 愛用者専用ポータル
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="mb-6"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.35,
              letterSpacing: "0.06em",
              color: "var(--brown-800)",
            }}
          >
            自然の恵みとともに、<br />
            <em style={{ fontStyle: "normal", color: "var(--forest-500)" }}>豊かな毎日</em>へ。
          </h1>

          <p
            className="mx-auto mb-10 max-w-md"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: 300,
              lineHeight: 2,
              letterSpacing: "0.06em",
              color: "var(--brown-500)",
            }}
          >
            学習動画・イベント情報・お役立ちリンクをまとめた、<br className="hidden sm:block" />
            あなたのための会員専用ポータルです。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!loading && (
              isAuthenticated ? (
                <Link href="/dashboard">
                  <button
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "var(--forest-500)",
                      color: "white",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.08em",
                      boxShadow: "0 4px 20px oklch(0.480 0.095 145 / 0.25)",
                    }}
                  >
                    マイページへ進む
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <button
                      className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all"
                      style={{
                        background: "var(--forest-500)",
                        color: "white",
                        fontFamily: "var(--font-sans)",
                        letterSpacing: "0.08em",
                        boxShadow: "0 4px 20px oklch(0.480 0.095 145 / 0.25)",
                      }}
                    >
                      無料で会員登録
                      <span style={{ fontSize: "0.75rem" }}>›</span>
                    </button>
                  </Link>
                  <a
                    href={getLoginUrl()}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "transparent",
                      border: "1px solid var(--brown-300)",
                      color: "var(--brown-700)",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ログイン
                  </a>
                </>
              )
            )}
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ color: "var(--brown-300)" }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              Scroll
            </span>
            <div
              className="w-px h-10"
              style={{ background: "linear-gradient(to bottom, var(--gold-400), transparent)" }}
            />
          </div>
        </div>
      </section>

      {/* ── 01 ABOUT ───────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ background: "white" }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: decorative image placeholder */}
            <Reveal>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: "4/5",
                  background: "linear-gradient(135deg, var(--cream-200) 0%, var(--cream-300) 100%)",
                  maxWidth: "420px",
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-40">
                  <Leaf className="w-16 h-16" style={{ color: "var(--forest-500)" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--brown-500)" }}>
                    Image
                  </span>
                </div>
                {/* Gold corner accent */}
                <div
                  className="absolute top-4 right-4 w-12 h-12 rounded-full"
                  style={{ border: "1px solid var(--gold-300)", opacity: 0.6 }}
                />
                <div
                  className="absolute bottom-4 left-4 w-8 h-8 rounded-full"
                  style={{ border: "1px solid var(--gold-300)", opacity: 0.4 }}
                />
              </div>
            </Reveal>

            {/* Right: text */}
            <Reveal delay={150}>
              <SectionLabel num="01" label="About NatuLabo" />
              <h2
                className="mb-6"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  letterSpacing: "0.05em",
                  color: "var(--brown-800)",
                }}
              >
                本質のウェルネスを、<br />
                <em style={{ fontStyle: "normal", color: "var(--forest-500)" }}>日常の行動</em>から。
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  fontWeight: 300,
                  lineHeight: 2.1,
                  letterSpacing: "0.05em",
                  color: "var(--brown-500)",
                }}
              >
                NatuLabo Portalは、dōTERRA愛用者のための会員専用サポートサイトです。
                はじめての方向けのスタートガイドから、学習動画・イベント情報・お役立ちリンクまで、
                あなたのウェルネスライフをトータルにサポートします。
              </p>
              <div
                className="mt-8 pt-8"
                style={{ borderTop: "1px solid var(--cream-300)" }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    color: "var(--gold-600)",
                    letterSpacing: "0.04em",
                    lineHeight: 1.8,
                  }}
                >
                  "自然の力を、あなたの毎日に。"
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 02 FEATURES ────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ background: "var(--cream-50)" }}>
        <div className="container">
          <Reveal className="text-center mb-16">
            <SectionLabel num="02" label="Member Contents" />
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 400,
                letterSpacing: "0.06em",
                color: "var(--brown-800)",
              }}
            >
              会員限定コンテンツ
            </h2>
            <p
              className="mt-4 mx-auto max-w-sm"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 300,
                color: "var(--brown-500)",
                lineHeight: 2,
                letterSpacing: "0.05em",
              }}
            >
              ログイン後にすべての機能をご利用いただけます。
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Reveal key={f.href} delay={i * 80}>
                <Link href={isAuthenticated ? f.href : "/register"}>
                  <div
                    className="group p-8 rounded-2xl cursor-pointer transition-all duration-300"
                    style={{
                      background: "white",
                      border: "1px solid var(--cream-300)",
                      boxShadow: "0 2px 12px oklch(0.200 0.030 60 / 0.04)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px oklch(0.200 0.030 60 / 0.10)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--gold-300)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px oklch(0.200 0.030 60 / 0.04)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--cream-300)";
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: "var(--cream-100)" }}
                    >
                      <f.icon className="w-5 h-5" style={{ color: "var(--forest-500)" }} />
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.6rem",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "var(--gold-500)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {f.en}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: "var(--brown-800)",
                        letterSpacing: "0.04em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {f.label}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        fontWeight: 300,
                        color: "var(--brown-500)",
                        lineHeight: 1.8,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ background: "white" }}>
        <div className="container">
          <Reveal>
            <div
              className="relative rounded-3xl overflow-hidden px-8 py-16 text-center"
              style={{
                background: "linear-gradient(135deg, var(--forest-600) 0%, var(--forest-500) 60%, oklch(0.520 0.092 150) 100%)",
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "-20%", right: "-5%",
                  width: "40%", paddingBottom: "40%",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: "-15%", left: "5%",
                  width: "30%", paddingBottom: "30%",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />

              <div className="relative">
                <div
                  className="inline-flex items-center gap-3 mb-6"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <span style={{ width: "2rem", height: "1px", background: "var(--gold-300)", display: "inline-block" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase" }}>
                    Invitation
                  </span>
                  <span style={{ width: "2rem", height: "1px", background: "var(--gold-300)", display: "inline-block" }} />
                </div>

                <h2
                  className="mb-4"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontWeight: 400,
                    color: "white",
                    letterSpacing: "0.06em",
                    lineHeight: 1.5,
                  }}
                >
                  招待コードをお持ちの方へ
                </h2>
                <p
                  className="mb-8 mx-auto max-w-sm"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 2,
                    letterSpacing: "0.05em",
                  }}
                >
                  招待コードがあれば、すぐに会員登録できます。<br />
                  コードをご準備のうえ登録ページへお進みください。
                </p>
                <Link href="/register">
                  <button
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "white",
                      color: "var(--forest-600)",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.08em",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    会員登録はこちら
                    <span style={{ fontSize: "0.75rem" }}>›</span>
                  </button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        className="py-12"
        style={{
          background: "var(--brown-900)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "var(--forest-500)" }}
            >
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em" }}>
              NatuLabo Portal
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              fontWeight: 300,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.06em",
            }}
          >
            © {new Date().getFullYear()} NatuLabo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
