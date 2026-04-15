import { getPool } from "./db/pool.ts";

export async function dispatchWebhookEvent(eventType: string, payload: any) {
  try {
    const pool = getPool();
    const res = await pool.query(`SELECT target_url, secret_token, events FROM board_webhooks`);
    
    for (const row of res.rows) {
      const events: string[] = row.events || [];
      if (events.includes(eventType) || events.includes("*")) {
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        if (row.secret_token) {
          headers["x-board-token"] = row.secret_token;
        }

        // Fire and forget, don't await response to avoid blocking UI
        fetch(row.target_url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            event: eventType,
            timestamp: new Date().toISOString(),
            data: payload
          })
        }).catch(err => {
          console.error(`Failed to dispatch webhook to ${row.target_url}:`, err.message);
        });
      }
    }
  } catch (err) {
    console.error("Failed to process webhooks:", err);
  }
}
