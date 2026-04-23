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
          label="FLAT/DOOR/BUILDING"
          placeholder="404 WING B"
          {...register(`addresses.${type}.flat` as any)}
          error={addressErrors?.flat}
          required
        />
        <SharedInput
          label="ROAD/STREET/BLOCK"
          placeholder="MG ROAD CAMP"
          {...register(`addresses.${type}.road` as any)}
          error={addressErrors?.road}
          required
        />
        <SharedInput
          label="POST OFFICE"
          placeholder="LAXMI NAGAR"
          {...register(`addresses.${type}.postOffice` as any)}
          error={addressErrors?.postOffice}
          required
        />
        <SharedInput
          label="AREA/LOCALITY"
          placeholder="SHIVAJI NAGAR"
          {...register(`addresses.${type}.area` as any)}
          error={addressErrors?.area}
          required
        />
        <SharedInput
          label="DISTRICT/CITY"
          placeholder="PUNE"
          {...register(`addresses.${type}.city` as any)}
          error={addressErrors?.city}
          required
        />
        <SharedInput
          label="STATE/UNION TERRITORY"
          placeholder="MAHARASHTRA"
          {...register(`addresses.${type}.state` as any)}
          error={addressErrors?.state}
          required
        />
        <SharedInput
          label="COUNTRY"
          defaultValue="INDIA"
          {...register(`addresses.${type}.country` as any)}
          error={addressErrors?.country}
        />
        <SharedInput
          label="PIN CODE"
          placeholder="411001"
          {...register(`addresses.${type}.pin` as any)}
          error={addressErrors?.pin}
          required
        />
      </div>
    </div>
  );
}
