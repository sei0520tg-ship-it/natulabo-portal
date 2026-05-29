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
  { href: "/admin", icon: BarChart3, label: "ダッシュボード" },
  { href: "/admin/users", icon: Users, label: "会員管理" },
  { href: "/admin/videos", icon: BookOpen, label: "動画管理" },
  { href: "/admin/events", icon: Calendar, label: "イベント管理" },
  { href: "/admin/contact", icon: MessageCircle, label: "問い合わせ先管理" },
  { href: "/admin/links", icon: Link2, label: "外部リンク管理" },
  { href: "/admin/setup", icon: Settings, label: "初期設定管理" },
  { href: "/admin/images", icon: Image, label: "画像管理" },
  { href: "/admin/invitations", icon: ExternalLink, label: "招待コード管理" },
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Leaf className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-56 bg-card border-r border-border z-30">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-serif font-semibold text-xs text-foreground">NatuLabo</p>
            <p className="text-[10px] text-muted-foreground tracking-wider">ADMIN</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <Icon size={15} className="shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-3 border-t border-border space-y-0.5">
          <Link href="/dashboard">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
              <Leaf size={15} />
              会員ページへ
            </div>
          </Link>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
          >
            <LogOut size={15} />
            ログアウト
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-card border-b border-border flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-primary" />
          <span className="font-serif font-semibold text-sm">管理画面</span>
        </div>
        <Link href="/dashboard">
          <span className="text-xs text-primary">会員ページへ</span>
        </Link>
      </div>

      {/* Main */}
      <main className="flex-1 lg:pl-56 pt-12 lg:pt-0 min-h-screen">
        {/* Mobile nav */}
        <div className="lg:hidden overflow-x-auto border-b border-border bg-card px-2 py-1.5">
          <div className="flex gap-1 min-w-max">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = location === href || (href !== "/admin" && location.startsWith(href));
              return (
                <Link key={href} href={href}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}>
                    <Icon size={13} />
                    {label}
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
