import { UseFormRegister, FieldErrors, Control, useWatch, UseFormSetValue } from "react-hook-form";
import { PanCorrectionData } from "@/lib/form-engine/correction-schema";
import { SharedInput, SharedSelect } from "../SharedInput";
import { useEffect } from "react";

interface StepProps {
  register: UseFormRegister<PanCorrectionData>;
  errors: FieldErrors<PanCorrectionData>;
  control: Control<PanCorrectionData>;
  setValue: UseFormSetValue<PanCorrectionData>;
}

export function CorrectionIdentityStep({ register, errors, control, setValue }: StepProps) {
  const isMinor = useWatch({ control, name: "dob" }); // Simplified check logic could go here
  
  // Background logic: When user types in a field → corresponding correctionFields[field] = true
  // We watch the values and set the flags in the background.
  const firstName = useWatch({ control, name: "firstName" });
  const middleName = useWatch({ control, name: "middleName" });
  const lastName = useWatch({ control, name: "lastName" });
  const gender = useWatch({ control, name: "gender" });
  const dob = useWatch({ control, name: "dob" });
  const aadhaar = useWatch({ control, name: "aadhaar" });

  useEffect(() => {
    if (firstName && firstName.length > 0) setValue("correctionFields.firstName", true, { shouldValidate: true });
    if (middleName && middleName.length > 0) setValue("correctionFields.middleName", true, { shouldValidate: true });
    if (lastName && lastName.length > 0) setValue("correctionFields.lastName", true, { shouldValidate: true });
    if (gender) setValue("correctionFields.gender", true, { shouldValidate: true });
    if (dob) setValue("correctionFields.dob", true, { shouldValidate: true });
    if (aadhaar && aadhaar.length > 0) setValue("correctionFields.aadhaar", true, { shouldValidate: true });
  }, [firstName, middleName, lastName, gender, dob, aadhaar, setValue]);

  return (
    <div className="premium-card">
      <div className="space-y-6">
        {/* Row 1: Existing PAN & Aadhaar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SharedInput
            label="EXISTING PAN NUMBER"
            placeholder="ABCDE1234F"
            {...register("oldPan")}
            error={errors.oldPan}
            required
            maxLength={10}
            className="uppercase"
          />
          <SharedInput
            label="AADHAAR NUMBER"
            placeholder="123456789012"
            {...register("aadhaar")}
            error={errors.aadhaar}
            required
            maxLength={12}
          />
        </div>

        {/* Row 2: Names */}
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

        {/* Row 3: Gender & DOB */}
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
      </div>
    </div>
  );
}
