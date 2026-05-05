import { getPlans, INITIAL_PLANS, PLAN_ORDER } from "@/lib/plans-db";
import PricingCards from "./PricingCards";

export default async function Pricing() {
  let plans;
  try {
    plans = await getPlans();
  } catch {
    plans = PLAN_ORDER.map(key => INITIAL_PLANS[key]);
  }
  return <PricingCards plans={plans} />;
}
