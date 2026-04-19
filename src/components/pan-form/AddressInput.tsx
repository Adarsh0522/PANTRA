import { UseFormRegister, FieldErrors } from "react-hook-form";
import { PanFormData } from "@/lib/form-engine/schema";
import { SharedInput } from "./SharedInput";

interface AddressInputProps {
  type: "residence" | "office" | "representative";
  register: UseFormRegister<PanFormData>;
  errors: FieldErrors<PanFormData>;
  title: string;
}

export function AddressInput({ type, register, errors, title }: AddressInputProps) {
  // Helper to get errors for nested fields
  const addressErrors = errors.addresses?.[type] as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SharedInput
          label="Flat/Door/Building"
          placeholder="e.g. 404 Wing B"
          {...register(`addresses.${type}.flat` as any)}
          error={addressErrors?.flat}
          required
        />
        <SharedInput
          label="Road/Street/Block"
          placeholder="e.g. MG Road Camp"
          {...register(`addresses.${type}.road` as any)}
          error={addressErrors?.road}
          required
        />
        <SharedInput
          label="Post Office"
          placeholder="e.g. Sai Plaza"
          {...register(`addresses.${type}.postOffice` as any)}
          error={addressErrors?.postOffice}
          required
        />
        <SharedInput
          label="Area/Locality"
          placeholder="e.g. Shivajinagar"
          {...register(`addresses.${type}.area` as any)}
          error={addressErrors?.area}
          required
        />
        <SharedInput
          label="District/City"
          placeholder="e.g. Pune"
          {...register(`addresses.${type}.city` as any)}
          error={addressErrors?.city}
          required
        />
        <SharedInput
          label="State/Union Territory"
          placeholder="e.g. Maharashtra"
          {...register(`addresses.${type}.state` as any)}
          error={addressErrors?.state}
          required
        />
        <SharedInput
          label="Country"
          defaultValue="INDIA"
          {...register(`addresses.${type}.country` as any)}
          error={addressErrors?.country}
        />
        <SharedInput
          label="PIN Code"
          placeholder="6 digits"
          {...register(`addresses.${type}.pin` as any)}
          error={addressErrors?.pin}
          required
        />
      </div>
    </div>
  );
}
