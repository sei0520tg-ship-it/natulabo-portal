import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ExternalLink,
  Image,
  Leaf,
  Link2,
  LogOut,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/admin",             icon: BarChart3,     label: "ダッシュボード",     en: "DASHBOARD" },
  { href: "/admin/users",       icon: Users,         label: "会員管理",           en: "MEMBERS" },
  { href: "/admin/videos",      icon: BookOpen,      label: "動画管理",           en: "VIDEOS" },
  { href: "/admin/events",      icon: Calendar,      label: "イベント管理",       en: "EVENTS" },
  { href: "/admin/contact",     icon: MessageCircle, label: "問い合わせ先管理",   en: "CONTACT" },
  { href: "/admin/links",       icon: Link2,         label: "外部リンク管理",     en: "LINKS" },
  { href: "/admin/setup",       icon: Settings,      label: "初期設定管理",       en: "SETUP" },
  { href: "/admin/images",      icon: Image,         label: "画像管理",           en: "IMAGES" },
  { href: "/admin/invitations", icon: ExternalLink,  label: "招待コード管理",     en: "INVITES" },
  { href: "/admin/testimonials", icon: Leaf,          label: "体験談管理",         en: "STORIES" },
  { href: "/admin/topics",        icon: Leaf,          label: "トピックス管理",       en: "TOPICS" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        window.location.href = getLoginUrl();
      } else if (user?.role !== "admin") {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, loading, user, navigate]);

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--cream-50)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "var(--forest-500)" }}
        >
          <Leaf className="w-5 h-5 text-white animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream-50)" }}>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-56 z-30"
        style={{
          background: "white",
          borderRight: "1px solid var(--cream-300)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 py-4"
          style={{ borderBottom: "1px solid var(--cream-200)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--forest-500)" }}
          >
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.8rem",
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
                fontSize: "0.5rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "var(--gold-500)",
              }}
            >
              Admin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, en }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
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
                    size={14}
                    style={{ color: active ? "var(--forest-500)" : "var(--brown-300)", flexShrink: 0 }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.75rem",
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
                        fontSize: "0.48rem",
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
        </nav>

        {/* Footer */}
        <div
          className="px-2 py-3 space-y-0.5"
          style={{ borderTop: "1px solid var(--cream-200)" }}
        >
          <Link href="/dashboard">
            <div
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--cream-50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <Leaf size={14} style={{ color: "var(--brown-300)" }} />
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 300,
                  color: "var(--brown-500)",
                  letterSpacing: "0.04em",
                }}
              >
                会員ページへ
              </p>
            </div>
          </Link>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200"
            style={{ background: "transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--cream-50)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <LogOut size={14} style={{ color: "var(--brown-300)" }} />
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
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

      {/* ── Mobile header ────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-12"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--cream-300)",
        }}
      >
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4" style={{ color: "var(--forest-500)" }} />
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.85rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: "var(--brown-800)",
            }}
          >
            管理画面
          </span>
        </div>
        <Link href="/dashboard">
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: 300,
              color: "var(--forest-500)",
              letterSpacing: "0.04em",
            }}
          >
            会員ページへ
          </span>
        </Link>
      </div>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 lg:pl-56 pt-12 lg:pt-0 min-h-screen">
        {/* Mobile scroll nav */}
        <div
          className="lg:hidden overflow-x-auto px-2 py-2"
          style={{
            background: "white",
            borderBottom: "1px solid var(--cream-200)",
          }}
        >
          <div className="flex gap-1 min-w-max">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = location === href || (href !== "/admin" && location.startsWith(href));
              return (
                <Link key={href} href={href}>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200"
                    style={{
                      background: active ? "var(--cream-100)" : "transparent",
                      border: active ? "1px solid var(--gold-300)" : "1px solid transparent",
                    }}
                  >
                    <Icon
                      size={12}
                      style={{ color: active ? "var(--forest-500)" : "var(--brown-300)" }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.7rem",
                        fontWeight: active ? 500 : 300,
                        color: active ? "var(--brown-800)" : "var(--brown-500)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
