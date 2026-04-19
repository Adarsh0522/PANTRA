import { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

interface SharedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  helperText?: string;
}

export function SharedInput({
  label,
  error,
  helperText,
  className,
  ...props
}: SharedInputProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-[12px] font-medium text-slate-600 block">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={cn(
          "w-full h-11 px-4 bg-white border rounded-lg transition-all outline-none text-[14px] placeholder:text-slate-400",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          props.disabled && "bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200"
        )}
        {...props}
      />
      {error && (
        <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

interface SharedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError;
  options: { label: string; value: string }[];
}

export function SharedSelect({
  label,
  error,
  options,
  className,
  ...props
}: SharedSelectProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-[12px] font-medium text-slate-600 block">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        <select
          className={cn(
            "w-full h-11 px-4 pr-10 bg-white border rounded-lg transition-all outline-none appearance-none text-[14px]",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            props.disabled && "bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200"
          )}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
          {error.message}
        </p>
      )}
    </div>
  );
}


