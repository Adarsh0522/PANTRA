export const NEW_PAN_CONFIG: Record<string, any> = {
    page1: {
        first_name: { x: 63.7, y: 68.9, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        middle_name: { x: 63.7, y: 73.7, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        last_name: { x: 63.7, y: 78.4, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },

        aadhaar_name_line1: { x: 63.7, y: 89.4, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        aadhaar_name_line2: { x: 63.7, y: 94.1, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        aadhaar: { x: 63.7, y: 113.0, type: 'grid', boxes: 12, box_width: 5.37, height: 4.2 },

        gender_male: { x: 64.7, y: 103.5, type: 'checkbox', data_field: 'gender', match: 'MALE', width: 3.5, height: 3.5 },
        gender_female: { x: 81.0, y: 103.5, type: 'checkbox', data_field: 'gender', match: 'FEMALE', width: 3.5, height: 3.5 },
        gender_trans: { x: 102.6, y: 102.8, type: 'checkbox', data_field: 'gender', match: 'TRANSGENDER', width: 3.5, height: 3.5 },

        dob_day: { x: 63.7, y: 108.2, type: 'grid', boxes: 2, box_width: 5.42, height: 4.2 },
        dob_month: { x: 80.1, y: 108.2, type: 'grid', boxes: 2, box_width: 5.42, height: 4.2 },
        dob_year: { x: 96.3, y: 108.2, type: 'grid', boxes: 4, box_width: 5.20, height: 4.2 },

        address_flat: { x: 63.7, y: 123.8, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        address_road: { x: 63.7, y: 128.5, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        address_post: { x: 63.7, y: 133.2, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        address_area: { x: 63.8, y: 137.9, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        address_city: { x: 63.8, y: 142.6, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        address_state: { x: 46.9, y: 147.4, type: 'text', width: 28.8, height: 4.2 },
        address_pincode: { x: 161.3, y: 147.4, type: 'grid', boxes: 7, box_width: 5.4, height: 4.2 },
        address_country: { x: 102.3, y: 147.4, type: 'text', width: 34, height: 4.2 },

        office_flat: { x: 63.7, y: 158.2, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        office_road: { x: 63.7, y: 162.9, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        office_post: { x: 63.7, y: 167.6, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        office_area: { x: 63.7, y: 172.3, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        office_city: { x: 63.7, y: 177.0, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        office_state: { x: 46.9, y: 181.7, type: 'text', width: 28.8, height: 4.2 },
        office_pincode: { x: 161.3, y: 181.7, type: 'grid', boxes: 7, box_width: 5.4, height: 4.2 },
        office_country: { x: 102.3, y: 181.7, type: 'text', width: 34, height: 4.2 },

        residential_resident: { x: 75.3, y: 187.9, type: 'checkbox', data_field: 'residential_status', match: 'RESIDENT', width: 3.5, height: 3.5 },
        residential_nri: { x: 97.2, y: 187.9, type: 'checkbox', data_field: 'residential_status', match: 'NRI', width: 3.5, height: 3.5 },
        residential_rnor: { x: 124.4, y: 187.9, type: 'checkbox', data_field: 'residential_status', match: 'RNOR', width: 3.5, height: 3.5 },

        passport_number: { x: 115.9, y: 195.1, type: 'grid', boxes: 12, box_width: 5.2, height: 4.2 },

        taxpayer_identification_number: { x: 95.2, y: 202.0, type: 'grid', boxes: 20, box_width: 5.2, height: 4.1 },

        country_code: { x: 84.7, y: 212.7, type: 'grid', boxes: 3, box_width: 5.2, height: 4.1 },
        mobile: { x: 133.1, y: 212.7, type: 'grid', boxes: 10, box_width: 5.2, height: 4.1 },
        email: { x: 84.7, y: 217.4, type: 'text', width: 115.2, height: 4.2, transform: 'none' },
        std_code: { x: 84.7, y: 222.2, type: 'grid', boxes: 4, box_width: 5.2, height: 4.1 },
        landline_no: { x: 133.1, y: 222.2, type: 'grid', boxes: 8, box_width: 5.3, height: 4.1 },

        income_salary: { x: 64.2, y: 236.2, type: 'checkbox', data_field: 'income', match: 'SALARY', width: 3.5, height: 3.5 },
        income_business: { x: 91.2, y: 236.2, type: 'checkbox', data_field: 'income', match: 'BUSINESS', width: 3.5, height: 3.5 },
        income_house: { x: 140.2, y: 236.2, type: 'checkbox', data_field: 'income', match: 'HOUSE PROPERTY', width: 3.5, height: 3.5 },
        income_capital: { x: 64.2, y: 241.9, type: 'checkbox', data_field: 'income', match: 'CAPITAL GAINS', width: 3.5, height: 3.5 },
        income_other: { x: 91.2, y: 241.9, type: 'checkbox', data_field: 'income', match: 'OTHER', width: 3.5, height: 3.5 },
        income_none: { x: 140.2, y: 241.9, type: 'checkbox', data_field: 'income', match: 'NO INCOME', width: 3.5, height: 3.5 },

        single_mother_yes: { x: 85.8, y: 255.7, type: 'checkbox', data_field: 'single_mother', match: 'YES', width: 3.5, height: 3.5 },
        single_mother_no: { x: 107.5, y: 255.7, type: 'checkbox', data_field: 'single_mother', match: 'NO', width: 3.5, height: 3.5 },

        father_first: { x: 63.4, y: 260.9, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        father_middle: { x: 63.4, y: 265.6, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        father_last: { x: 63.4, y: 270.3, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
    },
    page2: {
        mother_first: { x: 63.4, y: 7.9, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        mother_middle: { x: 63.4, y: 12.6, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        mother_last: { x: 63.3, y: 17.3, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },

        print_father: { x: 118.5, y: 23.0, type: 'checkbox', data_field: 'print_name', match: 'FATHER', width: 3.5, height: 3.5 },
        print_mother: { x: 140.2, y: 23.0, type: 'checkbox', data_field: 'print_name', match: 'MOTHER', width: 3.5, height: 3.5 },

        ao_area: { x: 83.8, y: 37.7, type: 'grid', boxes: 3, box_width: 5.3, height: 4.1 },
        ao_type: { x: 140.2, y: 37.7, type: 'grid', boxes: 2, box_width: 5.3, height: 4.1 },
        ao_range: { x: 84.0, y: 42.5, type: 'grid', boxes: 3, box_width: 5.3, height: 4.1 },
        ao_no: { x: 140.2, y: 42.5, type: 'grid', boxes: 2, box_width: 5.3, height: 4.1 },

        ra_first: { x: 62.7, y: 57.8, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        ra_middle: { x: 62.7, y: 62.5, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        ra_last: { x: 62.7, y: 67.2, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },

        ra_pan_no: { x: 62.9, y: 72.9, type: 'grid', boxes: 10, box_width: 5.42, height: 4.1 },
        ra_aadhaar: { x: 99.2, y: 78.6, type: 'grid', boxes: 12, box_width: 5.42, height: 4.1 },

        ra_address1: { x: 62.7, y: 89.7, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        ra_address2: { x: 62.7, y: 94.4, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        ra_post: { x: 62.7, y: 99.1, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        ra_area: { x: 62.7, y: 103.8, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        ra_city: { x: 62.7, y: 108.5, type: 'grid', boxes: 25, box_width: 5.42, height: 4.2 },
        ra_state: { x: 45.5, y: 113.2, type: 'text', width: 28.8, height: 4.1 },
        ra_pincode: { x: 160.4, y: 113.2, type: 'grid', boxes: 7, box_width: 5.42, height: 4.1 },
        ra_country: { x: 100.8, y: 113.2, type: 'text', width: 33, height: 4.1 },

        ra_country_code: { x: 83.7, y: 124.3, type: 'grid', boxes: 3, box_width: 5.42, height: 4.1 },
        ra_mobile: { x: 126.3, y: 124.3, type: 'grid', boxes: 10, box_width: 5.42, height: 4.1 },
        ra_email: { x: 83.7, y: 129.2, type: 'text', width: 115, height: 4.1 },
        ra_std_code: { x: 83.8, y: 134.2, type: 'grid', boxes: 4, box_width: 5.42, height: 4.1 },
        ra_landline: { x: 126.7, y: 134.2, type: 'grid', boxes: 8, box_width: 5.25, height: 4.1 },

        comm_residence: { x: 76.3, y: 146.8, type: 'checkbox', data_field: 'comm_address', match: 'RESIDENCE', width: 3.5, height: 3.5 },
        comm_ra_address: { x: 106.7, y: 146.8, type: 'checkbox', data_field: 'comm_address', match: 'REPRESENTATIVE', width: 3.5, height: 3.5 },
        comm_office: { x: 158.1, y: 146.8, type: 'checkbox', data_field: 'comm_address', match: 'OFFICE', width: 3.5, height: 3.5 },

        app_doc_poi: { x: 25.0, y: 166.9, type: 'checkbox', data_field: 'app_doc_poi', match: 'YES', width: 3.5, height: 3.5 },
        app_doc_poa: { x: 59.8, y: 166.9, type: 'checkbox', data_field: 'app_doc_poa', match: 'YES', width: 3.5, height: 3.5 },
        app_doc_dob: { x: 95.5, y: 166.9, type: 'checkbox', data_field: 'app_doc_dob', match: 'YES', width: 3.5, height: 3.5 },

        ra_doc_poi: { x: 25.0, y: 180.1, type: 'checkbox', data_field: 'ra_doc_poi', match: 'YES', width: 3.5, height: 3.5 },
        ra_doc_poa: { x: 59.8, y: 180.1, type: 'checkbox', data_field: 'ra_doc_poa', match: 'YES', width: 3.5, height: 3.5 },

        decl_name: { x: 25, y: 197.9, type: 'text', width: 60, height: 3.0 },
        decl_capacity: { x: 97.5, y: 197.9, type: 'text', width: 40, height: 3.0 },
        decl_place: { x: 26.5, y: 219.4, type: 'text', width: 60, height: 3.0 },
        decl_date: { x: 25.5, y: 224.7, type: 'text', width: 20, height: 3.0 },
    }
};
