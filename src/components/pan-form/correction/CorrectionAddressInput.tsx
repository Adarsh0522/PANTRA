import { UseFormRegister, FieldErrors } from "react-hook-form";
import { PanCorrectionData } from "@/lib/form-engine/correction-schema";
import { SharedInput } from "../SharedInput";

interface AddressInputProps {
  type: "residence" | "office";
  register: UseFormRegister<PanCorrectionData>;
  errors: FieldErrors<PanCorrectionData>;
  title: string;
}

export function CorrectionAddressInput({ type, register, errors, title }: AddressInputProps) {
  const addressErrors = errors.addresses?.[type] as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
