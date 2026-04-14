/**
 * Smoke test: Postgres reachable, migrations applied, core tables exist.
 * Requires .env with DATABASE_URL (see .env.example) and Docker Postgres: docker compose up -d
 */
import "dotenv/config";
import { getPool, closePool } from "../server/db/pool.ts";

async function main() {
  let pool;
  try {
    pool = getPool();
  } catch (e) {
    console.error("FAIL: Could not create DB pool.");
    console.error("Set DATABASE_URL in .env (copy from .env.example) and run: docker compose up -d");
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const one = await pool.query("SELECT 1 AS ok");
  if (one.rows[0]?.ok !== 1) {
    console.error("FAIL: SELECT 1");
    process.exit(1);
  }
  console.log("OK: SELECT 1");

  const mig = await pool.query(
    "SELECT COUNT(*)::int AS n FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2",
    ["public", "schema_migrations"],
  );
  if ((mig.rows[0] as { n: number }).n !== 1) {
    console.error("FAIL: schema_migrations missing — run npm run db:migrate");
    await closePool();
    process.exit(1);
  }
  console.log("OK: schema_migrations exists");

  const required = ["tasks", "subtasks", "assignees", "questions", "task_agent_meta", "hunt_reports"];
  const tabs = await pool.query<{ t: string }>(
    `SELECT table_name AS t FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
    [required],
  );
  const have = new Set(tabs.rows.map((r) => r.t));
  const missing = required.filter((t) => !have.has(t));
  if (missing.length > 0) {
    console.error("FAIL: Missing tables:", missing.join(", "));
    await closePool();
    process.exit(1);
  }
  console.log("OK: Core tables present:", required.join(", "));

  await closePool();
  console.log("Smoke DB: all checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
