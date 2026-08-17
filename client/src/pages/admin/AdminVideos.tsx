import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, RefreshCw, Trash2, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type VideoForm = { title: string; category: string; videoUrl: string; thumbnailUrl: string; description: string; isLatest: boolean; sortOrder: number };
const emptyForm: VideoForm = { title: "", category: "", videoUrl: "", thumbnailUrl: "", description: "", isLatest: false, sortOrder: 0 };

export default function AdminVideos() {
  const { data: videos, refetch } = trpc.video.list.useQuery();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);

  const upsertMutation = trpc.video.upsert.useMutation({
    onSuccess: () => { toast.success(editId ? "動画を更新しました" : "動画を追加しました"); refetch(); setOpen(false); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const deleteMutation = trpc.video.delete.useMutation({
    onSuccess: () => { toast.success("削除しました"); refetch(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  // YouTube 再生リストとの同期（通常は cron が自動実行。ここは手動トリガー用）
  const { data: syncStatus, refetch: refetchStatus } = trpc.video.syncStatus.useQuery();
  const syncMutation = trpc.video.syncNow.useMutation({
    onSuccess: (r) => {
      toast.success(
        `同期しました（取得 ${r.fetched}件 / 新規 ${r.inserted} / 更新 ${r.updated} / 紐付け ${r.linked} / 非表示 ${r.unpublished}）`
      );
      refetch();
      refetchStatus();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (v: NonNullable<typeof videos>[0]) => {
    setForm({ title: v.title, category: v.category, videoUrl: v.videoUrl, thumbnailUrl: v.thumbnailUrl ?? "", description: v.description ?? "", isLatest: v.isLatest, sortOrder: v.sortOrder });
    setEditId(v.id);
    setOpen(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(editId ? { id: editId, ...form } : form);
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-semibold">動画管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">動画URLの追加・編集・削除ができます。</p>
          </div>
          <Button onClick={openCreate} size="sm" className="rounded-xl gap-1.5">
            <Plus size={15} /> 追加
          </Button>
        </div>

        {/* YouTube 自動連携の状態 */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Youtube size={18} className="mt-0.5 shrink-0 text-red-600" />
              <div className="min-w-0">
                <p className="text-sm font-medium">YouTube自動連携</p>
                {syncStatus?.configured ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    同期済み {syncStatus.syncedCount}件
                    {syncStatus.lastSyncedAt
                      ? ` ・ 最終同期 ${new Date(syncStatus.lastSyncedAt).toLocaleString("ja-JP")}`
                      : " ・ 未同期"}
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-0.5">
                    未設定です。環境変数 YOUTUBE_API_KEY と YOUTUBE_PLAYLIST_ID を設定してください。
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={!syncStatus?.configured || syncMutation.isPending}
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5"
            >
              <RefreshCw size={15} className={syncMutation.isPending ? "animate-spin" : ""} />
              {syncMutation.isPending ? "同期中..." : "今すぐ同期"}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">画像・タイトル</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">カテゴリ</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">最新</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {videos?.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" className="h-9 w-14 shrink-0 rounded-md object-cover" /> : <div className="h-9 w-14 shrink-0 rounded-md" style={{ background: "var(--cream-100)" }} />}
                        <span className="truncate text-xs font-medium">{v.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{v.category}</td>
                    <td className="px-4 py-3">
                      {v.isLatest && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">NEW</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg" onClick={() => openEdit(v)}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate({ id: v.id })}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">{editId ? "動画を編集" : "動画を追加"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">タイトル *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" required />
              </div>
              <div>
                <Label className="text-xs">カテゴリ *</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="例: 基礎知識" className="mt-1 h-10 rounded-xl text-sm" required />
              </div>
              <div>
                <Label className="text-xs">動画URL（Google Drive / YouTube等） *</Label>
                <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." className="mt-1 h-10 rounded-xl text-sm" required />
              </div>
              <div>
                <Label className="text-xs">サムネイル画像URL</Label>
                <Input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="/manus-storage/... または https://..." className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="text-xs">説明</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="text-xs">表示順</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">最新動画として表示</Label>
                <Switch checked={form.isLatest} onCheckedChange={(v) => setForm({ ...form, isLatest: v })} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>キャンセル</Button>
                <Button type="submit" className="flex-1 rounded-xl" disabled={upsertMutation.isPending}>
                  {editId ? "更新" : "追加"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
