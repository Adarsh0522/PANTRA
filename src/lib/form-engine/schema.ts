import { z } from "zod";

export const addressSchema = z.object({
  flat: z.string().min(1, "Flat/Door/Building is required"),
  road: z.string().min(1, "Road/Street/Block/Sector is required"),
  postOffice: z.string().min(1, "Post Office is required"),
  area: z.string().min(1, "Area/Locality/Town/City is required"),
  city: z.string().min(1, "District/City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().default("INDIA"),
  pin: z.string().regex(/^\d{6}$/, "Must be a 6-digit PIN code"),
});

export const panFormObject = z.object({
  // Step 1: Identity
  firstName: z.string().min(1, "First Name is required"),
  middleName: z.string().min(1, "Middle Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  gender: z.enum(["MALE", "FEMALE", "TRANSGENDER"], {
    message: "Gender is required",
  }),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  isMinor: z.boolean(),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),

  // Step 2: Address
  addressType: z.enum(["RESIDENCE", "OFFICE", "REPRESENTATIVE"], {
    message: "Address type is required",
  }),
  addresses: z.object({
    residence: addressSchema,
    office: addressSchema.partial().optional(),
    representative: addressSchema.partial().optional(),
  }),
  raSameAsResidence: z.boolean(),

  // Step 3: Additional Details
  residentialStatus: z.enum(["RESIDENT", "NON_RESIDENT", "RNOR"]),
  passportNumber: z.string().optional(),
  tin: z.string().optional(),

  contact: z.object({
    countryCode: z.string().max(3, "Max 3 digits"),
    mobile: z.string().regex(/^\d{10}$/, "Must be a 10-digit mobile number"),
    email: z.string().email("Invalid email address"),
    stdCode: z.string().max(3, "Max 3 digits").optional(),
    landline: z.string().max(8, "Max 8 digits").optional(),
  }),

  incomeSource: z.enum(["salary", "business", "house_property", "capital", "other", "none"]),

  isSingleParent: z.enum(["YES", "NO"]),
  singleParentType: z.enum(["FATHER", "MOTHER"]).optional(),
  fatherName: z.object({
    firstName: z.string().optional(),
    middleName: z.string().min(1, "Middle Name is required"),
    lastName: z.string().optional(),
  }).optional(),
  motherName: z.object({
    firstName: z.string().optional(),
    middleName: z.string().min(1, "Middle Name is required"),
    lastName: z.string().optional(),
  }).optional(),
  parentToPrint: z.enum(["FATHER", "MOTHER"]),

  // RA Details
  hasRA: z.boolean(),
  raDetails: z.object({
    firstName: z.string().optional(),
    middleName: z.string().min(1, "Middle Name is required"),
    lastName: z.string().optional(),
    pan: z.string().optional(),
    aadhaar: z.string().optional(),
    countryCode: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().optional(),
    stdCode: z.string().optional(),
    landline: z.string().optional(),
  }).optional(),

  // AO Code
  aoCode: z.object({
    areaCode: z.string().max(3, "Max 3 digits"),
    aoType: z.string().max(2, "Max 2 characters"),
    rangeCode: z.string().max(3, "Max 3 digits"),
    aoNo: z.string().max(2, "Max 2 digits"),
  }),

  // Documents
  documents: z.object({
    proofOfIdentity: z.boolean(),
    proofOfAddress: z.boolean(),
    proofOfDob: z.boolean(),
    raProofOfIdentity: z.boolean().optional(),
    raProofOfAddress: z.boolean().optional(),
  }),

  // Step 4: Verification
  verification: z.object({
    name: z.string().min(1, "Name is required"),
    place: z.string().min(1, "Place is required"),
    date: z.string(),
    pronoun: z.string(),
  }),
});

export const panFormSchema: z.ZodType<PanFormData, any, any> = panFormObject.superRefine((data, ctx) => {
  // Passport Rule
  if (data.residentialStatus !== "RESIDENT" && !data.passportNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passport number is required",
      path: ["passportNumber"],
    });
  }

  // Representative Assessee (RA) Rules
  if (data.addressType === "REPRESENTATIVE") {
    const ra = data.raDetails;
    if (!ra?.firstName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["raDetails", "firstName"] });
    }
    if (!ra?.middleName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["raDetails", "middleName"] });
    }
    if (!ra?.lastName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["raDetails", "lastName"] });
    }
    if (!ra?.pan && !ra?.aadhaar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either PAN or Aadhaar is required for Representative",
        path: ["raDetails", "pan"]
      });
    }
    if (!ra?.mobile) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["raDetails", "mobile"] });
    }
    if (!ra?.email) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["raDetails", "email"] });
    }

    // RA Document Proofs
    if (!data.documents?.raProofOfIdentity) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["documents", "raProofOfIdentity"] });
    }
    if (!data.documents?.raProofOfAddress) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["documents", "raProofOfAddress"] });
    }
  }

  // Parents Validation
  const isSingle = data.isSingleParent === "YES";

  if (isSingle) {
    if (!data.singleParentType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["singleParentType"],
        message: "Select parent type",
      });
    }

    if (data.singleParentType === "FATHER") {
      if (!data.fatherName?.firstName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fatherName", "firstName"], message: "Required" });
      }
      if (!data.fatherName?.middleName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fatherName", "middleName"], message: "Required" });
      }
      if (!data.fatherName?.lastName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fatherName", "lastName"], message: "Required" });
      }
    }

    if (data.singleParentType === "MOTHER") {
      if (!data.motherName?.firstName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["motherName", "firstName"], message: "Required" });
      }
      if (!data.motherName?.middleName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["motherName", "middleName"], message: "Required" });
      }
      if (!data.motherName?.lastName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["motherName", "lastName"], message: "Required" });
      }
    }

  } else {
    // BOTH parents required
    if (!data.fatherName?.firstName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fatherName", "firstName"], message: "Required" });
    }
    if (!data.fatherName?.middleName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fatherName", "middleName"], message: "Required" });
    }
    if (!data.fatherName?.lastName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fatherName", "lastName"], message: "Required" });
    }
    if (!data.motherName?.firstName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["motherName", "firstName"], message: "Required" });
    }
    if (!data.motherName?.middleName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["motherName", "middleName"], message: "Required" });
    }
    if (!data.motherName?.lastName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["motherName", "lastName"], message: "Required" });
    }
  }

  // ALWAYS REQUIRED
  if (!data.parentToPrint) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["parentToPrint"],
      message: "Select name to print",
    });
  }
});

export type PanFormData = z.infer<typeof panFormObject>;
export type AddressData = z.infer<typeof addressSchema>;
