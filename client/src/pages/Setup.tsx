import MemberLayout from "@/components/MemberLayout";
import ContentVisualHero from "@/components/ContentVisualHero";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import { CheckCircle2, ChevronDown, ChevronUp, ExternalLink, PlayCircle, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Setup() {
  usePageView("初期設定フロー");
  const { data: steps, isLoading } = trpc.setup.list.useQuery();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <MemberLayout>
      <div className="container py-6 lg:py-8">
        <ContentVisualHero eyebrow="START HERE" title="はじめての方へ" description="dōTERRAをより楽しむために、まずこちらの準備ステップを順番に進めてください。" icon={Sparkles} tone="apricot" />

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {steps?.map((step, index) => {
              const isOpen = expanded === index;
              return (
                <div
                  key={step.id}
                  className={`bg-card rounded-2xl border transition-all duration-200 overflow-hidden animate-fade-in-up ${
                    isOpen ? "border-primary/30 shadow-sm" : "border-border"
                  }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Step header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : index)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                      isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{step.title}</p>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {/* Step content */}
                  {isOpen && (
                    <div className="px-4 pb-5 space-y-4 border-t border-border/50 pt-4">
                      {step.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      )}

                      {/* Image */}
                      {step.imageUrl && (
                        <img
                          src={step.imageUrl}
                          alt={step.title}
                          className="w-full rounded-xl object-cover max-h-48"
                        />
                      )}

                      {/* Video embed */}
                      {step.videoUrl && (
                        <div className="rounded-xl overflow-hidden bg-black aspect-video">
                          <iframe
                            src={step.videoUrl}
                            title={step.title}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      )}

                      {/* Link */}
                      {step.linkUrl && (
                        <a
                          href={step.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                        >
                          <ExternalLink size={14} />
                          {step.linkLabel ?? "詳細を見る"}
                        </a>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <CheckCircle2 size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">確認したら次のステップへ進みましょう</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
