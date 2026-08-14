type ContentVisualHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  sourceHref?: string;
};

export default function ContentVisualHero({
  eyebrow,
  title,
  description,
  imageUrl,
  imageAlt,
  sourceHref,
}: ContentVisualHeroProps) {
  return (
    <section className="relative min-h-[15rem] overflow-hidden rounded-[1.65rem] animate-fade-in-up sm:min-h-[17rem]">
      <img src={imageUrl} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(10,31,15,0.90) 0%, rgba(11,39,20,0.63) 52%, rgba(10,31,15,0.22) 100%)" }} />
      <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.22)" }} />
      <div className="relative flex min-h-[15rem] max-w-2xl flex-col justify-end p-6 sm:min-h-[17rem] sm:p-9">
        <p style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-display)", fontSize: "0.62rem", letterSpacing: "0.25em" }}>{eyebrow}</p>
        <h1 className="mt-3" style={{ color: "white", fontFamily: "var(--font-serif)", fontSize: "clamp(1.55rem, 3.5vw, 2.55rem)", fontWeight: 400, letterSpacing: "0.065em", lineHeight: 1.35 }}>{title}</h1>
        <p className="mt-3 max-w-xl" style={{ color: "rgba(255,255,255,0.86)", fontSize: "0.79rem", fontWeight: 300, lineHeight: 1.85, letterSpacing: "0.05em" }}>{description}</p>
        {sourceHref && <a href={sourceHref} target="_blank" rel="noreferrer" className="mt-4 w-fit" style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.61rem", letterSpacing: "0.04em" }}>ビジュアル：dōTERRA公式掲載画像</a>}
      </div>
    </section>
  );
}
