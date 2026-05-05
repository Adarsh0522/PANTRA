import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { INITIAL_PLANS, PLAN_ORDER, PlanKey } from "../src/lib/plans";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Connected to DB via pg, running create table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "app_plans" (
        "key" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "price" integer NOT NULL,
        "ui_price" integer,
        "period" text NOT NULL,
        "description" text NOT NULL,
        "total_limit" integer NOT NULL,
        "monthly_limit" integer,
        "daily_limit" integer NOT NULL,
        "watermark_limit" integer NOT NULL,
        "watermark" boolean NOT NULL,
        "extra_per_form" integer NOT NULL,
        "badge" text,
        "cta" text NOT NULL,
        "features" jsonb NOT NULL,
        "sort_order" integer NOT NULL
      );
    `);
    console.log("Table created.");

    // Deactivate old plans
    await client.query(`UPDATE app_plans SET sort_order = -1 WHERE key IN ('monthly_lite', 'monthly', 'quarterly', 'yearly')`);
    console.log("Old plans deactivated.");

    const planKeys: PlanKey[] = PLAN_ORDER;
    
    for (let i = 0; i < planKeys.length; i++) {
      const key = planKeys[i];
      const plan = INITIAL_PLANS[key];
      
      await client.query(`
        INSERT INTO "app_plans" (
          "key", name, price, ui_price, period, description, total_limit, monthly_limit, 
          daily_limit, watermark_limit, watermark, extra_per_form, badge, cta, features, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) ON CONFLICT ("key") DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          ui_price = EXCLUDED.ui_price,
          period = EXCLUDED.period,
          description = EXCLUDED.description,
          total_limit = EXCLUDED.total_limit,
          monthly_limit = EXCLUDED.monthly_limit,
          daily_limit = EXCLUDED.daily_limit,
          watermark_limit = EXCLUDED.watermark_limit,
          watermark = EXCLUDED.watermark,
          extra_per_form = EXCLUDED.extra_per_form,
          badge = EXCLUDED.badge,
          cta = EXCLUDED.cta,
          features = EXCLUDED.features,
          sort_order = EXCLUDED.sort_order
      `, [
        plan.key, plan.name, plan.price, null, "lifetime", plan.description,
        plan.downloadLimit, null, 0, 0, false, plan.extraPerForm,
        plan.badge || null, plan.cta, JSON.stringify(plan.features), i + 1
      ]);
    }
    console.log("Plans seeded successfully with new pricing model.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
