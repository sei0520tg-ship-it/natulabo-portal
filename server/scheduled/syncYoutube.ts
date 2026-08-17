/**
 * syncYoutube.ts
 *
 * cron（Heartbeat）から定期的に叩かれる YouTube 同期エンドポイント。
 * `references/periodic-updates.md` の §3 Step 2 に沿った形。
 *
 * 登録コマンド（デプロイ後にサンドボックスの端末で 1 回だけ実行）:
 *   manus-heartbeat create \
 *     --name sync-youtube \
 *     --cron "0 0 * * * *" \
 *     --path /api/scheduled/syncYoutube \
 *     --description "YouTube再生リストを毎時同期"
 */

import type { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { syncYouTubeVideos } from "../youtube";

export async function syncYoutubeHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const result = await syncYouTubeVideos();
    console.log("[syncYoutube]", result);
    return res.json({ ok: true, ...result });
  } catch (error) {
    const err = error as Error;
    console.error("[syncYoutube] failed:", err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.originalUrl, taskUid: null },
      timestamp: new Date().toISOString(),
    });
  }
}
