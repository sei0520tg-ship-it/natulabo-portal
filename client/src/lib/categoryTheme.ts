/**
 * categoryTheme.ts
 *
 * カテゴリ・セクションごとの色をここ1箇所に集約する。
 *
 * 以前は CalendarPage / Links / Contact / Testimonials / AdminDashboard の5ファイルに
 * Tailwind標準色の対応表がバラバラに書かれており、ブランドのトークンから外れていた。
 *
 * 【重要】クラス名は必ず完全な文字列で書くこと。
 * Tailwind v4 のスキャナはソースを正規表現で走査するため、`bg-${name}-100` のような
 * 組み立て方をするとクラスが生成されずに消える。ここに文字列を並べておけば、
 * スキャナが必ず見つけるので purge されない。
 */

export type ToneName =
  | "blossom"
  | "mint"
  | "aqua"
  | "butter"
  | "lilac"
  | "sage"
  | "apricot"
  | "neutral";

export type Tone = {
  /** 面（カードやチップの背景） */
  surface: string;
  /** 文字色。surface の上でAA基準を満たす明度にしてある */
  ink: string;
  /** 枠線 */
  edge: string;
  /** カレンダーの点など、小さな塗り */
  dot: string;
};

const TONES: Record<ToneName, Tone> = {
  blossom: { surface: "bg-blossom-100", ink: "text-blossom-700", edge: "border-blossom-300", dot: "bg-blossom-500" },
  mint:    { surface: "bg-mint-100",    ink: "text-mint-700",    edge: "border-mint-300",    dot: "bg-mint-500" },
  aqua:    { surface: "bg-aqua-100",    ink: "text-aqua-700",    edge: "border-aqua-300",    dot: "bg-aqua-500" },
  butter:  { surface: "bg-butter-100",  ink: "text-butter-700",  edge: "border-butter-300",  dot: "bg-butter-500" },
  lilac:   { surface: "bg-lilac-100",   ink: "text-lilac-700",   edge: "border-lilac-300",   dot: "bg-lilac-500" },
  sage:    { surface: "bg-sage-100",    ink: "text-sage-700",    edge: "border-sage-300",    dot: "bg-sage-500" },
  apricot: { surface: "bg-apricot-100", ink: "text-apricot-700", edge: "border-apricot-300", dot: "bg-apricot-500" },
  neutral: { surface: "bg-cream-100",   ink: "text-brown-600",   edge: "border-cream-300",   dot: "bg-brown-300" },
};

/** トーンを引く。未知のキーや未設定は neutral に落とす。 */
export const tone = (name?: ToneName | null): Tone => TONES[name ?? "neutral"] ?? TONES.neutral;

/** イベントのカテゴリ（7種類）。カレンダーの点の色分けに使う。 */
export const eventTone: Record<string, ToneName> = {
  company: "aqua",
  team: "mint",
  online: "lilac",
  workshop: "apricot",
  seminar: "blossom",
  business: "sage",
  user: "butter",
};

/** 外部リンク集のカテゴリ。 */
export const linkTone: Record<string, ToneName> = {
  "クラフト材料": "mint",
  "容器・ボトル": "aqua",
  Amazon: "butter",
  "参考情報": "lilac",
};

/** 問い合わせ窓口の種別。 */
export const contactTone: Record<string, ToneName> = {
  LINE: "mint",
  medical: "aqua",
  app: "lilac",
  other: "butter",
};

/** 体験談のカテゴリ。 */
export const testimonialTone: Record<string, ToneName> = {
  健康: "mint",
  美容: "blossom",
  メンタル: "lilac",
  家族: "apricot",
};

/** 管理ダッシュボードの統計カード（表示順に対応）。 */
export const adminStatTones: ToneName[] = ["aqua", "mint", "lilac", "butter"];

/**
 * ルート → トーン。
 * これにより「メニューのカード」「そのページのヒーロー」「ナビの選択色」が
 * すべて同じ色で揃う。写真が担っていたセクションの識別を色で置き換える。
 */
export const sectionTone: Record<string, ToneName> = {
  "/dashboard": "mint",
  "/setup": "apricot",
  "/videos": "aqua",
  "/recipes": "blossom",
  "/testimonials": "mint",
  "/calendar": "lilac",
  "/contact": "sage",
  "/links": "butter",
  "/profile": "neutral",
};
