// Run: npx tsx src/scripts/migrate-pricing.ts
// One-time migration script for pricing restructuring
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("🚀 Starting pricing migration...\n");

  // ─── Step 1: Deactivate old plans ──────────────────────────────────────────
  console.log("Step 1: Deactivating old plans (monthly_lite, monthly, quarterly, yearly)...");
  const deactivated = await sql`
    UPDATE app_plans 
    SET sort_order = -1 
    WHERE key IN ('monthly_lite', 'monthly', 'quarterly', 'yearly')
    RETURNING key
  `;
  console.log(`  ✓ Deactivated ${deactivated.length} old plans: ${deactivated.map(r => r.key).join(', ') || 'none found'}\n`);

  // ─── Step 2: Upsert new plans ─────────────────────────────────────────────
  console.log("Step 2: Upserting new plans...");

  const plans = [
    {
      key: "free",
      name: "Free Plan",
      price: 0,
      period: "lifetime",
      description: "Start for free",
      total_limit: 5,
      extra_per_form: 10,
      badge: null,
      cta: "Start Free",
      features: JSON.stringify(["5 downloads lifetime", "No expiry", "₹10 per extra form", "Basic support"]),
      sort_order: 1,
    },
    {
      key: "per_form",
      name: "Pay Per Form",
      price: 10,
      period: "per form",
      description: "No subscription needed",
      total_limit: 1,
      extra_per_form: 10,
      badge: null,
      cta: "Pay & Download",
      features: JSON.stringify(["₹10 per form", "No watermark", "Instant download", "No subscription needed"]),
      sort_order: 2,
    },
    {
      key: "starter",
      name: "Starter Plan",
      price: 299,
      period: "lifetime",
      description: "Perfect for occasional CSC usage",
      total_limit: 35,
      extra_per_form: 10,
      badge: null,
      cta: "Get Started",
      features: JSON.stringify(["35 downloads", "No expiry", "~₹8.5 per form", "No watermark"]),
      sort_order: 3,
    },
    {
      key: "growth",
      name: "Growth Plan",
      price: 499,
      period: "lifetime",
      description: "Best for regular CSC operators",
      total_limit: 80,
      extra_per_form: 10,
      badge: "Most Popular",
      cta: "Upgrade Now",
      features: JSON.stringify(["80 downloads", "No expiry", "~₹6.25 per form", "No watermark"]),
      sort_order: 4,
    },
    {
      key: "pro",
      name: "Pro Plan",
      price: 999,
      period: "lifetime",
      description: "For high-volume centers",
      total_limit: 150,
      extra_per_form: 10,
      badge: "Best Value",
      cta: "Upgrade Now",
      features: JSON.stringify(["150 downloads", "No expiry", "~₹6.6 per form", "Priority support"]),
      sort_order: 5,
    },
  ];

  for (const plan of plans) {
    await sql`
      INSERT INTO app_plans (key, name, price, ui_price, period, description, total_limit, monthly_limit, daily_limit, watermark_limit, watermark, extra_per_form, badge, cta, features, sort_order)
      VALUES (
        ${plan.key}, ${plan.name}, ${plan.price}, ${null},
        ${plan.period}, ${plan.description}, ${plan.total_limit}, ${null},
        ${0}, ${0}, ${false}, ${plan.extra_per_form},
        ${plan.badge}, ${plan.cta}, ${plan.features}::jsonb, ${plan.sort_order}
      )
      ON CONFLICT (key) DO UPDATE SET
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
    `;
    console.log(`  ✓ ${plan.key} (₹${plan.price}, ${plan.total_limit} downloads)`);
  }

  // ─── Step 3: Verify plans ─────────────────────────────────────────────────
  console.log("\nStep 2b: Verifying app_plans table...");
  const allPlans = await sql`SELECT key, name, price, total_limit, sort_order FROM app_plans ORDER BY sort_order`;
  console.table(allPlans);

  // ─── Step 4: Migrate all users to Free plan ────────────────────────────────
  console.log("\nStep 3: Migrating all existing users to Free plan...");
  
  // First, show current state
  const beforeCount = await sql`SELECT COUNT(*) as total, plan_type FROM subscriptions GROUP BY plan_type`;
  console.log("  Before migration:");
  console.table(beforeCount);

  const migrated = await sql`
    UPDATE subscriptions SET
      plan_type = 'free',
      download_limit = 5,
      downloads_used = LEAST(downloads_used, 5),
      is_active = true,
      end_date = NULL,
      free_downloads_today = 0,
      watermark_downloads_today = 0
    RETURNING id
  `;
  console.log(`\n  ✓ Migrated ${migrated.length} subscriptions to Free plan`);

  // Verify after migration
  const afterCount = await sql`SELECT COUNT(*) as total, plan_type FROM subscriptions GROUP BY plan_type`;
  console.log("  After migration:");
  console.table(afterCount);

  console.log("\n✅ Pricing migration complete!");
  console.log("   - Old plans deactivated");
  console.log("   - New plans inserted (Free, Starter, Growth, Pro)");
  console.log("   - All users moved to Free plan (5 lifetime downloads)");
  console.log("   - Usage preserved where < 5, capped at 5 otherwise");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
