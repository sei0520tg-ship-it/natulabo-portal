import { getLoginUrl } from "@/const";
import { Leaf } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: "5rem",
              height: "5rem",
              borderRadius: "1.25rem",
              background: "var(--cream-100, oklch(0.970 0.012 80))",
              boxShadow: "0 2px 12px oklch(0.200 0.030 60 / 0.08)",
            }}
          >
            <img
              src="/manus-storage/logo-circle_08be9919.png"
              alt="NatuLabo"
              style={{ width: "3rem", height: "3rem", objectFit: "contain" }}
            />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.6rem",
              fontWeight: 400,
              letterSpacing: "0.06em",
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
        <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-8">
          <h2 className="text-xl font-serif font-medium text-foreground mb-2">ようこそ</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            NatuLabo会員専用ポータルへログインしてください。
          </p>

          <Button
            onClick={handleLogin}
            className="w-full h-12 text-base font-medium rounded-xl bg-primary hover:bg-primary/90 transition-colors"
            disabled={loading}
          >
            {loading ? "確認中..." : "ログイン / 新規登録"}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
            このサイトは招待制の会員限定サービスです。<br />
            招待コードをお持ちの方のみご利用いただけます。
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 NatuLabo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
