import { mapDateToParts, wrapTextByWords } from "./text-mapper";
import { PanCorrectionData } from "../form-engine/correction-schema";

/**
 * Maps the structured PAN Correction Form Data into the flat key-value structure
 * required by the PDF Config / Engine.
 * 
 * STRICT RULE: Only map fields if correctionFields[field] is true. 
 * Otherwise, pass "".
 */
export function mapCorrectionFormToPDF(data: PanCorrectionData): Record<string, any> {
  const { correctionFields } = data;
  const dobParts = data.dob ? mapDateToParts(data.dob) : null;

  const mapped: Record<string, any> = {
    // OLD PAN - MANDATORY
    old_pan: data.oldPan || "",

    // Ticks (Individual & Group flags based on user request)
    is_name_changed: (correctionFields.firstName || correctionFields.middleName || correctionFields.lastName) ? "YES" : "",
    is_dob_changed: correctionFields.dob ? "YES" : "",
    is_gender_changed: correctionFields.gender ? "YES" : "",
    is_aadhaar_changed: correctionFields.aadhaar ? "YES" : "",
    is_address_changed: correctionFields.address ? "YES" : "",
    is_contact_changed: (correctionFields.mobile || correctionFields.email) ? "YES" : "",
    is_father_name_changed: correctionFields.fatherName ? "YES" : "",
    is_mother_name_changed: correctionFields.motherName ? "YES" : "",

    // Specific tick fields requested by user (for future-proofing or specific config keys)
    first_name_tick: correctionFields.firstName ? "YES" : "",
    dob_tick: correctionFields.dob ? "YES" : "",
    gender_tick: correctionFields.gender ? "YES" : "",
    address_tick: correctionFields.address ? "YES" : "",
    contact_tick: (correctionFields.mobile || correctionFields.email) ? "YES" : "",

    // Identity Mapping (Strict Blank Rule)
    first_name: correctionFields.firstName ? (data.firstName || "") : "",
    middle_name: correctionFields.middleName ? (data.middleName || "") : "",
    last_name: correctionFields.lastName ? (data.lastName || "") : "",
    
    gender: correctionFields.gender ? (data.gender || "") : "",
    
    dob_day: (correctionFields.dob && dobParts) ? dobParts.day : "",
    dob_month: (correctionFields.dob && dobParts) ? dobParts.month : "",
    dob_year: (correctionFields.dob && dobParts) ? dobParts.year : "",

    // Aadhaar Mapping
    aadhaar: correctionFields.aadhaar ? (data.aadhaar || "") : "",
    ...(() => {
      // Aadhaar name mapping - only if aadhaar or name is being corrected? 
      // Usually, if we corrected Name, we might want to update it everywhere.
      // But let's stick to the rule: only map if selected.
      if (!correctionFields.firstName && !correctionFields.lastName) return {};
      const fullName = `${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`.replace(/\s+/g, " ").trim().toUpperCase();
      const wrapped = wrapTextByWords(fullName, 25);
      return {
        aadhaar_name_line1: wrapped.line1,
        aadhaar_name_line2: wrapped.line2,
      };
    })(),

    // Address Mapping (Strict Blank Rule)
    ...(() => {
      if (!correctionFields.address) {
        return {
          address_flat: "", address_road: "", address_post: "", address_area: "",
          address_city: "", address_state: "", address_pincode: "", address_country: "",
          comm_address: ""
        };
      }
      
      const type = data.addressType || "RESIDENCE";
      const addr = type === "RESIDENCE" ? data.addresses?.residence : data.addresses?.office;
      
      return {
        address_flat: addr?.flat || "",
        address_road: addr?.road || "",
        address_post: addr?.postOffice || "",
        address_area: addr?.area || "",
        address_city: addr?.city || "",
        address_state: addr?.state || "",
        address_pincode: addr?.pin || "",
        address_country: addr?.country || "INDIA",
        comm_address: type
      };
    })(),

    // Contact Mapping (Printable Fields)
    country_code: (correctionFields.mobile || correctionFields.email) ? (data.contact?.isdCode || "91") : "",
    mobile: correctionFields.mobile ? (data.contact?.mobile || "") : "",
    email: correctionFields.email ? (data.contact?.email || "") : "",

    // Optional Field Mapping (Strict Sync with PDF Config)
    is_passport_changed: correctionFields.passport ? "YES" : "",
    passport_number: correctionFields.passport ? (data.passportNumber || "") : "",
    
    is_taxpayer_identification_number_changed: correctionFields.tin ? "YES" : "",
    taxpayer_identification_number: correctionFields.tin ? (data.tin || "") : "",
    
    country_isd: correctionFields.landline ? (data.contact?.isdCode || "") : "",
    std_code: correctionFields.landline ? (data.contact?.stdCode || "") : "",
    landline_no: correctionFields.landline ? (data.contact?.landline || "") : "",

    // Parents Mapping
    father_first: correctionFields.fatherName ? (data.fatherName?.firstName || "") : "",
    father_middle: correctionFields.fatherName ? (data.fatherName?.middleName || "") : "",
    father_last: correctionFields.fatherName ? (data.fatherName?.lastName || "") : "",
    
    mother_first: correctionFields.motherName ? (data.motherName?.firstName || "") : "",
    mother_middle: correctionFields.motherName ? (data.motherName?.middleName || "") : "",
    mother_last: correctionFields.motherName ? (data.motherName?.lastName || "") : "",
    
    print_name: data.parentToPrint || "FATHER",

    // Document Proofs
    app_doc_poi: data.documents?.proofOfIdentity ? "YES" : "NO",
    app_doc_poa: data.documents?.proofOfAddress ? "YES" : "NO",
    app_doc_dob: data.documents?.proofOfDateOfBirth ? "YES" : "NO",
    app_doc_other: data.documents?.otherChangesProof ? "YES" : "NO",
    app_cop_pan: data.documents?.copyOfPan ? "YES" : "NO",

    // AO Code - usually preserved or required, but let's follow the rule
    ao_area: data.aoCode?.areaCode || "",
    ao_type: data.aoCode?.aoType || "",
    ao_range: data.aoCode?.rangeCode || "",
    ao_no: data.aoCode?.aoNo || "",

    // Verification
    decl_name: (data.verification?.name || `${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`.replace(/\s+/g, " ").trim()).toUpperCase(),
    decl_place: (data.verification?.place || "").toUpperCase(),
    decl_date: data.verification?.date || "",
    decl_capacity: (data.verification?.pronoun || "himself").toUpperCase(),
  };

  return mapped;
}
