import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Form = { title: string; description: string; videoUrl: string; imageUrl: string; linkUrl: string; linkLabel: string; sortOrder: number };
const emptyForm: Form = { title: "", description: "", videoUrl: "", imageUrl: "", linkUrl: "", linkLabel: "", sortOrder: 0 };

export default function AdminSetup() {
  const { data: steps, refetch } = trpc.setup.adminList.useQuery();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);

  const upsertMutation = trpc.setup.upsert.useMutation({
    onSuccess: () => { toast.success(editId ? "更新しました" : "追加しました"); refetch(); setOpen(false); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const deleteMutation = trpc.setup.delete.useMutation({
    onSuccess: () => { toast.success("削除しました"); refetch(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (step: NonNullable<typeof steps>[0]) => {
    setForm({ title: step.title, description: step.description ?? "", videoUrl: step.videoUrl ?? "", imageUrl: step.imageUrl ?? "", linkUrl: step.linkUrl ?? "", linkLabel: step.linkLabel ?? "", sortOrder: step.sortOrder });
    setEditId(step.id);
    setOpen(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...(editId ? { id: editId } : {}),
      title: form.title,
      description: form.description || undefined,
      videoUrl: form.videoUrl || undefined,
      imageUrl: form.imageUrl || undefined,
      linkUrl: form.linkUrl || undefined,
      linkLabel: form.linkLabel || undefined,
      sortOrder: form.sortOrder,
    };
    upsertMutation.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-semibold">初期設定管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">「はじめての方へ」のステップを管理します。</p>
          </div>
          <Button onClick={openCreate} size="sm" className="rounded-xl gap-1.5"><Plus size={15} /> 追加</Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">順</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">タイトル</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">動画URL</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {steps?.map((step) => (
                  <tr key={step.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{step.sortOrder}</td>
                    <td className="px-4 py-3 text-xs font-medium">{step.title}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell max-w-xs truncate">{step.videoUrl ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg" onClick={() => openEdit(step)}><Pencil size={13} /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-destructive" onClick={() => deleteMutation.mutate({ id: step.id })}><Trash2 size={13} /></Button>
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
            <DialogHeader><DialogTitle className="font-serif">{editId ? "ステップを編集" : "ステップを追加"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div><Label className="text-xs">タイトル *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" required /></div>
              <div><Label className="text-xs">説明</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div><Label className="text-xs">動画URL（Google Drive等）</Label><Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div><Label className="text-xs">画像URL</Label><Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div><Label className="text-xs">リンクURL</Label><Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div><Label className="text-xs">リンクラベル</Label><Input value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} placeholder="詳細を見る" className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div><Label className="text-xs">表示順</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>キャンセル</Button>
                <Button type="submit" className="flex-1 rounded-xl" disabled={upsertMutation.isPending}>{editId ? "更新" : "追加"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
