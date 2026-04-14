import fs from "node:fs";
import pg from "pg";

let pool: pg.Pool | null = null;

function buildSsl():
  | boolean
  | { rejectUnauthorized: boolean; ca?: string }
  | undefined {
  if (process.env.DATABASE_SSL === "disable") {
    return undefined;
  }
  const caPath = process.env.PGSSLROOTCERT;
  if (caPath) {
    const ca = fs.readFileSync(caPath, "utf8");
    return { rejectUnauthorized: true, ca };
  }
  if (process.env.DATABASE_SSL === "true") {
    return { rejectUnauthorized: true };
  }
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("sslmode=require") || url.includes("sslmode=verify-full") || url.includes("sslmode=verify-ca")) {
    return { rejectUnauthorized: true };
  }
  return undefined;
}

/** Singleton pool for the AI tasks API (Vite dev / preview server process). */
export function getPool(): pg.Pool {
  if (pool) {
    return pool;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env, run `docker compose up -d`, then `npm run db:migrate`.",
    );
  }
  pool = new pg.Pool({
    connectionString,
    max: Number(process.env.PGPOOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    ssl: buildSsl(),
  });
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
