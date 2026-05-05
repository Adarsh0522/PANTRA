// Static fallback rendering of pricing using INITIAL_PLANS
// Used when DB is unavailable (e.g., local dev with no DB connection)
import { PLAN_ORDER, INITIAL_PLANS } from "@/lib/plans";
import PricingCards from "./PricingCards";

export default function PricingFallback() {
  const plans = PLAN_ORDER.map(key => INITIAL_PLANS[key]);
  return <PricingCards plans={plans} />;
}
