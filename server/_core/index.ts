import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { syncYoutubeHandler } from "../scheduled/syncYoutube";
import { getNatuLaboCalendarIcs, getNatuLaboEventIcs } from "../calendarFeed";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Scheduled (cron) callbacks — /api/scheduled/* は自動登録されないので明示的に生やす。
  // Vite / static のフォールスルーより前に置くこと。
  app.post("/api/scheduled/syncYoutube", syncYoutubeHandler);
  // 会員がGoogle・Apple・Outlookカレンダーで購読できる公開イベントフィード。
  // 外部カレンダーはセッション認証を送れないため、公開済みイベントのみを返す。
  app.get("/api/calendar/natulabo.ics", async (_req, res) => {
    const ics = await getNatuLaboCalendarIcs();
    res.set({
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "inline; filename=natulabo-events.ics",
      "Cache-Control": "no-store",
    });
    res.send(ics);
  });
  app.get("/api/calendar/events/:id.ics", async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      res.status(400).send("Invalid event id");
      return;
    }
    const ics = await getNatuLaboEventIcs(id);
    if (!ics) {
      res.status(404).send("Event not found");
      return;
    }
    res.set({
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=natulabo-event-${id}.ics`,
      "Cache-Control": "no-store",
    });
    res.send(ics);
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
