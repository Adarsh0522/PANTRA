import { UseFormRegister, FieldErrors, Control, useWatch, UseFormSetValue } from "react-hook-form";
import { PanCorrectionData } from "@/lib/form-engine/correction-schema";
import { CorrectionAddressInput } from "./CorrectionAddressInput";
import { SharedSelect } from "../SharedInput";
import { useEffect } from "react";

interface StepProps {
  register: UseFormRegister<PanCorrectionData>;
  errors: FieldErrors<PanCorrectionData>;
  control: Control<PanCorrectionData>;
  setValue: UseFormSetValue<PanCorrectionData>;
}

export function CorrectionAddressStep({ register, errors, control, setValue }: StepProps) {
  const addressType = useWatch({ control, name: "addressType" });
  
  // Background logic for address correction activation
  const resAddress = useWatch({ control, name: "addresses.residence" });
  const offAddress = useWatch({ control, name: "addresses.office" });

  useEffect(() => {
    const hasValues = (addr: any) => addr && Object.values(addr).some(val => val && String(val).length > 0);
    const activeAddress = addressType === "RESIDENCE" ? resAddress : offAddress;
    
    if (hasValues(activeAddress)) {
      setValue("correctionFields.address", true, { shouldValidate: true });
    }
  }, [resAddress, offAddress, addressType, setValue]);

  return (
    <div className="space-y-8">
      {/* Communication Choice & Main Address */}
      <div className="premium-card">
        <div className="max-w-xs mb-8">
          <SharedSelect
            label="Address Source"
            options={[
              { label: "Residence", value: "RESIDENCE" },
              { label: "Office", value: "OFFICE" },
            ]}
            {...register("addressType")}
            error={errors.addressType}
            required
          />
        </div>

        {/* Conditional rendering of address input based on source */}
        {addressType === "RESIDENCE" ? (
          <CorrectionAddressInput
            type="residence"
            title="Residence Address"
            register={register}
            errors={errors}
          />
        ) : (
          <CorrectionAddressInput
            type="office"
            title="Office Address"
            register={register}
            errors={errors}
          />
        )}
      </div>
    </div>
  );
}
