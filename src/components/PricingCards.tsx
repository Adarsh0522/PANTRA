"use client";

import { Check, Zap, Star, Flame } from "lucide-react";
import Link from "next/link";
import { INITIAL_PLANS, type PlanConfig } from "@/lib/plans";

export default function PricingCards({ plans }: { plans: PlanConfig[] }) {
  // Fallback to INITIAL_PLANS if plan not found in DB result
  const freePlan = plans.find((p) => p.key === "free") || INITIAL_PLANS.free;
  const starterPlan = plans.find((p) => p.key === "starter") || INITIAL_PLANS.starter;
  const growthPlan = plans.find((p) => p.key === "growth") || INITIAL_PLANS.growth;
  const proPlan = plans.find((p) => p.key === "pro") || INITIAL_PLANS.pro;

  const getDisplayPrice = (plan: PlanConfig) => {
    return plan.price === 0 ? "₹0" : `₹${plan.price.toLocaleString("en-IN")}`;
  };

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-[#F1F5F9] border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] mb-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto font-medium">
            Start for free, upgrade anytime. No expiry, no hidden fees. High margins for your CSC center.
          </p>
        </div>

        {/* 4 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">

          {/* 1. Free Plan */}
          <div className="relative rounded-2xl border bg-white border-slate-200 transition-all duration-300 flex flex-col hover:shadow-lg overflow-hidden h-full">
            {/* Header */}
            <div className="bg-slate-100 p-6 lg:p-8 border-b border-slate-200">
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">{freePlan.name}</h3>
              <p className="text-slate-700 text-xs font-medium leading-relaxed">{freePlan.description}</p>
            </div>
            {/* Body */}
            <div className="p-6 lg:p-8 flex flex-col flex-1">
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
              <Link href="/login" className="w-full py-3 px-4 rounded-xl font-bold transition-colors text-sm bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-center block mt-auto">
                {freePlan.cta}
              </Link>
            </div>
          </div>

          {/* 2. Starter Plan – ₹299 */}
          <div className="relative rounded-2xl border bg-white border-blue-100 transition-all duration-300 flex flex-col hover:shadow-lg overflow-hidden h-full">
            {/* Header */}
            <div className="bg-blue-50 p-6 lg:p-8 border-b border-blue-100">
              <h3 className="text-xl font-bold text-blue-700 mb-2">{starterPlan.name}</h3>
              <p className="text-blue-600/80 text-xs font-medium leading-relaxed">{starterPlan.description}</p>
            </div>
            {/* Body */}
            <div className="p-6 lg:p-8 flex flex-col flex-1">
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
              <Link href="/login" className="w-full py-3 px-4 rounded-xl font-bold transition-colors text-sm bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 text-center block mt-auto">
                {starterPlan.cta}
              </Link>
            </div>
          </div>

          {/* 3. Growth Plan – ₹499 ⭐ Most Popular — Highlighted */}
          <div className="relative rounded-2xl border-2 border-[#2563EB] bg-white shadow-xl md:scale-105 z-10 flex flex-col overflow-hidden h-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
              <span className="bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-b-lg shadow-sm inline-flex items-center gap-1.5">
                <Star className="w-3 h-3" /> Most Popular
              </span>
            </div>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 lg:p-8 border-b border-blue-700 pt-10">
              <h3 className="text-xl font-bold text-white mb-2">{growthPlan.name}</h3>
              <p className="text-blue-100 text-xs font-medium leading-relaxed">{growthPlan.description}</p>
            </div>
            {/* Body */}
            <div className="p-6 lg:p-8 flex flex-col flex-1 bg-gradient-to-b from-white to-[#f8faff]">
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
              <Link href="/login" className="w-full py-3 px-4 rounded-xl font-bold transition-colors text-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-center block shadow-md mt-auto">
                {growthPlan.cta}
              </Link>
            </div>
          </div>

          {/* 4. Pro Plan – ₹999 🔥 Best Value */}
          <div className="relative rounded-2xl border bg-[#0F172A] border-slate-800 transition-all duration-300 flex flex-col hover:shadow-2xl overflow-hidden h-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-[#0F172A] text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-b-lg inline-flex items-center gap-1.5">
                <Flame className="w-3 h-3" /> Best Value
              </span>
            </div>
            {/* Header */}
            <div className="bg-slate-900 p-6 lg:p-8 border-b border-slate-800 pt-10">
              <h3 className="text-xl font-bold text-white mb-2">{proPlan.name}</h3>
              <p className="text-amber-400/80 text-xs font-medium leading-relaxed">{proPlan.description}</p>
            </div>
            {/* Body */}
            <div className="p-6 lg:p-8 flex flex-col flex-1">
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
              <Link href="/login" className="w-full py-3 px-4 rounded-xl font-bold transition-colors text-sm bg-white hover:bg-slate-100 text-[#0F172A] text-center block shadow-md mt-auto">
                {proPlan.cta}
              </Link>
            </div>
          </div>

        </div>
        


        {/* Pay Per Form Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-slate-800 font-bold text-sm">Pay per form: <span className="text-[#2563EB]">₹10/download</span></span>
            <span className="text-slate-400 text-xs font-medium">• No subscription needed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
