import { useForm, useWatch, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { panCorrectionSchema, PanCorrectionData } from "@/lib/form-engine/correction-schema";

const STORAGE_KEY = "pan_correction_draft";

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

    // Load from localStorage
    useEffect(() => {
        let parsed: any = null;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                parsed = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse correction draft", e);
            }
        }

        if (initialProfile) {
            const p = initialProfile;
            parsed = parsed || {};

            // Auto-fill Basic Details into Contact
            if (!parsed.contact) parsed.contact = {};
            if (!parsed.contact.email && p.email) parsed.contact.email = p.email;

            if (!parsed.firstName && !parsed.lastName) {
                // Simple name split if full_name exists
                const parts = p.full_name ? p.full_name.split(' ') : [];
                if (parts.length === 1) {
                    parsed.lastName = parts[0];
                } else if (parts.length > 1) {
                    parsed.firstName = parts[0];
                    parsed.lastName = parts.slice(1).join(' ');
                }
            }

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
        }

        if (parsed) {
            form.reset(parsed);
        }
    }, [form, initialProfile]);

    // Save to localStorage
    useEffect(() => {
        const sub = form.watch((value) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        });
        return () => sub.unsubscribe();
    }, [form]);

    return form;
}
