"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Shield,
} from "lucide-react";

type VerifyStatus = "loading" | "success" | "failed" | "pending";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [plan, setPlan] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);

  const verifyPayment = useCallback(async () => {
    if (!orderId) {
      console.error("ORDER ID MISSING");
      setStatus("failed");
      return;
    }

    console.log("VERIFYING ORDER:", orderId);

    try {
      let attempts = 0;
      while (attempts < 5) {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (data.status === "PAID" || data.frinextStatus === "COMPLETED") {
          setStatus("success");
          setPlan(data.plan || "");
          setTimeout(() => {
            const returnUrl = searchParams.get("return_url");
            if (returnUrl) {
              router.push(`${returnUrl}?payment_success=true`);
            } else {
              router.push("/dashboard");
            }
          }, 3000);
          return;
        }

        // Wait 2 seconds before retry
        setStatus("pending");
        setRetryCount(attempts + 1);
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;
      }

      console.error("PAYMENT VERIFY FAILED");
      setStatus("failed");
    } catch (err) {
      console.error("Verify error:", err);
      setStatus("failed");
    }
  }, [orderId, router]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="min-h-screen bg-[#e9edf1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* ── Loading State ── */}
          {status === "loading" && (
            <div className="p-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Verifying Payment
                </h2>
                <p className="text-slate-500 text-sm">
                  Please wait while we confirm your transaction...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Secure verification in progress</span>
              </div>
            </div>
          )}

          {/* ── Pending State ── */}
          {status === "pending" && (
            <div className="p-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Waiting for Confirmation
                </h2>
                <p className="text-slate-500 text-sm">
                  Payment is being processed. Checking again...
                  <br />
                  <span className="text-xs text-slate-400">
                    Attempt {retryCount + 1}/5
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ── Success State ── */}
          {status === "success" && (
            <div className="relative">
              {/* Confetti gradient header */}
              <div className="h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500" />

              <div className="p-12 text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-50 to-green-50 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500 shadow-lg shadow-emerald-100/50">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </div>
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  <h2 className="text-2xl font-black text-slate-900">
                    Payment Successful! 🎉
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Your{" "}
                    <span className="font-bold text-slate-700 capitalize">
                      {plan}
                    </span>{" "}
                    plan has been activated.
                  </p>
                </div>

                {/* Animated progress bar */}
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                      style={{
                        animation: "progressBar 3s linear forwards",
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Redirecting to dashboard...
                  </p>
                </div>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <style>{`
                @keyframes progressBar {
                  from { width: 0%; }
                  to { width: 100%; }
                }
              `}</style>
            </div>
          )}

          {/* ── Failed State ── */}
          {status === "failed" && (
            <div className="relative">
              <div className="h-2 bg-gradient-to-r from-red-400 to-rose-500" />

              <div className="p-12 text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                  <XCircle className="w-14 h-14 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">
                    Payment Failed
                  </h2>
                  <p className="text-slate-500 text-sm">
                    We couldn't verify your payment. No amount has been deducted.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setStatus("loading");
                      setRetryCount(0);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-2xl font-bold text-sm transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Verification
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/pricing")}
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all"
                  >
                    Try Again
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order ID footer */}
        {orderId && (
          <p className="text-center text-xs text-slate-400 mt-4 font-mono">
            Order ID: {orderId}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#e9edf1] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
