import { z } from "zod";

export const panCorrectionObject = z.object({
  isCorrectionMode: z.boolean().optional(),
  oldPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)"),

  // Correction Flag Toggles
  correctionFields: z.object({
    firstName: z.boolean().default(false),
    middleName: z.boolean().default(false),
    lastName: z.boolean().default(false),
    gender: z.boolean().default(false),
    dob: z.boolean().default(false),
    aadhaar: z.boolean().default(false),
    address: z.boolean().default(false),
    mobile: z.boolean().default(false),
    email: z.boolean().default(false),
    fatherName: z.boolean().default(false),
    motherName: z.boolean().default(false),
    passport: z.boolean().default(false),
    tin: z.boolean().default(false),
    landline: z.boolean().default(false),
    photoMismatch: z.boolean().default(false),
    signatureMismatch: z.boolean().default(false),
  }),

  // Fields (All optional by default, validated conditionally)
  firstName: z.string().optional(),
  middleName: z.string().optional(), // 🔥 FIX: Removed .min(1)
  lastName: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "TRANSGENDER"]).optional(),
  dob: z.string().optional(),
  aadhaar: z.string().optional(),

  addressType: z.enum(["RESIDENCE", "OFFICE"]).default("RESIDENCE"),

  // 🔥 FIX: Removed strict addressSchema to prevent "too_small" validation errors on empty fields
  addresses: z.object({
    residence: z.object({
      flat: z.string().optional(),
      road: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pin: z.string().optional(),
      country: z.string().optional(),
      postOffice: z.string().optional(),
    }).optional(),
    office: z.object({
      flat: z.string().optional(),
      road: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pin: z.string().optional(),
      country: z.string().optional(),
      postOffice: z.string().optional(),
    }).optional(),
  }).optional(),

  // UI Support Fields
  residentialStatus: z.enum(["RESIDENT", "NON_RESIDENT", "RNOR"]).optional(),
  passportNumber: z.string().optional(),
  tin: z.string().optional(),
  incomeSource: z.enum(["salary", "business", "house_property", "capital", "other", "none"]).optional(),
  isSingleParent: z.enum(["YES", "NO"]).default("NO"),
  singleParentType: z.enum(["FATHER", "MOTHER"]).optional(),

  contact: z.object({
    isdCode: z.string().default("91"),
    mobile: z.string().optional(),
    email: z.string().optional(),
    stdCode: z.string().optional(),
    landline: z.string().optional(),
  }).optional(),

  // 🔥 FIX: Removed .min(1) to make Parents Name completely optional
  fatherName: z.object({
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
  }).optional(),

  motherName: z.object({
    firstName: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),
  }).optional(),

  parentToPrint: z.enum(["FATHER", "MOTHER"]).default("FATHER"),

  aoCode: z.object({
    areaCode: z.string().optional(),
    aoType: z.string().optional(),
    rangeCode: z.string().optional(),
    aoNo: z.string().optional(),
  }).optional(),

  // Documents
  documents: z.object({
    proofOfIdentity: z.boolean().optional(),
    proofOfAddress: z.boolean().optional(),
    proofOfDateOfBirth: z.boolean().optional(),
    otherChangesProof: z.boolean().optional(),
    copyOfPan: z.boolean().optional(),
  }).optional(),

  // Verification
  verification: z.object({
    name: z.string().optional(),
    place: z.string().min(1, "Place is required"),
    date: z.string(),
    pronoun: z.string(),
  }),
});

export const panCorrectionSchema = panCorrectionObject.superRefine((data, ctx) => {
  const { correctionFields } = data;

  // 1. At least one correction field must be selected
  const hasSelection = Object.values(correctionFields).some(val => val === true);
  if (!hasSelection) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one field must be selected for correction",
      path: ["correctionFields"],
    });
  }

  // 2. Conditional Field Validation
  if (correctionFields.firstName && !data.firstName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["firstName"] });
  }
  if (correctionFields.lastName && !data.lastName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["lastName"] });
  }
  if (correctionFields.gender && !data.gender) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["gender"] });
  }
  if (correctionFields.dob) {
    if (!data.dob) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["dob"] });
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dob)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid date format", path: ["dob"] });
    }
  }
  if (correctionFields.aadhaar) {
    if (!data.aadhaar) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["aadhaar"] });
    } else if (!/^\d{12}$/.test(data.aadhaar)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be 12 digits", path: ["aadhaar"] });
    }
  }

  // 3. Contact Validation
  if (correctionFields.mobile && !data.contact?.mobile) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["contact", "mobile"] });
  } else if (correctionFields.mobile && data.contact?.mobile && !/^\d{10}$/.test(data.contact.mobile)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid mobile", path: ["contact", "mobile"] });
  }

  if (correctionFields.email && !data.contact?.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["contact", "email"] });
  } else if (correctionFields.email && data.contact?.email && !z.string().email().safeParse(data.contact.email).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid email", path: ["contact", "email"] });
  }

  // 4. Address Validation (Dynamic based on type)
  if (correctionFields.address) {
    const selectedType = data.addressType;
    const addr = data.addresses?.[selectedType === "RESIDENCE" ? "residence" : "office"];
    const pathPrefix = ["addresses", selectedType === "RESIDENCE" ? "residence" : "office"];

    if (!addr?.flat) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: [...pathPrefix, "flat"] });
    if (!addr?.road) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: [...pathPrefix, "road"] });
    if (!addr?.postOffice) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: [...pathPrefix, "postOffice"] });
    if (!addr?.area) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: [...pathPrefix, "area"] });
    if (!addr?.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: [...pathPrefix, "city"] });
    if (!addr?.state) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: [...pathPrefix, "state"] });
    if (!addr?.pin || !/^\d{6}$/.test(addr.pin)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid PIN", path: [...pathPrefix, "pin"] });
  }
});

export type PanCorrectionData = z.infer<typeof panCorrectionObject>;