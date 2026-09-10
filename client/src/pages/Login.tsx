import BrandMark from "@/components/BrandMark";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SoftBackdrop from "@/components/SoftBackdrop";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      setError(null);
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
    onError: (e: { message: string }) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <SoftBackdrop />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <BrandMark variant="circle" className="mx-auto mb-4 h-24 w-24" title="NatuLabo" />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "var(--brown-800)",
              lineHeight: 1.3,
            }}
          >
            NatuLabo
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--brown-400)",
              marginTop: "0.3rem",
            }}
          >
            Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-card border border-cream-300 bg-card p-8 shadow-float">
          <h2 className="text-xl font-semibold text-foreground mb-2">ようこそ</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            NatuLabo会員専用ポータルへログインしてください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 h-11 rounded-field"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">パスワード</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11 rounded-field"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-pill bg-primary text-base hover:bg-primary/90"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "確認中..." : "ログイン"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
            このサイトは招待制の会員限定サービスです。<br />
            招待コードをお持ちの方は{" "}
            <Link href="/register" className="font-bold text-primary underline underline-offset-2">
              会員登録
            </Link>
            {" "}へお進みください。
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-brown-400">
          © {new Date().getFullYear()} NatuLabo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
