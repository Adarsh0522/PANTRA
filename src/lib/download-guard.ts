// ─── Download Guard ──────────────────────────────────────────────────────────
// Server-side utility that checks if a user can download a PDF.
// Called BEFORE any PDF generation to enforce plan limits.

import { db } from "@/db";
import { download_logs, subscriptions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { PLANS, type PlanKey } from "@/lib/plans";

export interface DownloadCheckResult {
  allowed: boolean;
  reason?: "daily_limit" | "plan_limit";
  requiresPayment?: {
    amount: number;
    type: "per_form" | "extra_form";
  };
  watermark: boolean;
}

/**
 * Get today's download count for a user (UTC-based day boundary).
 */
export async function getTodayDownloadCount(userId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const logs = await db
    .select()
    .from(download_logs)
    .where(
      and(
        eq(download_logs.user_id, userId),
        gte(download_logs.downloaded_at, todayStart)
      )
    );

  return logs.length;
}

/**
 * Get user's active subscription. Auto-creates a free plan row if none exists.
 * This is the SINGLE SOURCE OF TRUTH for subscription state.
 */
async function getActiveSubscription(userId: string) {
  let sub = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.user_id, userId),
      eq(subscriptions.is_active, true)
    ),
  });

  // Auto-create free plan subscription if none exists
  if (!sub) {
    const id = crypto.randomUUID();
    const now = new Date();
    await db.insert(subscriptions).values({
      id,
      user_id: userId,
      plan_type: 'free',
      is_active: true,
      downloads_used: 0,
      download_limit: 2,
      free_downloads_today: 0,
      watermark_downloads_today: 0,
      last_usage_date: now,
      start_date: now,
      end_date: null,
    });

    sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id),
    });
  }

  if (!sub) return null;

  // Check expiry (for paid plans)
  if (sub.end_date && sub.end_date < new Date()) {
    return null;
  }

  return sub;
}

/**
 * Reset daily counters if it's a new day (UTC).
 */
async function syncUsageDate(sub: any) {
  const lastDate = sub.last_usage_date ? new Date(sub.last_usage_date) : null;
  const now = new Date();

  const isDifferentDay = !lastDate || 
    lastDate.getUTCDate() !== now.getUTCDate() || 
    lastDate.getUTCMonth() !== now.getUTCMonth() || 
    lastDate.getUTCFullYear() !== now.getUTCFullYear();

  if (isDifferentDay) {
    await db
      .update(subscriptions)
      .set({
        free_downloads_today: 0,
        watermark_downloads_today: 0,
        last_usage_date: now,
      })
      .where(eq(subscriptions.id, sub.id));
    
    // Refresh sub object for logic
    sub.free_downloads_today = 0;
    sub.watermark_downloads_today = 0;
  }
}

/**
 * Main guard: can this user download right now?
 */
export async function canUserDownload(userId: string): Promise<DownloadCheckResult> {
  const sub = await getActiveSubscription(userId);
  const planKey: PlanKey = (sub?.plan_type as PlanKey) || "free";
  const plan = PLANS[planKey] || PLANS.free;

  if (sub) await syncUsageDate(sub);

  // ── Free Plan: 2 clean / day + 5 watermark / day ──
  if (planKey === "free") {
    const cleanUsed = sub?.free_downloads_today ?? 0;
    const watermarkUsed = sub?.watermark_downloads_today ?? 0;

    // Phase 1: Clean downloads (upto 2)
    if (cleanUsed < plan.dailyLimit) {
      return { allowed: true, watermark: false };
    }

    // Phase 2: Watermark downloads (upto 5)
    if (watermarkUsed < plan.watermarkLimit) {
      return {
        allowed: false, // Return false to trigger the 3-button modal
        reason: "daily_limit",
        requiresPayment: { amount: 10, type: "per_form" },
        watermark: true,
      };
    }

    // Phase 3: Blocked completely
    return {
      allowed: false,
      reason: "plan_limit", // This will show "Daily limit reached"
      requiresPayment: { amount: 10, type: "per_form" },
      watermark: true,
    };
  }

  // ── Yearly / Unlimited ──
  if (planKey === "yearly") {
    return { allowed: true, watermark: false };
  }

  // ── Monthly / Quarterly: check usage against limit ──
  if (planKey === "monthly" || planKey === "quarterly") {
    const used = sub?.downloads_used ?? 0;
    const limit = sub?.download_limit ?? plan.limit;

    if (used >= limit) {
      return {
        allowed: false,
        reason: "plan_limit",
        requiresPayment: { amount: plan.extraPerForm || 10, type: "extra_form" },
        watermark: false,
      };
    }

    return { allowed: true, watermark: false };
  }

  return { allowed: true, watermark: false };
}

/**
 * Record a download in the log + increment correct user counters.
 */
export async function recordDownload(userId: string, panFormId?: string, forcedWatermark = false) {
  const id = crypto.randomUUID();

  await db.insert(download_logs).values({
    id,
    user_id: userId,
    pan_form_id: panFormId || null,
    downloaded_at: new Date(),
  });

  const sub = await getActiveSubscription(userId);
  if (!sub) return;

  const planKey = (sub.plan_type as PlanKey) || "free";
  const updateData: any = {
    downloads_used: (sub.downloads_used || 0) + 1,
    last_usage_date: new Date(),
  };

  if (planKey === "free") {
    const cleanUsed = sub.free_downloads_today || 0;
    
    // If not watermark mode and we have clean quota left
    if (!forcedWatermark && cleanUsed < (PLANS.free.dailyLimit || 2)) {
      updateData.free_downloads_today = cleanUsed + 1;
    } else {
      updateData.watermark_downloads_today = (sub.watermark_downloads_today || 0) + 1;
    }
  }

  await db.update(subscriptions).set(updateData).where(eq(subscriptions.id, sub.id));
}
