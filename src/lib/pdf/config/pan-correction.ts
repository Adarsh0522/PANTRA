export const PAN_CORRECTION_CONFIG: Record<string, any> = {
    page1: {
        old_pan: { x: 80, y: 30.5, type: 'grid', boxes: 10, box_width: 5.2, height: 4.2 },

        aadhaar: { x: 74.8, y: 45.0, type: 'grid', boxes: 12, box_width: 5.2, height: 4.2 },

        correct_aadhaar: { x: 27.3, y: 87.5, type: 'checkbox', data_field: 'is_aadhaar_changed', match: 'YES', width: 3.5, height: 3.5 },
        aadhaar_name_line1: { x: 62.3, y: 92.5, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        aadhaar_name_line2: { x: 62.3, y: 97.2, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },

        correct_name: { x: 27.3, y: 67.2, type: 'checkbox', data_field: 'is_name_changed', match: 'YES', width: 3.5, height: 3.5 },

        first_name: { x: 62.2, y: 72, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        middle_name: { x: 62.2, y: 76.7, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        last_name: { x: 62.2, y: 81.4, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },

        correct_gender: { x: 27.3, y: 107.0, type: 'checkbox', data_field: 'is_gender_changed', match: 'YES', width: 3.5, height: 3.5 },

        gender_male: { x: 63.4, y: 106.7, type: 'checkbox', data_field: 'gender', match: 'MALE', width: 3.5, height: 3.5 },
        gender_female: { x: 79.7, y: 106.7, type: 'checkbox', data_field: 'gender', match: 'FEMALE', width: 3.5, height: 3.5 },
        gender_trans: { x: 101.2, y: 106.7, type: 'checkbox', data_field: 'gender', match: 'TRANSGENDER', width: 3.5, height: 3.5 },

        correct_dob: { x: 27.3, y: 111.6, type: 'checkbox', data_field: 'is_dob_changed', match: 'YES', width: 3.5, height: 3.5 },

        dob_day: { x: 62.3, y: 111.4, type: 'grid', boxes: 2, box_width: 5.3, height: 4.1 },
        dob_month: { x: 78.5, y: 111.4, type: 'grid', boxes: 2, box_width: 5.42, height: 4.1 },
        dob_year: { x: 94.5, y: 111.4, type: 'grid', boxes: 4, box_width: 5.42, height: 4.1 },

        correct_address: { x: 27.3, y: 117.3, type: 'checkbox', data_field: 'is_address_changed', match: 'YES', width: 3.5, height: 3.5 },

        comm_residence: { x: 64.0, y: 123.5, type: 'checkbox', data_field: 'comm_address', match: 'RESIDENCE', width: 3.5, height: 3.5 },
        comm_office: { x: 93.0, y: 123.5, type: 'checkbox', data_field: 'comm_address', match: 'OFFICE', width: 3.5, height: 3.5 },

        address_flat: { x: 62.3, y: 128.5, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        address_road: { x: 62.3, y: 133.3, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        address_post: { x: 62.3, y: 138.0, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        address_area: { x: 62.3, y: 142.8, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        address_city: { x: 62.3, y: 147.6, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        address_state: { x: 47.8, y: 153.3, type: 'text', width: 28.5, height: 4.1 },
        address_pincode: { x: 159.8, y: 152.3, type: 'grid', boxes: 7, box_width: 5.42, height: 4.1 },
        address_country: { x: 102.8, y: 153.3, type: 'text', width: 28, height: 4.1 },

        correct_passport: { x: 27.3, y: 157.0, type: 'checkbox', data_field: 'is_passport_changed', match: 'YES', width: 3.5, height: 3.5 },
        passport_number: { x: 135.3, y: 157.0, type: 'grid', boxes: 12, box_width: 5.2, height: 4.1 },

        correct_taxpayer_identification_number: { x: 27.3, y: 161.7, type: 'checkbox', data_field: 'is_taxpayer_identification_number_changed', match: 'YES', width: 3.5, height: 3.5 },
        taxpayer_identification_number: { x: 93.5, y: 166.3, type: 'grid', boxes: 20, box_width: 5.2, height: 4.1 },

        correct_contact: { x: 27.3, y: 172.4, type: 'checkbox', data_field: 'is_contact_changed', match: 'YES', width: 3.5, height: 3.5 },

        country_code: { x: 98.5, y: 179.3, type: 'grid', boxes: 3, box_width: 5.2, height: 4.2 },
        mobile: { x: 145.7, y: 179.3, type: 'grid', boxes: 10, box_width: 5.2, height: 4.2 },
        email: { x: 100.5, y: 184.0, type: 'text', width: 99.5, height: 4.1, transform: 'none' },
        country_isd: { x: 98.5, y: 188.8, type: 'grid', boxes: 4, box_width: 5.2, height: 4.1 },
        std_code: { x: 147.0, y: 188.8, type: 'grid', boxes: 4, box_width: 5.2, height: 4.1 },
        landline_no: { x: 98.5, y: 196.8, type: 'grid', boxes: 8, box_width: 5.2, height: 4.2 },

        correct_father_name: { x: 27.8, y: 213.1, type: 'checkbox', data_field: 'is_father_name_changed', match: 'YES', width: 3.5, height: 3.5 },

        father_first: { x: 62.3, y: 213.0, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        father_middle: { x: 62.3, y: 217.7, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        father_last: { x: 62.3, y: 222.4, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },

        correct_mother_name: { x: 27.8, y: 227.2, type: 'checkbox', data_field: 'is_mother_name_changed', match: 'YES', width: 3.5, height: 3.5 },

        mother_first: { x: 62.3, y: 227.1, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        mother_middle: { x: 62.3, y: 231.8, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },
        mother_last: { x: 62.3, y: 236.5, type: 'grid', boxes: 25, box_width: 5.42, height: 4.1 },

        print_father: { x: 122.1, y: 242.6, type: 'checkbox', data_field: 'print_name', match: 'FATHER', width: 3.5, height: 3.5 },
        print_mother: { x: 146.3, y: 242.6, type: 'checkbox', data_field: 'print_name', match: 'MOTHER', width: 3.5, height: 3.5 },

        app_doc_poi: { x: 25.0, y: 264.2, type: 'checkbox', data_field: 'app_doc_poi', match: 'YES', width: 3.5, height: 3.5 },
        app_doc_poa: { x: 59.8, y: 264.2, type: 'checkbox', data_field: 'app_doc_poa', match: 'YES', width: 3.5, height: 3.5 },
        app_doc_dob: { x: 95.4, y: 264.2, type: 'checkbox', data_field: 'app_doc_dob', match: 'YES', width: 3.5, height: 3.5 },
        app_doc_other: { x: 25.0, y: 272.7, type: 'checkbox', data_field: 'app_doc_other', match: 'YES', width: 3.5, height: 3.5 },
        app_cop_pan: { x: 95.4, y: 272.7, type: 'checkbox', data_field: 'app_cop_pan', match: 'YES', width: 3.5, height: 3.5 },
    },
    page2: {
        decl_name: { x: 25, y: 17.5, type: 'text', width: 60, height: 3.0 },
        decl_capacity: { x: 103.5, y: 18.4, type: 'text', width: 40, height: 3.0 },
        decl_place: { x: 27.8, y: 32.9, type: 'text', width: 60, height: 3.0 },
        decl_date: { x: 26.8, y: 41.8, type: 'text', width: 20, height: 3.0 },
    }
};
