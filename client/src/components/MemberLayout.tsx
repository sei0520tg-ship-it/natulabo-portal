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
  User,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/dashboard", icon: Home, label: "ホーム" },
  { href: "/setup", icon: Settings, label: "はじめに" },
  { href: "/videos", icon: BookOpen, label: "動画" },
  { href: "/calendar", icon: Calendar, label: "カレンダー" },
  { href: "/contact", icon: MessageCircle, label: "お問い合わせ" },
  { href: "/links", icon: ExternalLink, label: "リンク集" },
];

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Leaf className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-sidebar border-r border-sidebar-border z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-serif font-semibold text-sidebar-foreground text-sm leading-tight">NatuLabo</p>
            <p className="text-xs text-muted-foreground tracking-wider">PORTAL</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
                  <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                  {label}
                </div>
              </Link>
            );
          })}

          {user?.role === "admin" && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">管理</p>
              </div>
              <Link href="/admin">
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  location.startsWith("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}>
                  <Settings size={18} />
                  管理画面
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-sidebar-border space-y-0.5">
          <Link href="/profile">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer">
              <User size={18} />
              <span className="truncate">{user?.name ?? "プロフィール"}</span>
            </div>
          </Link>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut size={18} />
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-60 pb-20 lg:pb-0 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-serif font-semibold text-sm">NatuLabo Portal</span>
          </div>
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
          </Link>
        </header>

        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
