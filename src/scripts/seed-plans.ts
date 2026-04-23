// Run: npx tsx src/scripts/seed-plans.ts
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Creating app_plans table if not exists...");

  await sql`
    CREATE TABLE IF NOT EXISTS app_plans (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      ui_price INTEGER,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      total_limit INTEGER NOT NULL,
      monthly_limit INTEGER,
      daily_limit INTEGER NOT NULL DEFAULT 0,
      watermark_limit INTEGER NOT NULL DEFAULT 0,
      watermark BOOLEAN NOT NULL DEFAULT false,
      extra_per_form INTEGER NOT NULL DEFAULT 0,
      badge TEXT,
      cta TEXT NOT NULL,
      features JSONB NOT NULL,
      sort_order INTEGER NOT NULL
    )
  `;

  console.log("Seeding plans...");

  const plans = [
    {
      key: "free",
      name: "Free Plan",
      price: 0,
      ui_price: null,
      period: "forever",
      description: "Best for getting started",
      total_limit: 999999,
      monthly_limit: 10,
      daily_limit: 2,
      watermark_limit: 5,
      watermark: true,
      extra_per_form: 10,
      badge: null,
      cta: "Start Free",
      features: JSON.stringify(["2 downloads per day", "₹10 per extra clean form", "Basic support"]),
      sort_order: 1,
    },
    {
      key: "per_form",
      name: "Pay Per Form",
      price: 10,
      ui_price: null,
      period: "per form",
      description: "No subscription needed",
      total_limit: 999999,
      monthly_limit: null,
      daily_limit: 0,
      watermark_limit: 0,
      watermark: false,
      extra_per_form: 10,
      badge: null,
      cta: "Pay & Download",
      features: JSON.stringify(["₹10 per form", "No watermark", "Instant download", "No subscription needed"]),
      sort_order: 2,
    },
    {
      key: "monthly",
      name: "Monthly Plan",
      price: 1,
      ui_price: 999,
      period: "month",
      description: "Perfect for daily PAN operators",
      total_limit: 150,
      monthly_limit: 150,
      daily_limit: 0,
      watermark_limit: 0,
      watermark: false,
      extra_per_form: 8,
      badge: "Most Popular",
      cta: "Upgrade Now",
      features: JSON.stringify(["150 downloads included", "No daily limits", "No watermark PDFs", "₹8 per extra form"]),
      sort_order: 3,
    },
    {
      key: "quarterly",
      name: "3 Month Plan",
      price: 2399,
      ui_price: null,
      period: "3 months",
      description: "Save more with higher usage",
      total_limit: 600,
      monthly_limit: null,
      daily_limit: 0,
      watermark_limit: 0,
      watermark: false,
      extra_per_form: 0,
      badge: "Best Value",
      cta: "Upgrade Now",
      features: JSON.stringify(["600 total downloads", "No monthly limits", "No watermark PDFs", "Priority support"]),
      sort_order: 4,
    },
    {
      key: "yearly",
      name: "Yearly Plan",
      price: 5999,
      ui_price: null,
      period: "year",
      description: "For high-volume professionals",
      total_limit: 999999,
      monthly_limit: null,
      daily_limit: 0,
      watermark_limit: 0,
      watermark: false,
      extra_per_form: 0,
      badge: "Premium",
      cta: "Upgrade Now",
      features: JSON.stringify(["Unlimited downloads", "No watermark PDFs", "Fair usage policy", "Priority support"]),
      sort_order: 5,
    },
  ];

  for (const plan of plans) {
    await sql`
      INSERT INTO app_plans (key, name, price, ui_price, period, description, total_limit, monthly_limit, daily_limit, watermark_limit, watermark, extra_per_form, badge, cta, features, sort_order)
      VALUES (
        ${plan.key}, ${plan.name}, ${plan.price}, ${plan.ui_price},
        ${plan.period}, ${plan.description}, ${plan.total_limit}, ${plan.monthly_limit},
        ${plan.daily_limit}, ${plan.watermark_limit}, ${plan.watermark}, ${plan.extra_per_form},
        ${plan.badge}, ${plan.cta}, ${plan.features}::jsonb, ${plan.sort_order}
      )
      ON CONFLICT (key) DO NOTHING
    `;
    console.log(`  ✓ ${plan.key}`);
  }

  console.log("Done! app_plans seeded successfully.");
}

main().catch(console.error);
