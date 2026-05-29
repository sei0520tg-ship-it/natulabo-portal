import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminInvitations() {
  const { data: invitations, refetch } = trpc.invitation.list.useQuery();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", maxUses: 1, expiresAt: "" });

  const createMutation = trpc.invitation.create.useMutation({
    onSuccess: () => { toast.success("招待コードを作成しました"); refetch(); setOpen(false); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const deleteMutation = trpc.invitation.delete.useMutation({
    onSuccess: () => { toast.success("削除しました"); refetch(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const handleDelete = (id: number) => {
    if (confirm("この招待コードを削除しますか？")) deleteMutation.mutate({ id });
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm({ ...form, code });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("コードをコピーしました");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      code: form.code,
      maxUses: form.maxUses,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-semibold">招待コード管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">会員招待用コードの発行・管理ができます。</p>
          </div>
          <Button onClick={() => { setForm({ code: "", maxUses: 1, expiresAt: "" }); setOpen(true); }} size="sm" className="rounded-xl gap-1.5">
            <Plus size={15} /> 発行
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">コード</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">使用数</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">有効期限</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">状態</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(invitations as Array<{ id: number; code: string; usedCount?: number; useCount?: number; maxUses: number; expiresAt?: Date | null; createdAt: Date }>)?.map((inv) => {
                      const expired = inv.expiresAt && new Date(inv.expiresAt) < new Date();
                      const usedCount = inv.usedCount ?? inv.useCount ?? 0;
                      const maxed = usedCount >= inv.maxUses;
                  const status = expired ? "期限切れ" : maxed ? "上限達成" : "有効";
                  return (
                    <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{inv.code}</code>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 rounded" onClick={() => copyCode(inv.code)}>
                            <Copy size={11} />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{usedCount} / {inv.maxUses}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                        {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString("ja-JP") : "無期限"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status === "有効" ? "default" : "secondary"} className="text-[10px]">{status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-destructive" onClick={() => handleDelete(inv.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader><DialogTitle className="font-serif">招待コードを発行</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">招待コード *</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ABCD1234" className="h-10 rounded-xl text-sm font-mono" required />
                  <Button type="button" variant="outline" size="sm" onClick={generateCode} className="h-10 rounded-xl shrink-0 text-xs">自動生成</Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">最大使用回数</Label>
                <Input type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="text-xs">有効期限（空欄で無期限）</Label>
                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>キャンセル</Button>
                <Button type="submit" className="flex-1 rounded-xl" disabled={createMutation.isPending}>発行する</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
