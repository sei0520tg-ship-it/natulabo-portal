import MemberLayout from "@/components/MemberLayout";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Videos() {
  usePageView("学習動画ライブラリ");
  const { data: videos, isLoading } = trpc.video.list.useQuery();
  const logVideoView = trpc.log.videoView.useMutation();
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("すべて");

  const categories = ["すべて", ...Array.from(new Set(videos?.map((v) => v.category) ?? []))];
  const filtered = activeCategory === "すべて"
    ? videos ?? []
    : (videos ?? []).filter((v) => v.category === activeCategory);

  const latestVideos = (videos ?? []).filter((v) => v.isLatest);

  const handlePlay = (videoId: number) => {
    setActiveVideo(videoId);
    logVideoView.mutate({ videoId });
  };

  return (
    <MemberLayout>
      <div className="container py-6 lg:py-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold">学習動画ライブラリ</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            カテゴリ別に動画を整理しています。気になる動画をご覧ください。
          </p>
        </div>

        {/* Latest videos */}
        {latestVideos.length > 0 && (
          <div className="animate-fade-in-up stagger-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-amber-500" />
              <h2 className="text-base font-semibold">最新動画</h2>
            </div>
            <div className="space-y-4">
              {latestVideos.map((video) => (
                <div key={video.id} id={`video-${video.id}`} className="bg-card rounded-2xl border border-primary/20 overflow-hidden shadow-sm">
                  <div className="aspect-video bg-black">
                    {activeVideo === video.id ? (
                      <iframe
                        src={video.videoUrl + "?autoplay=1"}
                        title={video.title}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <button
                        onClick={() => handlePlay(video.id)}
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 transition-colors group"
                      >
                        <PlayCircle size={56} className="text-primary group-hover:scale-105 transition-transform" />
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{video.category}</Badge>
                      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">NEW</Badge>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{video.title}</h3>
                    {video.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{video.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="animate-fade-in-up stagger-2">
          <h2 className="text-base font-semibold mb-3">カテゴリ別</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((video, index) => (
              <div
                key={video.id}
                id={`video-${video.id}`}
                className="bg-card rounded-2xl border border-border overflow-hidden card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="aspect-video bg-black">
                  {activeVideo === video.id ? (
                    <iframe
                      src={video.videoUrl + "?autoplay=1"}
                      title={video.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <button
                      onClick={() => handlePlay(video.id)}
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20 hover:from-primary/20 transition-colors group"
                    >
                      <PlayCircle size={40} className="text-primary/70 group-hover:text-primary group-hover:scale-105 transition-all" />
                    </button>
                  )}
                </div>
                <div className="p-3.5">
                  <Badge variant="secondary" className="text-xs mb-1.5">{video.category}</Badge>
                  <h3 className="font-medium text-sm text-foreground leading-snug">{video.title}</h3>
                  {video.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
