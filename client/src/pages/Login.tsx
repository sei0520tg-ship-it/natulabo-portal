import { getLoginUrl } from "@/const";
import { Leaf } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { doterraAssets, doterraSources } from "@/lib/doterraAssets";

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
      <img src={doterraAssets.loginGarden} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,35,17,0.84), rgba(28,58,31,0.56))" }} />
      <div className="absolute -right-20 -top-28 h-96 w-96 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.18)" }} />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
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
              color: "white",
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
              color: "rgba(255,255,255,0.72)",
              marginTop: "0.3rem",
            }}
          >
            Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(255,255,255,0.48)", backdropFilter: "blur(16px)" }}>
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

        <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.72)" }}>
          © {new Date().getFullYear()} NatuLabo. All rights reserved.
        </p>
        <a href={doterraSources.coImpact} target="_blank" rel="noreferrer" className="mt-2 block text-center" style={{ color: "rgba(255,255,255,0.54)", fontSize: "0.62rem", letterSpacing: "0.04em" }}>
          背景画像：dōTERRA公式掲載画像
        </a>
      </div>
    </div>
  );
}
