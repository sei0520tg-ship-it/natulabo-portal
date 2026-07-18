import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Home,
  Leaf,
  LogOut,
  MessageCircle,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/dashboard", icon: Home,          label: "ホーム",         en: "HOME" },
  { href: "/setup",     icon: Settings,       label: "はじめに",       en: "SETUP" },
  { href: "/videos",    icon: BookOpen,       label: "動画",           en: "VIDEOS" },
  { href: "/recipes",   icon: Sparkles,       label: "レシピ",           en: "RECIPES" },
  { href: "/calendar",  icon: Calendar,       label: "カレンダー",     en: "EVENTS" },
  { href: "/contact",   icon: MessageCircle,  label: "お問い合わせ",   en: "CONTACT" },
  { href: "/links",     icon: ExternalLink,   label: "リンク集",       en: "LINKS" },
];

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--cream-50)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "var(--forest-500)" }}
          >
            <Leaf className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              color: "var(--brown-500)",
            }}
          >
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--cream-50)" }}>

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 z-30"
        style={{
          background: "white",
          borderRight: "1px solid var(--cream-300)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid var(--cream-200)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--forest-500)" }}
          >
            <Leaf className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                color: "var(--brown-800)",
                lineHeight: 1.2,
              }}
            >
              NatuLabo
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.55rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--brown-300)",
              }}
            >
              Portal
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, en }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background: active ? "var(--cream-100)" : "transparent",
                    borderLeft: active ? "2px solid var(--gold-400)" : "2px solid transparent",
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLDivElement).style.background = "var(--cream-50)";
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: active ? "var(--forest-500)" : "var(--brown-400, var(--brown-300))", flexShrink: 0 }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        fontWeight: active ? 500 : 300,
                        letterSpacing: "0.04em",
                        color: active ? "var(--brown-800)" : "var(--brown-500)",
                        lineHeight: 1.2,
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.5rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: active ? "var(--gold-500)" : "var(--brown-300)",
                      }}
                    >
                      {en}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}

          {user?.role === "admin" && (
            <>
              <div
                className="pt-4 pb-2 px-3"
                style={{ borderTop: "1px solid var(--cream-200)", marginTop: "0.75rem" }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "var(--gold-500)",
                  }}
                >
                  Admin
                </p>
              </div>
              <Link href="/admin">
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background: location.startsWith("/admin") ? "var(--cream-100)" : "transparent",
                    borderLeft: location.startsWith("/admin") ? "2px solid var(--gold-400)" : "2px solid transparent",
                  }}
                  onMouseEnter={e => {
                    if (!location.startsWith("/admin")) (e.currentTarget as HTMLDivElement).style.background = "var(--cream-50)";
                  }}
                  onMouseLeave={e => {
                    if (!location.startsWith("/admin")) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <Settings
                    size={16}
                    style={{ color: location.startsWith("/admin") ? "var(--forest-500)" : "var(--brown-300)" }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      fontWeight: location.startsWith("/admin") ? 500 : 300,
                      letterSpacing: "0.04em",
                      color: location.startsWith("/admin") ? "var(--brown-800)" : "var(--brown-500)",
                    }}
                  >
                    管理画面
                  </p>
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* User section */}
        <div
          className="px-3 py-4 space-y-0.5"
          style={{ borderTop: "1px solid var(--cream-200)" }}
        >
          <Link href="/profile">
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--cream-50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--cream-200)" }}
              >
                <User size={14} style={{ color: "var(--brown-500)" }} />
              </div>
              <p
                className="truncate"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 300,
                  color: "var(--brown-700)",
                  letterSpacing: "0.04em",
                }}
              >
                {user?.name ?? "プロフィール"}
              </p>
            </div>
          </Link>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
            style={{ background: "transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--cream-50)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <LogOut size={14} style={{ color: "var(--brown-300)" }} />
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 300,
                color: "var(--brown-300)",
                letterSpacing: "0.04em",
              }}
            >
              ログアウト
            </p>
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="lg:pl-60 pb-20 lg:pb-0 min-h-screen">
        {/* Mobile header */}
        <header
          className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14"
          style={{
            background: "rgba(250,248,243,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--cream-300)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "var(--forest-500)" }}
            >
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.85rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                color: "var(--brown-800)",
              }}
            >
              NatuLabo Portal
            </span>
          </div>
          <Link href="/profile">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--cream-200)" }}
            >
              <User size={15} style={{ color: "var(--brown-500)" }} />
            </div>
          </Link>
        </header>

        {children}
      </main>

      {/* ── Mobile bottom nav ───────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--cream-300)",
        }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200"
                  style={{ minWidth: "3.5rem" }}
                >
                  <Icon
                    size={20}
                    style={{ color: active ? "var(--forest-500)" : "var(--brown-300)" }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.6rem",
                      fontWeight: active ? 500 : 300,
                      letterSpacing: "0.04em",
                      color: active ? "var(--forest-500)" : "var(--brown-400, var(--brown-300))",
                    }}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
