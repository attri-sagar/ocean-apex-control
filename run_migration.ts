import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function run() {
  try {
    const sql = fs.readFileSync('db/migrations/004_task_activity.sql', 'utf8');
    await pool.query(sql);
    console.log("Migration 004 applied.");
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
