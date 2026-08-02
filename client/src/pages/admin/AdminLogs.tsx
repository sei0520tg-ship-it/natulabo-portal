import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CheckCircle2, Clock } from "lucide-react";

// 秒数を "mm:ss" 形式に変換
function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AdminLogs() {
  const { data: pageViewStats } = trpc.admin.pageViewStats.useQuery();
  const { data: videoViewStats } = trpc.admin.videoViewStats.useQuery();
  const { data: allPageViews } = trpc.admin.allPageViews.useQuery();
  const { data: allProgress } = trpc.video.allProgress.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-5xl">
        <div>
          <h1 className="text-xl font-serif font-semibold">閲覧ログ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">会員の閲覧履歴・動画視聴履歴を確認できます。</p>
        </div>

        <Tabs defaultValue="progress">
          <TabsList className="rounded-xl h-9">
            <TabsTrigger value="progress" className="text-xs rounded-lg">視聴進捗</TabsTrigger>
            <TabsTrigger value="pages" className="text-xs rounded-lg">ページ閲覧</TabsTrigger>
            <TabsTrigger value="videos" className="text-xs rounded-lg">動画視聴数</TabsTrigger>
            <TabsTrigger value="history" className="text-xs rounded-lg">閲覧履歴</TabsTrigger>
          </TabsList>

          {/* 視聴進捗タブ（新機能） */}
          <TabsContent value="progress" className="mt-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <p className="text-xs text-muted-foreground">
                  各会員がどの動画をどこまで視聴したかを確認できます。進捗は5秒ごとに自動保存されます。
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">会員名</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">動画タイトル</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">視聴位置</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">進捗</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">最終更新</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allProgress?.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium">
                          {p.userName ?? `ID:${p.userId}`}
                          {p.userEmail && (
                            <div className="text-muted-foreground font-normal">{p.userEmail}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {p.videoTitle ?? `動画ID:${p.videoId}`}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="font-mono">{formatTime(p.lastPosition)}</span>
                          {p.duration > 0 && (
                            <span className="text-muted-foreground"> / {formatTime(p.duration)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-2">
                            {p.completed === "yes" ? (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle2 size={12} /> 完了
                              </span>
                            ) : p.progressPct > 0 ? (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Clock size={12} /> {p.progressPct}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">未視聴</span>
                            )}
                            {p.progressPct > 0 && (
                              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${p.completed === "yes" ? "bg-green-500" : "bg-amber-400"}`}
                                  style={{ width: `${p.progressPct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {p.updatedAt ? new Date(p.updatedAt).toLocaleString("ja-JP") : "-"}
                        </td>
                      </tr>
                    ))}
                    {(!allProgress || allProgress.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          視聴データがありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pages" className="mt-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-sm font-medium mb-4">ページ別閲覧数</h3>
              {pageViewStats && pageViewStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={pageViewStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="pageName" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">データがありません</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">動画タイトル</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">視聴数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {videoViewStats?.map((v, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium">動画ID: {v.videoId}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{v.count}回</td>
                      </tr>
                    ))}
                    {(!videoViewStats || videoViewStats.length === 0) && (
                      <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-muted-foreground">データがありません</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">会員</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">ページ</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">日時</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allPageViews?.slice(0, 100).map((pv) => (
                      <tr key={pv.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-xs">{(pv as { userName?: string }).userName ?? `ID:${pv.userId}`}</td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{pv.pageName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {new Date(pv.viewedAt).toLocaleString("ja-JP")}
                        </td>
                      </tr>
                    ))}
                    {(!allPageViews || allPageViews.length === 0) && (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">データがありません</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
