import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Topic = {
  id: number;
  title: string;
  body: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  sortOrder: number;
  isPublished: "published" | "draft";
  createdAt: Date;
  updatedAt: Date;
};

type FormState = {
  id?: number;
  title: string;
  body: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  sortOrder: number;
  isPublished: "published" | "draft";
};

const emptyForm = (): FormState => ({
  title: "",
  body: "",
  imageUrl: "",
  buttonText: "",
  buttonUrl: "",
  sortOrder: 0,
  isPublished: "published",
});

export default function AdminTopics() {
  const utils = trpc.useUtils();
  const { data: topics = [], isLoading } = trpc.topic.adminList.useQuery();
  const upsert = trpc.topic.upsert.useMutation({
    onSuccess: () => {
      utils.topic.adminList.invalidate();
      setDialogOpen(false);
      toast.success(form.id ? "トピックスを更新しました" : "トピックスを追加しました");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.topic.delete.useMutation({
    onSuccess: () => {
      utils.topic.adminList.invalidate();
      toast.success("削除しました");
    },
    onError: (e) => toast.error(e.message),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  function openNew() {
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(t: Topic) {
    setForm({
      id: t.id,
      title: t.title,
      body: t.body ?? "",
      imageUrl: t.imageUrl ?? "",
      buttonText: t.buttonText ?? "",
      buttonUrl: t.buttonUrl ?? "",
      sortOrder: t.sortOrder,
      isPublished: t.isPublished,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      toast.error("タイトルは必須です");
      return;
    }
    upsert.mutate({
      ...form,
      body: form.body || undefined,
      imageUrl: form.imageUrl || undefined,
      buttonText: form.buttonText || undefined,
      buttonUrl: form.buttonUrl || undefined,
    });
  }

  function handleDelete(id: number) {
    if (!confirm("このトピックスを削除しますか？")) return;
    deleteMutation.mutate({ id });
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                fontWeight: 400,
                color: "var(--brown-800)",
              }}
            >
              トピックス管理
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--brown-400)", marginTop: "0.25rem" }}>
              ダッシュボード上部のカルーセルに表示されるお知らせを管理します（最大5件推奨）
            </p>
          </div>
          <Button onClick={openNew} style={{ background: "var(--forest-600)", color: "white" }}>
            <Plus className="w-4 h-4 mr-2" />
            新規追加
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-sm" style={{ color: "var(--brown-400)" }}>
            読み込み中...
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: "var(--brown-400)" }}>
            トピックスがありません。「新規追加」から追加してください。
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--cream-300)" }}>
            <Table>
              <TableHeader>
                <TableRow style={{ background: "var(--cream-50)" }}>
                  <TableHead className="w-12 text-center">順序</TableHead>
                  <TableHead>画像・タイトル</TableHead>
                  <TableHead>本文（抜粋）</TableHead>
                  <TableHead className="w-24">ボタン</TableHead>
                  <TableHead className="w-24">状態</TableHead>
                  <TableHead className="w-24 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-center text-sm" style={{ color: "var(--brown-400)" }}>
                      {t.sortOrder}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {t.imageUrl ? <img src={t.imageUrl} alt="" className="h-10 w-14 rounded-lg object-cover" /> : <div className="h-10 w-14 rounded-lg" style={{ background: "var(--cream-100)" }} />}
                        <div>
                          <div className="font-medium text-sm" style={{ color: "var(--brown-800)" }}>
                            {t.title}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--brown-400)" }}>
                            {t.imageUrl ? "画像あり" : "画像未設定"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs" style={{ color: "var(--brown-500)" }}>
                        {t.body ? t.body.slice(0, 50) + (t.body.length > 50 ? "…" : "") : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs" style={{ color: "var(--brown-500)" }}>
                        {t.buttonText || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={t.isPublished === "published" ? "default" : "secondary"}
                        style={
                          t.isPublished === "published"
                            ? { background: "var(--forest-100)", color: "var(--forest-700)", border: "none" }
                            : { background: "var(--cream-200)", color: "var(--brown-500)", border: "none" }
                        }
                      >
                        {t.isPublished === "published" ? "公開" : "下書き"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(t)}
                          style={{ color: "var(--forest-600)" }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(t.id)}
                          style={{ color: "#dc2626" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}>
                {form.id ? "トピックスを編集" : "トピックスを追加"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--brown-600)" }}>
                  タイトル <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="例: 🌿 8月のトピックス"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--brown-600)" }}>
                  本文（任意）
                </label>
                <Textarea
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="お知らせの詳細内容を入力..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--brown-600)" }}>
                  背景画像URL（任意）
                </label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--brown-600)" }}>
                    ボタンテキスト（任意）
                  </label>
                  <Input
                    value={form.buttonText}
                    onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                    placeholder="例: 詳細を見る"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--brown-600)" }}>
                    ボタンリンク先（任意）
                  </label>
                  <Input
                    value={form.buttonUrl}
                    onChange={(e) => setForm((f) => ({ ...f, buttonUrl: e.target.value }))}
                    placeholder="/videos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--brown-600)" }}>
                    表示順
                  </label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--brown-600)" }}>
                    公開状態
                  </label>
                  <Select
                    value={form.isPublished}
                    onValueChange={(v) => setForm((f) => ({ ...f, isPublished: v as "published" | "draft" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">公開</SelectItem>
                      <SelectItem value="draft">下書き</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={upsert.isPending}
                style={{ background: "var(--forest-600)", color: "white" }}
              >
                {upsert.isPending ? "保存中..." : "保存する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
