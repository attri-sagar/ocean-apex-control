import type { IncomingMessage } from "node:http";
import { getPool } from "./db/pool.ts";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

export async function handleWebhookRequest(
  fullUrl: string,
  req: IncomingMessage,
  body: any
): Promise<{ status: number; body: Record<string, unknown> }> {
  let u: URL;
  try {
    u = new URL(fullUrl, "http://localhost");
  } catch {
    return { status: 400, body: { error: "bad_request", message: "Invalid URL" } };
  }

  const pool = getPool();

  if (u.pathname === "/api/webhooks") {
    if (req.method === "GET") {
      try {
        const res = await pool.query("SELECT id, target_url, events, created_at FROM board_webhooks ORDER BY created_at DESC");
        return { status: 200, body: { webhooks: res.rows } };
      } catch (e: any) {
        return { status: 500, body: { error: "db_error", message: e.message } };
      }
    }

    if (req.method === "POST") {
      try {
        const id = `wh-${Date.now()}`;
        await pool.query(
          `INSERT INTO board_webhooks (id, target_url, secret_token, events) VALUES ($1, $2, $3, $4::jsonb)`,
          [id, body.target_url, body.secret_token || null, JSON.stringify(body.events || ["task.created", "task.assigned"])]
        );
        return { status: 200, body: { success: true, id } };
      } catch (e: any) {
        return { status: 500, body: { error: "db_error", message: e.message } };
      }
    }

    if (req.method === "DELETE") {
      try {
        const id = u.searchParams.get("id");
        if (!id) return { status: 400, body: { error: "missing_id" } };
        await pool.query(`DELETE FROM board_webhooks WHERE id = $1`, [id]);
        return { status: 200, body: { success: true } };
      } catch (e: any) {
        return { status: 500, body: { error: "db_error", message: e.message } };
      }
    }
  }

  return { status: 404, body: { error: "not_found", message: "Not found" } };
}
