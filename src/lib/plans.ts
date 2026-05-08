// ─── PANTRA Plan Configuration ───────────────────────────────────────────────
// Single source of truth for all plan details.
// ⚠️ This file is imported by BOTH client and server components.
// DO NOT add any database imports here.
// For DB functions (getPlans, getPlan), use '@/lib/plans-db' (server-only).

export type PlanKey = "free" | "per_form" | "starter" | "growth" | "pro";

export interface PlanConfig {
  key: PlanKey;
  name: string;
  price: number;           // in ₹
  downloadLimit: number;   // total lifetime downloads allowed
  extraPerForm: number;    // ₹ cost per extra form after limit
  badge: string | null;    // "Most Popular", "Best Value", etc.
  cta: string;             // CTA button label
  description: string;
  perFormValue?: string;   // e.g. "~₹8.5/form" for display
  toolsValidityDays: number; // 0 means no tools, X means X days from start_date
  features: string[];
}

// ─── Referral reward tiers (downloads credited to referrer) ─────────────────
export const REFERRAL_REWARDS: Record<string, number> = {
  per_form: 1,
  starter: 10,
  growth: 20,
  pro: 40,
};

// Max referral downloads a user can earn per month
export const MAX_REFERRAL_DOWNLOADS_PER_MONTH = 200;

export const INITIAL_PLANS: Record<PlanKey, PlanConfig> = {
  free: {
    key: "free",
    name: "Free Plan",
    price: 0,
    downloadLimit: 5,
    extraPerForm: 10,
    badge: null,
    cta: "Start Free",
    description: "Start for free",
    toolsValidityDays: 0,
    features: [
      "5 PAN Downloads (Lifetime)",
      "1 Free Trial per Document Tool",
      "₹10 per extra form",
      "Basic support",
    ],
  },
  per_form: {
    key: "per_form",
    name: "Pay Per Form",
    price: 10,
    downloadLimit: 1,
    extraPerForm: 10,
    badge: null,
    cta: "Pay & Download",
    description: "No subscription needed",
    toolsValidityDays: 0,
    features: [
      "₹10 per form",
      "No watermark",
      "Instant download",
      "No subscription needed",
    ],
  },
  starter: {
    key: "starter",
    name: "Starter Plan",
    price: 299,
    downloadLimit: 35,
    extraPerForm: 10,
    badge: null,
    cta: "Get Started",
    description: "Perfect for occasional CSC usage",
    perFormValue: "~₹8.5/form",
    toolsValidityDays: 30,
    features: [
      "35 PAN Downloads (Lifetime)",
      "30 Days Unlimited Document Tools",
      "~₹8.5 per form",
      "No watermark",
    ],
  },
  growth: {
    key: "growth",
    name: "Growth Plan",
    price: 499,
    downloadLimit: 80,
    extraPerForm: 10,
    badge: "Most Popular",
    cta: "Upgrade Now",
    description: "Best for regular CSC operators",
    perFormValue: "~₹6.25/form",
    toolsValidityDays: 90,
    features: [
      "80 PAN Downloads (Lifetime)",
      "90 Days Unlimited Document Tools",
      "~₹6.25 per form",
      "No watermark",
    ],
  },
  pro: {
    key: "pro",
    name: "Pro Plan",
    price: 999,
    downloadLimit: 150,
    extraPerForm: 10,
    badge: "Best Value",
    cta: "Upgrade Now",
    description: "For high-volume centers",
    perFormValue: "~₹6.6/form",
    toolsValidityDays: 365,
    features: [
      "150 PAN Downloads (Lifetime)",
      "365 Days Unlimited Document Tools",
      "~₹6.6 per form",
      "Priority support",
    ],
  },
} as const;

// Helper: ordered list for UI rendering (excludes per_form — shown separately)
export const PLAN_ORDER: PlanKey[] = ["free", "starter", "growth", "pro"];
