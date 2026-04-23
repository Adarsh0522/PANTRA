import { UseFormRegister, FieldErrors, Control, useWatch } from "react-hook-form";
import { PanFormData } from "@/lib/form-engine/schema";
import { SharedInput, SharedSelect } from "./SharedInput";

interface StepProps {
  register: UseFormRegister<PanFormData>;
  errors: FieldErrors<PanFormData>;
  control: Control<PanFormData>;
}

export function IdentityStep({ register, errors, control }: StepProps) {
  const isMinor = useWatch({ control, name: "isMinor" });
  const dobValue = useWatch({ control, name: "dob" });

  return (
    <div className="premium-card">

      <div className="space-y-6">
        {/* Row 1: Names */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SharedInput
            label="FIRST NAME"
            placeholder="RAJESH"
            {...register("firstName")}
            error={errors.firstName}
            required
          />
          <SharedInput
            label="MIDDLE NAME"
            placeholder="KUMAR"
            {...register("middleName")}
            error={errors.middleName}
            required
          />
          <SharedInput
            label="LAST NAME"
            placeholder="SHARMA"
            {...register("lastName")}
            error={errors.lastName}
            required
          />
        </div>

        {/* Row 2: Gender & DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SharedSelect
            label="GENDER"
            options={[
              { label: "MALE", value: "MALE" },
              { label: "FEMALE", value: "FEMALE" },
              { label: "TRANSGENDER", value: "TRANSGENDER" },
            ]}
            {...register("gender")}
            error={errors.gender}
            required
          />
          <SharedInput
            label="DATE OF BIRTH"
            type="date"
            {...register("dob")}
            error={errors.dob}
            required
          />
        </div>

        {/* Row 3: Aadhaar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SharedInput
            label="AADHAAR NUMBER"
            placeholder="123456789012"
            maxLength={12}
            {...register("aadhaar")}
            error={errors.aadhaar}
            required
          />
        </div>
      </div>


      {isMinor && (
        <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 items-start cursor-default hover:bg-blue-50 smooth-transition">
          <div className="bg-blue-500 text-white p-1 rounded-md">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            <strong>Minor Applicant:</strong> Representative Assessee (RA) details will be required in the final steps for legal verification.
          </p>
        </div>
      )}
    </div>
  );
}


