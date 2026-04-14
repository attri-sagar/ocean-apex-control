/**
 * Run SQL migrations from db/migrations/*.sql in lexicographic order.
 * Usage: npm run db:migrate
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required for migrations.");
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: buildSsl(),
  });

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const migrationsDir = path.resolve(__dirname, "../../db/migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const version = file;
      const { rowCount } = await client.query("SELECT 1 FROM schema_migrations WHERE version = $1", [version]);
      if (rowCount && rowCount > 0) {
        console.log(`Skip ${version} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      console.log(`Apply ${version}...`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    }
    console.log("Migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
