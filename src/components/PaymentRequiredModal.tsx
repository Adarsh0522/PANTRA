"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  X,
  CreditCard,
  ArrowRight,
  Loader2,
  Zap,
  FileText,
  Award,
} from "lucide-react";

interface PaymentRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueFree: () => void;
  reason: "daily_limit" | "monthly_limit" | "plan_limit";
  amount: number;
  paymentType: "per_form" | "extra_form";
  watermarkAvailable?: boolean;
}

export default function PaymentRequiredModal({
  isOpen,
  onClose,
  onContinueFree,
  reason,
  amount,
  paymentType,
  watermarkAvailable = false,
}: PaymentRequiredModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  let title = "Limit Reached";
  let description = "You have reached your limit.";
  
  if (reason === "daily_limit") {
    title = "Daily Limit Reached";
    description = "You've used your 2 free downloads for today.";
  } else if (reason === "monthly_limit") {
    title = "Monthly Limit Reached";
    description = "You've used your 10 free downloads for this month.";
  } else if (reason === "plan_limit") {
    title = "Plan Limit Reached";
    description = "You've exhausted your plan's download limit.";
  }

  async function handlePayPerForm() {
    setLoading(true);
    try {
      // 1. Try Razorpay as PRIMARY gateway
      let rzpFailed = false;
      try {
        const rzRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "per_form" }),
        });

        if (rzRes.ok) {
          const rzData = await rzRes.json();
          
          if (rzData.order_id) {
            const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              amount: rzData.amount,
              currency: rzData.currency,
              name: "PANTRA",
              description: "Payment for Single PDF Download",
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
                    window.location.href = window.location.pathname + "?payment_success=true";
                  } else {
                    const errText = await verifyRes.text();
                    alert("Payment verification failed. Server says: " + errText);
                    setLoading(false);
                  }
                } catch (err) {
                  alert("Error verifying payment: " + String(err));
                  setLoading(false);
                }
              },
              modal: {
                ondismiss: function() {
                  setLoading(false);
                }
              }
            };
            
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
               alert("Razorpay Payment Failed. Code: " + response.error.code);
               setLoading(false);
            });
            rzp.open();
            return; // Successfully opened Razorpay
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
          body: JSON.stringify({ 
            plan: "per_form",
            returnUrl: window.location.pathname
          }),
        });

        const data = await res.json();

        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          alert("Payment creation failed on both gateways. Please try again.");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all hover:rotate-90 group"
        >
          <X className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        </button>

        <div className="p-8 space-y-8">
          {/* Icon Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
              <Zap className="w-10 h-10 text-blue-600 fill-blue-600/10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                {description}
              </p>
            </div>
          </div>

          {/* Action Stack — Ordered for maximum conversion */}
          <div className="space-y-3">
            {/* 1️⃣ PRIMARY: Pay ₹10 — Instant Download (most prominent) */}
            <button
              onClick={handlePayPerForm}
              disabled={loading}
              className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white p-5 rounded-3xl font-bold text-[13px] transition-all hover:-translate-y-1 active:scale-95 group disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-white">Pay ₹{amount} — Instant Download</div>
                  <div className="text-[11px] text-slate-400 font-medium">No watermark</div>
                </div>
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              )}
            </button>

            {/* 2️⃣ SECONDARY: Upgrade Plan */}
            <button
              onClick={() => router.push("/dashboard/pricing")}
              className="w-full flex items-center justify-between bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white p-5 rounded-3xl font-bold text-[13px] transition-all hover:-translate-y-1 active:scale-95 group shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold">Upgrade Plan</div>
                  <div className="text-[11px] text-blue-100 font-medium">Unlimited downloads & Priority</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            {/* 3️⃣ TERTIARY: Continue Free with Watermark (deliberately subtle/unattractive) */}
            {watermarkAvailable && (
              <button
                onClick={onContinueFree}
                className="w-full flex items-center justify-between border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-500 p-4 rounded-2xl text-[12px] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-500">Continue Free (with Watermark)</div>
                    <div className="text-[10px] text-slate-400 font-medium">Download with PANTRA watermark</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">Highest security for your CSC center</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
