import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, PreviewServer, ViteDevServer } from "vite";
import { handleAiTasksPost } from "./server/aiTasksApi.ts";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function installAiTasksMiddleware(server: ViteDevServer | PreviewServer) {
  server.middlewares.use(
    async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
      const url = req.url?.split("?")[0] ?? "";
      if (req.method !== "POST" || url !== "/functions/v1/ai-tasks") {
        next();
        return;
      }
      try {
        const raw = await readBody(req);
        let body: unknown = {};
        if (raw) body = JSON.parse(raw);
        const result = await handleAiTasksPost(req.headers as Record<string, string | string[] | undefined>, body);
        res.setHeader("Content-Type", "application/json");
        res.statusCode = result.status;
        res.end(JSON.stringify(result.body));
      } catch (e) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "invalid_json", message: String(e) }));
      }
    },
  );
}

export function aiTasksApiPlugin(): Plugin {
  return {
    name: "clawbuddy-ai-tasks-api",
    configureServer(server) {
      installAiTasksMiddleware(server);
    },
    configurePreviewServer(server) {
      installAiTasksMiddleware(server);
    },
  };
}
