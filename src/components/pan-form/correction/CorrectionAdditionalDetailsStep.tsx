"use client";

import { useEffect, useState } from "react";
import { UseFormRegister, FieldErrors, Control, useWatch, UseFormSetValue } from "react-hook-form";
import { PanCorrectionData } from "@/lib/form-engine/correction-schema";
import { SharedInput } from "../SharedInput";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProps {
  register: UseFormRegister<PanCorrectionData>;
  errors: FieldErrors<PanCorrectionData>;
  control: Control<PanCorrectionData>;
  setValue: UseFormSetValue<PanCorrectionData>;
}

// --- STEP 3: Residential Status, Contact & Income ---
export function CorrectionContactIncomeSection({ register, errors, control, setValue }: SectionProps) {
  const mobile = useWatch({ control, name: "contact.mobile" });
  const email = useWatch({ control, name: "contact.email" });
  const passportNumber = useWatch({ control, name: "passportNumber" });
  const tin = useWatch({ control, name: "tin" });
  const landline = useWatch({ control, name: "contact.landline" });

  // Background correction activation (Dynamic Toggle)
  useEffect(() => {
    setValue("correctionFields.mobile", !!(mobile && mobile.length > 0), { shouldValidate: true });
    setValue("correctionFields.email", !!(email && email.length > 0), { shouldValidate: true });
    setValue("correctionFields.passport", !!(passportNumber && passportNumber.length > 0), { shouldValidate: true });
    setValue("correctionFields.tin", !!(tin && tin.length > 0), { shouldValidate: true });
    setValue("correctionFields.landline", !!(landline && landline.length > 0), { shouldValidate: true });
  }, [mobile, email, passportNumber, tin, landline, setValue]);

  return (
    <div className="space-y-10">
      {/* 1. Identification (Passport & TIN) */}
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Foreign Identification (If Any)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SharedInput 
            label="Passport Number" 
            placeholder="For NRIs / Foreign Citizens" 
            {...register("passportNumber")} 
            error={errors.passportNumber} 
          />
          <SharedInput 
            label="Taxpayer Id Number (TIN)" 
            placeholder="TIN in Country of Residence" 
            {...register("tin")} 
            error={errors.tin} 
          />
        </div>
      </div>

      {/* 2. Contact Row */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Contact Information</p>
        <div className="space-y-6">
          {/* Row 1: Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <SharedInput label="Country Code" defaultValue="91" {...register("contact.isdCode" as any)} required />
            </div>
            <div className="md:col-span-3">
              <SharedInput label="Mobile Number" placeholder="10 digits" {...register("contact.mobile" as any)} error={errors.contact?.mobile} required />
            </div>
          </div>

          {/* Row 2: Email */}
          <div className="w-full">
            <SharedInput label="Email ID" placeholder="name@example.com" type="email" {...register("contact.email" as any)} error={errors.contact?.email} required />
          </div>

          {/* Row 3: Landline */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end pt-4 border-t border-slate-100">
            <div className="md:col-span-1">
              <SharedInput label="Country/ISD" defaultValue="91" {...register("contact.isdCode" as any)} />
            </div>
            <div className="md:col-span-1">
              <SharedInput label="Area/STD" placeholder="Code" {...register("contact.stdCode" as any)} />
            </div>
            <div className="md:col-span-4">
              <SharedInput label="Landline Number" placeholder="Optional" {...register("contact.landline" as any)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STEP 4: Parents Details ---
export function CorrectionParentsSection({ register, errors, control, setValue }: SectionProps) {
  const fatherFirst = useWatch({ control, name: "fatherName.firstName" });
  const motherFirst = useWatch({ control, name: "motherName.firstName" });

  useEffect(() => {
    if (fatherFirst && fatherFirst.length > 0) setValue("correctionFields.fatherName", true, { shouldValidate: true });
    if (motherFirst && motherFirst.length > 0) setValue("correctionFields.motherName", true, { shouldValidate: true });
  }, [fatherFirst, motherFirst, setValue]);

  return (
    <div className="space-y-10">

      {/* Names Grid */}
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Father's Details</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SharedInput label="First Name" {...register("fatherName.firstName")} error={errors.fatherName?.firstName} required />
              <SharedInput label="Middle Name" {...register("fatherName.middleName")} />
              <SharedInput label="Last Name" {...register("fatherName.lastName")} error={errors.fatherName?.lastName} required />
            </div>
          </div>
        <div className="space-y-4 pt-8 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Mother's Details</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SharedInput label="First Name" {...register("motherName.firstName")} error={errors.motherName?.firstName} required />
            <SharedInput label="Middle Name" {...register("motherName.middleName")} />
            <SharedInput label="Last Name" {...register("motherName.lastName")} error={errors.motherName?.lastName} required />
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">Name to be printed on PAN card</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
          <label className="flex items-center gap-3 p-4 bg-white border rounded-xl cursor-pointer">
            <input type="radio" value="FATHER" {...register("parentToPrint")} className="w-4 h-4 text-blue-600" />
            <span className="text-[13px] font-medium text-slate-700">Father's Name</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-white border rounded-xl cursor-pointer">
            <input type="radio" value="MOTHER" {...register("parentToPrint")} className="w-4 h-4 text-blue-600" />
            <span className="text-[13px] font-medium text-slate-700">Mother's Name</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// --- STEP 5: Declaration & Verification ---
export function CorrectionDeclarationSection({ register, errors, control, setValue }: SectionProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Documents submitted as Proof</p>
        <p className="text-[13px] text-slate-500 leading-relaxed italic">
          Documents submitted as Proof of Identity, Proof of Address, Proof of Date of Birth of the Applicant & Proof of Change in support of proposed changes / corrections requested by the Applicant
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: "documents.proofOfIdentity", label: "(i) Proof of Identity" },
            { id: "documents.proofOfAddress", label: "(ii) Proof of Address" },
            { id: "documents.proofOfDateOfBirth", label: "(iii) Proof of Date of Birth" },
            { id: "documents.otherChangesProof", label: "(iv) Documentary proof in support of other changes" },
            { id: "documents.copyOfPan", label: "(v) Copy of PAN" }
          ].map(doc => (
            <label key={doc.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" {...register(doc.id as any)} className="w-4 h-4 rounded text-blue-600" />
              <span className="text-[12px] font-medium text-slate-700">{doc.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Declaration & Verification</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <SharedInput label="Verification Place" placeholder="Mumbai" {...register("verification.place")} required />
          <div className="px-6 py-3 bg-slate-900 rounded-2xl relative overflow-hidden ring-1 ring-white/10 shadow-lg h-[58px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-2 text-[8px] font-bold text-blue-400 uppercase tracking-tighter">Secure Matrix</div>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Current Date</p>
            <p className="text-white font-mono text-sm tracking-tight" suppressHydrationWarning>
              {mounted ? new Date().toLocaleDateString() : "---"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
