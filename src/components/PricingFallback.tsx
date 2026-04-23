// Static fallback rendering of pricing using INITIAL_PLANS
// Used when DB is unavailable (e.g., local dev with no DB connection)
import { Check } from "lucide-react";
import Link from "next/link";
import { INITIAL_PLANS, PLAN_ORDER } from "@/lib/plans";

export default function PricingFallback() {
  const plans = PLAN_ORDER.filter(k => k !== "per_form").map(key => INITIAL_PLANS[key]);

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-[#F8FAFC] border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] mb-4 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-slate-600 max-w-xl mx-auto font-medium">Choose the plan that fits your workload. No hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {plans.map(plan => {
            const isPopular = plan.key === "monthly";
            const displayPrice = plan.uiPrice ?? plan.price;
            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-6 flex flex-col gap-5 ${
                  isPopular
                    ? "border-[#2563EB] bg-gradient-to-b from-white to-[#f8fafc] shadow-xl ring-1 ring-[#2563EB] md:scale-105 z-10"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    isPopular ? "bg-[#2563EB] text-white" : "bg-[#F97316] text-white"
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-lg">{plan.name}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">{plan.description}</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-[#0F172A]">
                    {plan.price === 0 ? "Free" : `₹${displayPrice}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-slate-500 text-sm font-medium mb-1">/{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    isPopular
                      ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md"
                      : "bg-slate-100 hover:bg-slate-200 text-[#0F172A]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
