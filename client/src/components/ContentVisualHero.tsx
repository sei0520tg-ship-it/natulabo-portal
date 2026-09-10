import type { LucideIcon } from "lucide-react";
import { tone, type ToneName } from "@/lib/categoryTheme";

type ContentVisualHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** ページを象徴するアイコン。白い丸チップの中に入る */
  icon: LucideIcon;
  /** ページごとの色。sectionTone と揃えると全体で色が一貫する */
  tone: ToneName;
  /**
   * 縦を詰めた横長の見た目にする。
   * カレンダーのように「本体を早く見せたい」ページで使う。
   */
  compact?: boolean;
};

/**
 * 会員向け各ページの共通ヒーロー。
 *
 * 以前はdōTERRAの写真の上に濃い緑のスクリムを敷いて白文字を載せていたが、
 * 写真ごとに可読性が変わるうえ暗く重い印象だった。
 * パステルの面に濃いブラウンの文字を載せる形にして、
 * コントラストが常に一定になるようにしている。
 */
export default function ContentVisualHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone: toneName,
  compact = false,
}: ContentVisualHeroProps) {
  const t = tone(toneName);

  return (
    <section
      className={`relative overflow-hidden rounded-card-lg border border-cream-300 bg-cream-100 animate-fade-in-up ${
        compact ? "px-5 py-4 sm:px-6 sm:py-5" : "px-6 py-8 sm:px-9 sm:py-10"
      }`}
    >
      {/* 装飾。写真の代わりに画面へやわらかい密度を与える。読み上げ対象から外す。 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className={`soft-blob natu-float -right-10 -top-16 h-52 w-52 ${t.surface} opacity-80`} />
        <span className={`soft-blob -bottom-20 right-24 h-40 w-40 ${t.surface} opacity-60`} />
      </div>

      {compact ? (
        // 横並び。説明文は補足なので、狭い画面では省いて高さを抑える。
        <div className="relative flex items-center gap-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-pill ${t.surface}`}>
            <Icon size={22} className={t.ink} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className={`font-display text-[0.6rem] font-semibold tracking-[0.14em] ${t.ink}`}>
              {eyebrow}
            </p>
            <h1 className="mt-0.5 font-bold text-brown-800" style={{ fontSize: "1.15rem", lineHeight: 1.35 }}>
              {title}
            </h1>
            <p className="mt-1 hidden text-xs leading-relaxed text-brown-600 sm:block">{description}</p>
          </div>
        </div>
      ) : (
        <div className="relative flex max-w-2xl flex-col gap-3">
          <span className={`flex h-16 w-16 items-center justify-center rounded-pill ${t.surface}`}>
            <Icon size={28} className={t.ink} aria-hidden="true" />
          </span>

          <p className={`font-display text-[0.68rem] font-semibold tracking-[0.14em] ${t.ink}`}>
            {eyebrow}
          </p>

          <h1
            className="font-bold text-brown-800"
            style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)", lineHeight: 1.4 }}
          >
            {title}
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-brown-600">{description}</p>
        </div>
      )}
    </section>
  );
}
