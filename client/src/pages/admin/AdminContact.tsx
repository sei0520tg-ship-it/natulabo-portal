import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "LINE", label: "LINE相談" },
  { value: "medical", label: "医療相談" },
  { value: "app", label: "アプリ・システム" },
  { value: "other", label: "その他" },
];

const ICONS = ["MessageCircle", "Stethoscope", "Smartphone", "Mail", "HelpCircle"];

type Form = { title: string; description: string; category: string; iconName: string; linkUrl: string; linkLabel: string; sortOrder: number };
const emptyForm: Form = { title: "", description: "", category: "LINE", iconName: "MessageCircle", linkUrl: "", linkLabel: "", sortOrder: 0 };

export default function AdminContact() {
  const { data: items, refetch } = trpc.contact.adminList.useQuery();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);

  const upsertMutation = trpc.contact.upsert.useMutation({
    onSuccess: () => { toast.success(editId ? "更新しました" : "追加しました"); refetch(); setOpen(false); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const deleteMutation = trpc.contact.delete.useMutation({
    onSuccess: () => { toast.success("削除しました"); refetch(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (item: NonNullable<typeof items>[0]) => {
    setForm({ title: item.title, description: item.description ?? "", category: item.category, iconName: item.iconName ?? "HelpCircle", linkUrl: item.linkUrl ?? "", linkLabel: item.linkLabel ?? "", sortOrder: item.sortOrder });
    setEditId(item.id);
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
            <h1 className="text-xl font-serif font-semibold">問い合わせ先管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">相談窓口の追加・編集・削除ができます。</p>
          </div>
          <Button onClick={openCreate} size="sm" className="rounded-xl gap-1.5"><Plus size={15} /> 追加</Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">タイトル</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">カテゴリ</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items?.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg" onClick={() => openEdit(item)}><Pencil size={13} /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-destructive" onClick={() => deleteMutation.mutate({ id: item.id })}><Trash2 size={13} /></Button>
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
            <DialogHeader><DialogTitle className="font-serif">{editId ? "編集" : "追加"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div><Label className="text-xs">タイトル *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" required /></div>
              <div><Label className="text-xs">説明</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div>
                <Label className="text-xs">カテゴリ</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1 h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">アイコン</Label>
                <Select value={form.iconName} onValueChange={(v) => setForm({ ...form, iconName: v })}>
                  <SelectTrigger className="mt-1 h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{ICONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">リンクURL</Label><Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." className="mt-1 h-10 rounded-xl text-sm" /></div>
              <div><Label className="text-xs">リンクラベル</Label><Input value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} placeholder="相談する" className="mt-1 h-10 rounded-xl text-sm" /></div>
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
