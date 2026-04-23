import PricingClient from "./PricingClient";
import { getCurrentUser } from "@/lib/auth";
import { getPlans } from "@/lib/plans";

export const metadata = {
  title: "Pricing | PANTRA",
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const activePlanKey = user?.subscription?.plan_type || "free";
  const plans = await getPlans();

  return <PricingClient activePlanKey={activePlanKey} plans={plans} />;
}
