import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = [
    { label: "Identity", id: 1 },
    { label: "Address", id: 2 },
    { label: "Details", id: 3 },
    { label: "Review", id: 4 },
  ];

  return (
    <div className="w-full max-w-[600px] mx-auto px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Background Line */}
        <div className="absolute top-[16px] left-0 right-0 h-0.5 bg-slate-200 -z-10" />
        
        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-[#F9FAFB] px-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors",
                currentStep >= step.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              )}
            >
              {currentStep > step.id ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                currentStep >= step.id ? "text-blue-600" : "text-slate-400"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

