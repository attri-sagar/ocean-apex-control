import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, PreviewServer, ViteDevServer } from "vite";
import { handleAgentsRequest } from "./server/agentsApi.ts";
import { handleWebhookRequest } from "./server/webhookApi.ts";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function installAgentsMiddleware(server: ViteDevServer | PreviewServer) {
  server.middlewares.use(
    async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
      const pathOnly = req.url?.split("?")[0] ?? "";
      if (pathOnly.startsWith("/api/webhooks")) {
        try {
          let body = {};
          if (req.method === "POST" || req.method === "PUT") {
            const raw = await readBody(req);
            if (raw) body = JSON.parse(raw);
          }
          const result = await handleWebhookRequest(req.url ?? "", req, body);
          res.setHeader("Content-Type", "application/json");
          res.statusCode = result.status;
          res.end(JSON.stringify(result.body));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "server_error", message: String(e) }));
        }
        return;
      }
      if (!pathOnly.startsWith("/api/agents")) {
        next();
        return;
      }
      try {
        let body = {};
        if (req.method === "POST" || req.method === "PUT") {
          const raw = await readBody(req);
          if (raw) body = JSON.parse(raw);
        }
        const result = await handleAgentsRequest(req.url ?? "", req, body);
        res.setHeader("Content-Type", "application/json");
        res.statusCode = result.status;
        res.end(JSON.stringify(result.body));
      } catch (e) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "server_error", message: String(e) }));
      }
    },
  );
}

export function agentsApiPlugin(): Plugin {
  return {
    name: "apexhunter-agents-api",
    configureServer(server) {
      installAgentsMiddleware(server);
    },
    configurePreviewServer(server) {
      installAgentsMiddleware(server);
    },
  };
}
