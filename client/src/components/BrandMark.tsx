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
 * variant:
 *   wordmark … 横一列の「NATU LABO.」。ヘッダーやフッター向け
 *   circle   … ピンクの円に2行で収めたもの。ログイン画面などの象徴的な位置向け
 *   banner   … ピンクの帯に白抜きの横組み
 */

type Variant = "wordmark" | "circle" | "banner";

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
      <span
        {...a11y}
        className={`inline-flex flex-col items-center justify-center rounded-pill bg-brand-pink leading-none ${className}`}
      >
        <span className="font-display font-bold tracking-[0.04em] text-brown-900" style={{ fontSize: "0.34em" }}>
          NATU
        </span>
        <span className="font-display font-bold tracking-[0.04em] text-brown-900" style={{ fontSize: "0.34em", marginTop: "0.12em" }}>
          LABO.
        </span>
      </span>
    );
  }

  if (variant === "banner") {
    return (
      <span
        {...a11y}
        className={`inline-flex items-center bg-brand-pink px-[0.5em] py-[0.22em] font-display font-bold tracking-[0.14em] text-brown-900 ${className}`}
      >
        NATU&nbsp;LABO.
      </span>
    );
  }

  return (
    <span
      {...a11y}
      className={`font-display font-bold tracking-[0.14em] text-brown-900 ${className}`}
    >
      NATU&nbsp;LABO.
    </span>
  );
}
