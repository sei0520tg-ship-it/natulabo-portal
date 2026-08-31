import MemberLayout from "@/components/MemberLayout";
import YouTubePlayer, { extractYouTubeId } from "@/components/YouTubePlayer";
import ContentVisualHero from "@/components/ContentVisualHero";
import { trpc } from "@/lib/trpc";
import { usePageView } from "@/hooks/usePageView";
import { tone, type ToneName } from "@/lib/categoryTheme";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, PlayCircle, RotateCcw, Sparkles } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

// 1ページあたりの動画数。カードは2列表示なので偶数が収まりが良い。
const PAGE_SIZE = 12;
import { Button } from "@/components/ui/button";
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

// サムネイルが無い動画の代替表示。写真ではなくパステルの面を順に割り当てる。
// 現在は全180本にYouTubeのサムネイルがあるため、実際にはほとんど出番がない。
const fallbackTones: ToneName[] = ["aqua", "blossom", "butter", "lilac", "mint", "apricot"];

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
    thumbnailUrl?: string | null;
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
  const fallbackTone = tone(fallbackTones[video.id % fallbackTones.length]);

  const handleProgress = useCallback(
    (pos: number, dur: number) => {
      onProgressUpdate(video.id, pos, dur);
    },
    [video.id, onProgressUpdate]
  );

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden card-hover">
      <div className="aspect-video bg-muted relative">
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
            aria-label={`「${video.title}」を再生`}
            className="relative w-full h-full overflow-hidden group"
          >
            {video.thumbnailUrl ? (
              <>
                <img src={video.thumbnailUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-brown-900/35" />
              </>
            ) : (
              <span className={`absolute inset-0 ${fallbackTone.surface}`} />
            )}
            <span className="relative flex h-full flex-col items-center justify-center gap-2">
              <span className={`flex h-12 w-12 items-center justify-center rounded-pill bg-card shadow-soft ${video.thumbnailUrl ? "text-forest-600" : fallbackTone.ink}`}><PlayCircle size={25} /></span>
              {startSec > 0 && <span className="rounded-pill bg-brown-900/70 px-3 py-1 text-xs text-white">{formatTime(startSec)} から続きを再生</span>}
            </span>
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
  // 続きから再生確認ダイアログの対象動画イド
  const [resumeTarget, setResumeTarget] = useState<{ videoId: number; position: number } | null>(null);

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

  // ── ページネーション ──────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement | null>(null);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // カテゴリ変更や動画削除で件数が減ったとき、存在しないページに取り残されないようにする
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [page, currentPage]);

  const goToPage = (next: number) => {
    const target = Math.min(Math.max(next, 1), totalPages);
    if (target === currentPage) return;
    setPage(target);
    setActiveVideo(null); // 再生中の動画がページ外へ消えるのを防ぐ
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePlay = (videoId: number) => {
    const prog = progressMap.get(videoId);
    // 未完了で一定以上視聴済みの場合は確認ダイアログを表示
    if (prog && prog.lastPosition > 30 && prog.completed !== "yes") {
      setResumeTarget({ videoId, position: prog.lastPosition });
    } else {
      setActiveVideo(videoId);
    }
  };

  const handleResumeConfirm = (fromStart: boolean) => {
    if (!resumeTarget) return;
    if (fromStart) {
      // 最初から再生：進捗リセットして再生
      saveProgress.mutate({ videoId: resumeTarget.videoId, lastPosition: 0, duration: 0 });
    }
    setActiveVideo(resumeTarget.videoId);
    setResumeTarget(null);
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
        <ContentVisualHero eyebrow="VIDEO LIBRARY" title="学習動画ライブラリ" description="カテゴリ別に動画を整理しています。視聴の続きから、あなたのペースで学びを深めましょう。" icon={BookOpen} tone="aqua" />

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
        <div ref={gridTopRef} className="animate-fade-in-up stagger-2 scroll-mt-20">
          <h2 className="text-base font-semibold mb-3">カテゴリ別</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); setActiveVideo(null); }}
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
            {paged.map((video, index) => (
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

        {/* ページ送り */}
        {!isLoading && filtered.length > 0 && (
          <nav aria-label="動画一覧のページ送り" className="flex flex-col items-center gap-3 pt-2">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              全{filtered.length}件中 {(currentPage - 1) * PAGE_SIZE + 1}〜
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}件を表示
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft size={15} />
                前のページ
              </Button>
              <span className="px-3 text-sm font-medium tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                次のページ
                <ChevronRight size={15} />
              </Button>
            </div>
          </nav>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">このカテゴリの動画はまだありません</p>
          </div>
        )}
      </div>

      {/* 続きから再生 確認ダイアログ */}
      {resumeTarget && (() => {
        const targetVideo = (videos ?? []).find(v => v.id === resumeTarget.videoId);
        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setResumeTarget(null)}
          >
            <div
              className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-border"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <PlayCircle size={18} className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm leading-snug">
                  {targetVideo?.title ?? "動画"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-3 mb-5 leading-relaxed">
                <span className="font-medium text-foreground">{formatTime(resumeTarget.position)}</span>まで視聴済みです。続きから再生しますか？
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => handleResumeConfirm(true)}
                >
                  <RotateCcw size={13} />
                  最初から
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => handleResumeConfirm(false)}
                >
                  <PlayCircle size={13} />
                  {formatTime(resumeTarget.position)}から続き
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </MemberLayout>
  );
}
