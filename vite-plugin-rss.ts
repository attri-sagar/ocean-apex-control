import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, PreviewServer, ViteDevServer } from "vite";
import { handleRssRequest } from "./server/rssFeeds.ts";

function installRssMiddleware(server: ViteDevServer | PreviewServer) {
  server.middlewares.use(
    async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
      const pathOnly = req.url?.split("?")[0] ?? "";
      if (req.method !== "GET" || !pathOnly.startsWith("/api/rss")) {
        next();
        return;
      }
      try {
        const result = await handleRssRequest(req.url ?? "", req);
        res.setHeader("Content-Type", "application/json");
        res.statusCode = result.status;
        res.end(JSON.stringify(result.body));
      } catch (e) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "rss_error", message: String(e) }));
      }
    },
  );
}

export function rssApiPlugin(): Plugin {
  return {
    name: "apexhunter-rss-api",
    configureServer(server) {
      installRssMiddleware(server);
    },
    configurePreviewServer(server) {
      installRssMiddleware(server);
    },
  };
}
