import MemberLayout from "@/components/MemberLayout";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import ContentVisualHero from "@/components/ContentVisualHero";
import { doterraAssets, doterraSources } from "@/lib/doterraAssets";
import { ExternalLink, Mail, MessageCircle, Smartphone, Stethoscope, HelpCircle } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  MessageCircle,
  Stethoscope,
  Smartphone,
  Mail,
  HelpCircle,
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  LINE: { bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
  medical: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  app: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  other: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
};

const categoryLabels: Record<string, string> = {
  LINE: "LINE相談",
  medical: "医療相談",
  app: "アプリ・システム",
  other: "その他",
};

export default function Contact() {
  usePageView("お問い合わせ窓口");
  const { data: items, isLoading } = trpc.contact.list.useQuery();

  return (
    <MemberLayout>
      <div className="container py-6 lg:py-8">
        <ContentVisualHero eyebrow="SUPPORT & CARE" title="お問い合わせ窓口" description="お困りの内容に合わせて、最適な窓口にご相談ください。" imageUrl={doterraAssets.memberRoseField} imageAlt="dōTERRA公式掲載の植物" sourceHref={doterraSources.japanHome} />

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items?.map((item, index) => {
              const colors = categoryColors[item.category] ?? categoryColors.other;
              const IconComponent = iconMap[item.iconName ?? "HelpCircle"] ?? HelpCircle;
              return (
                <div
                  key={item.id}
                  className={`card-hover bg-card rounded-2xl border ${colors.border} p-5 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                      <IconComponent size={22} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                          {categoryLabels[item.category] ?? item.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                      )}
                      {item.linkUrl && (
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 mt-3 text-xs font-medium ${colors.text} hover:underline`}
                        >
                          <ExternalLink size={12} />
                          {item.linkLabel ?? "相談する"}
                        </a>
                      )}
                    </div>
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
