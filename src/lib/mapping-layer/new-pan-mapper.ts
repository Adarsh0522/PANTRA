import { mapTextToBoxes, mapDateToParts, wrapTextByWords } from "./text-mapper";
import { PanFormData } from "../form-engine/schema";

/**
 * Maps the structured Form Data into the flat key-value structure
 * required by the PDF Config / Engine.
 */
export function mapFormToPDF(data: PanFormData): Record<string, any> {
  const dobParts = mapDateToParts(data.dob);

  const mapped: Record<string, any> = {
    // Identity
    first_name: data.firstName,
    middle_name: data.middleName || "",
    last_name: data.lastName,

    gender: data.gender,

    dob_day: dobParts?.day || "",
    dob_month: dobParts?.month || "",
    dob_year: dobParts?.year || "",

    // Aadhaar Number
    aadhaar: data.aadhaar,

    // Aadhaar Name Mapping (Word-based wrapping)
    ...(() => {
      const fullName = `${data.firstName} ${data.middleName || ""} ${data.lastName}`.replace(/\s+/g, " ").trim().toUpperCase();
      const wrapped = wrapTextByWords(fullName, 25);
      return {
        aadhaar_name_line1: wrapped.line1,
        aadhaar_name_line2: wrapped.line2,
      };
    })(),

    // Address - Residence
    address_flat: data.addresses?.residence?.flat || "",
    address_road: data.addresses?.residence?.road || "",
    address_post: data.addresses?.residence?.postOffice || "",
    address_area: data.addresses?.residence?.area || "",
    address_city: data.addresses?.residence?.city || "",
    address_state: data.addresses?.residence?.state || "",
    address_pincode: data.addresses?.residence?.pin || "",
    address_country: data.addresses?.residence?.country || "",

    // Address - Office (Strictly only if communication is OFFICE)
    office_flat: (data.addressType === "OFFICE") ? (data.addresses?.office?.flat || "") : "",
    office_road: (data.addressType === "OFFICE") ? (data.addresses?.office?.road || "") : "",
    office_post: (data.addressType === "OFFICE") ? (data.addresses?.office?.postOffice || "") : "",
    office_area: (data.addressType === "OFFICE") ? (data.addresses?.office?.area || "") : "",
    office_city: (data.addressType === "OFFICE") ? (data.addresses?.office?.city || "") : "",
    office_state: (data.addressType === "OFFICE") ? (data.addresses?.office?.state || "") : "",
    office_pincode: (data.addressType === "OFFICE") ? (data.addresses?.office?.pin || "") : "",
    office_country: (data.addressType === "OFFICE") ? (data.addresses?.office?.country || "") : "",

    // Residential Status (Match config: RESIDENT, NRI, RNOR)
    residential_status: data.residentialStatus === "NON_RESIDENT" ? "NRI" : (data.residentialStatus || "RESIDENT"),
    passport_number: data.passportNumber || "",

    // Contact
    country_code: data.contact?.countryCode || "91",
    mobile: data.contact?.mobile || "",
    email: data.contact?.email?.toUpperCase() || "",
    std_code: data.contact?.stdCode || "",
    landline_no: data.contact?.landline || "",

    // Income (Robust mapping handling both single selection and legacy array data)
    ...(() => {
      const rawIncome = data.incomeSource;
      const src = Array.isArray(rawIncome) ? rawIncome[0] : rawIncome;

      return {
        income: (() => {
          switch (src) {
            case "salary": return "SALARY";
            case "business": return "BUSINESS";
            case "house_property": return "HOUSE PROPERTY";
            case "capital": return "CAPITAL GAINS";
            case "other": return "OTHER";
            case "none": return "NO INCOME";
            default: return null;
          }
        })(),
        income_salary: src === "salary" ? "YES" : "NO",
        income_business: src === "business" ? "YES" : "NO",
        income_house: src === "house_property" ? "YES" : "NO",
        income_capital: src === "capital" ? "YES" : "NO",
        income_other: src === "other" ? "YES" : "NO",
        income_none: src === "none" ? "YES" : "NO",
      };
    })(),

    // Parents
    single_mother: data.isSingleParent ? "YES" : "NO",
    father_first: data.fatherName?.firstName || "",
    father_middle: data.fatherName?.middleName || "",
    father_last: data.fatherName?.lastName || "",
    mother_first: data.motherName?.firstName || "",
    mother_middle: data.motherName?.middleName || "",
    mother_last: data.motherName?.lastName || "",
    print_name: data.parentToPrint || "FATHER",

    // AO Code
    ao_area: data.aoCode?.areaCode || "",
    ao_type: data.aoCode?.aoType || "",
    ao_range: data.aoCode?.rangeCode || "",
    ao_no: data.aoCode?.aoNo || "",

    // RA Details (Only if Representative selected)
    ...(() => {
      if (data.addressType !== "REPRESENTATIVE") {
        return {
          ra_first: "", ra_middle: "", ra_last: "", ra_pan_no: "", ra_aadhaar: "",
          ra_address1: "", ra_address2: "", ra_post: "", ra_area: "", ra_city: "", ra_state: "", ra_pincode: "", ra_country: ""
        };
      }
      return {
        ra_first: data.raDetails?.firstName || "",
        ra_middle: data.raDetails?.middleName || "",
        ra_last: data.raDetails?.lastName || "",
        ra_pan_no: data.raDetails?.pan || "",
        ra_aadhaar: data.raDetails?.aadhaar || "",
        ra_address1: data.addresses?.representative?.flat || "",
        ra_address2: data.addresses?.representative?.road || "",
        ra_post: data.addresses?.representative?.postOffice || "",
        ra_area: data.addresses?.representative?.area || "",
        ra_city: data.addresses?.representative?.city || "",
        ra_state: data.addresses?.representative?.state || "",
        ra_pincode: data.addresses?.representative?.pin || "",
        ra_country: data.addresses?.representative?.country || "",
        // RA Contact
        ra_country_code: data.raDetails?.countryCode || "91",
        ra_mobile: data.raDetails?.mobile || "",
        ra_email: data.raDetails?.email?.toUpperCase() || "",
        ra_std_code: data.raDetails?.stdCode || "",
        ra_landline: data.raDetails?.landline || "",
      };
    })(),

    // Communications
    comm_address: data.addressType,

    // Docs
    app_doc_poi: data.documents?.proofOfIdentity ? "YES" : "NO",
    app_doc_poa: data.documents?.proofOfAddress ? "YES" : "NO",
    app_doc_dob: data.documents?.proofOfDob ? "YES" : "NO",
    ra_doc_poi: data.documents?.raProofOfIdentity ? "YES" : "NO",
    ra_doc_poa: data.documents?.raProofOfAddress ? "YES" : "NO",

    // Verification (Aligned with config decl_ fields)
    decl_name: (data.verification?.name || "").toUpperCase(),
    decl_place: (data.verification?.place || "").toUpperCase(),
    decl_date: data.verification?.date || "",
    decl_capacity: (data.verification?.pronoun || "himself").toUpperCase(),
  };

  return mapped;
}
