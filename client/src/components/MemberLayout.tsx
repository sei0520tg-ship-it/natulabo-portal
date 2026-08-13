import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Home,
  Leaf,
  LogOut,
  MessageCircleHeart,
  Settings2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/dashboard", icon: Home, label: "ホーム", en: "HOME" },
  { href: "/setup", icon: Settings2, label: "はじめに", en: "START HERE" },
  { href: "/videos", icon: BookOpen, label: "学習動画", en: "VIDEO LIBRARY" },
  { href: "/recipes", icon: Sparkles, label: "クラフトレシピ", en: "RECIPES" },
  { href: "/testimonials", icon: Leaf, label: "体験談", en: "STORIES" },
  { href: "/calendar", icon: CalendarDays, label: "イベント", en: "EVENTS" },
  { href: "/contact", icon: MessageCircleHeart, label: "お問い合わせ", en: "CONTACT" },
  { href: "/links", icon: ExternalLink, label: "リンク集", en: "LINKS" },
];

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--cream-50)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="natu-float flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--forest-500)" }}>
            <img src="/manus-storage/logo-circle_08be9919.png" alt="" className="h-10 w-10 rounded-full" />
          </div>
          <span style={{ color: "var(--brown-500)", fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.24em" }}>LOADING</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--cream-50)" }}>
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] flex-col lg:flex"
        style={{
          background: "linear-gradient(165deg, oklch(0.235 0.045 145) 0%, var(--brown-900) 100%)",
          boxShadow: "16px 0 40px rgba(45,34,22,0.08)",
        }}
      >
        <div className="px-7 pb-7 pt-8">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="NatuLabo ホーム">
            <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.94)" }}>
              <img src="/manus-storage/logo-circle_08be9919.png" alt="NatuLabo" className="h-8 w-8 object-contain" />
            </span>
            <div>
              <p style={{ color: "white", fontFamily: "var(--font-display)", fontSize: "1.15rem", letterSpacing: "0.16em", lineHeight: 1 }}>NATU LABO.</p>
              <p style={{ color: "rgba(255,255,255,0.46)", fontFamily: "var(--font-display)", fontSize: "0.55rem", letterSpacing: "0.3em", marginTop: "0.35rem" }}>MEMBER&apos;S PORTAL</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-5">
          <p className="px-3 pb-3 pt-2" style={{ color: "rgba(255,255,255,0.36)", fontFamily: "var(--font-display)", fontSize: "0.56rem", letterSpacing: "0.26em" }}>EXPLORE</p>
          <div className="space-y-1">
            {navItems.map(({ href, icon: Icon, label, en }) => {
              const active = location === href || location.startsWith(`${href}/`);
              return (
                <Link key={href} href={href}>
                  <div
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
                    style={{ background: active ? "rgba(255,255,255,0.14)" : "transparent" }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: active ? "var(--gold-300)" : "rgba(255,255,255,0.08)", color: active ? "var(--brown-900)" : "rgba(255,255,255,0.78)" }}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p style={{ color: active ? "white" : "rgba(255,255,255,0.78)", fontSize: "0.8rem", fontWeight: active ? 500 : 300, letterSpacing: "0.05em", lineHeight: 1.2 }}>{label}</p>
                      <p style={{ color: active ? "rgba(227,201,145,0.8)" : "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)", fontSize: "0.49rem", letterSpacing: "0.2em", marginTop: "0.22rem" }}>{en}</p>
                    </div>
                    {active && <ChevronRight className="h-3.5 w-3.5" style={{ color: "var(--gold-300)" }} />}
                  </div>
                </Link>
              );
            })}
          </div>

          {user?.role === "admin" && (
            <div className="mt-6 border-t pt-5" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <p className="px-3 pb-2" style={{ color: "rgba(255,255,255,0.36)", fontFamily: "var(--font-display)", fontSize: "0.56rem", letterSpacing: "0.26em" }}>MANAGE</p>
              <Link href="/admin">
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: location.startsWith("/admin") ? "rgba(255,255,255,0.14)" : "transparent" }}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.78)" }}><Settings2 className="h-3.5 w-3.5" /></span>
                  <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.8rem", fontWeight: 300, letterSpacing: "0.05em" }}>管理画面</p>
                </div>
              </Link>
            </div>
          )}
        </nav>

        <div className="m-4 rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.14)", color: "var(--gold-300)" }}><UserRound className="h-3.5 w-3.5" /></span>
            <span className="min-w-0 flex-1 truncate" style={{ color: "rgba(255,255,255,0.86)", fontSize: "0.78rem", fontWeight: 300, letterSpacing: "0.04em" }}>{user?.name ?? "プロフィール"}</span>
          </Link>
          <button onClick={() => logoutMutation.mutate()} className="mt-1 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left" style={{ color: "rgba(255,255,255,0.44)" }}>
            <LogOut className="h-3.5 w-3.5" />
            <span style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>ログアウト</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen pb-20 lg:pl-[17.5rem] lg:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 lg:hidden" style={{ background: "rgba(250,248,243,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--cream-300)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="NatuLabo ホーム">
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "white", boxShadow: "0 2px 8px rgba(45,34,22,0.08)" }}><img src="/manus-storage/logo-circle_08be9919.png" alt="NatuLabo" className="h-7 w-7" /></span>
            <span style={{ color: "var(--brown-800)", fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "0.14em" }}>NATU LABO.</span>
          </Link>
          <Link href="/profile" aria-label="プロフィールを開く" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--cream-200)", color: "var(--forest-600)" }}><UserRound className="h-4 w-4" /></Link>
        </header>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 lg:hidden" style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--cream-300)" }}>
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const active = location === href || location.startsWith(`${href}/`);
            return (
              <Link key={href} href={href}>
                <span className="flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5" style={{ color: active ? "var(--forest-600)" : "var(--brown-300)" }}>
                  <span className="flex h-6 w-8 items-center justify-center rounded-full" style={{ background: active ? "var(--cream-200)" : "transparent" }}><Icon className="h-4 w-4" /></span>
                  <span style={{ fontSize: "0.58rem", fontWeight: active ? 500 : 300, letterSpacing: "0.03em" }}>{label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
