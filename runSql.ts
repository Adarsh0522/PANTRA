import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.DATABASE_URL as string);
  const db = drizzle(sql);

  console.log("Truncating legacy users data to accept new unique email constraints...");
  await sql`TRUNCATE TABLE users CASCADE;`;
  console.log("Truncated.");
}

main().catch(console.error);
