"use client";

import { useState, useEffect } from "react";
import { UseFormRegister, FieldErrors, Control, useWatch, UseFormSetValue } from "react-hook-form";
import { cn } from "@/lib/utils";
import { PanFormData } from "@/lib/form-engine/schema";
import { SharedInput, SharedSelect } from "./SharedInput";

interface SectionProps {
  register: UseFormRegister<PanFormData>;
  errors: FieldErrors<PanFormData>;
  control: Control<PanFormData>;
  setValue?: UseFormSetValue<PanFormData>;
}

// --- NEW SECTION: Residential Status ---
export function ResidentialStatusSection({ register, errors, control }: SectionProps) {
  const residentialStatus = useWatch({ control, name: "residentialStatus" });

  const statusOptions = [
    { label: "Resident", value: "RESIDENT" },
    { label: "Non Resident", value: "NON_RESIDENT" },
    { label: "Resident but Not Ordinarily Resident", value: "RNOR" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Residential Status</p>
        <p className="text-[12px] text-slate-500 mb-4">Select your residential status as per tax rules</p>
        <div className="flex flex-col gap-3">
          {statusOptions.map((status) => (
            <label
              key={status.value}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 border rounded-2xl cursor-pointer transition-all text-[14px] font-bold",
                residentialStatus === status.value
                  ? "border-blue-600 bg-blue-50/10 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-600 shadow-sm"
              )}
            >
              <input
                type="radio"
                value={status.value}
                {...register("residentialStatus")}
                className="w-5 h-5 border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <span>{status.label}</span>
            </label>
          ))}
        </div>
        {errors.residentialStatus && <p className="text-xs text-red-500">{errors.residentialStatus.message}</p>}
      </div>

      {/* Passport Number (Conditional) */}
      {(residentialStatus === "NON_RESIDENT" || residentialStatus === "RNOR") && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <SharedInput
            label="Passport Number"
            placeholder="Enter valid passport number"
            {...register("passportNumber")}
            error={errors.passportNumber}
            required
          />
        </div>
      )}

      {/* TIN Field (Optional) */}
      <div className="pt-6 border-t border-slate-100">
        <SharedInput
          label="Taxpayer Identification Number (TIN)"
          placeholder="TIN in Country of Residence (if any)"
          {...register("tin")}
          error={errors.tin}
        />
      </div>
    </div>
  );
}

// --- STEP 3: Contact & Income ---
export function ContactIncomeSection({ register, errors, control }: SectionProps) {
  const incomeSource = useWatch({ control, name: "incomeSource" });

  const incomeOptions = [
    { label: "Salary", value: "salary" },
    { label: "Business/Profession", value: "business" },
    { label: "House Property", value: "house_property" },
    { label: "Capital Gains", value: "capital" },
    { label: "Other Sources", value: "other" },
    { label: "No Income", value: "none" },
  ];

  return (
    <div className="space-y-10">
      {/* Contact Information Row */}
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Contact Information</p>
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <div className="w-full lg:w-[80px]">
            <SharedInput
              label="Country Code"
              defaultValue="91"
              {...register("contact.countryCode")}
              required
            />
          </div>

          <div className="w-full lg:flex-1">
            <SharedInput
              label="Mobile Number"
              placeholder="10 digits"
              {...register("contact.mobile")}
              required
            />
          </div>

          <div className="w-full lg:flex-1">
            <SharedInput
              label="Email ID"
              placeholder="name@example.com"
              type="email"
              {...register("contact.email")}
              required
            />
          </div>
        </div>
      </div>

      {/* Landline Details Row */}
      <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Landline Details (Optional)</p>
        <div className="flex gap-4">
          <div className="w-[120px]">
            <SharedInput
              label="STD Code"
              {...register("contact.stdCode")}
            />
          </div>
          <div className="flex-1">
            <SharedInput
              label="Landline Number"
              {...register("contact.landline")}
            />
          </div>
        </div>
      </div>

      {/* Source of Income Row */}
      <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Source of Income</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {incomeOptions.map((source) => (
            <label
              key={source.value}
              className={cn(
                "w-full h-full flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all text-[13px] font-medium",
                incomeSource === source.value
                  ? "border-blue-600 bg-blue-50/10 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
              )}
            >
              <input
                type="radio"
                value={source.value}
                {...register("incomeSource")}
                className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />
              <span>{source.label}</span>
            </label>
          ))}
        </div>
        {errors.incomeSource && <p className="text-xs text-red-500">{errors.incomeSource.message}</p>}
      </div>
    </div>
  );
}

// --- STEP 4: Parents Details ---
export function ParentsSection({ register, errors, control, setValue }: SectionProps) {
  const isSingleParent = useWatch({ control, name: "isSingleParent" });
  const singleParentType = useWatch({ control, name: "singleParentType" });
  const parentToPrint = useWatch({ control, name: "parentToPrint" });

  // Bonus: Clear opposite parent when single parent is selected
  useEffect(() => {
    if (isSingleParent === "YES") {
      if (singleParentType === "FATHER") {
        setValue?.("motherName", { firstName: "", middleName: "", lastName: "" });
      } else if (singleParentType === "MOTHER") {
        setValue?.("fatherName", { firstName: "", middleName: "", lastName: "" });
      }
    }
  }, [isSingleParent, singleParentType, setValue]);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[14px] font-semibold text-slate-900">Is mother/father a single parent?</p>
            <p className="text-[12px] text-slate-500">Provide only one parent's name if Yes.</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setValue?.("isSingleParent", "YES")}
              className={cn(
                "px-8 py-2 rounded-lg text-[11px] font-bold uppercase transition-all",
                isSingleParent === "YES" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setValue?.("isSingleParent", "NO");
                setValue?.("singleParentType", undefined);
              }}
              className={cn(
                "px-8 py-2 rounded-lg text-[11px] font-bold uppercase transition-all",
                isSingleParent === "NO" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              No
            </button>
          </div>
        </div>

        {isSingleParent === "YES" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Select Single Parent Type</p>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <label>
                <input type="radio" value="FATHER" {...register("singleParentType")} className="hidden peer" />
                <div className="p-3 text-center border rounded-xl cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50/5 text-[11px] font-bold uppercase tracking-widest text-slate-400 peer-checked:text-blue-600 transition-all">Father</div>
              </label>
              <label>
                <input type="radio" value="MOTHER" {...register("singleParentType")} className="hidden peer" />
                <div className="p-3 text-center border rounded-xl cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50/5 text-[11px] font-bold uppercase tracking-widest text-slate-400 peer-checked:text-blue-600 transition-all">Mother</div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Parents Names Rows */}
      <div className="space-y-8">
        {(isSingleParent === "NO" || singleParentType === "FATHER") && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Father's Details</p>
            <div className="grid grid-cols-3 gap-6">
              <SharedInput label="First Name" {...register("fatherName.firstName")} required />
              <SharedInput label="Middle Name" {...register("fatherName.middleName")} />
              <SharedInput label="Last Name" {...register("fatherName.lastName")} required />
            </div>
          </div>
        )}

        {(isSingleParent === "NO" || singleParentType === "MOTHER") && (
          <div className="space-y-4 animate-in fade-in duration-300 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Mother's Details</p>
            <div className="grid grid-cols-3 gap-6">
              <SharedInput label="First Name" {...register("motherName.firstName")} required />
              <SharedInput label="Middle Name" {...register("motherName.middleName")} />
              <SharedInput label="Last Name" {...register("motherName.lastName")} required />
            </div>
          </div>
        )}
      </div>

      {/* Name Choice Row */}
      <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Name to be printed on PAN card</p>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <label className="flex items-center gap-3 p-4 bg-white border rounded-xl cursor-pointer transition-all hover:border-blue-200">
            <input type="radio" value="FATHER" {...register("parentToPrint")} className="w-4 h-4 text-blue-600" />
            <span className="text-[13px] font-medium text-slate-700">Father's Name</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-white border rounded-xl cursor-pointer transition-all hover:border-blue-200">
            <input type="radio" value="MOTHER" {...register("parentToPrint")} className="w-4 h-4 text-blue-600" />
            <span className="text-[13px] font-medium text-slate-700">Mother's Name</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// --- STEP 5: Declaration & Verification ---
export function DeclarationSection({ register, errors, control, setValue }: SectionProps) {
  const [mounted, setMounted] = useState(false);
  const addressType = useWatch({ control, name: "addressType" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRepresentative = addressType === "REPRESENTATIVE";

  return (
    <div className="space-y-12">
      {/* 1. Document Checklist Row */}
      <div className="space-y-6">
        {/* Applicant Checklist */}
        <div className="space-y-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
            {isRepresentative ? "APPLICANT DOCUMENT CHECKLIST" : "Document Checklist"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "proofOfIdentity", label: "Identity Proof" },
              { id: "proofOfAddress", label: "Address Proof" },
              { id: "proofOfDob", label: "DOB Proof" }
            ].map(doc => (
              <label key={doc.id} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-200 hover:bg-slate-50 transition-all text-[13px] font-medium text-slate-600">
                <input type="checkbox" {...register(`documents.${doc.id}` as any)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                {doc.label}
              </label>
            ))}
          </div>
        </div>

        {/* Representative Checklist (Conditional) */}
        {isRepresentative && (
          <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">REPRESENTATIVE ASSESSEE DOCUMENT CHECKLIST</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "raProofOfIdentity", label: "Proof of Identity" },
                { id: "raProofOfAddress", label: "Proof of Address" }
              ].map(doc => (
                <label key={doc.id} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-200 hover:bg-slate-50 transition-all text-[13px] font-medium text-slate-600">
                  <input type="checkbox" {...register(`documents.${doc.id}` as any)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                  {doc.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. AO Code Details Row */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">AO Code Details</p>
        <div className="grid grid-cols-4 gap-6">
          <SharedInput label="Area Code" maxLength={3} {...register("aoCode.areaCode")} required placeholder="PNE" />
          <SharedInput label="AO Type" maxLength={2} {...register("aoCode.aoType")} required placeholder="W" />
          <SharedInput label="Range" maxLength={3} {...register("aoCode.rangeCode")} required placeholder="231" />
          <SharedInput label="AO No" maxLength={2} {...register("aoCode.aoNo")} required placeholder="1" />
        </div>
      </div>

      {/* 3. Declaration & Place Row */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Declaration & Verification</p>
        <div className="grid grid-cols-2 gap-6">
          <SharedInput label="Verification Place" placeholder="Mumbai" {...register("verification.place")} required />
          <div className="px-6 py-4 bg-slate-900 rounded-2xl relative overflow-hidden ring-1 ring-white/10 shadow-2xl flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-2 text-[9px] font-bold text-blue-400 uppercase tracking-tighter">Secure Matrix v2.4</div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Current Date</p>
            <p className="text-white font-mono text-base tracking-tight" suppressHydrationWarning>
              {mounted ? new Date().toLocaleDateString() : "---"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STEP 5: Representative Assessee Details ---
export function RepresentativeAssesseeSection({ register, errors, control }: SectionProps) {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Representative Name</p>
          <p className="text-[10px] text-slate-500 italic">Name of the person representing the applicant</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SharedInput label="First Name" {...register("raDetails.firstName")} required />
          <SharedInput label="Middle Name" {...register("raDetails.middleName")} />
          <SharedInput label="Last Name" {...register("raDetails.lastName")} required />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Identity Details (PAN or Aadhaar)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SharedInput label="RA PAN Number" placeholder="ABCDE1234F" {...register("raDetails.pan" as any)} />
          <SharedInput label="RA Aadhaar Number" placeholder="12 digits" {...register("raDetails.aadhaar" as any)} />
        </div>
        {errors.raDetails?.pan && <p className="text-[10px] text-red-500 font-medium italic">{errors.raDetails.pan.message}</p>}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">RA Contact Details</p>
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <div className="w-full lg:w-[80px]">
            <SharedInput label="Code" defaultValue="91" {...register("raDetails.countryCode" as any)} />
          </div>
          <div className="w-full lg:flex-1">
            <SharedInput label="Mobile Number" placeholder="10 digits" {...register("raDetails.mobile" as any)} required />
          </div>
          <div className="w-full lg:flex-1">
            <SharedInput label="Email ID" placeholder="name@example.com" type="email" {...register("raDetails.email" as any)} required />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">RA Landline Details (Optional)</p>
        <div className="flex gap-4">
          <div className="w-[100px]">
            <SharedInput label="STD Code" {...register("raDetails.stdCode" as any)} />
          </div>
          <div className="flex-1">
            <SharedInput label="Landline Number" {...register("raDetails.landline" as any)} />
          </div>
        </div>
      </div>
    </div>
  );
}
