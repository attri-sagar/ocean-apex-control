import type { IncomingMessage } from "node:http";
import { getPool } from "./db/pool.ts";

export async function handleAgentsRequest(
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

  if (u.pathname === "/api/agents") {
    if (req.method === "GET") {
      try {
        const res = await pool.query("SELECT * FROM agents ORDER BY created_at ASC");
        const userRes = await pool.query("SELECT id, name, role FROM users");
        const humanRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'human'");
        let humanUsers = [];
        if (humanRes.rowCount > 0) {
          const hr = await pool.query("SELECT id, name, role FROM human");
          humanUsers = hr.rows;
        }
        const agents = res.rows.map(r => ({
          id: r.id,
          name: r.name,
          emoji: r.emoji,
          type: r.type,
          role: r.role,
          status: r.status,
          currentActivity: r.current_activity,
          lastSeen: r.last_seen,
          tasksCompleted: r.tasks_completed,
          accuracy: Number(r.accuracy),
          skills: r.skills,
          accentColor: r.accent_color,
          uptime: Number(r.uptime),
          responseTime: r.response_time,
          model: r.model
        }));
        const allHumans = [...userRes.rows, ...humanUsers].map(u => ({
          id: u.id,
          name: u.name,
          emoji: '👤',
          type: 'Human',
          role: u.role,
          status: 'active',
          currentActivity: 'Viewing',
          lastSeen: new Date().toISOString(),
          tasksCompleted: 0,
          accuracy: 100,
          skills: [],
          accentColor: '#10b981',
          uptime: 100,
          responseTime: '0ms',
          model: 'human'
        }));
        return { status: 200, body: { agents: [...allHumans, ...agents] } };
      } catch (e: any) {
        return { status: 500, body: { error: "db_error", message: e.message } };
      }
    }

    if (req.method === "POST") {
      try {
        const id = body.id || `agent-${Date.now()}`;
        await pool.query(
          `INSERT INTO agents (id, name, emoji, type, role, status, current_activity, skills, accent_color, model)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            emoji = EXCLUDED.emoji,
            status = EXCLUDED.status,
            current_activity = EXCLUDED.current_activity,
            last_seen = now()`,
          [
            id, body.name, body.emoji || '🤖', body.type || 'Agent', body.role || 'Task',
            body.status || 'idle', body.currentActivity || 'Awaiting tasks', JSON.stringify(body.skills || []),
            body.accentColor || '#0ea5e9', body.model || 'default'
          ]
        );
        return { status: 200, body: { success: true, id } };
      } catch (e: any) {
        return { status: 500, body: { error: "db_error", message: e.message } };
      }
    }
  }

  return { status: 404, body: { error: "not_found", message: "Not found" } };
}
