import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Leaf, BookOpen, Calendar, Link2, MessageCircle, ChevronRight, Sparkles } from "lucide-react";
import { useEffect } from "react";

const features = [
  { icon: Leaf, title: "はじめての方へ", desc: "ステップ形式でスムーズにスタート", href: "/setup", color: "bg-emerald-50 text-emerald-600" },
  { icon: BookOpen, title: "学習動画", desc: "カテゴリ別に動画を整理・視聴", href: "/videos", color: "bg-amber-50 text-amber-600" },
  { icon: Calendar, title: "イベント", desc: "講座・イベントをカレンダーで確認", href: "/calendar", color: "bg-sky-50 text-sky-600" },
  { icon: MessageCircle, title: "お問い合わせ", desc: "困ったときの相談窓口一覧", href: "/contact", color: "bg-rose-50 text-rose-600" },
  { icon: Link2, title: "外部リンク", desc: "愛用に役立つリンク集", href: "/links", color: "bg-violet-50 text-violet-600" },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Leaf size={14} className="text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold text-sm tracking-wide">NatuLabo Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs rounded-xl" onClick={() => navigate("/login")}>
              ログイン
            </Button>
            <Button size="sm" className="h-8 text-xs rounded-xl" onClick={() => navigate("/register")}>
              会員登録
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-14 min-h-screen flex flex-col items-center justify-center bg-hero-gradient px-4 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-6">
            <Sparkles size={12} />
            dōTERRA 愛用者専用ポータル
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight mb-4">
            自然の恵みとともに、<br className="sm:hidden" />
            <span className="text-primary">豊かな毎日</span>へ。
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
            学習動画・イベント情報・お役立ちリンクをまとめた、あなたのための会員専用ポータルです。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="rounded-xl h-11 px-6 text-sm gap-2" onClick={() => navigate("/register")}>
              無料で会員登録 <ChevronRight size={16} />
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl h-11 px-6 text-sm bg-white/60" onClick={() => navigate("/login")}>
              ログイン
            </Button>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-1/4 left-4 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-4 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold mb-2">会員限定コンテンツ</h2>
            <p className="text-sm text-muted-foreground">ログイン後にすべての機能をご利用いただけます。</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {features.map((f, i) => (
              <div
                key={f.href}
                className={`animate-fade-in-up stagger-${i + 1} bg-card rounded-2xl border border-border p-4 text-center card-hover cursor-pointer`}
                onClick={() => navigate("/login")}
              >
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mx-auto mb-3`}>
                  <f.icon size={18} />
                </div>
                <p className="text-xs font-semibold mb-1">{f.title}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-natural-gradient">
        <div className="container text-center">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold mb-3">招待コードをお持ちの方</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            招待コードがあれば、すぐに会員登録できます。<br />コードをご準備のうえ登録ページへお進みください。
          </p>
          <Button size="lg" className="rounded-xl h-11 px-8 text-sm gap-2" onClick={() => navigate("/register")}>
            会員登録はこちら <ChevronRight size={16} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border bg-background">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Leaf size={12} className="text-primary" />
            <span className="font-serif">NatuLabo Portal</span>
          </div>
          <p>© {new Date().getFullYear()} NatuLabo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
