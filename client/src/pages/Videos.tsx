import MemberLayout from "@/components/MemberLayout";
import YouTubePlayer, { extractYouTubeId } from "@/components/YouTubePlayer";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

// 秒数を "m:ss" 形式に変換
function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// 進捗バーコンポーネント
function ProgressBar({
  pct,
  completed,
  lastPosition,
}: {
  pct: number;
  completed: string;
  lastPosition: number;
}) {
  if (pct <= 0) return null;
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">
          {completed === "yes" ? (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle2 size={12} /> 視聴完了
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600">
              <Clock size={12} /> {formatTime(lastPosition)} まで視聴済み
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            completed === "yes" ? "bg-green-500" : "bg-amber-400"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Google Drive埋め込みコンポーネント（フォールバック用）
function DrivePlayer({ url }: { url: string }) {
  const driveMatch = url.match(/\/file\/d\/([^/]+)/);
  if (!driveMatch) {
    return (
      <iframe
        src={url}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay"
      />
    );
  }
  const embedUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  return (
    <iframe
      src={embedUrl}
      className="w-full h-full"
      allowFullScreen
      allow="autoplay"
    />
  );
}

// 個別動画カードコンポーネント
function VideoCard({
  video,
  isActive,
  onPlay,
  progress,
  onProgressUpdate,
}: {
  video: {
    id: number;
    title: string;
    category: string;
    description?: string | null;
    videoUrl: string;
    isLatest?: boolean | null;
  };
  isActive: boolean;
  onPlay: (id: number) => void;
  progress?: {
    lastPosition: number;
    duration: number;
    progressPct: number;
    completed: string;
  } | null;
  onProgressUpdate: (videoId: number, pos: number, dur: number) => void;
}) {
  const pct = progress?.progressPct ?? 0;
  const completed = progress?.completed ?? "no";
  const lastPosition = progress?.lastPosition ?? 0;
  const startSec = completed === "yes" ? 0 : lastPosition;

  const youtubeId = extractYouTubeId(video.videoUrl);
  const isYouTube = !!youtubeId;

  const handleProgress = useCallback(
    (pos: number, dur: number) => {
      onProgressUpdate(video.id, pos, dur);
    },
    [video.id, onProgressUpdate]
  );

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden card-hover">
      <div className="aspect-video bg-black relative">
        {isActive ? (
          isYouTube ? (
            <YouTubePlayer
              videoId={youtubeId}
              startSeconds={startSec}
              onProgress={handleProgress}
              onEnded={() => {
                toast.success(`「${video.title}」の視聴が完了しました`);
              }}
              className="w-full h-full"
            />
          ) : (
            <DrivePlayer url={video.videoUrl} />
          )
        ) : (
          <button
            onClick={() => onPlay(video.id)}
            className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20 hover:from-primary/20 transition-colors group gap-2"
          >
            <PlayCircle
              size={44}
              className="text-primary/70 group-hover:text-primary group-hover:scale-105 transition-all"
            />
            {startSec > 0 && (
              <span className="text-xs text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                {formatTime(startSec)} から続きを再生
              </span>
            )}
          </button>
        )}

        {/* 完了バッジ */}
        {completed === "yes" && !isActive && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 size={11} /> 完了
          </div>
        )}

        {/* YouTube / Drive バッジ */}
        {!isActive && (
          <div className="absolute bottom-2 left-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isYouTube
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              {isYouTube ? "YouTube" : "Drive"}
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="secondary" className="text-xs">
            {video.category}
          </Badge>
          {video.isLatest && (
            <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
              NEW
            </Badge>
          )}
        </div>
        <h3 className="font-medium text-sm text-foreground leading-snug">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {video.description}
          </p>
        )}
        <ProgressBar pct={pct} completed={completed} lastPosition={lastPosition} />
      </div>
    </div>
  );
}

export default function Videos() {
  usePageView("学習動画ライブラリ");
  const { data: videos, isLoading } = trpc.video.list.useQuery();
  const { data: myProgress, refetch: refetchProgress } = trpc.video.myProgress.useQuery();
  const saveProgress = trpc.video.saveProgress.useMutation({
    onSuccess: () => {
      refetchProgress();
    },
    onError: () => {
      // 保存失敗は静かに処理（UXを妨げない）
      console.warn("[Videos] 視聴進捗の保存に失敗しました。次回の保存で再試行します。");
    },
  });

  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("すべて");

  // 進捗マップ (videoId → progress)
  const progressMap = new Map(
    (myProgress ?? []).map((p) => [p.videoId, p])
  );

  const categories = [
    "すべて",
    ...Array.from(new Set(videos?.map((v) => v.category) ?? [])),
  ];
  const filtered =
    activeCategory === "すべて"
      ? videos ?? []
      : (videos ?? []).filter((v) => v.category === activeCategory);

  const latestVideos = (videos ?? []).filter((v) => v.isLatest);

  const handlePlay = (videoId: number) => {
    const prog = progressMap.get(videoId);
    if (prog && prog.lastPosition > 0 && prog.completed !== "yes") {
      toast.info(`${formatTime(prog.lastPosition)} から続きを再生します`);
    }
    setActiveVideo(videoId);
  };

  const handleProgressUpdate = useCallback(
    (videoId: number, pos: number, dur: number) => {
      saveProgress.mutate({
        videoId,
        lastPosition: Math.floor(pos),
        duration: Math.floor(dur),
      });
    },
    [saveProgress]
  );

  return (
    <MemberLayout>
      <div className="container py-6 lg:py-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-serif font-semibold">学習動画ライブラリ</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            カテゴリ別に動画を整理しています。YouTubeの動画は続きから正確に再生できます。
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
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={activeVideo === video.id}
                  onPlay={handlePlay}
                  progress={progressMap.get(video.id)}
                  onProgressUpdate={handleProgressUpdate}
                />
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
              <div
                key={i}
                className="aspect-video bg-muted rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((video, index) => (
              <div
                key={video.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <VideoCard
                  video={video}
                  isActive={activeVideo === video.id}
                  onPlay={handlePlay}
                  progress={progressMap.get(video.id)}
                  onProgressUpdate={handleProgressUpdate}
                />
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">このカテゴリの動画はまだありません</p>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
