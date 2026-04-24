import { useForm, useWatch, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { panFormSchema, PanFormData } from "@/lib/form-engine/schema";
import { calculateAge } from "@/lib/mapping-layer/text-mapper";

// Helper to get current date in dd-mm-yyyy format
const getTodayFormatted = () => {
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const y = today.getFullYear();
  return `${d}-${m}-${y}`;
};

export function usePanFormLogic(initialProfile?: any): UseFormReturn<PanFormData, any, PanFormData> {
  const form = useForm<PanFormData, any, PanFormData>({
    resolver: zodResolver(panFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      isMinor: false,
      isSingleParent: "NO",
      aadhaar: "",
      addressType: "RESIDENCE",
      raSameAsResidence: false,
      residentialStatus: "RESIDENT",
      passportNumber: "",
      tin: "",
      incomeSource: "none",
      contact: {
        countryCode: "91",
        mobile: "",
        email: "",
        stdCode: "",
        landline: "",
      },
      aoCode: {
        areaCode: "",
        aoType: "",
        rangeCode: "",
        aoNo: "",
      },
      hasRA: false,
      documents: {
        proofOfIdentity: true,
        proofOfAddress: true,
        proofOfDob: true,
      },
      verification: {
        name: "",
        place: "",
        date: getTodayFormatted(),
        pronoun: "himself",
      },
    },
  });

  const { setValue, control, watch } = form;

  // Watchers
  const dob = useWatch({ control, name: "dob" });
  const isMinor = useWatch({ control, name: "isMinor" });
  const raSameAsResidence = useWatch({ control, name: "raSameAsResidence" });
  const residenceAddress = useWatch({ control, name: "addresses.residence" });
  const addressType = useWatch({ control, name: "addressType" });

  // Auto-fill Profile Data
  useEffect(() => {
    let parsed: any = null;

    // Auto-fill logic: if we have a profile from the DB, fill any blank strings
    // But ONLY if the user hasn't explicitly set them yet.
    if (initialProfile) {
      const p = initialProfile;
      parsed = {};

      // Auto-fill Basic Details into Contact
      if (!parsed.contact) parsed.contact = {};
      if (!parsed.contact.email && p.email) parsed.contact.email = p.email;

      // NOTE: Do NOT auto-fill firstName/lastName from profile.
      // User must enter these manually in the form.

      // Auto-fill Office Address
      if (!parsed.addresses) parsed.addresses = {};
      if (!parsed.addresses.office) parsed.addresses.office = {};

      const o = parsed.addresses.office;
      if (!o.flat && p.flat_door) o.flat = p.flat_door;
      if (!o.road && p.road_street) o.road = p.road_street;
      if (!o.area && p.area_locality) o.area = p.area_locality;
      if (!o.city && p.district_city) o.city = p.district_city;
      if (!o.state && p.state_ut) o.state = p.state_ut;
      if (!o.postOffice && p.post_office) o.postOffice = p.post_office;
      if (!o.pin && p.pin_code) o.pin = p.pin_code;
      if (!o.country) o.country = p.country || "INDIA";

      // Auto-fill AO Code Defaults
      if (!parsed.aoCode) parsed.aoCode = {};
      const ao = parsed.aoCode;
      if (!ao.areaCode && p.ao_area_code) ao.areaCode = p.ao_area_code;
      if (!ao.aoType && p.ao_type) ao.aoType = p.ao_type;
      if (!ao.rangeCode && p.ao_range_code) ao.rangeCode = p.ao_range_code;
      if (!ao.aoNo && p.ao_number) ao.aoNo = p.ao_number;
      // Preserve critical defaults that form.reset() would otherwise wipe
      parsed.incomeSource = parsed.incomeSource || "none";
      parsed.isSingleParent = parsed.isSingleParent || "NO";
      parsed.parentToPrint = parsed.parentToPrint || "FATHER";
      parsed.addressType = parsed.addressType || "RESIDENCE";
      parsed.residentialStatus = parsed.residentialStatus || "RESIDENT";
      parsed.isMinor = parsed.isMinor || false;
      parsed.hasRA = parsed.hasRA || false;
      parsed.raSameAsResidence = parsed.raSameAsResidence || false;
      if (!parsed.contact.countryCode) parsed.contact.countryCode = "91";
      if (!parsed.documents) parsed.documents = { proofOfIdentity: true, proofOfAddress: true, proofOfDob: true };
      if (!parsed.verification) parsed.verification = { name: "", place: "", date: getTodayFormatted(), pronoun: "himself" };
    }

    if (parsed) {
      form.reset(parsed);
    }
  }, [initialProfile]);

  // Age calculation and isMinor auto-toggle
  useEffect(() => {
    if (dob) {
      const age = calculateAge(dob);
      const minor = age < 18;
      if (minor !== isMinor) {
        setValue("isMinor", minor);
        if (minor) {
          // Minor → auto-set to REPRESENTATIVE
          setValue("hasRA", true);
          setValue("addressType", "REPRESENTATIVE");
        } else {
          // No longer minor → revert to RESIDENCE
          setValue("addressType", "RESIDENCE");
          setValue("hasRA", false);
        }
      }
    }
  }, [dob, isMinor, setValue]);

  // Sync hasRA with addressType
  useEffect(() => {
    if (addressType === "REPRESENTATIVE") {
      setValue("hasRA", true);
    } else {
      setValue("hasRA", false);
    }
  }, [addressType, setValue]);

  // RA Address Sync
  useEffect(() => {
    if (raSameAsResidence && residenceAddress) {
      setValue("addresses.representative", residenceAddress);
    }
  }, [raSameAsResidence, residenceAddress, setValue]);

  // Data Cleanup: Clear RA details if addressType changes away from REPRESENTATIVE
  useEffect(() => {
    if (addressType !== "REPRESENTATIVE") {
      setValue("raDetails", undefined);
      setValue("addresses.representative", undefined);
      setValue("raSameAsResidence", false);
      setValue("documents.raProofOfIdentity", false);
      setValue("documents.raProofOfAddress", false);
    }
  }, [addressType, setValue]);

  // Data Cleanup: Clear office if not communication address
  useEffect(() => {
    if (addressType === "RESIDENCE") {
      setValue("addresses.office", undefined);
    }
  }, [addressType, setValue]);

  // Data Cleanup: Clear passport if status is RESIDENT
  const residentialStatus = watch("residentialStatus");
  useEffect(() => {
    if (residentialStatus === "RESIDENT") {
      setValue("passportNumber", "");
    }
  }, [residentialStatus, setValue]);

  // Data Cleanup: Clear single parent details
  const isSingleParent = useWatch({ control, name: "isSingleParent" });
  const parentToPrint = useWatch({ control, name: "parentToPrint" });
  useEffect(() => {
    if (isSingleParent === "YES") {
      if (parentToPrint === "FATHER") {
        setValue("motherName", undefined);
      } else {
        setValue("fatherName", undefined);
      }
    }
  }, [isSingleParent, parentToPrint, setValue]);

  // Auto-fill Verification Details
  const firstName = watch("firstName");
  const middleName = watch("middleName");
  const lastName = watch("lastName");
  const gender = watch("gender");
  const raFirstName = watch("raDetails.firstName");
  const raMiddleName = watch("raDetails.middleName");
  const raLastName = watch("raDetails.lastName");

  useEffect(() => {
    // 1. Name construction
    let name = "";
    if (isMinor || addressType === "REPRESENTATIVE") {
      name = `${raFirstName || ""} ${raMiddleName || ""} ${raLastName || ""}`.trim();
    } else {
      name = `${firstName || ""} ${middleName || ""} ${lastName || ""}`.trim();
    }
    if (name) setValue("verification.name", name);

    // 2. Pronoun (gender-based)
    let pronoun = "himself";
    if (gender === "FEMALE") pronoun = "herself";
    if (gender === "TRANSGENDER") pronoun = "themself";
    setValue("verification.pronoun", pronoun);

    // 3. Date (forced to dd-mm-yyyy)
    setValue("verification.date", getTodayFormatted());
  }, [firstName, middleName, lastName, gender, isMinor, addressType, raFirstName, raMiddleName, raLastName, setValue]);

  return form;
}
