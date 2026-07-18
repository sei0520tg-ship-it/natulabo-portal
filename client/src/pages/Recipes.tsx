import MemberLayout from "@/components/MemberLayout";
import { usePageView } from "@/hooks/usePageView";
import { Leaf, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

// サンプルレシピデータ（管理画面から後で差し替え可能な構成）
const sampleRecipes = [
  {
    id: 1,
    category: "アロマ",
    title: "リラックスルームスプレー",
    description: "ラベンダーとフランキンセンスを使った、就寝前にぴったりのルームスプレーです。",
    ingredients: ["ラベンダー 5滴", "フランキンセンス 3滴", "精製水 50ml", "無水エタノール 5ml"],
    steps: ["スプレーボトルに無水エタノールを入れる", "エッセンシャルオイルを加えてよく混ぜる", "精製水を加えて完成"],
    tag: "リラックス",
  },
  {
    id: 2,
    category: "スキンケア",
    title: "モイスチャーフェイスオイル",
    description: "フランキンセンスとラベンダーで作る、保湿力の高いフェイスオイルです。",
    ingredients: ["フランキンセンス 2滴", "ラベンダー 2滴", "ホホバオイル 10ml"],
    steps: ["ホホバオイルをロールオンボトルに入れる", "エッセンシャルオイルを加える", "よく振り混ぜて完成"],
    tag: "スキンケア",
  },
  {
    id: 3,
    category: "クリーニング",
    title: "マルチパーパスクリーナー",
    description: "レモンとオンガードを使った、安心・安全な万能クリーナーです。",
    ingredients: ["レモン 10滴", "オンガード 5滴", "白酢 100ml", "水 100ml"],
    steps: ["スプレーボトルに白酢と水を入れる", "エッセンシャルオイルを加える", "よく振って使用前に混ぜる"],
    tag: "クリーニング",
  },
  {
    id: 4,
    category: "アロマ",
    title: "集中力アップディフューザーブレンド",
    description: "ペパーミントとローズマリーで作業効率をアップさせるブレンドです。",
    ingredients: ["ペパーミント 3滴", "ローズマリー 2滴", "レモン 2滴"],
    steps: ["ディフューザーに水を規定量入れる", "エッセンシャルオイルを加える", "スイッチを入れて拡散させる"],
    tag: "集中",
  },
  {
    id: 5,
    category: "ボディケア",
    title: "リフレッシュバスソルト",
    description: "ユーカリとペパーミントで作る、疲れた体を癒すバスソルトです。",
    ingredients: ["ユーカリ 5滴", "ペパーミント 3滴", "天然塩 200g", "重曹 50g"],
    steps: ["天然塩と重曹をボウルで混ぜる", "エッセンシャルオイルを加えてよく混ぜる", "保存容器に入れて完成"],
    tag: "リフレッシュ",
  },
  {
    id: 6,
    category: "スキンケア",
    title: "リップバーム",
    description: "ラベンダーとミルラで作る、保湿力抜群のナチュラルリップバームです。",
    ingredients: ["ラベンダー 2滴", "ミルラ 1滴", "ミツロウ 5g", "ホホバオイル 10ml"],
    steps: ["ミツロウをホホバオイルと湯煎で溶かす", "少し冷めたらエッセンシャルオイルを加える", "容器に流し込んで固める"],
    tag: "スキンケア",
  },
];

const categories = ["すべて", "アロマ", "スキンケア", "ボディケア", "クリーニング"];

const tagColors: Record<string, { bg: string; text: string }> = {
  リラックス:   { bg: "var(--cream-100)", text: "var(--brown-600)" },
  スキンケア:   { bg: "oklch(0.960 0.020 160)", text: "var(--forest-600)" },
  クリーニング: { bg: "oklch(0.960 0.015 220)", text: "oklch(0.380 0.060 220)" },
  集中:         { bg: "oklch(0.960 0.020 80)", text: "var(--gold-600)" },
  リフレッシュ: { bg: "oklch(0.960 0.020 200)", text: "oklch(0.400 0.060 200)" },
};

export default function Recipes() {
  usePageView("クラフトレシピ集");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = sampleRecipes.filter((r) => {
    const matchCat = selectedCategory === "すべて" || r.category === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      r.title.includes(searchQuery) ||
      r.description.includes(searchQuery) ||
      r.tag.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <MemberLayout>
      <div className="container py-8 lg:py-10 max-w-3xl space-y-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-3" style={{ color: "var(--gold-500)" }}>
            <span style={{ width: "1.5rem", height: "1px", background: "var(--gold-400)", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Craft Recipes
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              fontWeight: 400,
              letterSpacing: "0.05em",
              color: "var(--brown-800)",
              lineHeight: 1.4,
            }}
          >
            クラフトレシピ集
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              fontWeight: 300,
              letterSpacing: "0.05em",
              color: "var(--brown-500)",
              lineHeight: 1.8,
            }}
          >
            エッセンシャルオイルを使ったハンドメイドレシピをカテゴリ別にご紹介します。
          </p>
        </div>

        {/* ── Search ──────────────────────────────────────────────── */}
        <div
          className="animate-fade-in-up stagger-1 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "white", border: "1px solid var(--cream-300)" }}
        >
          <Search size={16} style={{ color: "var(--brown-300)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="レシピを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none bg-transparent"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              fontWeight: 300,
              letterSpacing: "0.04em",
              color: "var(--brown-800)",
            }}
          />
        </div>

        {/* ── Category tabs ───────────────────────────────────────── */}
        <div className="animate-fade-in-up stagger-1 flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-1.5 rounded-full transition-all duration-200"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: selectedCategory === cat ? 500 : 300,
                letterSpacing: "0.06em",
                background: selectedCategory === cat ? "var(--forest-500)" : "white",
                color: selectedCategory === cat ? "white" : "var(--brown-500)",
                border: selectedCategory === cat ? "1px solid var(--forest-500)" : "1px solid var(--cream-300)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Recipe list ─────────────────────────────────────────── */}
        <div className="animate-fade-in-up stagger-2 space-y-3">
          {filtered.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl"
              style={{ background: "white", border: "1px solid var(--cream-300)" }}
            >
              <Leaf size={32} style={{ color: "var(--cream-300)", margin: "0 auto 0.75rem" }} />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 300, color: "var(--brown-400)" }}>
                該当するレシピが見つかりませんでした
              </p>
            </div>
          ) : (
            filtered.map((recipe) => {
              const isOpen = expandedId === recipe.id;
              const tagColor = tagColors[recipe.tag] ?? { bg: "var(--cream-100)", text: "var(--brown-600)" };
              return (
                <div
                  key={recipe.id}
                  className="rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    background: "white",
                    border: isOpen ? "1px solid var(--gold-300)" : "1px solid var(--cream-300)",
                    boxShadow: isOpen ? "0 4px 16px oklch(0.200 0.030 60 / 0.06)" : "none",
                  }}
                >
                  {/* Header row */}
                  <button
                    className="w-full flex items-center gap-4 p-4 text-left"
                    onClick={() => setExpandedId(isOpen ? null : recipe.id)}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--cream-100)" }}
                    >
                      <Leaf size={18} style={{ color: "var(--forest-500)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            color: "var(--brown-800)",
                          }}
                        >
                          {recipe.title}
                        </p>
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.65rem",
                            fontWeight: 400,
                            letterSpacing: "0.04em",
                            background: tagColor.bg,
                            color: tagColor.text,
                          }}
                        >
                          {recipe.tag}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          fontWeight: 300,
                          color: "var(--brown-400)",
                          marginTop: "0.2rem",
                        }}
                      >
                        {recipe.category}
                      </p>
                    </div>
                    <span
                      className="shrink-0 transition-transform duration-200"
                      style={{
                        display: "inline-block",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        color: "var(--brown-300)",
                        fontSize: "0.75rem",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div
                      className="px-4 pb-5 space-y-4"
                      style={{ borderTop: "1px solid var(--cream-200)" }}
                    >
                      <p
                        className="pt-4"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.82rem",
                          fontWeight: 300,
                          color: "var(--brown-600)",
                          lineHeight: 1.8,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {recipe.description}
                      </p>

                      {/* Ingredients */}
                      <div>
                        <p
                          className="mb-2"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.6rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "var(--gold-500)",
                          }}
                        >
                          材料
                        </p>
                        <ul className="space-y-1">
                          {recipe.ingredients.map((ing, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: "var(--forest-400)" }}
                              />
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "0.8rem",
                                  fontWeight: 300,
                                  color: "var(--brown-700)",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {ing}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Steps */}
                      <div>
                        <p
                          className="mb-2"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.6rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "var(--gold-500)",
                          }}
                        >
                          作り方
                        </p>
                        <ol className="space-y-2">
                          {recipe.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                style={{
                                  background: "var(--cream-100)",
                                  fontFamily: "var(--font-serif)",
                                  fontSize: "0.65rem",
                                  fontWeight: 500,
                                  color: "var(--forest-500)",
                                }}
                              >
                                {i + 1}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "0.8rem",
                                  fontWeight: 300,
                                  color: "var(--brown-700)",
                                  letterSpacing: "0.04em",
                                  lineHeight: 1.6,
                                }}
                              >
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Note ────────────────────────────────────────────────── */}
        <div
          className="animate-fade-in-up stagger-3 flex items-start gap-3 p-4 rounded-xl"
          style={{ background: "var(--cream-100)", border: "1px solid var(--cream-300)" }}
        >
          <ExternalLink size={15} style={{ color: "var(--gold-500)", flexShrink: 0, marginTop: "0.1rem" }} />
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 300,
              color: "var(--brown-600)",
              letterSpacing: "0.04em",
              lineHeight: 1.7,
            }}
          >
            レシピは管理画面から随時追加・更新できます。エッセンシャルオイルの使用には個人差があります。ご使用前に必ず使用上の注意をご確認ください。
          </p>
        </div>
      </div>
    </MemberLayout>
  );
}
