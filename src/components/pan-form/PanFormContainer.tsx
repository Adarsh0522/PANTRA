"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePanFormLogic } from "@/hooks/use-pan-form-logic";
import { IdentityStep } from "./IdentityStep";
import { AddressStep } from "./AddressStep";
import { ContactIncomeSection, ParentsSection, DeclarationSection, RepresentativeAssesseeSection, ResidentialStatusSection } from "./AdditionalDetailsStep";
import { Loader2, ArrowRight, Download, FileText, ChevronDown, Check, Printer, X, Sparkles } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { mapFormToPDF } from "@/lib/mapping-layer/new-pan-mapper";
import { PanFormData } from "@/lib/form-engine/schema";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import PaymentRequiredModal from "@/components/PaymentRequiredModal";

// --- REUSABLE COLLAPSIBLE STEP COMPONENT ---
interface CollapsibleStepProps {
  title: string;
  stepIndex: number;
  activeStep: number;
  isCompleted: boolean;
  onContinue: () => void;
  onToggle: () => void;
  children: React.ReactNode;
  isValid?: boolean;
  customButton?: React.ReactNode;
}

function CollapsibleStep({
  title,
  stepIndex,
  activeStep,
  isCompleted,
  onContinue,
  onToggle,
  children,
  isValid = true,
  customButton
}: CollapsibleStepProps) {
  const isOpen = activeStep === stepIndex;
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && stepRef.current) {
      stepRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isOpen]);

  return (
    <div
      ref={stepRef}
      className={cn(
        "bg-white border transition-all duration-300 rounded-2xl overflow-hidden",
        isOpen ? "border-blue-200 ring-2 ring-blue-500/20 shadow-md" : "border-slate-200 shadow-sm",
        isCompleted && !isOpen ? "bg-white" : ""
      )}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between p-5 cursor-pointer transition-colors",
          isOpen ? "bg-blue-50 text-blue-700" : "bg-slate-50 hover:bg-slate-100"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
            isCompleted ? "bg-green-500 text-white" :
              isOpen ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
          )}>
            {isCompleted ? <Check className="w-4 h-4" /> : stepIndex}
          </div>
          <span className={cn(
            "text-sm font-semibold tracking-tight transition-colors",
            isOpen ? "text-blue-700" : "text-slate-600"
          )}>
            {title}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 transition-transform duration-300",
          isOpen ? "rotate-180 text-blue-700" : "text-slate-400"
        )} />
      </div>

      {/* Content */}
      <div className={cn(
        "grid transition-all duration-500 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="p-6 pt-6 border-t border-slate-100">
            <div className="space-y-6">
              {children}
            </div>
            <div className="mt-8 flex justify-end">
              {customButton ? (
                customButton
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinue();
                  }}
                  disabled={!isValid}
                  className={cn(
                    "rounded-full px-8 py-2.5 text-sm font-bold shadow-md transition-all active:scale-95",
                    isValid
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  )}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PanFormContainer({ noPadding = false, initialProfile }: { noPadding?: boolean, initialProfile?: any }) {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form data + action states (were missing before)
  const [mappedFormData, setMappedFormData] = useState<Record<string, any> | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Quota states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentReason, setPaymentReason] = useState<"daily_limit" | "monthly_limit" | "plan_limit">("daily_limit");
  const [paymentAmount, setPaymentAmount] = useState(10);
  const [watermarkAvailable, setWatermarkAvailable] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // ── Session Control (ONE session = ONE download/print count) ──
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionConsumed, setIsSessionConsumed] = useState(false);

  const form: UseFormReturn<PanFormData, any, PanFormData> = usePanFormLogic(initialProfile);
  const { register, handleSubmit, formState: { errors, isValid: isFormValid }, control, watch, setValue, trigger } = form;

  // Scroll Lock Effect
  useEffect(() => {
    if (showSuccessModal || isGenerating) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showSuccessModal, isGenerating]);

  // Auto-submit after payment success
  useEffect(() => {
    if (searchParams.get("payment_success") === "true") {
      // Clean up the URL
      window.history.replaceState(null, "", window.location.pathname);

      // 🔥 FIX: Restore form data from session storage and submit directly
      const savedData = sessionStorage.getItem("pendingPanForm_New");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          sessionStorage.removeItem("pendingPanForm_New"); // Clean up

          // Delay to ensure UI is ready before showing processing modal
          setTimeout(() => {
            onFinalSubmit(parsedData);
          }, 400);
          return;
        } catch (e) {
          console.error("Failed to parse saved form data", e);
        }
      }

      // Fallback
      const timer = setTimeout(() => {
        handleSubmit(onFinalSubmit, onInvalidSubmit)();
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Warning on refresh or leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Standard way to show warning dialog
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const currentValues = watch();

  // Debug: Log validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form Validation Errors:", errors);
    }
  }, [errors]);

  const debouncedValues = useDebounce(currentValues, 1000);
  const [lastHash, setLastHash] = useState("");

  const addressType = watch("addressType");
  const hasRAStep = addressType === "REPRESENTATIVE";
  const totalSteps = hasRAStep ? 6 : 5;

  const stepFields = useMemo(() => {
    const fields: Record<number, any[]> = {
      1: ["firstName", "lastName", "gender", "dob", "aadhaar"],
      2: ["addressType", "addresses.residence"],
      3: ["residentialStatus", "passportNumber", "tin", "contact.mobile", "contact.email", "incomeSource", "contact.countryCode"],
      4: ["isSingleParent", "fatherName.firstName", "fatherName.lastName", "motherName.firstName", "motherName.lastName", "parentToPrint"],
    };

    if (hasRAStep) {
      fields[5] = ["raDetails.firstName", "raDetails.lastName", "raDetails.pan", "raDetails.aadhaar", "raDetails.mobile", "raDetails.email"];
      fields[6] = ["aoCode", "verification.place", "documents", "verification.name"];
    } else {
      fields[5] = ["aoCode", "verification.place", "documents", "verification.name"];
    }
    return fields;
  }, [hasRAStep]);

  // Live Preview Logic
  useEffect(() => {
    const fetchPreview = async () => {
      const currentHash = JSON.stringify(debouncedValues);
      if (currentHash === lastHash) return;
      if (debouncedValues.firstName?.length < 2 || debouncedValues.lastName?.length < 2) {
        setPreviewUrl(null);
        return;
      }

      setPreviewLoading(true);
      try {
        const res = await fetch("/api/generate-pdf/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: debouncedValues, type: "new" }),
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setPreviewUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          setLastHash(currentHash);
        }
      } catch (e) {
        console.error("Preview failed", e);
      } finally {
        setPreviewLoading(false);
      }
    };
    fetchPreview();
  }, [debouncedValues, lastHash]);

  const handleContinue = async (stepIndex: number) => {
    const fields = stepFields[stepIndex];
    if (!fields) return;

    const isStepValid = await trigger(fields as any);

    if (isStepValid) {
      setCompletedSteps(prev => new Set(prev).add(stepIndex));
      if (stepIndex < totalSteps) {
        setActiveStep(stepIndex + 1);
      }
    }
  };

  const onInvalidSubmit = (errs: any) => {
    console.log("Validation Failed:", errs);

    // Find first step with errors
    for (let i = 1; i <= totalSteps; i++) {
      const fields = stepFields[i];
      const hasError = fields.some(f => {
        const parts = f.split('.');
        let curr = errs;
        for (const p of parts) {
          if (curr && curr[p]) curr = curr[p];
          else { curr = undefined; break; }
        }
        return !!curr;
      });

      if (hasError) {
        setActiveStep(i);
        return;
      }
    }
  };

  const onFinalSubmit = async (data: PanFormData) => {
    setIsGenerating(true);
    setShowSuccessModal(false);
    // Reset session state for new generation
    setSessionId(null);
    setIsSessionConsumed(false);
    setGeneratedPdfUrl(null);

    try {
      const mapped = mapFormToPDF(data);
      setMappedFormData(mapped);

      // ── PHASE 1: Generate PDF (limit check happens server-side) ──
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "new",
          data: mapped,
          action: "generate",
        }),
      });

      const result = await response.json();

      // ── LIMIT HIT: Show ONLY payment modal (no success modal) ──
      if (response.status === 402) {
        setIsGenerating(false);
        setPaymentReason(result.reason);
        setPaymentAmount(result.requiresPayment?.amount || 10);
        setWatermarkAvailable(!!result.watermarkAvailable);

        // Save the fully valid form data before user goes to payment gateway
        sessionStorage.setItem("pendingPanForm_New", JSON.stringify(data));

        setShowPaymentModal(true);
        return;
      }

      if (!response.ok) throw new Error(result.error || "Generation failed");

      // ── SUCCESS: Store session, show success modal ──
      setSessionId(result.sessionId);
      setGeneratedPdfUrl(result.pdfUrl);

      setCompletedSteps(prev => {
        const next = new Set(prev);
        for (let i = 1; i <= totalSteps; i++) next.add(i);
        return next;
      });
      setActiveStep(0);

      await new Promise(resolve => setTimeout(resolve, 500));
      setIsGenerating(false);
      setTimeout(() => setShowSuccessModal(true), 150);

    } catch (error) {
      console.error("Form preparation failed:", error);
      alert("Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  // ── Watermark continuation (from payment modal) ──
  const handleContinueFree = async () => {
    setShowPaymentModal(false);
    if (!mappedFormData) return;
    setIsGenerating(true);
    // Reset session for watermark generation
    setSessionId(null);
    setIsSessionConsumed(false);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "new",
          data: mappedFormData,
          mode: "watermark",
          action: "generate",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Generation failed");

      setSessionId(result.sessionId);
      setGeneratedPdfUrl(result.pdfUrl);
      setIsGenerating(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Free generation failed:", error);
      alert("Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  // ── Consume session: shared by Download and Print ──
  const consumeSession = async (): Promise<string | null> => {
    if (!sessionId || isSessionConsumed) return generatedPdfUrl;

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "download",
          sessionId: sessionId,
        }),
      });

      const result = await response.json();

      // Session already used (race condition / backend guard)
      if (response.status === 409) {
        setIsSessionConsumed(true);
        return result.pdfUrl || generatedPdfUrl;
      }

      if (!response.ok) throw new Error(result.error || "Consume failed");

      // ── Mark consumed: disables both buttons ──
      setIsSessionConsumed(true);
      setGeneratedPdfUrl(result.pdfUrl);
      return result.pdfUrl;
    } catch (error) {
      console.error("Session consume failed:", error);
      throw error;
    }
  };

  const handleDownload = async () => {
    if (!sessionId || isDownloading || isPrinting) return;
    // Frontend guard: if already consumed, just re-download existing file
    if (isSessionConsumed && generatedPdfUrl) {
      const link = document.createElement("a");
      link.href = generatedPdfUrl;
      link.download = `PAN_Application_${currentValues.firstName || "Form"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setIsDownloading(true);
    try {
      const pdfUrl = await consumeSession();
      if (!pdfUrl) throw new Error("No PDF URL");

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `PAN_Application_${currentValues.firstName || "Form"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!sessionId || isDownloading || isPrinting) return;
    setIsPrinting(true);

    try {
      // Consume if not already consumed
      let pdfUrl = generatedPdfUrl;
      if (!isSessionConsumed) {
        pdfUrl = await consumeSession();
      }
      if (!pdfUrl) throw new Error("No PDF URL");

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdfUrl;
      iframe.onload = () => {
        const iframeWin = iframe.contentWindow;
        if (!iframeWin) return;
        iframeWin.focus();
        iframeWin.onafterprint = () => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        };
        iframeWin.print();
      };
      document.body.appendChild(iframe);
    } catch (error) {
      console.error("Print failed:", error);
      alert("Print failed. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleFinalReset = () => {
    // 1. Clear specific storage key
    // 1. Reset internal form state
    form.reset();
    // 3. Clear session state
    setSessionId(null);
    setIsSessionConsumed(false);
    setGeneratedPdfUrl(null);
    setMappedFormData(null);
    // 4. Hide modal
    setShowSuccessModal(false);
    // 5. Redirect to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className={cn(
      "w-full flex flex-col lg:flex-row gap-6 items-start bg-[#F1F5F9]",
      noPadding ? "" : "pt-2 px-4 lg:px-6"
    )}>
      {/* Form Section - Center (65%) */}
      <form
        onSubmit={handleSubmit(onFinalSubmit, onInvalidSubmit)}
        className="flex-1 w-full lg:max-w-[calc(100%-420px)] lg:pl-2"
      >
        <div className="flex flex-col gap-4">
          <CollapsibleStep
            title="Personal Details"
            stepIndex={1}
            activeStep={activeStep}
            isCompleted={completedSteps.has(1)}
            onContinue={() => handleContinue(1)}
            onToggle={() => setActiveStep(1)}
          >
            <IdentityStep register={register} errors={errors} control={control} />
          </CollapsibleStep>

          <CollapsibleStep
            title="Communication Address"
            stepIndex={2}
            activeStep={activeStep}
            isCompleted={completedSteps.has(2)}
            onContinue={() => handleContinue(2)}
            onToggle={() => (completedSteps.has(1) || activeStep === 2) && setActiveStep(2)}
          >
            <AddressStep register={register} errors={errors} control={control} />
          </CollapsibleStep>

          <CollapsibleStep
            title="Contact & Source of Income"
            stepIndex={3}
            activeStep={activeStep}
            isCompleted={completedSteps.has(3)}
            onContinue={() => handleContinue(3)}
            onToggle={() => (completedSteps.has(2) || activeStep === 3) && setActiveStep(3)}
          >
            <div className="space-y-8">
              <ResidentialStatusSection register={register} errors={errors} control={control} />
              <div className="border-t border-slate-200 pt-8" />
              <ContactIncomeSection register={register} errors={errors} control={control} />
            </div>
          </CollapsibleStep>

          <CollapsibleStep
            title="Parents Details"
            stepIndex={4}
            activeStep={activeStep}
            isCompleted={completedSteps.has(4)}
            onContinue={() => handleContinue(4)}
            onToggle={() => (completedSteps.has(3) || activeStep === 4) && setActiveStep(4)}
          >
            <ParentsSection register={register} errors={errors} control={control} setValue={setValue} />
          </CollapsibleStep>

          {hasRAStep && (
            <CollapsibleStep
              title="Representative Assessee Details"
              stepIndex={5}
              activeStep={activeStep}
              isCompleted={completedSteps.has(5)}
              onContinue={() => handleContinue(5)}
              onToggle={() => (completedSteps.has(4) || activeStep === 5) && setActiveStep(5)}
            >
              <RepresentativeAssesseeSection register={register} errors={errors} control={control} />
            </CollapsibleStep>
          )}

          <CollapsibleStep
            title="Declaration & Verification"
            stepIndex={totalSteps}
            activeStep={activeStep}
            isCompleted={completedSteps.has(totalSteps)}
            onContinue={() => handleContinue(totalSteps)}
            onToggle={() => (completedSteps.has(totalSteps - 1) || activeStep === totalSteps) && setActiveStep(totalSteps)}
            customButton={
              <button
                type="submit"
                disabled={isGenerating}
                className={cn(
                  "w-full lg:w-auto flex items-center justify-center gap-3 text-white h-[52px] px-10 rounded-full font-bold transition-all active:scale-95 shadow-lg text-base",
                  !isGenerating
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 cursor-pointer"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Application PDF</span>
                  </>
                )}
              </button>
            }
          >
            <DeclarationSection register={register} errors={errors} control={control} setValue={setValue} />
          </CollapsibleStep>

          {/* Premium Loading Overlay */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center"
              >
                <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border border-white/20 animate-in zoom-in-95 duration-500">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-xl font-bold text-slate-900 tracking-tight">Preparing Application</p>
                    <p className="text-sm font-medium text-slate-500">Verifying your Form 49A data...</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Modal */}
          <AnimatePresence>
            {showSuccessModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                  onClick={() => setShowSuccessModal(false)}
                />
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
                >
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleFinalReset}
                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all z-10 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="p-8 sm:p-12 text-center">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50">
                      <Check className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">Application Ready</h2>
                    <p className="text-slate-500 mb-10 text-base leading-relaxed">
                      Your PAN application form has been verified. Download or print your official PDF below.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading || isPrinting || (isSessionConsumed && !generatedPdfUrl)}
                        className={cn(
                          "flex items-center justify-center gap-3 text-white h-[60px] rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]",
                          isSessionConsumed
                            ? "bg-emerald-600 shadow-emerald-500/25 cursor-pointer"
                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 cursor-pointer",
                          (isDownloading || isPrinting) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSessionConsumed ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                        {isDownloading ? "Generating..." : isSessionConsumed ? "Re-download" : "Download"}
                      </button>
                      <button
                        type="button"
                        onClick={handlePrint}
                        disabled={isDownloading || isPrinting || isSessionConsumed}
                        className={cn(
                          "flex items-center justify-center gap-3 text-white h-[60px] rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98]",
                          isSessionConsumed
                            ? "bg-slate-400 opacity-50 cursor-not-allowed"
                            : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 cursor-pointer",
                          (isDownloading || isPrinting) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isPrinting ? <Loader2 className="w-5 h-5 animate-spin" /> : isSessionConsumed ? <Check className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
                        {isPrinting ? "Generating..." : isSessionConsumed ? "Used" : "Print PDF"}
                      </button>
                    </div>

                    {isSessionConsumed && (
                      <p className="text-xs text-center text-slate-400 -mt-2 mb-2">
                        ✓ Action recorded. Generate a new PDF for another download.
                      </p>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleFinalReset}
                        className="w-full h-[56px] rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Start New Application
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Live Preview Section - Right (35%) */}
      <div className="w-full lg:w-[380px] lg:sticky lg:top-8 h-[525px] max-h-[90vh]">
        <div className="preview-card rounded-[24px] p-6 shadow-2xl relative overflow-hidden group h-full flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16" />

          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Preview</span>
          </div>

          <div className="flex-1 bg-[#0d1425] rounded-2xl overflow-hidden border border-white/5 relative shadow-inner flex flex-col items-center justify-center p-2">
            {previewUrl ? (
              <div className="w-full h-full flex items-center justify-center">
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-[98%] h-[98%] opacity-95 group-hover:opacity-100 transition-opacity mx-auto rounded-lg"
                  title="Live Print Preview"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                  <FileText className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Intelligent Drafting</p>
                <p className="text-[10px] text-slate-600 leading-relaxed px-4">System is waiting for secure identity inputs to generate Live PDF Matrix</p>
              </div>
            )}

            {previewLoading && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Syncing</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentRequiredModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onContinueFree={handleContinueFree}
        reason={paymentReason}
        amount={paymentAmount}
        paymentType={paymentReason === "daily_limit" ? "per_form" : "extra_form"}
        watermarkAvailable={watermarkAvailable}
      />
    </div>
  );
}
