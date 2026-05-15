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
  subtitle?: string;       // e.g. "~₹8.5/form" or "~₹83 per Month"
  period: string;          // e.g. "lifetime", "monthly", "3 Months", "year"
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
    period: "lifetime",
    toolsValidityDays: 7,
    features: [
      "5 PAN Downloads (Lifetime)",
      "7 Days Free Trial per Document Tool",
      "₹10 per extra form",
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
    period: "lifetime",
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
    downloadLimit: 999999, // Unlimited
    extraPerForm: 10,
    badge: null,
    cta: "Get Started",
    description: "Perfect for occasional CSC usage",
    subtitle: "~₹9.96 per Day",
    period: "monthly",
    toolsValidityDays: 30,
    features: [
      "Unlimited PAN Downloads",
      "Unlimited Document Tools",
      "Basic support",
    ],
  },
  growth: {
    key: "growth",
    name: "Growth Plan",
    price: 499,
    downloadLimit: 999999, // Unlimited
    extraPerForm: 10,
    badge: "Most Popular",
    cta: "Upgrade Now",
    description: "Best for regular CSC operators",
    subtitle: "~₹166 per Month",
    period: "3 Months",
    toolsValidityDays: 90,
    features: [
      "Unlimited PAN Downloads",
      "Unlimited Document Tools",
      "~₹5.54 per Day",
      "priority support",
    ],
  },
  pro: {
    key: "pro",
    name: "Pro Plan",
    price: 999,
    downloadLimit: 999999, // Unlimited
    extraPerForm: 10,
    badge: "Best Value",
    cta: "Upgrade Now",
    description: "For high-volume centers",
    subtitle: "~₹83 per Month",
    period: "year",
    toolsValidityDays: 365,
    features: [
      "Unlimited PAN Downloads",
      "Unlimited Document Tools",
      "~₹2.74 per Day",
      "Priority support",
    ],
  },
} as const;

// Helper: ordered list for UI rendering (excludes per_form — shown separately)
export const PLAN_ORDER: PlanKey[] = ["free", "starter", "growth", "pro"];
