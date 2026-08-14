import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = ["健康", "美容", "メンタル", "家族", "その他"] as const;

type TestimonialForm = {
  title: string;
  authorName: string;
  authorLabel: string;
  category: string;
  content: string;
  oilsUsed: string;
  imageUrl: string;
  isPublished: "published" | "draft";
  sortOrder: number;
};

const emptyForm: TestimonialForm = {
  title: "",
  authorName: "",
  authorLabel: "",
  category: "健康",
  content: "",
  oilsUsed: "",
  imageUrl: "",
  isPublished: "published",
  sortOrder: 0,
};

export default function AdminTestimonials() {
  const { data: testimonials, refetch } = trpc.testimonial.adminList.useQuery();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  const upsertMutation = trpc.testimonial.upsert.useMutation({
    onSuccess: () => {
      toast.success(editId ? "体験談を更新しました" : "体験談を追加しました");
      refetch();
      setOpen(false);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const deleteMutation = trpc.testimonial.delete.useMutation({
    onSuccess: () => {
      toast.success("削除しました");
      refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (t: NonNullable<typeof testimonials>[0]) => {
    setForm({
      title: t.title,
      authorName: t.authorName,
      authorLabel: t.authorLabel ?? "",
      category: t.category,
      content: t.content,
      oilsUsed: t.oilsUsed ?? "",
      imageUrl: t.imageUrl ?? "",
      isPublished: t.isPublished,
      sortOrder: t.sortOrder,
    });
    setEditId(t.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(editId ? { id: editId, ...form } : form);
  };

  const togglePublish = (t: NonNullable<typeof testimonials>[0]) => {
    upsertMutation.mutate({
      id: t.id,
      title: t.title,
      authorName: t.authorName,
      authorLabel: t.authorLabel ?? undefined,
      category: t.category,
      content: t.content,
      oilsUsed: t.oilsUsed ?? undefined,
      imageUrl: t.imageUrl ?? undefined,
      isPublished: t.isPublished === "published" ? "draft" : "published",
      sortOrder: t.sortOrder,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-semibold">体験談管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              体験談の追加・編集・削除・公開/非公開の切り替えができます。
            </p>
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">画像・タイトル</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">著者</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">カテゴリ</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">公開</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {testimonials?.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium max-w-xs">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {t.imageUrl ? <img src={t.imageUrl} alt="" className="h-9 w-14 shrink-0 rounded-md object-cover" /> : <div className="h-9 w-14 shrink-0 rounded-md" style={{ background: "var(--cream-100)" }} />}
                        <div className="min-w-0">
                          <div className="truncate max-w-[180px]">{t.title}</div>
                          <div className="text-muted-foreground truncate max-w-[180px] mt-0.5 text-[11px]">
                            {t.content.slice(0, 40)}…
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                      <div>{t.authorName}</div>
                      {t.authorLabel && (
                        <div className="text-[11px] opacity-70">{t.authorLabel}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {t.category}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(t)}
                        title={t.isPublished === "published" ? "公開中（クリックで非公開）" : "非公開（クリックで公開）"}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition-colors ${
                          t.isPublished === "published"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                      >
                        {t.isPublished === "published" ? (
                          <><Eye size={11} /> 公開</>
                        ) : (
                          <><EyeOff size={11} /> 非公開</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 rounded-lg"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm(`「${t.title}」を削除しますか？`)) {
                              deleteMutation.mutate({ id: t.id });
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!testimonials || testimonials.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      体験談がまだありません。「追加」ボタンから登録してください。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 追加・編集ダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editId ? "体験談を編集" : "体験談を追加"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="例: ラベンダーで睡眠が改善しました"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="authorName">著者名 *</Label>
                <Input
                  id="authorName"
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  placeholder="例: 田中 花子"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="authorLabel">著者ラベル</Label>
                <Input
                  id="authorLabel"
                  value={form.authorLabel}
                  onChange={(e) => setForm({ ...form, authorLabel: e.target.value })}
                  placeholder="例: 2児の母 / 愛用歴3年"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>カテゴリ *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>公開状態</Label>
                <Select
                  value={form.isPublished}
                  onValueChange={(v) => setForm({ ...form, isPublished: v as "published" | "draft" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">公開</SelectItem>
                    <SelectItem value="draft">非公開</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">体験談本文 *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="体験談の内容を入力してください..."
                rows={5}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="oilsUsed">使用したオイル</Label>
              <Input
                id="oilsUsed"
                value={form.oilsUsed}
                onChange={(e) => setForm({ ...form, oilsUsed: e.target.value })}
                placeholder="例: ラベンダー,フランキンセンス（カンマ区切り）"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">アイコン画像URL</Label>
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sortOrder">表示順</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? "保存中…" : editId ? "更新" : "追加"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
