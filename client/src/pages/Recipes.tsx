import MemberLayout from "@/components/MemberLayout";
import { usePageView } from "@/hooks/usePageView";
import { Search, X, Leaf, Droplets, Home, Sparkles, Wind } from "lucide-react";
import { useState } from "react";

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Recipe {
  id: number;
  category: string;
  title: string;
  titleEn: string;
  tagline: string;
  description: string;
  ingredients: string[];
  steps: string[];
  tips?: string;
  oilColor: string;
}

/* ── Sample data ────────────────────────────────────────────────────────── */
const recipes: Recipe[] = [
  {
    id: 1,
    category: "アロマ",
    title: "リラックス ルームスプレー",
    titleEn: "Relax Room Spray",
    tagline: "就寝前の空間づくりに",
    description: "ラベンダーとフランキンセンスの穏やかな香りが、心と空間をリセットしてくれます。枕元やリビングに一吹きするだけで、深いリラックスタイムへ。",
    ingredients: ["ラベンダー 5滴", "フランキンセンス 3滴", "精製水 50ml", "無水エタノール 5ml"],
    steps: [
      "スプレーボトルに無水エタノールを入れる",
      "エッセンシャルオイルを加えてよく混ぜる",
      "精製水を加えてさらに混ぜる",
      "使用前に毎回よく振ってから使用する",
    ],
    tips: "就寝30分前に枕元や寝室にスプレーするのがおすすめです。",
    oilColor: "oklch(0.780 0.080 290)",
  },
  {
    id: 2,
    category: "スキンケア",
    title: "モイスチャー フェイスオイル",
    titleEn: "Moisture Face Oil",
    tagline: "乾燥が気になる肌に",
    description: "フランキンセンスの細胞再生力とラベンダーの鎮静効果を組み合わせた、贅沢な保湿フェイスオイル。朝のスキンケアの仕上げや、夜のナイトケアとして。",
    ingredients: ["フランキンセンス 2滴", "ラベンダー 2滴", "ホホバオイル 10ml"],
    steps: [
      "ロールオンボトルにホホバオイルを入れる",
      "エッセンシャルオイルを加える",
      "よく振り混ぜて完成",
      "洗顔後、化粧水の後に数滴なじませる",
    ],
    tips: "パッチテストを行ってから使用してください。妊娠中の方はご注意ください。",
    oilColor: "oklch(0.820 0.060 80)",
  },
  {
    id: 3,
    category: "クリーニング",
    title: "マルチパーパス クリーナー",
    titleEn: "Multipurpose Cleaner",
    tagline: "家中を安心・安全に",
    description: "レモンの洗浄力とオンガードの除菌力を組み合わせた、家族みんなが安心して使えるナチュラルクリーナー。キッチンから洗面台まで幅広く活躍します。",
    ingredients: ["レモン 10滴", "オンガード 5滴", "白酢 100ml", "精製水 100ml"],
    steps: [
      "スプレーボトルに白酢と精製水を入れる",
      "エッセンシャルオイルを加える",
      "よく振り混ぜて完成",
      "使用前に毎回よく振ってから使用する",
    ],
    tips: "大理石や天然石には使用しないでください。",
    oilColor: "oklch(0.820 0.100 105)",
  },
  {
    id: 4,
    category: "アロマ",
    title: "集中力アップ ディフューザーブレンド",
    titleEn: "Focus Diffuser Blend",
    tagline: "仕事・勉強のお供に",
    description: "ペパーミントのクリアな刺激とローズマリーの活性化作用、レモンの爽やかさが脳をシャキッとさせます。テレワークや勉強タイムに最適なブレンドです。",
    ingredients: ["ペパーミント 3滴", "ローズマリー 2滴", "レモン 2滴"],
    steps: [
      "ディフューザーに水を規定量入れる",
      "エッセンシャルオイルを合計7滴加える",
      "スイッチを入れて30〜60分拡散させる",
    ],
    tips: "就寝前の使用は避けてください。乳幼児のいる部屋での使用は控えめに。",
    oilColor: "oklch(0.780 0.100 160)",
  },
  {
    id: 5,
    category: "ボディケア",
    title: "リフレッシュ バスソルト",
    titleEn: "Refresh Bath Salt",
    tagline: "疲れた体を癒すバスタイムに",
    description: "ユーカリとペパーミントの爽快な香りが、一日の疲れをすっきりと洗い流してくれます。重曹が肌をなめらかに整え、ミネラル豊富な天然塩が体を芯から温めます。",
    ingredients: ["ユーカリ 5滴", "ペパーミント 3滴", "天然塩（粗塩） 200g", "重曹 50g"],
    steps: [
      "天然塩と重曹をボウルでよく混ぜる",
      "エッセンシャルオイルを加えてさらに混ぜる",
      "密閉容器に入れて保存する",
      "入浴時に大さじ2〜3杯をお湯に溶かす",
    ],
    tips: "肌が敏感な方は少量から試してください。妊娠中の方はペパーミントの使用量を減らしてください。",
    oilColor: "oklch(0.780 0.080 200)",
  },
  {
    id: 6,
    category: "スキンケア",
    title: "ナチュラル リップバーム",
    titleEn: "Natural Lip Balm",
    tagline: "乾燥した唇に潤いを",
    description: "ミツロウのコーティング力とホホバオイルの保湿力が唇をしっかり守ります。ラベンダーとミルラの組み合わせが唇の荒れを整え、自然なツヤを与えます。",
    ingredients: ["ラベンダー 2滴", "ミルラ 1滴", "ミツロウ 5g", "ホホバオイル 10ml"],
    steps: [
      "ミツロウをホホバオイルと一緒に湯煎で溶かす",
      "火から外して少し冷ましてからエッセンシャルオイルを加える",
      "リップバームの容器に素早く流し込む",
      "完全に固まるまで（約30分）触れずに待つ",
    ],
    tips: "夏場は冷蔵庫で保管するとよいでしょう。",
    oilColor: "oklch(0.820 0.060 30)",
  },
  {
    id: 7,
    category: "ボディケア",
    title: "マッサージ ボディオイル",
    titleEn: "Massage Body Oil",
    tagline: "全身のコリと疲れに",
    description: "ディープブルーのクールな感触とラベンダーの鎮静効果が、筋肉の緊張をほぐします。入浴後のマッサージに使うことで、翌朝の体の軽さを実感できます。",
    ingredients: ["ディープブルー 3滴", "ラベンダー 3滴", "フランキンセンス 2滴", "スイートアーモンドオイル 20ml"],
    steps: [
      "ボトルにスイートアーモンドオイルを入れる",
      "エッセンシャルオイルを加えてよく混ぜる",
      "入浴後、適量を手に取り気になる部位をマッサージする",
    ],
    tips: "傷や炎症のある部位には使用しないでください。",
    oilColor: "oklch(0.650 0.100 230)",
  },
  {
    id: 8,
    category: "クリーニング",
    title: "フレッシュ ランドリースプレー",
    titleEn: "Fresh Laundry Spray",
    tagline: "衣類・布製品のリフレッシュに",
    description: "レモングラスとラベンダーの爽やかな香りで、衣類や布製品をリフレッシュ。洗濯後のシワ伸ばしにも使えます。クローゼットや引き出しにひと吹きするだけで香りが持続します。",
    ingredients: ["レモングラス 5滴", "ラベンダー 5滴", "精製水 100ml", "ウォッカまたは無水エタノール 10ml"],
    steps: [
      "スプレーボトルにウォッカ（または無水エタノール）を入れる",
      "エッセンシャルオイルを加えてよく混ぜる",
      "精製水を加えてさらに混ぜる",
      "衣類から20〜30cm離してスプレーする",
    ],
    oilColor: "oklch(0.820 0.080 130)",
  },
];

/* ── Category config ────────────────────────────────────────────────────── */
const categories = [
  { label: "すべて", icon: Sparkles },
  { label: "アロマ", icon: Wind },
  { label: "スキンケア", icon: Droplets },
  { label: "ボディケア", icon: Leaf },
  { label: "クリーニング", icon: Home },
];

/* ── Recipe Card ────────────────────────────────────────────────────────── */
function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden transition-all duration-300 group"
      style={{
        background: "white",
        border: "1px solid var(--cream-300)",
        boxShadow: "0 2px 8px oklch(0.200 0.030 60 / 0.04)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px oklch(0.200 0.030 60 / 0.10)";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px oklch(0.200 0.030 60 / 0.04)";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      }}
    >
      {/* Color band */}
      <div
        className="h-1.5 w-full"
        style={{ background: recipe.oilColor, opacity: 0.7 }}
      />
      <div className="p-5">
        {/* Category badge */}
        <span
          className="inline-block px-2.5 py-0.5 rounded-full mb-3"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.58rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            background: "var(--cream-100)",
            color: "var(--brown-500)",
          }}
        >
          {recipe.category}
        </span>

        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1rem",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: "var(--brown-800)",
            lineHeight: 1.4,
            marginBottom: "0.3rem",
          }}
        >
          {recipe.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            color: "var(--gold-500)",
            marginBottom: "0.75rem",
          }}
        >
          {recipe.titleEn}
        </p>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            fontWeight: 300,
            color: "var(--brown-500)",
            letterSpacing: "0.04em",
            lineHeight: 1.6,
          }}
        >
          {recipe.tagline}
        </p>

        {/* Ingredient count */}
        <div
          className="flex items-center gap-1.5 mt-4 pt-4"
          style={{ borderTop: "1px solid var(--cream-200)" }}
        >
          <Droplets size={12} style={{ color: "var(--forest-400)" }} />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: 300,
              color: "var(--brown-400)",
              letterSpacing: "0.04em",
            }}
          >
            材料 {recipe.ingredients.length}種類
          </span>
          <span
            className="ml-auto"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.58rem",
              letterSpacing: "0.15em",
              color: "var(--gold-500)",
              textTransform: "uppercase",
            }}
          >
            詳しく見る →
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Recipe Modal ────────────────────────────────────────────────────────── */
function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl"
        style={{ background: "var(--cream-50)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Color header */}
        <div
          className="h-2 w-full rounded-t-3xl sm:rounded-t-2xl"
          style={{ background: recipe.oilColor, opacity: 0.8 }}
        />

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className="inline-block px-2.5 py-0.5 rounded-full mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  background: "var(--cream-200)",
                  color: "var(--brown-500)",
                }}
              >
                {recipe.category}
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.2rem",
                  fontWeight: 400,
                  letterSpacing: "0.04em",
                  color: "var(--brown-800)",
                  lineHeight: 1.4,
                }}
              >
                {recipe.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "var(--gold-500)",
                  marginTop: "0.25rem",
                }}
              >
                {recipe.titleEn}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
              style={{ background: "var(--cream-200)" }}
            >
              <X size={14} style={{ color: "var(--brown-500)" }} />
            </button>
          </div>

          {/* Description */}
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              fontWeight: 300,
              color: "var(--brown-600)",
              lineHeight: 1.9,
              letterSpacing: "0.04em",
            }}
          >
            {recipe.description}
          </p>

          {/* Ingredients */}
          <div
            className="rounded-xl p-4"
            style={{ background: "white", border: "1px solid var(--cream-300)" }}
          >
            <p
              className="mb-3"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--gold-500)",
              }}
            >
              Ingredients — 材料
            </p>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: recipe.oilColor, opacity: 0.6 }}
                  >
                    <Droplets size={10} style={{ color: "white" }} />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      fontWeight: 400,
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
              className="mb-3"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--gold-500)",
              }}
            >
              How to Make — 作り方
            </p>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: "var(--cream-200)",
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      color: "var(--forest-600)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      fontWeight: 300,
                      color: "var(--brown-700)",
                      letterSpacing: "0.04em",
                      lineHeight: 1.7,
                    }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {recipe.tips && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: "oklch(0.970 0.015 80)", border: "1px solid var(--gold-200)" }}
            >
              <Leaf size={14} style={{ color: "var(--gold-500)", flexShrink: 0, marginTop: "0.15rem" }} />
              <div>
                <p
                  className="mb-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--gold-600)",
                  }}
                >
                  Tips
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    fontWeight: 300,
                    color: "var(--brown-600)",
                    letterSpacing: "0.04em",
                    lineHeight: 1.7,
                  }}
                >
                  {recipe.tips}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function Recipes() {
  usePageView("クラフトレシピ集");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filtered = recipes.filter((r) => {
    const matchCat = selectedCategory === "すべて" || r.category === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      r.title.includes(searchQuery) ||
      r.description.includes(searchQuery) ||
      r.tagline.includes(searchQuery) ||
      r.ingredients.some(i => i.includes(searchQuery));
    return matchCat && matchSearch;
  });

  return (
    <MemberLayout>
      <div className="container py-8 lg:py-10 max-w-3xl">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-3">
            <span style={{ width: "1.5rem", height: "1px", background: "var(--gold-400)", display: "inline-block" }} />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--gold-500)",
              }}
            >
              Craft Recipes
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
              fontWeight: 400,
              letterSpacing: "0.05em",
              color: "var(--brown-800)",
              lineHeight: 1.3,
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
            エッセンシャルオイルを使った、日常を豊かにするハンドメイドレシピ集です。
          </p>
        </div>

        {/* ── Search ──────────────────────────────────────────────── */}
        <div
          className="animate-fade-in-up stagger-1 flex items-center gap-3 px-4 py-3 rounded-2xl mb-5"
          style={{ background: "white", border: "1px solid var(--cream-300)" }}
        >
          <Search size={15} style={{ color: "var(--brown-300)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="レシピ名・オイル名で検索..."
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
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={14} style={{ color: "var(--brown-300)" }} />
            </button>
          )}
        </div>

        {/* ── Category tabs ───────────────────────────────────────── */}
        <div className="animate-fade-in-up stagger-1 flex gap-2 flex-wrap mb-7">
          {categories.map(({ label, icon: Icon }) => {
            const active = selectedCategory === label;
            return (
              <button
                key={label}
                onClick={() => setSelectedCategory(label)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-200"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  fontWeight: active ? 500 : 300,
                  letterSpacing: "0.04em",
                  background: active ? "var(--forest-500)" : "white",
                  color: active ? "white" : "var(--brown-500)",
                  border: active ? "1px solid var(--forest-500)" : "1px solid var(--cream-300)",
                  transform: active ? "scale(1.02)" : "scale(1)",
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Recipe grid ─────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl animate-fade-in-up"
            style={{ background: "white", border: "1px solid var(--cream-300)" }}
          >
            <Leaf size={36} style={{ color: "var(--cream-300)", margin: "0 auto 1rem" }} />
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                fontWeight: 400,
                color: "var(--brown-400)",
                letterSpacing: "0.05em",
              }}
            >
              該当するレシピが見つかりませんでした
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                fontWeight: 300,
                color: "var(--brown-300)",
                letterSpacing: "0.04em",
              }}
            >
              別のキーワードやカテゴリでお試しください
            </p>
          </div>
        ) : (
          <>
            <p
              className="mb-4 animate-fade-in-up stagger-2"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 300,
                color: "var(--brown-400)",
                letterSpacing: "0.04em",
              }}
            >
              {filtered.length}件のレシピ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up stagger-2">
              {filtered.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Footer note ─────────────────────────────────────────── */}
        <div
          className="mt-8 flex items-start gap-3 p-4 rounded-xl animate-fade-in-up stagger-3"
          style={{ background: "var(--cream-100)", border: "1px solid var(--cream-300)" }}
        >
          <Leaf size={14} style={{ color: "var(--gold-500)", flexShrink: 0, marginTop: "0.15rem" }} />
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

      {/* ── Modal ───────────────────────────────────────────────────── */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </MemberLayout>
  );
}
