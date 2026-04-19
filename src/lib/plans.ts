// ─── PANTRA Plan Configuration ───────────────────────────────────────────────
// Single source of truth for all plan details.
// Used by: pricing UI, download-guard, payment API, auth mock.

export type PlanKey = "free" | "per_form" | "monthly" | "quarterly" | "yearly";

export interface PlanConfig {
  key: PlanKey;
  name: string;
  uiPrice?: number;        // if different from DB price (for testing)
  price: number;           // in ₹
  period: string;
  description: string;
  limit: number;           // total downloads allowed (Infinity = unlimited)
  dailyLimit: number;      // per-day clean downloads (0 = no daily cap)
  watermarkLimit: number;  // per-day watermarked downloads
  watermark: boolean;
  extraPerForm: number;    // ₹ cost per extra form after limit (0 = not applicable)
  badge: string | null;    // "Most Popular", "Best Value", etc.
  cta: string;             // CTA button label
  features: string[];
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  free: {
    key: "free",
    name: "Free Plan",
    price: 0,
    period: "forever",
    description: "Best for getting started",
    limit: Infinity,
    dailyLimit: 2,
    watermarkLimit: 5,
    watermark: true,
    extraPerForm: 10,
    badge: null,
    cta: "Start Free",
    features: [
      "2 downloads per day",
      "₹10 per extra clean form",
      "Basic support",
    ],
  },
  per_form: {
    key: "per_form",
    name: "Pay Per Form",
    price: 10,
    period: "per form",
    description: "No subscription needed",
    limit: Infinity,
    dailyLimit: 0,
    watermarkLimit: 0,
    watermark: false,
    extraPerForm: 10,
    badge: null,
    cta: "Pay & Download",
    features: [
      "₹10 per form",
      "No watermark",
      "Instant download",
      "No subscription needed",
    ],
  },
  monthly: {
    key: "monthly",
    name: "Monthly Plan",
    price: 1,           // DEBUG: ₹1 for testing
    uiPrice: 999,       // REAL UX PRICE
    period: "month",
    description: "Perfect for daily PAN operators",
    limit: 150,
    dailyLimit: 0,
    watermarkLimit: 0,
    watermark: false,
    extraPerForm: 8,
    badge: "Most Popular",
    cta: "Upgrade Now",
    features: [
      "150 downloads included",
      "No daily limits",
      "No watermark PDFs",
      "₹8 per extra form",
    ],
  },
  quarterly: {
    key: "quarterly",
    name: "3 Month Plan",
    price: 2399,
    period: "3 months",
    description: "Save more with higher usage",
    limit: 600,
    dailyLimit: 0,
    watermarkLimit: 0,
    watermark: false,
    extraPerForm: 0,
    badge: "Best Value",
    cta: "Upgrade Now",
    features: [
      "600 total downloads",
      "No monthly limits",
      "No watermark PDFs",
      "Priority support",
    ],
  },
  yearly: {
    key: "yearly",
    name: "Yearly Plan",
    price: 5999,
    period: "year",
    description: "For high-volume professionals",
    limit: Infinity,
    dailyLimit: 0,
    watermarkLimit: 0,
    watermark: false,
    extraPerForm: 0,
    badge: "Premium",
    cta: "Upgrade Now",
    features: [
      "Unlimited downloads",
      "No watermark PDFs",
      "Fair usage policy",
      "Priority support",
    ],
  },
} as const;

// Helper: ordered list for UI rendering
export const PLAN_ORDER: PlanKey[] = ["free", "per_form", "monthly", "quarterly", "yearly"];

// Amount lookup — NEVER trust frontend; always derive from this.
export function getPlanAmount(plan: PlanKey): number {
  return PLANS[plan].price;
}
