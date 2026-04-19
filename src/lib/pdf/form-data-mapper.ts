import { mapDateToParts } from "@/lib/mapping-layer/text-mapper";

type PanFormInput = {
  name?: string;
  dob?: string;
  gender?: string;
  mobile?: string;
  resAddress?: string;
  officeAddress?: string;
  aadhaar?: string;
  incomeType?: string;
};

type AddressFields = {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

const GRID_LINE_LENGTH = 25;
const EMPTY_ADDRESS: AddressFields = {
  line1: "",
  line2: "",
  line3: "",
  line4: "",
  line5: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
};

function sanitizeGridText(value: string | undefined) {
  return (value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9/@&().,\- ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizePlainText(value: string | undefined) {
  return (value || "").trim();
}

function wrapTokens(tokens: string[], lineCount: number, lineLength: number) {
  const lines = Array.from({ length: lineCount }, () => "");

  for (const token of tokens) {
    const cleanToken = sanitizeGridText(token);
    if (!cleanToken) continue;

    let placed = false;

    for (let index = 0; index < lines.length; index += 1) {
      const current = lines[index];
      const candidate = current ? `${current} ${cleanToken}` : cleanToken;

      if (candidate.length <= lineLength) {
        lines[index] = candidate;
        placed = true;
        break;
      }
    }

    if (!placed) {
      for (let index = 0; index < lines.length; index += 1) {
        if (!lines[index]) {
          lines[index] = cleanToken.slice(0, lineLength);
          break;
        }
      }
    }
  }

  return lines;
}

function splitName(name: string | undefined) {
  const parts = sanitizeGridText(name).split(" ").filter(Boolean);

  if (parts.length === 0) {
    return {
      first_name: "",
      middle_name: "",
      last_name: "",
      aadhaar_name_line1: "",
      aadhaar_name_line2: "",
    };
  }

  if (parts.length === 1) {
    const single = parts[0];
    return {
      first_name: single,
      middle_name: "",
      last_name: "",
      aadhaar_name_line1: single,
      aadhaar_name_line2: "",
    };
  }

  const first_name = parts[0];
  const last_name = parts[parts.length - 1];
  const middle_name = parts.slice(1, -1).join(" ");
  const aadhaarLines = wrapTokens(parts, 2, GRID_LINE_LENGTH);

  return {
    first_name,
    middle_name,
    last_name,
    aadhaar_name_line1: aadhaarLines[0],
    aadhaar_name_line2: aadhaarLines[1],
  };
}

function parseAddress(rawAddress: string | undefined): AddressFields {
  const normalized = sanitizeGridText(rawAddress);
  if (!normalized) return EMPTY_ADDRESS;

  const segments = normalized
    .split(",")
    .map((segment) => sanitizeGridText(segment))
    .filter(Boolean);

  const parts = segments.length > 0 ? segments : normalized.split(" ").filter(Boolean);
  const pincode = parts.find((part) => /^\d{6}$/.test(part)) || "";
  const withoutPincode = parts.filter((part) => part !== pincode);
  const countryIndex = withoutPincode.findIndex((part) => ["INDIA", "BHARAT"].includes(part));
  const country = countryIndex >= 0 ? withoutPincode[countryIndex] : "";
  const withoutCountry = withoutPincode.filter((_, index) => index !== countryIndex);

  let state = "";
  let city = "";
  let lineParts = withoutCountry;

  if (segments.length >= 3) {
    state = withoutCountry[withoutCountry.length - 1] || "";
    city = withoutCountry[withoutCountry.length - 2] || "";
    lineParts = withoutCountry.slice(0, -2);
  }

  const wrappedLines = wrapTokens(lineParts, 5, GRID_LINE_LENGTH);

  return {
    line1: wrappedLines[0],
    line2: wrappedLines[1],
    line3: wrappedLines[2],
    line4: wrappedLines[3],
    line5: city || wrappedLines[4],
    city,
    state,
    pincode,
    country,
  };
}

function mapIncome(incomeType: string | undefined) {
  switch ((incomeType || "").toLowerCase()) {
    case "salary":
      return "SALARY";
    case "business":
      return "BUSINESS";
    case "house_property":
      return "HOUSE PROPERTY";
    case "other":
      return "OTHER";
    case "none":
      return "NO INCOME";
    default:
      return "";
  }
}

export function mapPanFormDataToPdfFields(formData: PanFormInput) {
  const nameFields = splitName(formData.name);
  const residentialAddress = parseAddress(formData.resAddress);
  const officeAddress = parseAddress(formData.officeAddress || formData.resAddress);
  const dob = mapDateToParts(formData.dob);
  const communicationAddress =
    formData.officeAddress && sanitizeGridText(formData.officeAddress) !== sanitizeGridText(formData.resAddress)
      ? "OFFICE"
      : "RESIDENCE";

  return {
    ...nameFields,
    aadhaar: sanitizeGridText(formData.aadhaar),
    dob_day: dob?.day || "",
    dob_month: dob?.month || "",
    dob_year: dob?.year || "",
    gender: sanitizeGridText(formData.gender),
    mobile: sanitizeGridText(formData.mobile),
    country_code: "91",
    address_flat: residentialAddress.line1,
    address_road: residentialAddress.line2,
    address_post: residentialAddress.line3,
    address_area: residentialAddress.line4,
    address_city: residentialAddress.city || residentialAddress.line5,
    address_state: residentialAddress.state,
    address_pincode: residentialAddress.pincode,
    address_country: residentialAddress.country || "INDIA",
    office_flat: officeAddress.line1,
    office_road: officeAddress.line2,
    office_post: officeAddress.line3,
    office_area: officeAddress.line4,
    office_city: officeAddress.city || officeAddress.line5,
    office_state: officeAddress.state,
    office_pincode: officeAddress.pincode,
    office_country: officeAddress.country || "INDIA",
    residential_status: "RESIDENT",
    comm_address: communicationAddress,
    income: mapIncome(formData.incomeType),
    decl_name: sanitizePlainText(formData.name),
    decl_place: sanitizePlainText(residentialAddress.city || residentialAddress.state),
  };
}
