import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { BarChart3, BookOpen, Calendar, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: pvStats } = trpc.admin.pageViewStats.useQuery();
  const { data: users } = trpc.admin.users.useQuery();

  const recentUsers = users?.slice(0, 5) ?? [];

  const statCards = [
    { label: "総会員数", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "総ページビュー", value: stats?.totalPageViews ?? 0, icon: BarChart3, color: "text-green-600", bg: "bg-green-50" },
    { label: "動画視聴数", value: stats?.totalVideoViews ?? 0, icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "イベント数", value: stats?.totalEvents ?? 0, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-serif font-semibold">管理ダッシュボード</h1>
          <p className="text-sm text-muted-foreground mt-0.5">サイト全体の状況を確認できます。</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-4">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Recent users */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold mb-3">最近の会員</h2>
            <div className="space-y-2">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">{(u.name ?? "?")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{u.name ?? "未設定"}</p>
                    <p className="text-[10px] text-muted-foreground">{u.email ?? "メールなし"}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {u.role === "admin" ? "管理者" : "会員"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Page view stats */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold mb-3">ページ別閲覧数</h2>
            <div className="space-y-2">
              {pvStats?.slice(0, 6).map((pv) => (
                <div key={pv.pageName} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs truncate">{pv.pageName}</span>
                      <span className="text-xs font-medium text-muted-foreground ml-2">{pv.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full"
                        style={{ width: `${Math.min(100, (pv.count / (pvStats[0]?.count ?? 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!pvStats || pvStats.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">データがありません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
