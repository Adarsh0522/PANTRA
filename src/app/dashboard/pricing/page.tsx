import PricingClient from "./PricingClient";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Pricing | PANTRA",
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const activePlanKey = user?.subscription?.plan_type || "free";

  return <PricingClient activePlanKey={activePlanKey} />;
}
