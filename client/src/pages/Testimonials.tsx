import MemberLayout from "@/components/MemberLayout";
import { usePageView } from "@/hooks/usePageView";
import { trpc } from "@/lib/trpc";
import ContentVisualHero from "@/components/ContentVisualHero";
import { useState } from "react";
import { MessageCircle, Heart, Sparkles, Users, Leaf, Star, AlertCircle, RefreshCw } from "lucide-react";

const CATEGORIES = ["すべて", "健康", "美容", "メンタル", "家族", "その他"] as const;

const categoryIcon = (cat: string) => {
  switch (cat) {
    case "健康": return <Heart className="w-4 h-4" />;
    case "美容": return <Sparkles className="w-4 h-4" />;
    case "メンタル": return <Star className="w-4 h-4" />;
    case "家族": return <Users className="w-4 h-4" />;
    default: return <Leaf className="w-4 h-4" />;
  }
};

const categoryColor = (cat: string) => {
  switch (cat) {
    case "健康": return "bg-emerald-100 text-emerald-700";
    case "美容": return "bg-pink-100 text-pink-700";
    case "メンタル": return "bg-violet-100 text-violet-700";
    case "家族": return "bg-amber-100 text-amber-700";
    default: return "bg-stone-100 text-stone-600";
  }
};

export default function Testimonials() {
  usePageView("/testimonials");
  const [activeCategory, setActiveCategory] = useState<string>("すべて");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: testimonials, isLoading, isError, refetch } = trpc.testimonial.list.useQuery();

  const filtered =
    activeCategory === "すべて"
      ? (testimonials ?? [])
      : (testimonials ?? []).filter((t) => t.category === activeCategory);

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ContentVisualHero eyebrow="MEMBER STORIES" title="体験談" description="dōTERRAのエッセンシャルオイルとともに暮らす、メンバーの皆さんのリアルな声をお届けします。" icon={Heart} tone="mint" />

        {/* カテゴリタブ */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border"
              style={{
                background: activeCategory === cat ? "var(--forest-500)" : "white",
                color: activeCategory === cat ? "white" : "var(--brown-500)",
                borderColor: activeCategory === cat ? "var(--forest-500)" : "var(--cream-300)",
                fontFamily: "var(--font-sans)",
                fontWeight: activeCategory === cat ? 500 : 300,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* エラー */}
        {isError && (
          <div className="text-center py-16">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
            <p
              className="text-sm mb-4"
              style={{ color: "var(--brown-500)", fontFamily: "var(--font-sans)" }}
            >
              体験談の読み込みに失敗しました
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors"
              style={{
                background: "var(--cream-100)",
                color: "var(--brown-700)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <RefreshCw className="w-4 h-4" /> 再試行
            </button>
          </div>
        )}

        {/* ローディング */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-stone-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-stone-200 rounded w-24 mb-2" />
                    <div className="h-3 bg-stone-100 rounded w-16" />
                  </div>
                </div>
                <div className="h-3 bg-stone-100 rounded mb-2" />
                <div className="h-3 bg-stone-100 rounded mb-2 w-4/5" />
                <div className="h-3 bg-stone-100 rounded w-3/5" />
              </div>
            ))}
          </div>
        )}

        {/* 体験談なし */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--brown-300)" }}>
            <Leaf className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 300 }}
            >
              まだ体験談がありません
            </p>
          </div>
        )}

        {/* 体験談カード */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map((t) => {
              const isExpanded = expandedId === t.id;
              const isLong = t.content.length > 120;
              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{ border: "1px solid var(--cream-300)" }}
                >
                  {/* カテゴリバッジ */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${categoryColor(t.category)}`}
                    >
                      {categoryIcon(t.category)}
                      {t.category}
                    </span>
                    {t.oilsUsed && (
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "var(--brown-500)", fontFamily: "var(--font-sans)" }}
                      >
                        <Leaf className="w-3 h-3" style={{ color: "var(--forest-500)" }} />
                        {t.oilsUsed.split(",").slice(0, 2).join("・")}
                      </span>
                    )}
                  </div>

                  {/* タイトル */}
                  <h2
                    className="text-lg leading-snug mb-3"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 400,
                      color: "var(--forest-500)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t.title}
                  </h2>

                  {/* 本文 */}
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "var(--brown-500)",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 300,
                    }}
                  >
                    {isLong && !isExpanded
                      ? `${t.content.slice(0, 120)}…`
                      : t.content}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
                      className="mt-2 text-xs hover:underline"
                      style={{ color: "var(--gold-500)", fontFamily: "var(--font-sans)" }}
                    >
                      {isExpanded ? "閉じる" : "続きを読む"}
                    </button>
                  )}

                  {/* 著者 */}
                  <div
                    className="flex items-center gap-3 mt-4 pt-4"
                    style={{ borderTop: "1px solid var(--cream-200)" }}
                  >
                    {t.imageUrl ? (
                      <img
                        src={t.imageUrl}
                        alt={t.authorName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                        style={{
                          background: "var(--cream-200)",
                          color: "var(--forest-500)",
                          fontFamily: "var(--font-serif)",
                        }}
                      >
                        {t.authorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--brown-800)", fontFamily: "var(--font-sans)" }}
                      >
                        {t.authorName}
                      </p>
                      {t.authorLabel && (
                        <p
                          className="text-xs"
                          style={{
                            color: "var(--brown-300)",
                            fontFamily: "var(--font-sans)",
                            fontWeight: 300,
                          }}
                        >
                          {t.authorLabel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
