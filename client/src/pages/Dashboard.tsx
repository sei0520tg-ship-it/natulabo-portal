import { useAuth } from "@/_core/hooks/useAuth";
import MemberLayout from "@/components/MemberLayout";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  MessageCircle,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

const menuItems = [
  {
    href: "/setup",
    icon: Settings,
    title: "はじめての方向け",
    subtitle: "初期設定・準備フロー",
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  {
    href: "/contact",
    icon: MessageCircle,
    title: "お問い合わせ",
    subtitle: "困ったときの相談窓口一覧",
    color: "bg-sky-50 text-sky-600",
    border: "border-sky-100",
  },
  {
    href: "/videos",
    icon: BookOpen,
    title: "学習動画ライブラリ",
    subtitle: "カテゴリ別動画コンテンツ",
    color: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
  },
  {
    href: "/calendar",
    icon: Calendar,
    title: "イベント・講座",
    subtitle: "カレンダーで日程確認",
    color: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
  },
  {
    href: "/links",
    icon: ExternalLink,
    title: "外部リンク集",
    subtitle: "愛用に役立つサイト一覧",
    color: "bg-rose-50 text-rose-600",
    border: "border-rose-100",
  },
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
      <div className="container py-6 lg:py-8 space-y-8">
        {/* Greeting */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            こんにちは、{user?.name ?? "ゲスト"}さん
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            NatuLaboポータルへようこそ。今日も素敵な一日を。
          </p>
        </div>

        {/* Hero image */}
        <div className="animate-fade-in-up stagger-1 rounded-2xl overflow-hidden h-36 sm:h-48 relative">
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80"
            alt="NatuLabo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent flex items-center px-6">
            <div>
              <p className="text-white font-serif text-lg font-semibold leading-snug">
                自然の力で、<br />毎日をもっと豊かに。
              </p>
            </div>
          </div>
        </div>

        {/* Menu grid */}
        <div className="animate-fade-in-up stagger-2">
          <h2 className="text-base font-semibold text-foreground mb-3">メニュー</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {menuItems.map(({ href, icon: Icon, title, subtitle, color, border }) => (
              <Link key={href} href={href}>
                <div className={`card-hover bg-card rounded-xl border ${border} p-4 flex items-center gap-4 cursor-pointer`}>
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <div className="animate-fade-in-up stagger-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">直近のイベント</h2>
              <Link href="/calendar">
                <span className="text-xs text-primary hover:underline">すべて見る</span>
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                const date = new Date(event.startAt);
                const categoryColors: Record<string, string> = {
                  company: "bg-blue-100 text-blue-700",
                  team: "bg-green-100 text-green-700",
                  online: "bg-purple-100 text-purple-700",
                  workshop: "bg-orange-100 text-orange-700",
                  seminar: "bg-pink-100 text-pink-700",
                  business: "bg-indigo-100 text-indigo-700",
                  user: "bg-teal-100 text-teal-700",
                };
                const categoryLabels: Record<string, string> = {
                  company: "本社", team: "チーム", online: "オンライン",
                  workshop: "ワークショップ", seminar: "セミナー",
                  business: "ビジネス", user: "愛用者",
                };
                return (
                  <div key={event.id} className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
                    <div className="text-center w-10 shrink-0">
                      <p className="text-xs text-muted-foreground">{date.getMonth() + 1}月</p>
                      <p className="text-xl font-bold text-primary leading-none">{date.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.location}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${categoryColors[event.category] ?? "bg-gray-100 text-gray-700"}`}>
                      {categoryLabels[event.category] ?? event.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Latest videos */}
        {latestVideos.length > 0 && (
          <div className="animate-fade-in-up stagger-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">最新動画</h2>
              <Link href="/videos">
                <span className="text-xs text-primary hover:underline">すべて見る</span>
              </Link>
            </div>
            <div className="space-y-2">
              {latestVideos.map((video) => (
                <Link key={video.id} href={`/videos#video-${video.id}`}>
                  <div className="card-hover bg-card rounded-xl border border-border p-3.5 flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{video.category}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">NEW</span>
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
