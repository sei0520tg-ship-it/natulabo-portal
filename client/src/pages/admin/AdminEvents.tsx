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
  { value: "company", label: "本社" },
  { value: "team", label: "チーム" },
  { value: "online", label: "オンライン" },
  { value: "workshop", label: "ワークショップ" },
  { value: "seminar", label: "セミナー" },
  { value: "business", label: "ビジネス" },
  { value: "user", label: "愛用者" },
];

type EventForm = { title: string; description: string; category: string; startAt: string; endAt: string; location: string; formUrl: string };
const emptyForm: EventForm = { title: "", description: "", category: "online", startAt: "", endAt: "", location: "", formUrl: "" };

export default function AdminEvents() {
  const { data: events, refetch } = trpc.event.adminList.useQuery();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);

  const upsertMutation = trpc.event.upsert.useMutation({
    onSuccess: () => { toast.success(editId ? "更新しました" : "追加しました"); refetch(); setOpen(false); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const deleteMutation = trpc.event.delete.useMutation({
    onSuccess: () => { toast.success("削除しました"); refetch(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (ev: NonNullable<typeof events>[0]) => {
    const fmt = (d: Date | null | undefined) => d ? new Date(d).toISOString().slice(0, 16) : "";
    setForm({
      title: ev.title, description: ev.description ?? "", category: ev.category,
      startAt: fmt(ev.startAt), endAt: fmt(ev.endAt), location: ev.location ?? "", formUrl: ev.formUrl ?? "",
    });
    setEditId(ev.id);
    setOpen(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...(editId ? { id: editId } : {}),
      title: form.title, description: form.description || undefined, category: form.category,
      startAt: new Date(form.startAt), endAt: form.endAt ? new Date(form.endAt) : undefined,
      location: form.location || undefined, formUrl: form.formUrl || undefined,
    };
    upsertMutation.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-semibold">イベント管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">イベント・講座の追加・編集・削除ができます。</p>
          </div>
          <Button onClick={openCreate} size="sm" className="rounded-xl gap-1.5">
            <Plus size={15} /> 追加
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">タイトル</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">日時</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">カテゴリ</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events?.map((ev) => (
                  <tr key={ev.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium max-w-xs truncate">{ev.title}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                      {new Date(ev.startAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {CATEGORIES.find((c) => c.value === ev.category)?.label ?? ev.category}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg" onClick={() => openEdit(ev)}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate({ id: ev.id })}>
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
              <DialogTitle className="font-serif">{editId ? "イベントを編集" : "イベントを追加"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">タイトル *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" required />
              </div>
              <div>
                <Label className="text-xs">カテゴリ *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1 h-10 rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">開始日時 *</Label>
                <Input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" required />
              </div>
              <div>
                <Label className="text-xs">終了日時</Label>
                <Input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="text-xs">場所</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="text-xs">申込みフォームURL</Label>
                <Input value={form.formUrl} onChange={(e) => setForm({ ...form, formUrl: e.target.value })} placeholder="https://forms.gle/..." className="mt-1 h-10 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="text-xs">説明</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 h-10 rounded-xl text-sm" />
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
