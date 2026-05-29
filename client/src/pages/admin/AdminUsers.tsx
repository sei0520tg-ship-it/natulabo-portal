import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { data: users, refetch } = trpc.admin.users.useQuery();
  const [search, setSearch] = useState("");
  const setRoleMutation = trpc.admin.setRole.useMutation({
    onSuccess: () => { toast.success("ロールを更新しました"); refetch(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const filtered = (users ?? []).filter((u) =>
    (u.name ?? "").includes(search) || (u.email ?? "").includes(search)
  );

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-xl font-serif font-semibold">会員管理</h1>
          <p className="text-sm text-muted-foreground mt-0.5">登録会員の一覧・ロール変更ができます。</p>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="名前・メールで検索"
            className="pl-9 h-10 rounded-xl"
          />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">会員</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">メール</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">ロール</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">登録日</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-primary">{(u.name ?? "?")[0]}</span>
                        </div>
                        <span className="font-medium text-xs">{u.name ?? "未設定"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{u.email ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                        {u.role === "admin" ? "管理者" : "会員"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] rounded-lg px-2"
                        onClick={() => setRoleMutation.mutate({ userId: u.id, role: u.role === "admin" ? "user" : "admin" })}
                        disabled={setRoleMutation.isPending}
                      >
                        {u.role === "admin" ? <User size={11} className="mr-1" /> : <Shield size={11} className="mr-1" />}
                        {u.role === "admin" ? "会員に変更" : "管理者に変更"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">会員が見つかりません</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
