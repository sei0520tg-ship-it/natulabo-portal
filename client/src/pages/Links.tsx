import MemberLayout from "@/components/MemberLayout";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import { ExternalLink } from "lucide-react";

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "クラフト材料": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  "容器・ボトル": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-100" },
  "Amazon": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  "参考情報": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
};

const defaultColor = { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-100" };

export default function Links() {
  usePageView("外部リンク集");
  const { data: links, isLoading } = trpc.link.list.useQuery();

  // Group by category
  const grouped: Record<string, typeof links> = {};
  links?.forEach((link) => {
    if (!grouped[link.category]) grouped[link.category] = [];
    grouped[link.category]!.push(link);
  });

  return (
    <MemberLayout>
      <div className="container py-6 lg:py-8 space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold">外部リンク集</h1>
          <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
            dōTERRAの愛用に役立つ外部サイトをカテゴリ別にまとめています。
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items], catIndex) => {
              const colors = categoryColors[category] ?? defaultColor;
              return (
                <div key={category} className="animate-fade-in-up" style={{ animationDelay: `${catIndex * 80}ms` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${colors.bg} ${colors.text}`}>
                      {category}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items?.map((link, index) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`card-hover flex items-center gap-4 bg-card rounded-xl border ${colors.border} p-4 group animate-fade-in-up`}
                        style={{ animationDelay: `${(catIndex * 80) + (index * 50)}ms` }}
                      >
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                          <ExternalLink size={16} className={colors.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{link.title}</p>
                          {link.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{link.description}</p>
                          )}
                        </div>
                        <ExternalLink size={14} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      </a>
                    ))}
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
