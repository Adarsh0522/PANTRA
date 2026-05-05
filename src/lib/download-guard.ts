// ─── Download Guard ──────────────────────────────────────────────────────────
// Server-side utility that checks if a user can download a PDF.
// Called BEFORE any PDF generation to enforce plan limits.
// Model: Simple lifetime download credits — no expiry, no daily/monthly limits.

import { db } from "@/db";
import { download_logs, subscriptions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { getPlan, type PlanKey } from "@/lib/plans-db";

export interface DownloadCheckResult {
  allowed: boolean;
  reason?: "plan_limit";
  requiresPayment?: {
    amount: number;
    type: "per_form";
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
 * No expiry checks — all plans are lifetime credit-based.
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
      download_limit: 5,
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

  return sub || null;
}

/**
 * Main guard: can this user download right now?
 * Simple credit check: downloads_used < download_limit
 */
export async function canUserDownload(userId: string): Promise<DownloadCheckResult> {
  const sub = await getActiveSubscription(userId);

  const downloadsUsed = sub?.downloads_used ?? 0;
  const downloadLimit = sub?.download_limit ?? 5;

  // Credits remaining — allow download
  if (downloadsUsed < downloadLimit) {
    return { allowed: true, watermark: false };
  }

  // Credits exhausted — requires payment or watermark download
  return {
    allowed: false,
    reason: "plan_limit",
    requiresPayment: { amount: 10, type: "per_form" },
    watermark: true,
  };
}

/**
 * Record a download in the log + increment downloads_used counter.
 */
export async function recordDownload(userId: string, panFormId?: string, _forcedWatermark = false) {
  const id = crypto.randomUUID();

  await db.insert(download_logs).values({
    id,
    user_id: userId,
    pan_form_id: panFormId || null,
    downloaded_at: new Date(),
  });

  const sub = await getActiveSubscription(userId);
  if (!sub) return;

  // Simply increment downloads_used by 1
  await db.update(subscriptions)
    .set({
      downloads_used: (sub.downloads_used || 0) + 1,
      last_usage_date: new Date(),
    })
    .where(eq(subscriptions.id, sub.id));
}
