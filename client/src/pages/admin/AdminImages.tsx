import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image, Pencil, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function AdminImages() {
  const { data: images, refetch } = trpc.image.list.useQuery();
  const [open, setOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ slot: "", label: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.image.upload.useMutation({
    onSuccess: (data) => { setPreviewUrl(data.url); setUploading(false); toast.success("アップロードしました"); refetch(); setOpen(false); },
    onError: (e: { message: string }) => { toast.error(e.message); setUploading(false); },
  });
  const updateUrlMutation = trpc.image.updateUrl.useMutation({
    onSuccess: () => { toast.success("更新しました"); refetch(); setOpen(false); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const openCreate = () => { setForm({ slot: "", label: "", imageUrl: "" }); setPreviewUrl(""); setEditSlot(null); setOpen(true); };
  const openEdit = (img: NonNullable<typeof images>[0]) => {
    setForm({ slot: img.slot, label: img.label, imageUrl: img.imageUrl ?? "" });
    setPreviewUrl(img.imageUrl ?? "");
    setEditSlot(img.slot);
    setOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.slot || !form.label) { toast.error("スロットキーとラベルを先に入力してください"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      uploadMutation.mutate({ base64, mimeType: file.type, slot: form.slot, label: form.label });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlMutation.mutate({ slot: form.slot, label: form.label, imageUrl: form.imageUrl });
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-semibold">画像管理</h1>
            <p className="text-sm text-muted-foreground mt-0.5">サイトで使用する画像のアップロード・差し替えができます。</p>
          </div>
          <Button onClick={openCreate} size="sm" className="rounded-xl gap-1.5"><Upload size={15} /> 追加</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images?.map((img) => (
            <div key={img.id} className="bg-card rounded-xl border border-border overflow-hidden group">
              <div className="aspect-video bg-muted relative">
                {img.imageUrl ? (
                  <img src={img.imageUrl} alt={img.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Image size={24} className="opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" className="h-7 w-7 p-0 rounded-lg" onClick={() => openEdit(img)}><Pencil size={12} /></Button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{img.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{img.slot}</p>
              </div>
            </div>
          ))}
          {(!images || images.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Image size={32} className="mb-2 opacity-30" />
              <p className="text-sm">画像がありません</p>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader><DialogTitle className="font-serif">{editSlot ? "画像を差し替え" : "画像を追加"}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-xs">ラベル *</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="例: ヒーロー画像" className="mt-1 h-10 rounded-xl text-sm" /></div>
              {!editSlot && (
                <div><Label className="text-xs">スロットキー *</Label><Input value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })} placeholder="例: hero_banner" className="mt-1 h-10 rounded-xl text-sm font-mono" /></div>
              )}

              {/* File upload */}
              <div>
                <Label className="text-xs">ファイルをアップロード</Label>
                <div
                  className="mt-1 border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="w-full max-h-28 object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload size={18} />
                      <p className="text-xs">クリックして画像を選択</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {uploading && <p className="text-xs text-muted-foreground mt-1 text-center">アップロード中...</p>}
              </div>

              {/* URL input alternative */}
              <div>
                <Label className="text-xs">または画像URLを直接入力</Label>
                <form onSubmit={handleUrlSubmit} className="flex gap-2 mt-1">
                  <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="h-10 rounded-xl text-sm flex-1" />
                  <Button type="submit" size="sm" className="h-10 rounded-xl shrink-0" disabled={updateUrlMutation.isPending}>適用</Button>
                </form>
              </div>

              <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => setOpen(false)}>閉じる</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
