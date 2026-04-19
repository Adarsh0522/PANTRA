const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { migrate } = require('drizzle-orm/neon-http/migrator');
require('dotenv').config({ path: '.env.local' });

async function runMigrate() {
  console.log("Connecting to Neon...");
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  console.log("Migrating...");
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log("Migration successful!");
}

runMigrate().catch(console.error);
