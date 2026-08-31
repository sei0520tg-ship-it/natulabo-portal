import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import SoftBackdrop from "@/components/SoftBackdrop";
import { CheckCircle2, Leaf, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Register() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"invite" | "profile" | "done">("invite");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: "",
    address: "",
    brandRegisteredAt: "",
  });

  const validateInvite = trpc.invitation.validate.useQuery(
    { code: inviteCode },
    { enabled: false }
  );

  const registerMutation = trpc.member.register.useMutation({
    onSuccess: () => setStep("done"),
    onError: (e) => setInviteError(e.message),
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    const result = await validateInvite.refetch();
    if (result.data?.valid) {
      setStep("profile");
    } else {
      setInviteError(result.data?.reason ?? "招待コードが無効です");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    registerMutation.mutate({
      invitationCode: inviteCode,
      name: form.name,
      phone: form.phone,
      address: form.address,
      brandRegisteredAt: form.brandRegisteredAt || undefined,
      email: user?.email ?? "",
    });
  };

  if (step === "done") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <SoftBackdrop />
        <div className="relative z-10 rounded-3xl bg-white/95 p-10 text-center shadow-2xl animate-fade-in-up">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-semibold mb-2">登録完了</h2>
          <p className="text-muted-foreground mb-6">NatuLaboポータルへようこそ！</p>
          <Button onClick={() => navigate("/dashboard")} className="rounded-xl px-8">
            ダッシュボードへ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <SoftBackdrop />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center mb-3"
            style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "1.25rem",
              background: "var(--cream-100, oklch(0.970 0.012 80))",
              boxShadow: "0 2px 12px oklch(0.200 0.030 60 / 0.08)",
            }}
          >
            <img
              src="/manus-storage/logo-circle_08be9919.png"
              alt="NatuLabo"
              style={{ width: "2.75rem", height: "2.75rem", objectFit: "contain" }}
            />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              fontWeight: 400,
              letterSpacing: "0.05em",
              color: "white",
            }}
          >
            会員登録
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.62rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "var(--brown-400)",
              marginTop: "0.3rem",
            }}
          >
            NatuLabo Portal
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8" style={{ color: "white" }}>
          {["招待コード確認", "プロフィール入力"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                (i === 0 && step === "invite") || (i === 1 && step === "profile")
                  ? "bg-primary text-primary-foreground"
                  : i === 0 && step === "profile"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className="hidden text-xs text-brown-600 sm:block">{label}</span>
              {i === 0 && <div className="h-px w-8 bg-cream-400" />}
            </div>
          ))}
        </div>

        <div className="rounded-card border border-cream-300 bg-card p-8 shadow-float">
          {step === "invite" && (
            <form onSubmit={handleInviteSubmit} className="space-y-5">
              <div>
                <Label htmlFor="invite" className="text-sm font-medium">招待コード</Label>
                <Input
                  id="invite"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="招待コードを入力"
                  className="mt-1.5 h-11 rounded-xl"
                  required
                />
                {inviteError && (
                  <p className="text-destructive text-xs mt-1.5">{inviteError}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl"
                disabled={validateInvite.isFetching}
              >
                {validateInvite.isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "次へ"}
              </Button>
            </form>
          )}

          {step === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">お名前 <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="山田 花子"
                  className="mt-1.5 h-11 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">電話番号</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="090-0000-0000"
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-sm font-medium">住所</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="東京都渋谷区..."
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="brand" className="text-sm font-medium">dōTERRA登録日</Label>
                <Input
                  id="brand"
                  type="date"
                  value={form.brandRegisteredAt}
                  onChange={(e) => setForm({ ...form, brandRegisteredAt: e.target.value })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              {inviteError && (
                <p className="text-destructive text-xs">{inviteError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => setStep("invite")}
                >
                  戻る
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "登録する"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
