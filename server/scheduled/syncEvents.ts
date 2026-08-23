/**
 * syncEvents.ts
 *
 * cron（Heartbeat）から定期的に叩かれる、スプレッドシート → カレンダー同期。
 * `references/periodic-updates.md` の §3 Step 2 に沿った形。
 *
 * 登録コマンド（デプロイ後にサンドボックスの端末で1回だけ実行）:
 *   manus-heartbeat create \
 *     --name sync-events \
 *     --cron "0 0,15,30,45 * * * *" \
 *     --path /api/scheduled/syncEvents \
 *     --description "イベント用スプレッドシートを15分おきに同期"
 */

import type { Request, Response } from "express";
import { sdk } from "../_core/sdk";
import { syncEventSheets } from "../eventSheetSync";

export async function syncEventsHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const result = await syncEventSheets();
    console.log("[syncEvents]", result);
    return res.json({ ok: true, ...result });
  } catch (error) {
    const err = error as Error;
    console.error("[syncEvents] failed:", err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.originalUrl },
      timestamp: new Date().toISOString(),
    });
  }
}
