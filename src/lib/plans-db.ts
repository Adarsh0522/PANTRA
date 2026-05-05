// ─── Server-only Plan DB Functions ───────────────────────────────────────────
// ⚠️ This file imports the database — ONLY use in server components & API routes.
// For types/constants, import from '@/lib/plans' instead.

import { db } from "@/db";
import { app_plans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { INITIAL_PLANS, PLAN_ORDER, type PlanKey, type PlanConfig } from "@/lib/plans";

// Re-export everything from plans.ts for convenience in server files
export { INITIAL_PLANS, PLAN_ORDER, REFERRAL_REWARDS, MAX_REFERRAL_DOWNLOADS_PER_MONTH } from "@/lib/plans";
export type { PlanKey, PlanConfig } from "@/lib/plans";

// Fetch all plans from the database
export async function getPlans(): Promise<PlanConfig[]> {
  const fallback = PLAN_ORDER.map(key => INITIAL_PLANS[key]);

  const timeout = new Promise<PlanConfig[]>((resolve) =>
    setTimeout(() => resolve(fallback), 3000)
  );

  const dbFetch = (async () => {
    try {
      const records = await db.select().from(app_plans).orderBy(app_plans.sort_order);
      if (!records || records.length === 0) return fallback;

      // Filter only active plans (sort_order > 0) and map to PlanConfig
      return records
        .filter(r => r.sort_order > 0)
        .map(record => ({
          key: record.key as PlanKey,
          name: record.name,
          price: record.price,
          downloadLimit: record.total_limit,
          extraPerForm: record.extra_per_form,
          badge: record.badge,
          cta: record.cta,
          description: record.description,
          features: record.features as string[],
        }));
    } catch {
      return fallback;
    }
  })();

  return Promise.race([dbFetch, timeout]);
}

export async function getPlan(key: PlanKey): Promise<PlanConfig> {
  try {
    const record = await db.query.app_plans.findFirst({
      where: eq(app_plans.key, key),
    });

    if (record) {
      return {
        key: record.key as PlanKey,
        name: record.name,
        price: record.price,
        downloadLimit: record.total_limit,
        extraPerForm: record.extra_per_form,
        badge: record.badge,
        cta: record.cta,
        description: record.description,
        features: record.features as string[],
      };
    }
  } catch (error) {
    console.error(`Failed to fetch plan ${key} from DB, falling back to INITIAL_PLANS:`, error);
  }

  return INITIAL_PLANS[key];
}

// Amount lookup — NEVER trust frontend; always derive from this.
export async function getPlanAmount(plan: PlanKey): Promise<number> {
  const p = await getPlan(plan);
  return p.price;
}
