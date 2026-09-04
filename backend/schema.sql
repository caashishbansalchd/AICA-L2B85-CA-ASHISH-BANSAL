-- ============================================================================
-- INDIAN INCOME TAX & ITR-U COMPUTATION ENGINE - SQLITE DATABASE SCHEMA (DDL)
-- Compliant with Income-tax Act, 1961, Finance Acts, and CBDT Rules
-- Covers AY 2022-23 to AY 2031-32
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Assessment Year Master
CREATE TABLE IF NOT EXISTS assessment_year (
    ay_id TEXT PRIMARY KEY,                       -- e.g., '2024-25'
    fy_id TEXT NOT NULL,                          -- e.g., '2023-24'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    default_regime TEXT NOT NULL DEFAULT 'NEW',  -- 'OLD' or 'NEW'
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Financial Year Master
CREATE TABLE IF NOT EXISTS financial_year (
    fy_id TEXT PRIMARY KEY,                       -- e.g., '2023-24'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Assessee / Taxpayer Category Master
CREATE TABLE IF NOT EXISTS assessee_types (
    code TEXT PRIMARY KEY,                        -- 'INDIVIDUAL', 'HUF', 'FIRM', 'LLP', 'DOMESTIC_COMPANY', 'FOREIGN_COMPANY', 'AOP', 'BOI', 'TRUST', 'COOPERATIVE'
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Residential Status Master
CREATE TABLE IF NOT EXISTS residential_status (
    code TEXT PRIMARY KEY,                        -- 'RESIDENT', 'RNOR', 'NON_RESIDENT'
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Finance Act Rules (Configuration per AY)
CREATE TABLE IF NOT EXISTS finance_act_rules (
    rule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ay_id TEXT NOT NULL,
    finance_act_name TEXT NOT NULL,               -- e.g. 'Finance Act, 2024'
    standard_deduction_old REAL NOT NULL DEFAULT 50000.0,
    standard_deduction_new REAL NOT NULL DEFAULT 75000.0,
    rebate_87a_limit_old REAL NOT NULL DEFAULT 500000.0,
    rebate_87a_max_old REAL NOT NULL DEFAULT 12500.0,
    rebate_87a_limit_new REAL NOT NULL DEFAULT 700000.0,
    rebate_87a_max_new REAL NOT NULL DEFAULT 25000.0,
    rebate_87a_marginal_relief_new INTEGER NOT NULL DEFAULT 1,
    health_education_cess_rate REAL NOT NULL DEFAULT 4.0,  -- in percentage
    stcg_111a_rate REAL NOT NULL DEFAULT 15.0,            -- 20.0 post 23-July-2024
    ltcg_112_rate REAL NOT NULL DEFAULT 20.0,             -- 12.5 post 23-July-2024
    ltcg_112a_rate REAL NOT NULL DEFAULT 10.0,            -- 12.5 post 23-July-2024
    ltcg_112a_exemption_limit REAL NOT NULL DEFAULT 100000.0, -- 125000 post 23-July-2024
    vda_115bbh_rate REAL NOT NULL DEFAULT 30.0,
    lottery_115bb_rate REAL NOT NULL DEFAULT 30.0,
    interest_rate_234a REAL NOT NULL DEFAULT 1.0,         -- % per month
    interest_rate_234b REAL NOT NULL DEFAULT 1.0,         -- % per month
    interest_rate_234c REAL NOT NULL DEFAULT 1.0,         -- % per month
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id) ON DELETE CASCADE
);

-- 6. Tax Slabs (Configuration-driven, NO hardcoded rates)
CREATE TABLE IF NOT EXISTS tax_slabs (
    slab_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ay_id TEXT NOT NULL,
    regime TEXT NOT NULL CHECK(regime IN ('OLD', 'NEW')),
    assessee_type TEXT NOT NULL,                  -- INDIVIDUAL, HUF, etc.
    age_category TEXT NOT NULL CHECK(age_category IN ('GENERAL', 'SENIOR', 'SUPER_SENIOR', 'ALL')),
    from_amount REAL NOT NULL,
    to_amount REAL,                               -- NULL represents infinity
    tax_rate REAL NOT NULL,                       -- in percentage
    slab_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id) ON DELETE CASCADE,
    FOREIGN KEY (assessee_type) REFERENCES assessee_types (code) ON DELETE RESTRICT
);

-- 7. Surcharge Slabs & Rules
CREATE TABLE IF NOT EXISTS surcharge (
    surcharge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ay_id TEXT NOT NULL,
    regime TEXT NOT NULL CHECK(regime IN ('OLD', 'NEW', 'BOTH')),
    assessee_type TEXT NOT NULL,
    from_income REAL NOT NULL,
    to_income REAL,
    surcharge_rate REAL NOT NULL,                 -- percentage: 10, 15, 25, 37
    cap_special_rate_income INTEGER NOT NULL DEFAULT 1, -- Cap at 15% for Div/Cap Gains
    marginal_relief_applicable INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id) ON DELETE CASCADE,
    FOREIGN KEY (assessee_type) REFERENCES assessee_types (code) ON DELETE RESTRICT
);

-- 8. Rebate Rules u/s 87A
CREATE TABLE IF NOT EXISTS rebates (
    rebate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ay_id TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT '87A',
    regime TEXT NOT NULL CHECK(regime IN ('OLD', 'NEW')),
    max_income_limit REAL NOT NULL,
    max_rebate_amount REAL NOT NULL,
    marginal_relief_formula TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id) ON DELETE CASCADE
);

-- 9. Cess Master
CREATE TABLE IF NOT EXISTS cess (
    cess_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ay_id TEXT NOT NULL,
    name TEXT NOT NULL,                           -- 'Health and Education Cess'
    rate REAL NOT NULL DEFAULT 4.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id) ON DELETE CASCADE
);

-- 10. Deduction Master (Chapter VI-A)
CREATE TABLE IF NOT EXISTS deduction_master (
    section_code TEXT PRIMARY KEY,                -- e.g. '80C', '80D', '80CCD(1B)'
    title TEXT NOT NULL,
    description TEXT,
    eligible_in_old INTEGER NOT NULL DEFAULT 1,
    eligible_in_new INTEGER NOT NULL DEFAULT 0,
    overall_limit_parent_code TEXT,               -- e.g., '80CCE' for 80C, 80CCC, 80CCD(1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Deduction Limits per AY
CREATE TABLE IF NOT EXISTS deduction_limits (
    limit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ay_id TEXT NOT NULL,
    section_code TEXT NOT NULL,
    max_limit REAL,                               -- NULL if unlimited
    conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id) ON DELETE CASCADE,
    FOREIGN KEY (section_code) REFERENCES deduction_master (section_code) ON DELETE CASCADE
);

-- 12. Income Heads Master
CREATE TABLE IF NOT EXISTS income_heads (
    head_code TEXT PRIMARY KEY,                   -- 'SALARY', 'HOUSE_PROPERTY', 'BUSINESS_PROFESSION', 'CAPITAL_GAINS', 'OTHER_SOURCES'
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Taxpayer / Client Profile
CREATE TABLE IF NOT EXISTS taxpayer (
    taxpayer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pan TEXT NOT NULL UNIQUE,
    aadhaar TEXT,
    name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT CHECK(gender IN ('M', 'F', 'O')),
    assessee_type TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    residential_status TEXT NOT NULL DEFAULT 'RESIDENT',
    email TEXT,
    mobile TEXT,
    address TEXT,
    is_audit_case INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessee_type) REFERENCES assessee_types (code),
    FOREIGN KEY (residential_status) REFERENCES residential_status (code)
);

-- 14. Income Master Record
CREATE TABLE IF NOT EXISTS income (
    income_id INTEGER PRIMARY KEY AUTOINCREMENT,
    taxpayer_id INTEGER NOT NULL,
    ay_id TEXT NOT NULL,
    selected_regime TEXT NOT NULL CHECK(selected_regime IN ('OLD', 'NEW')),
    gross_total_income REAL NOT NULL DEFAULT 0.0,
    total_deductions REAL NOT NULL DEFAULT 0.0,
    taxable_total_income REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taxpayer_id) REFERENCES taxpayer (taxpayer_id) ON DELETE CASCADE,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id) ON DELETE RESTRICT
);

-- 15. Salary Head Details
CREATE TABLE IF NOT EXISTS salary (
    salary_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    basic_salary REAL NOT NULL DEFAULT 0.0,
    dearness_allowance REAL NOT NULL DEFAULT 0.0,
    hra_received REAL NOT NULL DEFAULT 0.0,
    rent_paid REAL NOT NULL DEFAULT 0.0,
    is_metro INTEGER NOT NULL DEFAULT 0,
    lta_received REAL NOT NULL DEFAULT 0.0,
    lta_exemption REAL NOT NULL DEFAULT 0.0,
    gratuity_received REAL NOT NULL DEFAULT 0.0,
    gratuity_exempt REAL NOT NULL DEFAULT 0.0,
    leave_encashment_received REAL NOT NULL DEFAULT 0.0,
    leave_encashment_exempt REAL NOT NULL DEFAULT 0.0,
    vrs_received REAL NOT NULL DEFAULT 0.0,
    vrs_exempt REAL NOT NULL DEFAULT 0.0,
    children_education_allowance REAL NOT NULL DEFAULT 0.0,
    children_education_exempt REAL NOT NULL DEFAULT 0.0,
    other_allowances REAL NOT NULL DEFAULT 0.0,
    perquisites REAL NOT NULL DEFAULT 0.0,
    professional_tax REAL NOT NULL DEFAULT 0.0,
    standard_deduction REAL NOT NULL DEFAULT 0.0,
    net_salary REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 16. House Property Head Details
CREATE TABLE IF NOT EXISTS house_property (
    hp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    property_type TEXT NOT NULL CHECK(property_type IN ('SOP', 'LOP', 'DLOP')), -- Self-Occupied, Let-Out, Deemed Let-Out
    gross_annual_value REAL NOT NULL DEFAULT 0.0,
    municipal_taxes_paid REAL NOT NULL DEFAULT 0.0,
    net_annual_value REAL NOT NULL DEFAULT 0.0,
    standard_deduction_24a REAL NOT NULL DEFAULT 0.0,  -- 30% of NAV
    interest_borrowed_capital_24b REAL NOT NULL DEFAULT 0.0, -- max 2L for SOP
    income_from_property REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 17. Business & Profession Head Details
CREATE TABLE IF NOT EXISTS business_income (
    biz_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    is_presumptive INTEGER NOT NULL DEFAULT 0,
    section_presumptive TEXT CHECK(section_presumptive IN ('44AD', '44ADA', '44AE', NULL)),
    gross_receipts_digital REAL NOT NULL DEFAULT 0.0,  -- 6% u/s 44AD
    gross_receipts_cash REAL NOT NULL DEFAULT 0.0,     -- 8% u/s 44AD
    professional_receipts REAL NOT NULL DEFAULT 0.0,   -- 50% u/s 44ADA
    heavy_goods_vehicles_count INTEGER NOT NULL DEFAULT 0,
    normal_business_profit REAL NOT NULL DEFAULT 0.0,
    depreciation REAL NOT NULL DEFAULT 0.0,
    net_business_income REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 18. Capital Gain Head Details
CREATE TABLE IF NOT EXISTS capital_gain (
    cg_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    stcg_111a REAL NOT NULL DEFAULT 0.0,          -- Equity oriented / STT paid
    stcg_normal REAL NOT NULL DEFAULT 0.0,        -- Normal slab rate
    ltcg_112 REAL NOT NULL DEFAULT 0.0,           -- Real estate, unlisted shares
    ltcg_112a REAL NOT NULL DEFAULT 0.0,          -- Listed equity / MFs (above exemption)
    ltcg_112a_exempt REAL NOT NULL DEFAULT 0.0,
    net_capital_gains REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 19. Other Sources Head Details
CREATE TABLE IF NOT EXISTS other_sources (
    os_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    dividend_income REAL NOT NULL DEFAULT 0.0,
    savings_interest REAL NOT NULL DEFAULT 0.0,
    fd_term_interest REAL NOT NULL DEFAULT 0.0,
    lottery_crossword_115bb REAL NOT NULL DEFAULT 0.0,
    horse_race_winnings REAL NOT NULL DEFAULT 0.0,
    vda_crypto_115bbh REAL NOT NULL DEFAULT 0.0,
    foreign_income REAL NOT NULL DEFAULT 0.0,
    other_general_income REAL NOT NULL DEFAULT 0.0,
    net_other_sources REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 20. Agricultural Income Details (for Partial Integration)
CREATE TABLE IF NOT EXISTS agricultural_income (
    agri_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    gross_agricultural_income REAL NOT NULL DEFAULT 0.0,
    expenses REAL NOT NULL DEFAULT 0.0,
    net_agricultural_income REAL NOT NULL DEFAULT 0.0,
    is_integrated INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 21. Deductions Claimed Record
CREATE TABLE IF NOT EXISTS deductions (
    deduction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    section_code TEXT NOT NULL,
    amount_invested REAL NOT NULL DEFAULT 0.0,
    amount_allowed REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE,
    FOREIGN KEY (section_code) REFERENCES deduction_master (section_code)
);

-- 22. Tax Deducted at Source (TDS) Record
CREATE TABLE IF NOT EXISTS tds (
    tds_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    tan_of_deductor TEXT,
    deductor_name TEXT NOT NULL,
    section_code TEXT NOT NULL,                   -- '192', '194A', '194C', '194H', '194J', '194IA', '194IB', '194M', '194O'
    gross_amount REAL NOT NULL DEFAULT 0.0,
    tds_deducted REAL NOT NULL DEFAULT 0.0,
    financial_year TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 23. Tax Collected at Source (TCS) Record
CREATE TABLE IF NOT EXISTS tcs (
    tcs_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    collector_tan TEXT,
    collector_name TEXT NOT NULL,
    section_code TEXT NOT NULL,                   -- '206C', '206C(1G)', etc.
    gross_amount REAL NOT NULL DEFAULT 0.0,
    tcs_collected REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 24. Advance Tax Installments Schedule & Record
CREATE TABLE IF NOT EXISTS advance_tax (
    adv_tax_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    installment_number INTEGER NOT NULL CHECK(installment_number IN (1, 2, 3, 4)),
    due_date DATE NOT NULL,
    percentage_required REAL NOT NULL,            -- 15%, 45%, 75%, 100%
    tax_required REAL NOT NULL DEFAULT 0.0,
    tax_paid REAL NOT NULL DEFAULT 0.0,
    payment_date DATE,
    bsr_code TEXT,
    challan_serial TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 25. Self Assessment Tax
CREATE TABLE IF NOT EXISTS self_assessment_tax (
    sat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    amount_paid REAL NOT NULL DEFAULT 0.0,
    payment_date DATE NOT NULL,
    bsr_code TEXT NOT NULL,
    challan_serial TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 26. Challans Ledger (Consolidated Tax Payments)
CREATE TABLE IF NOT EXISTS challan (
    challan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    taxpayer_id INTEGER NOT NULL,
    ay_id TEXT NOT NULL,
    challan_type TEXT NOT NULL CHECK(challan_type IN ('ADVANCE_TAX', 'SELF_ASSESSMENT', 'REGULAR_ASSESSMENT')),
    bsr_code TEXT NOT NULL,
    challan_number TEXT NOT NULL,
    tender_date DATE NOT NULL,
    amount REAL NOT NULL,
    bank_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taxpayer_id) REFERENCES taxpayer (taxpayer_id) ON DELETE CASCADE,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id),
    CONSTRAINT unique_challan UNIQUE (bsr_code, challan_number, tender_date)
);

-- 27. Interest under Section 234A Working
CREATE TABLE IF NOT EXISTS interest_234a (
    int_234a_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    due_date DATE NOT NULL,
    actual_filing_date DATE NOT NULL,
    months_delay INTEGER NOT NULL DEFAULT 0,
    assessed_tax REAL NOT NULL DEFAULT 0.0,
    prepaid_taxes REAL NOT NULL DEFAULT 0.0,
    default_amount REAL NOT NULL DEFAULT 0.0,
    interest_rate REAL NOT NULL DEFAULT 1.0,
    interest_amount REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 28. Interest under Section 234B Working
CREATE TABLE IF NOT EXISTS interest_234b (
    int_234b_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    start_date DATE NOT NULL,                      -- 1st April of AY
    calculation_date DATE NOT NULL,
    assessed_tax REAL NOT NULL DEFAULT 0.0,
    advance_tax_paid REAL NOT NULL DEFAULT 0.0,
    threshold_90_percent REAL NOT NULL DEFAULT 0.0,
    is_defaulted INTEGER NOT NULL DEFAULT 0,
    shortfall_amount REAL NOT NULL DEFAULT 0.0,
    months_delay INTEGER NOT NULL DEFAULT 0,
    interest_rate REAL NOT NULL DEFAULT 1.0,
    interest_amount REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 29. Interest under Section 234C Working
CREATE TABLE IF NOT EXISTS interest_234c (
    int_234c_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    installment_no INTEGER NOT NULL,
    due_date DATE NOT NULL,
    applicable_percentage REAL NOT NULL,
    buffer_percentage REAL NOT NULL,              -- 12%, 36%, 75%, 100%
    cumulative_tax_required REAL NOT NULL,
    cumulative_tax_paid REAL NOT NULL,
    shortfall REAL NOT NULL DEFAULT 0.0,
    months INTEGER NOT NULL,                      -- 3, 3, 3, 1
    interest_rate REAL NOT NULL DEFAULT 1.0,
    interest_amount REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 30. Original Return Status Master
CREATE TABLE IF NOT EXISTS return_status (
    status_code TEXT PRIMARY KEY,                 -- 'NOT_FILED', 'SEC_139_1', 'BELATED_139_4', 'REVISED_139_5', 'UPDATED_139_8A'
    name TEXT NOT NULL,
    description TEXT
);

-- 31. ITR-U Master & Section 140B Additional Tax
CREATE TABLE IF NOT EXISTS updated_return (
    itru_id INTEGER PRIMARY KEY AUTOINCREMENT,
    taxpayer_id INTEGER NOT NULL,
    ay_id TEXT NOT NULL,
    original_return_status TEXT NOT NULL,
    acknowledgement_no TEXT,
    date_of_filing_original DATE,
    filing_date_itru DATE NOT NULL,
    reason_code TEXT NOT NULL,                    -- '1'-Return not filed earlier, '2'-Income not reported correctly, etc.
    is_eligible INTEGER NOT NULL DEFAULT 1,
    eligibility_note TEXT,
    months_from_ay_end INTEGER NOT NULL,          -- 1 to 12 => 25%, 13 to 24 => 50%
    additional_tax_rate REAL NOT NULL,            -- 25.0 or 50.0
    previous_total_income REAL NOT NULL DEFAULT 0.0,
    revised_total_income REAL NOT NULL DEFAULT 0.0,
    additional_income REAL NOT NULL DEFAULT 0.0,
    previous_tax_paid REAL NOT NULL DEFAULT 0.0,
    revised_tax_liability REAL NOT NULL DEFAULT 0.0,
    additional_tax_liability REAL NOT NULL DEFAULT 0.0,
    interest_234a REAL NOT NULL DEFAULT 0.0,
    interest_234b REAL NOT NULL DEFAULT 0.0,
    interest_234c REAL NOT NULL DEFAULT 0.0,
    fee_234f REAL NOT NULL DEFAULT 0.0,
    total_tax_and_interest REAL NOT NULL DEFAULT 0.0,
    section_140b_additional_tax REAL NOT NULL DEFAULT 0.0,
    relief_claimed REAL NOT NULL DEFAULT 0.0,
    net_payable REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taxpayer_id) REFERENCES taxpayer (taxpayer_id) ON DELETE CASCADE,
    FOREIGN KEY (ay_id) REFERENCES assessment_year (ay_id),
    FOREIGN KEY (original_return_status) REFERENCES return_status (status_code)
);

-- 32. Consolidated Tax Computation Results & Audit Trail
CREATE TABLE IF NOT EXISTS tax_computation (
    computation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    income_id INTEGER NOT NULL,
    regime TEXT NOT NULL CHECK(regime IN ('OLD', 'NEW')),
    gross_total_income REAL NOT NULL,
    total_deductions REAL NOT NULL,
    taxable_income REAL NOT NULL,
    tax_on_normal_income REAL NOT NULL DEFAULT 0.0,
    tax_on_special_income REAL NOT NULL DEFAULT 0.0,
    gross_tax_liability REAL NOT NULL DEFAULT 0.0,
    rebate_87a REAL NOT NULL DEFAULT 0.0,
    tax_after_rebate REAL NOT NULL DEFAULT 0.0,
    surcharge REAL NOT NULL DEFAULT 0.0,
    marginal_relief_surcharge REAL NOT NULL DEFAULT 0.0,
    health_education_cess REAL NOT NULL DEFAULT 0.0,
    total_tax_liability REAL NOT NULL DEFAULT 0.0,
    relief_89 REAL NOT NULL DEFAULT 0.0,
    net_tax_liability REAL NOT NULL DEFAULT 0.0,
    interest_234a REAL NOT NULL DEFAULT 0.0,
    interest_234b REAL NOT NULL DEFAULT 0.0,
    interest_234c REAL NOT NULL DEFAULT 0.0,
    fee_234f REAL NOT NULL DEFAULT 0.0,
    aggregate_liability REAL NOT NULL DEFAULT 0.0,
    tds_credit REAL NOT NULL DEFAULT 0.0,
    tcs_credit REAL NOT NULL DEFAULT 0.0,
    advance_tax_paid REAL NOT NULL DEFAULT 0.0,
    self_assessment_tax_paid REAL NOT NULL DEFAULT 0.0,
    total_taxes_paid REAL NOT NULL DEFAULT 0.0,
    net_amount_payable REAL NOT NULL DEFAULT 0.0,
    refund_due REAL NOT NULL DEFAULT 0.0,
    calculation_logs TEXT,                        -- Step-by-step audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (income_id) REFERENCES income (income_id) ON DELETE CASCADE
);

-- 33. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('INSERT', 'UPDATE', 'DELETE', 'CALCULATE')),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 34. Application Settings
CREATE TABLE IF NOT EXISTS application_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_taxpayer_pan ON taxpayer(pan);
CREATE INDEX IF NOT EXISTS idx_tax_slabs_ay_regime ON tax_slabs(ay_id, regime, assessee_type);
CREATE INDEX IF NOT EXISTS idx_surcharge_ay_regime ON surcharge(ay_id, regime, assessee_type);
CREATE INDEX IF NOT EXISTS idx_deductions_ay ON deduction_limits(ay_id, section_code);
CREATE INDEX IF NOT EXISTS idx_income_taxpayer_ay ON income(taxpayer_id, ay_id);
CREATE INDEX IF NOT EXISTS idx_challan_taxpayer ON challan(taxpayer_id, ay_id);
CREATE INDEX IF NOT EXISTS idx_updated_return_ay ON updated_return(taxpayer_id, ay_id);
