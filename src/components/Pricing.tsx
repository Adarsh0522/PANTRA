import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free Setup",
      price: "₹0",
      period: "forever",
      description: "Perfect for testing the platform with basic features.",
      features: [
        "2 Form generations per day",
        "Clean PDF Form downloads",
        "Basic form features",
        "Standard support",
      ],
      cta: "Start Free",
      isPopular: false,
      buttonClass: "bg-slate-100 hover:bg-slate-200 text-[#0F172A]",
      cardClass: "bg-white border-slate-200"
    },
    {
      name: "Monthly",
      price: "₹990",
      period: "per month",
      description: "For active operators generating consistent daily volume.",
      features: [
        "Unlimited PDF Form generations",
        "No watermarks",
        "All features unlocked",
        "Cost: ~₹33/day",
      ],
      cta: "Choose Monthly",
      isPopular: true,
      buttonClass: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md",
      cardClass: "bg-gradient-to-b from-[#ffffff] to-[#f8fafc] border-[#2563EB] shadow-xl md:scale-105 z-10 ring-1 ring-[#2563EB]"
    },
    {
      name: "Quarterly",
      price: "₹2399",
      period: "for 3 months",
      description: "A balanced plan for seasonal high-volume periods.",
      features: [
        "Unlimited PDF Form generations",
        "No watermarks",
        "Cost: ~₹26/day",
        "Standard support",
      ],
      cta: "Choose 3 Months",
      isPopular: false,
      buttonClass: "bg-[#F97316] hover:bg-[#EA580C] text-white",
      cardClass: "bg-white border-slate-200"
    },
    {
      name: "Yearly Pro",
      price: "₹3650",
      period: "per year",
      description: "Massive savings for dedicated CSC professionals.",
      features: [
        "Everything in Monthly",
        "Best Value (Cost: ~₹10/day)",
        "Priority Customer Support",
        "Early access to new forms",
      ],
      cta: "Get Best Value",
      isPopular: false,
      buttonClass: "bg-[#0F172A] hover:bg-[#1e293b] text-white",
      cardClass: "bg-white border-slate-200"
    }
  ];

  return (
    <section id="pricing" className="py-16 lg:py-24 bg-[#F1F5F9] border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] mb-4 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-lg text-slate-800 font-medium">Start for free, upgrade for higher form volume. High margins for your CSC center.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 lg:p-8 border transition-all duration-300 flex flex-col ${plan.cardClass}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded shadow-sm border border-[#1D4ED8]">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">{plan.name}</h3>
                <p className="text-slate-700 h-10 text-xs font-medium leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[#0F172A] tracking-tight">{plan.price}</span>
                <span className="text-xs text-slate-600 font-bold">/{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2.5 text-slate-800 font-semibold text-sm">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.isPopular ? "text-[#2563EB]" : "text-[#16A34A]"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-4 rounded-xl font-bold transition-colors text-sm ${plan.buttonClass}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
