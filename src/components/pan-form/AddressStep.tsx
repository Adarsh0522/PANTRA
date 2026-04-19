import { UseFormRegister, FieldErrors, Control, useWatch } from "react-hook-form";
import { PanFormData } from "@/lib/form-engine/schema";
import { AddressInput } from "./AddressInput";
import { SharedSelect } from "./SharedInput";

interface StepProps {
  register: UseFormRegister<PanFormData>;
  errors: FieldErrors<PanFormData>;
  control: Control<PanFormData>;
}

export function AddressStep({ register, errors, control }: StepProps) {
  const addressType = useWatch({ control, name: "addressType" });
  const raSameAsResidence = useWatch({ control, name: "raSameAsResidence" });

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
              { label: "Representative", value: "REPRESENTATIVE" },
            ]}
            {...register("addressType")}
            error={errors.addressType}
            required
          />
        </div>

        <AddressInput
          type="residence"
          title="Residence Address"
          register={register}
          errors={errors}
        />
      </div>

      {/* Office Address Section */}
      {addressType === "OFFICE" && (
        <div className="premium-card">
          <AddressInput
            type="office"
            title="Office Address (Optional)"
            register={register}
            errors={errors}
          />
        </div>
      )}

      {/* Representative Section */}
      {addressType === "REPRESENTATIVE" && (
        <div className="space-y-8">
          <div className="premium-card bg-[#F9FAFB] border-dashed">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="raSameAsResidence"
                className="w-5 h-5 rounded-[6px] border-slate-300 text-[#2563EB] focus:ring-[#2563EB] transition-all cursor-pointer"
                {...register("raSameAsResidence")}
              />
              <label htmlFor="raSameAsResidence" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                Same as Representative Assessee Address
              </label>
            </div>
          </div>

          {!raSameAsResidence && (
            <div className="premium-card">
              <AddressInput
                type="representative"
                title="Representative Assessee Address"
                register={register}
                errors={errors}
              />
            </div>
          )}
        </div>
      )}
    </div>

  );
}

