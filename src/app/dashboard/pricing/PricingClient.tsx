"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import type { PlanKey, PlanConfig } from "@/lib/plans";
import { INITIAL_PLANS } from "@/lib/plans";
import { Check, Zap, Star, Flame, Sparkles, ArrowRight, Shield, Loader2 } from "lucide-react";

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
      // 1. Try Razorpay as PRIMARY gateway
      let rzpFailed = false;
      try {
        const rzRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planKey }),
        });

        if (rzRes.ok) {
          const rzData = await rzRes.json();
          
          if (rzData.order_id) {
            const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              amount: rzData.amount,
              currency: rzData.currency,
              name: "PANTRA",
              description: `Payment for ${planKey} plan`,
              order_id: rzData.order_id,
              handler: async function (response: any) {
                try {
                  const verifyRes = await fetch("/api/razorpay/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature,
                    })
                  });
                  
                  if (verifyRes.ok) {
                    router.push("/dashboard?payment=success");
                  } else {
                    alert("Payment verification failed.");
                    setLoadingPlan(null);
                  }
                } catch (err) {
                  alert("Error verifying payment.");
                  setLoadingPlan(null);
                }
              },
              modal: {
                ondismiss: function() {
                  setLoadingPlan(null);
                }
              }
            };
            
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
               alert("Razorpay Payment Failed. Code: " + response.error.code);
               setLoadingPlan(null);
            });
            rzp.open();
            return;
          } else {
            rzpFailed = true;
          }
        } else {
          rzpFailed = true;
        }
      } catch (err) {
        console.error("Razorpay initialization error:", err);
        rzpFailed = true;
      }

      // 2. Trigger Frinext as FALLBACK if Razorpay fails
      if (rzpFailed) {
        console.warn("Razorpay unavailable, falling back to Frinext gateway...");
        const res = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planKey }),
        });

        const data = await res.json();

        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          alert("Payment creation failed on both gateways. Please try again.");
          console.error("No payment_url:", data);
          setLoadingPlan(null);
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

  // Fallback to INITIAL_PLANS if plan not found in DB result
  const freePlan = plans.find(p => p.key === "free") || INITIAL_PLANS.free;
  const starterPlan = plans.find(p => p.key === "starter") || INITIAL_PLANS.starter;
  const growthPlan = plans.find(p => p.key === "growth") || INITIAL_PLANS.growth;
  const proPlan = plans.find(p => p.key === "pro") || INITIAL_PLANS.pro;

  const getDisplayPrice = (plan: PlanConfig) => {
    return plan.price === 0 ? '₹0' : `₹${plan.price.toLocaleString("en-IN")}`;
  };

  // Plan upgrade hierarchy for determining what plans to show CTA for
  const planHierarchy: Record<string, number> = { free: 0, starter: 1, growth: 2, pro: 3 };
  const activePlanRank = planHierarchy[activePlanKey] ?? 0;

  // CTA button renderer
  const PlanCTA = ({ plan, variant }: { plan: PlanConfig; variant: string }) => {
    const isActive = activePlanKey === plan.key;
    const planRank = planHierarchy[plan.key] ?? 0;
    const isDowngrade = planRank <= activePlanRank && !isActive;

    if (isActive) {
      return (
        <div className="w-full py-3 rounded-xl font-bold text-sm text-center bg-emerald-500/10 text-emerald-600 border border-emerald-200">
          ✓ Current Plan
        </div>
      );
    }

    if (isDowngrade && plan.key !== "free") return null;

    let ctaClasses = "";
    switch (variant) {
      case "free":
        ctaClasses = "bg-slate-100 hover:bg-slate-200 text-slate-800";
        break;
      case "starter":
        ctaClasses = "bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200";
        break;
      case "growth":
        ctaClasses = "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md";
        break;
      case "pro":
        ctaClasses = "bg-white hover:bg-slate-100 text-[#0F172A] shadow-md";
        break;
    }

    return (
      <button
        id={`plan-cta-${plan.key}`}
        onClick={() => handleSelectPlan(plan.key)}
        disabled={loadingPlan !== null}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${ctaClasses}`}
      >
        {loadingPlan === plan.key ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {plan.cta}
            {plan.key !== "free" && <ArrowRight className="w-4 h-4" />}
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
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
            Start with 5 free downloads. Upgrade anytime for more
            watermark-free PAN form downloads. No expiry.
          </p>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-6">

          {/* 1. Free Plan */}
          <div className="relative rounded-2xl p-6 lg:p-8 border bg-white border-slate-200 shadow-sm transition-all duration-300 flex flex-col hover:shadow-lg">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-[#0F172A]">{freePlan.name}</h3>
                {activePlanKey === "free" && (
                  <span className="bg-emerald-500/20 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                    Current
                  </span>
                )}
              </div>
              <p className="text-slate-700 h-10 text-xs font-medium leading-relaxed">{freePlan.description}</p>
            </div>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#0F172A] tracking-tight">{getDisplayPrice(freePlan)}</span>
              <span className="text-xs text-slate-600 font-bold">/{freePlan.period}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {freePlan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-800 font-semibold text-sm">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#16A34A]" />
                  <div className="flex flex-col">
                    <span>{f}</span>
                    {f.includes("Document Tool") && (
                      <span className="text-xs text-slate-500 font-medium mt-1">
                        (Includes ID Maker, BG Remover + 5 more)
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <PlanCTA plan={freePlan} variant="free" />
            </div>
          </div>

          {/* 2. Starter Plan – ₹299 */}
          <div className="relative rounded-2xl p-6 lg:p-8 border bg-white border-slate-200 shadow-sm transition-all duration-300 flex flex-col hover:shadow-lg">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-[#0F172A]">{starterPlan.name}</h3>
                {activePlanKey === "starter" && (
                  <span className="bg-emerald-500/20 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                    Current
                  </span>
                )}
              </div>
              <p className="text-slate-700 h-10 text-xs font-medium leading-relaxed">{starterPlan.description}</p>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline gap-1">
              <div>
                <span className="text-4xl font-extrabold text-[#0F172A] tracking-tight">{getDisplayPrice(starterPlan)}</span>
                <span className="text-sm text-slate-500 font-bold ml-1">/{starterPlan.period}</span>
              </div>
              <span className="text-xs text-emerald-600 font-bold sm:ml-2 mt-1 sm:mt-0">{starterPlan.subtitle}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {starterPlan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-800 font-semibold text-sm">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#16A34A]" />
                  <div className="flex flex-col">
                    <span>{f}</span>
                    {f.includes("Document Tool") && (
                      <span className="text-xs text-slate-500 font-medium mt-1">
                        (Includes ID Maker, BG Remover + 5 more)
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <PlanCTA plan={starterPlan} variant="starter" />
            </div>
          </div>

          {/* 3. Growth Plan – ₹499 ⭐ Most Popular — Highlighted */}
          <div className="relative rounded-2xl p-6 lg:p-8 border-2 border-[#2563EB] bg-gradient-to-b from-white to-[#f8faff] shadow-xl md:scale-105 z-10 flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <span className="bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm inline-flex items-center gap-1.5">
                <Star className="w-3 h-3" /> Most Popular
              </span>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-[#0F172A]">{growthPlan.name}</h3>
                {activePlanKey === "growth" && (
                  <span className="bg-emerald-500/20 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                    Current
                  </span>
                )}
              </div>
              <p className="text-slate-700 h-10 text-xs font-medium leading-relaxed">{growthPlan.description}</p>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline gap-1">
              <div>
                <span className="text-4xl font-extrabold text-[#0F172A] tracking-tight">{getDisplayPrice(growthPlan)}</span>
                <span className="text-sm text-slate-500 font-bold ml-1">/{growthPlan.period}</span>
              </div>
              <span className="text-xs text-emerald-600 font-bold sm:ml-2 mt-1 sm:mt-0">{growthPlan.subtitle}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {growthPlan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-800 font-semibold text-sm">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#2563EB]" />
                  <div className="flex flex-col">
                    <span>{f}</span>
                    {f.includes("Document Tool") && (
                      <span className="text-xs text-slate-500 font-medium mt-1">
                        (Includes ID Maker, BG Remover + 5 more)
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <PlanCTA plan={growthPlan} variant="growth" />
            </div>
          </div>

          {/* 4. Pro Plan – ₹999 🔥 Best Value */}
          <div className="relative rounded-2xl p-6 lg:p-8 border bg-[#0F172A] border-slate-800 transition-all duration-300 flex flex-col hover:shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-[#0F172A] text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full inline-flex items-center gap-1.5">
                <Flame className="w-3 h-3" /> Best Value
              </span>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">{proPlan.name}</h3>
                {activePlanKey === "pro" && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20">
                    Current
                  </span>
                )}
              </div>
              <p className="text-slate-400 h-10 text-xs font-medium leading-relaxed">{proPlan.description}</p>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline gap-1">
              <div>
                <span className="text-4xl font-extrabold text-white tracking-tight">{getDisplayPrice(proPlan)}</span>
                <span className="text-sm text-slate-400 font-bold ml-1">/{proPlan.period}</span>
              </div>
              <span className="text-xs text-amber-400 font-bold sm:ml-2 mt-1 sm:mt-0">{proPlan.subtitle}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {proPlan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-300 font-semibold text-sm">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div className="flex flex-col">
                    <span>{f}</span>
                    {f.includes("Document Tool") && (
                      <span className="text-xs text-slate-400 font-medium mt-1">
                        (Includes ID Maker, BG Remover + 5 more)
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <PlanCTA plan={proPlan} variant="pro" />
            </div>
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
            <span>No Expiry</span>
          </div>
        </div>
      </div>
    </>
  );
}
