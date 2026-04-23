"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanKey, PlanConfig } from "@/lib/plans";
import { Check, Zap, Crown, Sparkles, ArrowRight, Shield, Loader2 } from "lucide-react";

export default function PricingClient({ activePlanKey, plans }: { activePlanKey: string, plans: PlanConfig[] }) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  async function handleSelectPlan(planKey: PlanKey) {
    if (planKey === "free") {
      router.push("/dashboard");
      return;
    }

    setLoadingPlan(planKey);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await res.json();

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Payment creation failed. Please try again.");
        console.error("No payment_url:", data);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  const fallbackPlan = (key: PlanKey, name: string): PlanConfig => ({
    key, name, price: 0, period: "unknown", description: "",
    limit: 0, dailyLimit: 0, watermarkLimit: 0, watermark: false,
    extraPerForm: 0, badge: null, cta: "Select", features: []
  });

  const freePlan = plans.find(p => p.key === "free") || fallbackPlan("free", "Free Plan");
  const monthlyPlan = plans.find(p => p.key === "monthly") || fallbackPlan("monthly", "Monthly Plan");
  const quarterlyPlan = plans.find(p => p.key === "quarterly") || fallbackPlan("quarterly", "Quarterly Plan");
  const yearlyPlan = plans.find(p => p.key === "yearly") || fallbackPlan("yearly", "Yearly Plan");

  // Conditional Logic flag
  const isYearlyActive = activePlanKey === "yearly";

  // Reusable Card Renderer
  const renderCard = (plan: PlanConfig, variant: "free" | "monthly" | "quarterly" | "yearly") => {
    const isPopular = variant === "monthly";
    const isBestValue = variant === "quarterly";
    const isYearlyLayout = variant === "yearly";
    const isFree = variant === "free";
    
    // Style mappings
    let cardClasses = "";
    let badgeClasses = "";
    let nameClasses = "";
    let descClasses = "";
    let priceClasses = "";
    let periodClasses = "";
    let featureTextClasses = "";
    let iconBgClasses = "";
    let ctaClasses = "";
    let renderBadgeIcon: React.ReactNode = null;

    if (isPopular) {
      cardClasses = "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500 shadow-2xl shadow-blue-500/20 md:scale-105 z-10 text-white";
      badgeClasses = "bg-white text-blue-600 border-blue-100 shadow-black/10";
      nameClasses = "text-white";
      descClasses = "text-blue-100/80";
      priceClasses = "text-white";
      periodClasses = "text-blue-200/50";
      featureTextClasses = "text-blue-50";
      iconBgClasses = "bg-white/20 text-white";
      ctaClasses = "bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:-translate-y-0.5";
      renderBadgeIcon = <Crown className="w-3 h-3" />;
    } else if (isBestValue) {
      cardClasses = "bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/20 text-white";
      badgeClasses = "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-orange-500/30";
      nameClasses = "text-white";
      descClasses = "text-slate-400";
      priceClasses = "text-white";
      periodClasses = "text-slate-500";
      featureTextClasses = "text-slate-300";
      iconBgClasses = "bg-orange-500/20 text-orange-400";
      ctaClasses = "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:-translate-y-0.5";
      renderBadgeIcon = <Zap className="w-3 h-3" />;
    } else if (isYearlyLayout) {
      cardClasses = "bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/20 text-white";
      nameClasses = "text-white";
      descClasses = "text-slate-400";
      priceClasses = "text-white";
      periodClasses = "text-slate-500";
      featureTextClasses = "text-slate-200";
      iconBgClasses = "bg-blue-500/20 text-blue-400";
      ctaClasses = "bg-white text-slate-900 hover:bg-slate-100 shadow-md hover:-translate-y-0.5";
    } else {
      cardClasses = "bg-white border-slate-200 shadow-sm";
      nameClasses = "text-slate-900";
      descClasses = "text-slate-500";
      priceClasses = "text-slate-900";
      periodClasses = "text-slate-400";
      featureTextClasses = "text-slate-700";
      iconBgClasses = "bg-emerald-50 text-emerald-600";
      ctaClasses = "bg-slate-100 hover:bg-slate-200 text-slate-800";
    }

    const isActive = activePlanKey === plan.key;
    // Hide ALL upgrade buttons if Yearly is active, EXCEPT if this card is exactly Yearly (will have "Current Plan" instead or just hide the button).
    // The requirement: "If user has Yearly plan: -> Hide all Upgrade buttons".
    // AND: "If user already on a plan: -> Show Current Plan badge".
    let hideButton = false;
    if (isYearlyActive) {
      hideButton = true;
    }
    if (isActive) {
      hideButton = true;
    }

    // "uiPrice" support for rendering test price as 999
    const displayPrice = "uiPrice" in plan && plan.uiPrice !== undefined ? plan.uiPrice : plan.price;

    return (
      <div key={plan.key} className="relative h-full">
        {!isYearlyLayout && plan.badge && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg border whitespace-nowrap ${badgeClasses}`}>
              {renderBadgeIcon}
              {plan.badge}
            </span>
          </div>
        )}
        <div className={`relative rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${cardClasses} ${isYearlyLayout ? 'md:flex-row md:items-center p-8 lg:p-10' : 'p-7 pt-8 h-full'}`}>
          {!isYearlyLayout && isPopular && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />}
          {!isYearlyLayout && isBestValue && <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />}

          <div className={`relative z-10 flex flex-col flex-1 ${isYearlyLayout ? 'md:flex-row md:items-start md:justify-between w-full' : ''}`}>
            <div className={`${isYearlyLayout ? 'md:w-1/3' : ''}`}>
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`text-xl font-black tracking-tight ${nameClasses}`}>
                  {plan.name}
                </h3>
                {isActive && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20 whitespace-nowrap">
                    Current Plan
                  </span>
                )}
              </div>
              {isYearlyLayout && plan.badge && !isActive && (
                <span className="inline-block bg-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider border border-blue-500/10 whitespace-nowrap mb-2 mt-1">
                  {plan.badge}
                </span>
              )}
              <p className={`text-xs font-medium max-w-sm ${isYearlyLayout ? 'mt-2' : 'h-8 mt-1'} ${descClasses}`}>
                {plan.description}
              </p>

              <div className={`flex items-baseline gap-1.5 ${isYearlyLayout ? 'mt-6 mb-6 md:mb-0' : 'mt-5 mb-6'}`}>
                <span className={`text-3xl lg:text-4xl font-black tracking-tight ${priceClasses}`}>
                  {displayPrice === 0 ? '₹0' : `₹${displayPrice.toLocaleString("en-IN")}`}
                </span>
                <span className={`text-sm font-bold ${periodClasses}`}>
                  /{plan.period}
                </span>
              </div>
            </div>

            <ul className={`space-y-3 ${isYearlyLayout ? 'md:flex-1 md:max-w-md mt-6 md:mt-0' : 'mb-8 flex-1'}`}>
              {plan.features.map((feature, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm font-medium ${featureTextClasses}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-white/5 ${iconBgClasses}`}>
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button Space */}
          <div className={`${isYearlyLayout ? 'mt-8 md:mt-0 md:ml-8 shrink-0 flex items-center' : 'mt-auto'}`}>
            {!hideButton && (
              <button
                id={`plan-cta-${plan.key}`}
                onClick={() => handleSelectPlan(plan.key)}
                disabled={loadingPlan !== null}
                className={`w-full ${isYearlyLayout ? 'md:w-auto px-10' : ''} py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${ctaClasses}`}
              >
                {loadingPlan === plan.key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {plan.cta}
                    {!isFree && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-200 mb-2 shadow-sm">
          <Sparkles className="w-4 h-4" />
          Choose Your Plan
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-slate-500 text-sm md:text-base font-medium max-w-lg mx-auto">
          Start with 2 free downloads per day. Upgrade anytime for unlimited,
          watermark-free PAN form generation.
        </p>
      </div>

      <div>
        {/* Tier Grid - Desktop: Free, Monthly, Quarterly / Mobile: Monthly, Quarterly, Free */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-6">
          <div className="order-3 md:order-1 transition-all">
            {renderCard(freePlan, "free")}
          </div>
          <div className="order-1 md:order-2 transition-all">
            {renderCard(monthlyPlan, "monthly")}
          </div>
          <div className="order-2 md:order-3 transition-all">
            {renderCard(quarterlyPlan, "quarterly")}
          </div>
        </div>

        {/* Yearly Plan - Full Width */}
        <div className="w-full mt-8">
          {renderCard(yearlyPlan, "yearly")}
        </div>
      </div>

      {/* Pay Per Form Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm mt-12">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-lg">
            <h3 className="text-xl md:text-2xl font-black text-slate-900">
              Pay Per Form — ₹10
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              No subscription needed. Download watermark-free PDF instantly.
            </p>
          </div>
          <button
            id="plan-cta-per_form"
            onClick={() => handleSelectPlan("per_form")}
            disabled={loadingPlan !== null}
            className="shrink-0 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingPlan === "per_form" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Pay & Download
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-bold pb-4 pt-4 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Secure UPI Payments</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Instant Activation</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-500" />
          <span>0% Transaction Fee</span>
        </div>
      </div>
    </div>
  );
}
