import { useForm, useWatch, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { panCorrectionSchema, PanCorrectionData } from "@/lib/form-engine/correction-schema";

const getTodayFormatted = () => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}-${m}-${y}`;
};

export function usePanCorrectionLogic(initialProfile?: any): UseFormReturn<PanCorrectionData, any, PanCorrectionData> {
    const form = useForm<PanCorrectionData, any, PanCorrectionData>({
        resolver: zodResolver(panCorrectionSchema) as any,
        mode: "onChange",
        reValidateMode: "onChange",
        shouldUnregister: false, // In correction mode, we want to keep state even if hidden
        defaultValues: {
            isCorrectionMode: true,
            oldPan: "",
            correctionFields: {
                firstName: false,
                middleName: false,
                lastName: false,
                gender: false,
                dob: false,
                aadhaar: false,
                address: false,
                mobile: false,
                email: false,
                fatherName: false,
                motherName: false,
                passport: false,
                tin: false,
                landline: false,
            },
            addressType: "RESIDENCE",
            addresses: {
                residence: { country: "INDIA" },
                office: { country: "INDIA" },
            },
            parentToPrint: "FATHER",
            verification: {
                name: "",
                place: "",
                date: getTodayFormatted(),
                pronoun: "himself",
            },
        },
    });

    const { formState: { errors } } = form;

    // Auto-fill from DB Profile
    useEffect(() => {
        let parsed: any = null;

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
            // Preserve critical defaults
            parsed.isSingleParent = parsed.isSingleParent || "NO";
            parsed.parentToPrint = parsed.parentToPrint || "FATHER";
            parsed.addressType = parsed.addressType || "RESIDENCE";
            parsed.isCorrectionMode = true;
            if (!parsed.contact.isdCode) parsed.contact.isdCode = "91";
            if (!parsed.correctionFields) parsed.correctionFields = {
                firstName: false, middleName: false, lastName: false,
                gender: false, dob: false, aadhaar: false, address: false,
                mobile: false, email: false, fatherName: false, motherName: false,
                passport: false, tin: false, landline: false,
            };
            if (!parsed.verification) parsed.verification = { name: "", place: "", date: getTodayFormatted(), pronoun: "himself" };
        }

        if (parsed) {
            form.reset(parsed);
        }
    }, [form, initialProfile]);

    return form;
}
