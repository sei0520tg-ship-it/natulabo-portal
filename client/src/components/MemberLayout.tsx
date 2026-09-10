import BrandMark from "@/components/BrandMark";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { sectionTone, tone } from "@/lib/categoryTheme";
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
  Menu,
  Settings2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

/**
 * モバイル下部タブに出す項目と、その並び順。
 *
 * navItems の先頭5件を使う実装だったが、それだとサイドバーの並びを変えた
 * だけで下部タブまで変わってしまう。よく使うものを明示的に選ぶ。
 * ここに無い項目（はじめに・お問い合わせ・リンク集）はハンバーガーから辿る。
 */
const BOTTOM_TAB_HREFS = ["/dashboard", "/calendar", "/videos", "/recipes", "/testimonials"];

const navItems = [
  { href: "/dashboard", icon: Home, label: "ホーム", en: "HOME" },
  { href: "/setup", icon: Settings2, label: "はじめに", en: "START HERE" },
  { href: "/videos", icon: BookOpen, label: "学習動画", en: "VIDEO LIBRARY" },
  { href: "/recipes", icon: Sparkles, label: "クラフトレシピ", en: "RECIPES" },
  { href: "/testimonials", icon: Leaf, label: "体験談", en: "STORIES" },
  { href: "/calendar", icon: CalendarDays, label: "イベント", en: "EVENTS", tabLabel: "カレンダー" },
  { href: "/contact", icon: MessageCircleHeart, label: "お問い合わせ", en: "CONTACT" },
  { href: "/links", icon: ExternalLink, label: "リンク集", en: "LINKS" },
];

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
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
          <div className="natu-float flex h-14 w-14 items-center justify-center rounded-pill bg-card shadow-soft">
            <BrandMark variant="circle" className="h-11 w-11" title="" />
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
        className="fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] flex-col border-r border-cream-300 bg-cream-100 lg:flex"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="px-7 pb-7 pt-8">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="NatuLabo ホーム">
            <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-card shadow-soft">
              <BrandMark variant="circle" className="h-9 w-9" title="NatuLabo" />
            </span>
            <div>
              <BrandMark className="text-[1.15rem] leading-none" title="" />
              <p className="font-display text-brown-400" style={{ fontSize: "0.55rem", letterSpacing: "0.22em", marginTop: "0.35rem" }}>MEMBER&apos;S PORTAL</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-5">
          <p className="px-3 pb-3 pt-2 font-display text-brown-400" style={{ fontSize: "0.56rem", letterSpacing: "0.2em" }}>EXPLORE</p>
          <div className="space-y-1">
            {navItems.map(({ href, icon: Icon, label, en }) => {
              const active = location === href || location.startsWith(`${href}/`);
              const t = tone(sectionTone[href]);
              return (
                <Link key={href} href={href}>
                  <div
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 ${
                      active ? `${t.surface} shadow-soft` : "hover:bg-cream-200"
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-pill ${active ? `bg-card ${t.ink} shadow-soft` : "bg-cream-200 text-brown-500"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={active ? "text-brown-800" : "text-brown-600"} style={{ fontSize: "0.82rem", fontWeight: active ? 700 : 400, letterSpacing: "0.03em", lineHeight: 1.2 }}>{label}</p>
                      <p className={`font-display ${active ? t.ink : "text-brown-300"}`} style={{ fontSize: "0.49rem", letterSpacing: "0.16em", marginTop: "0.22rem" }}>{en}</p>
                    </div>
                    {active && <ChevronRight className={`h-3.5 w-3.5 ${t.ink}`} />}
                  </div>
                </Link>
              );
            })}
          </div>

          {user?.role === "admin" && (
            <div className="mt-6 border-t border-cream-300 pt-5">
              <p className="px-3 pb-2 font-display text-brown-400" style={{ fontSize: "0.56rem", letterSpacing: "0.2em" }}>MANAGE</p>
              <Link href="/admin">
                <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${location.startsWith("/admin") ? "bg-cream-200" : "hover:bg-cream-200"}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-cream-200 text-brown-500"><Settings2 className="h-3.5 w-3.5" /></span>
                  <p className="text-brown-600" style={{ fontSize: "0.82rem", letterSpacing: "0.03em" }}>管理画面</p>
                </div>
              </Link>
            </div>
          )}
        </nav>

        <div className="m-4 rounded-card border border-cream-300 bg-card p-3 shadow-soft">
          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-butter-100 text-butter-700"><UserRound className="h-3.5 w-3.5" /></span>
            <span className="min-w-0 flex-1 truncate text-brown-700" style={{ fontSize: "0.8rem", letterSpacing: "0.03em" }}>{user?.name ?? "プロフィール"}</span>
          </Link>
          <button onClick={() => logoutMutation.mutate()} className="mt-1 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-brown-400 transition-colors hover:bg-cream-100">
            <LogOut className="h-3.5 w-3.5" />
            <span style={{ fontSize: "0.68rem", letterSpacing: "0.06em" }}>ログアウト</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen pb-20 lg:pl-[17.5rem] lg:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 lg:hidden" style={{ background: "rgba(250,248,243,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--cream-300)" }}>
          <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="NatuLabo ホーム">
            <BrandMark variant="circle" className="h-9 w-9" title="NatuLabo" />
            <BrandMark className="text-[1.25rem] leading-none" title="" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/profile" aria-label="プロフィールを開く" className="flex h-9 w-9 items-center justify-center rounded-pill bg-cream-200 text-forest-600"><UserRound className="h-4 w-4" /></Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="メニューを開く"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-pill bg-cream-200 text-brown-700"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>
        {children}
      </main>

      {/* モバイルのメニュー。下部タブには5項目しか出せないため、
          残りの項目・管理画面・ログアウトはここから辿れるようにする。 */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="メニューを閉じる"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-brown-900/30"
          />
          <div className="absolute inset-y-0 right-0 flex w-[80%] max-w-xs flex-col border-l border-cream-300 bg-cream-50 shadow-float">
            <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
              <span className="font-display text-sm font-bold tracking-[0.12em] text-brown-700">MENU</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="メニューを閉じる"
                className="flex h-9 w-9 items-center justify-center rounded-pill bg-cream-200 text-brown-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              {navItems.map(({ href, icon: Icon, label, en }) => {
                const active = location === href || location.startsWith(`${href}/`);
                const t = tone(sectionTone[href]);
                return (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                    <div className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 ${active ? `${t.surface}` : ""}`}>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-pill ${active ? `bg-card ${t.ink}` : "bg-cream-200 text-brown-500"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm ${active ? "font-bold text-brown-800" : "text-brown-600"}`}>{label}</span>
                        <span className={`block font-display text-[0.5rem] tracking-[0.14em] ${active ? t.ink : "text-brown-300"}`}>{en}</span>
                      </span>
                    </div>
                  </Link>
                );
              })}

              {user?.role === "admin" && (
                <Link href="/admin" onClick={() => setMenuOpen(false)}>
                  <div className="mt-2 flex items-center gap-3 rounded-xl border-t border-cream-300 px-3 pb-2.5 pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-cream-200 text-brown-500"><Settings2 className="h-4 w-4" /></span>
                    <span className="text-sm text-brown-600">管理画面</span>
                  </div>
                </Link>
              )}
            </nav>

            <button
              type="button"
              onClick={() => { setMenuOpen(false); logoutMutation.mutate(); }}
              className="flex items-center gap-3 border-t border-cream-300 px-6 py-4 text-left text-sm text-brown-400"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </div>
      )}

      {/* モバイルの下部タブ。選択中は面（クリーム）で示し、アイコンはタブごとの色を持たせる。 */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-50 lg:hidden">
        <div className="flex items-stretch justify-around">
          {BOTTOM_TAB_HREFS.map((tabHref) => navItems.find((n) => n.href === tabHref))
            .filter((item): item is (typeof navItems)[number] => Boolean(item))
            .map((item) => {
            const { href, icon: Icon } = item;
            // 下部タブは幅が狭いので、短い呼び方があればそちらを使う
            const label = "tabLabel" in item ? item.tabLabel : item.label;
            const active = location === href || location.startsWith(`${href}/`);
            const t = tone(sectionTone[href]);
            return (
              <Link key={href} href={href} className="flex-1">
                <span
                  className={`flex h-full min-w-0 flex-col items-center gap-1 px-1 py-2.5 transition-colors ${
                    active ? "bg-cream-200" : ""
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? t.ink : "text-brown-300"}`} />
                  <span
                    className={`truncate text-[0.6rem] ${active ? "font-bold text-brown-700" : "text-brown-400"}`}
                  >
                    {label}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
