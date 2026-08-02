/**
 * YouTubePlayer.tsx
 *
 * YouTube iframe API を使って正確な再生位置を取得し、
 * 続きから再生・視聴進捗の保存を行うプレイヤーコンポーネント。
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";

// YouTube IFrame Player API の型定義
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: {
            autoplay?: 0 | 1;
            start?: number;
            rel?: 0 | 1;
            modestbranding?: 0 | 1;
            controls?: 0 | 1 | 2;
          };
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}

// YouTube動画URLからvideo IDを抽出
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
    /youtube\.com\/shorts\/([^&?/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// エラーコードのメッセージ
function getYTErrorMessage(code: number): string {
  switch (code) {
    case 2: return "動画IDが無効です。URLを確認してください。";
    case 5: return "HTMLプレイヤーでエラーが発生しました。";
    case 100: return "動画が見つかりません（削除または非公開の可能性があります）。";
    case 101:
    case 150: return "この動画は埋め込み再生が許可されていません。YouTubeで直接ご覧ください。";
    default: return "動画の読み込みに失敗しました。しばらく経ってから再試行してください。";
  }
}

// YouTube iframe API スクリプトを一度だけ読み込む
let apiLoaded = false;
let apiReady = false;
const readyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(onReady: () => void) {
  if (apiReady) {
    onReady();
    return;
  }
  readyCallbacks.push(onReady);
  if (apiLoaded) return;
  apiLoaded = true;

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);

  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    readyCallbacks.forEach((cb) => cb());
    readyCallbacks.length = 0;
  };
}

interface YouTubePlayerProps {
  videoId: string;
  startSeconds?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (code: number) => void;
  className?: string;
}

let playerInstanceCounter = 0;

export default function YouTubePlayer({
  videoId,
  startSeconds = 0,
  onProgress,
  onEnded,
  onError,
  className = "",
}: YouTubePlayerProps) {
  const containerId = useRef(`yt-player-${++playerInstanceCounter}`);
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // コールバックを最新に保つ
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);
  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const startProgressTracking = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (!playerRef.current) return;
      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();
      if (duration > 0) {
        onProgressRef.current?.(currentTime, duration);
      }
    }, 5000);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setErrorMsg(null);

    loadYouTubeAPI(() => {
      if (!window.YT?.Player) return;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(containerId.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          start: Math.floor(startSeconds),
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            if (startSeconds > 0) {
              event.target.seekTo(startSeconds, true);
            }
            event.target.playVideo();
          },
          onStateChange: (event) => {
            const { PlayerState } = window.YT;
            if (event.data === PlayerState.PLAYING) {
              startProgressTracking();
            } else if (
              event.data === PlayerState.PAUSED ||
              event.data === PlayerState.BUFFERING
            ) {
              const currentTime = event.target.getCurrentTime();
              const duration = event.target.getDuration();
              if (duration > 0) {
                onProgressRef.current?.(currentTime, duration);
              }
              stopProgressTracking();
            } else if (event.data === PlayerState.ENDED) {
              const duration = event.target.getDuration();
              onProgressRef.current?.(duration, duration);
              stopProgressTracking();
              onEndedRef.current?.();
            }
          },
          onError: (event) => {
            const msg = getYTErrorMessage(event.data);
            setErrorMsg(msg);
            stopProgressTracking();
            onErrorRef.current?.(event.data);
          },
        },
      });
    });

    return () => {
      stopProgressTracking();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (errorMsg) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-muted/30 gap-3 p-4 ${className}`}>
        <AlertCircle size={32} className="text-destructive/70" />
        <p className="text-sm text-center text-muted-foreground">{errorMsg}</p>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary underline underline-offset-2"
        >
          YouTubeで直接見る
        </a>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <div id={containerId.current} className="w-full h-full" />
    </div>
  );
}
