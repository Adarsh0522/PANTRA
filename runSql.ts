import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  console.log("Adding subtitle column to app_plans...");
  try {
    await pool.query(`ALTER TABLE "app_plans" ADD COLUMN IF NOT EXISTS "subtitle" text;`);
    console.log("Added subtitle.");
  } catch(err) {
    console.error("Error adding column:", err);
  }
  await pool.end();
}

main().catch(console.error);
