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
}: ContentVisualHeroProps) {
  const t = tone(toneName);

  return (
    <section
      className={`relative overflow-hidden rounded-card-lg ${t.surface} px-6 py-8 animate-fade-in-up sm:px-9 sm:py-10`}
    >
      {/* 装飾。写真の代わりに画面へやわらかい密度を与える。読み上げ対象から外す。 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className={`soft-blob natu-float -right-10 -top-16 h-52 w-52 ${t.dot} opacity-25`} />
        <span className={`soft-blob -bottom-20 right-24 h-40 w-40 ${t.dot} opacity-20`} />
      </div>

      <div className="relative flex max-w-2xl flex-col gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-card shadow-soft">
          <Icon size={26} className={t.ink} aria-hidden="true" />
        </span>

        <p className={`font-display text-[0.68rem] font-medium tracking-[0.16em] ${t.ink}`}>
          {eyebrow}
        </p>

        <h1
          className="text-brown-800"
          style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)", lineHeight: 1.4 }}
        >
          {title}
        </h1>

        <p className="max-w-xl text-sm leading-relaxed text-brown-600">{description}</p>
      </div>
    </section>
  );
}
