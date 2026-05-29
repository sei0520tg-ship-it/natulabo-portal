import { useAuth } from "@/_core/hooks/useAuth";
import MemberLayout from "@/components/MemberLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import { CheckCircle2, Loader2, LogOut, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  usePageView("プロフィール");
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: (user as any)?.phone ?? "",
    address: (user as any)?.address ?? "",
    brandRegisteredAt: (user as any)?.brandRegisteredAt
      ? new Date((user as any).brandRegisteredAt).toISOString().split("T")[0]
      : "",
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  const updateMutation = trpc.member.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("プロフィールを更新しました");
      setEditing(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: form.name,
      phone: form.phone,
      address: form.address,
      brandRegisteredAt: form.brandRegisteredAt || undefined,
    });
  };

  return (
    <MemberLayout>
      <div className="container py-6 lg:py-8 max-w-lg">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold">プロフィール</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up stagger-1">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <User size={36} className="text-primary" />
          </div>
          <p className="font-semibold text-lg">{user?.name ?? "未設定"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {user?.role === "admin" && (
            <span className="mt-2 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">管理者</span>
          )}
        </div>

        {/* Profile form */}
        <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up stagger-2">
          {!editing ? (
            <div className="space-y-4">
              {[
                { label: "お名前", value: user?.name ?? "未設定" },
                { label: "メールアドレス", value: user?.email ?? "未設定" },
                { label: "電話番号", value: (user as any)?.phone ?? "未設定" },
                { label: "住所", value: (user as any)?.address ?? "未設定" },
                { label: "dōTERRA登録日", value: (user as any)?.brandRegisteredAt ? new Date((user as any).brandRegisteredAt).toLocaleDateString("ja-JP") : "未設定" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground shrink-0">{label}</span>
                  <span className="text-sm font-medium text-right">{value}</span>
                </div>
              ))}
              <Button onClick={() => setEditing(true)} variant="outline" className="w-full mt-4 rounded-xl h-11">
                編集する
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm">お名前</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm">電話番号</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="address" className="text-sm">住所</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="brand" className="text-sm">dōTERRA登録日</Label>
                <Input id="brand" type="date" value={form.brandRegisteredAt} onChange={(e) => setForm({ ...form, brandRegisteredAt: e.target.value })} className="mt-1.5 h-11 rounded-xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setEditing(false)}>
                  キャンセル
                </Button>
                <Button type="submit" className="flex-1 h-11 rounded-xl" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "保存する"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Logout */}
        <div className="mt-4 animate-fade-in-up stagger-3">
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={16} className="mr-2" />
            ログアウト
          </Button>
        </div>
      </div>
    </MemberLayout>
  );
}
