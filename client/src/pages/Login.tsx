import BrandMark from "@/components/BrandMark";
import { getLoginUrl } from "@/const";
import { Leaf } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import SoftBackdrop from "@/components/SoftBackdrop";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <SoftBackdrop />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: "5rem",
              height: "5rem",
              borderRadius: "var(--radius-card)",
              background: "var(--card)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <BrandMark className="h-12 w-12" title="NatuLabo" />
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
        <div className="rounded-card border border-cream-300 bg-card p-8 shadow-float">
          <h2 className="text-xl font-semibold text-foreground mb-2">ようこそ</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            NatuLabo会員専用ポータルへログインしてください。
          </p>

          <Button
            onClick={handleLogin}
            className="w-full h-12 text-base font-medium rounded-pill bg-primary hover:bg-primary/90 transition-colors"
            disabled={loading}
          >
            {loading ? "確認中..." : "ログイン / 新規登録"}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
            このサイトは招待制の会員限定サービスです。<br />
            招待コードをお持ちの方のみご利用いただけます。
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-brown-400">
          © {new Date().getFullYear()} NatuLabo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
