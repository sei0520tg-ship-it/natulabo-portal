import { useState } from "react";

/**
 * BrandMark.tsx
 *
 * NatuLabo のロゴマーク。
 *
 * ロゴの実体は Manus のストレージ（/manus-storage/…）にしか無く、
 * リポジトリには含まれていない。そのため Manus が落ちるとサイト全体で
 * ロゴが壊れた画像アイコンになってしまう（実際に発生した）。
 *
 * ここでは画像の読み込みに失敗したら、その場で描画する葉のマークに
 * 差し替える。外部に一切依存しないので、Manus から離れても崩れない。
 */

const LOGO_SRC = "/manus-storage/logo-circle_08be9919.png";

export default function BrandMark({
  className = "",
  title = "NatuLabo",
}: {
  className?: string;
  /** 装飾として置く場合は空文字を渡す（読み上げ対象から外れる） */
  title?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <svg
        viewBox="0 0 40 40"
        className={className}
        role={title ? "img" : undefined}
        aria-label={title || undefined}
        aria-hidden={title ? undefined : "true"}
      >
        <circle cx="20" cy="20" r="20" fill="var(--forest-500)" />
        {/* 葉。左右の曲線を合わせた形 */}
        <path
          d="M20 9c-6.2 2-9.8 6.6-9.8 12.2 0 3.6 1.8 6.6 4.6 8.3.7-5.9 2.6-10.2 5.9-13.4-2.4 3.6-3.8 8-4.2 13.6 1.1.4 2.3.6 3.5.6 6 0 9.8-4.3 9.8-10.6C29.8 15.4 25.6 11 20 9z"
          fill="var(--cream-50)"
        />
      </svg>
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt={title}
      aria-hidden={title ? undefined : "true"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
