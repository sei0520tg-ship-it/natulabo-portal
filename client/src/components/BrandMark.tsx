/**
 * BrandMark.tsx
 *
 * NatuLabo のロゴ。画像ファイルではなく、ロゴと同じ書体（Montserrat）で
 * 組んだテキストとして描画する。
 *
 * 画像を使わない理由:
 *   元のロゴは Manus のストレージにしか無く、Manus が落ちるとサイト全体で
 *   ロゴが壊れた画像になった（実際に発生した）。テキストで組めば外部に
 *   一切依存せず、どの解像度でも滲まない。
 *
 * circle / banner を SVG で描いている理由:
 *   文字サイズを em で指定すると親の font-size に引きずられ、
 *   ロゴの箱を大きくしても中の文字が small のままになる（実際にそうなった）。
 *   viewBox 付きの SVG なら、箱の大きさに文字が必ず比例する。
 *
 * variant:
 *   wordmark … 横一列の「NATULABO.」。ヘッダーやフッター向け
 *   circle   … ピンクの円に2行で収めたもの。ログイン画面などの象徴的な位置向け
 *   banner   … ピンクの帯に横組み
 */

type Variant = "wordmark" | "circle" | "banner";

const TEXT_STYLE = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fill: "var(--brown-900)",
} as const;

export default function BrandMark({
  variant = "wordmark",
  className = "",
  title = "NatuLabo",
}: {
  variant?: Variant;
  className?: string;
  /** 装飾として置く場合は空文字を渡す（読み上げ対象から外れる） */
  title?: string;
}) {
  const a11y = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true as const };

  if (variant === "circle") {
    return (
      <svg viewBox="0 0 100 100" className={className} {...a11y}>
        <circle cx="50" cy="50" r="50" fill="var(--brand-pink)" />
        <text
          x="50"
          y="44"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="21"
          letterSpacing="0.5"
          style={TEXT_STYLE}
        >
          NATU
        </text>
        <text
          x="50"
          y="67"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="21"
          letterSpacing="0.5"
          style={TEXT_STYLE}
        >
          LABO.
        </text>
      </svg>
    );
  }

  if (variant === "banner") {
    return (
      <svg viewBox="0 0 200 52" className={className} {...a11y}>
        <rect width="200" height="52" fill="var(--brand-pink)" />
        <text
          x="100"
          y="27"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="26"
          letterSpacing="2.2"
          style={TEXT_STYLE}
        >
          NATULABO.
        </text>
      </svg>
    );
  }

  return (
    <span
      {...a11y}
      className={`font-display font-bold tracking-[0.14em] text-brown-900 ${className}`}
    >
      NATULABO.
    </span>
  );
}
