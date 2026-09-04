-- ============================================================================
-- SEED DATA FOR INDIAN INCOME TAX & ITR-U RULE ENGINE
-- Covers AY 2022-23 to AY 2031-32
-- ============================================================================

-- Assessee Types
INSERT OR IGNORE INTO assessee_types (code, name, description) VALUES
('INDIVIDUAL', 'Individual', 'Natural person (General, Senior Citizen, Super Senior Citizen)'),
('HUF', 'Hindu Undivided Family', 'Family governed by Hindu legal code'),
('FIRM', 'Partnership Firm', 'Partnership firm registered or unregistered under Indian Partnership Act'),
('LLP', 'Limited Liability Partnership', 'Entity registered under LLP Act, 2008'),
('DOMESTIC_COMPANY', 'Domestic Company', 'Indian company or entity taxable at domestic corporate tax rate'),
('FOREIGN_COMPANY', 'Foreign Company', 'Company incorporated outside India without POEM in India'),
('AOP', 'Association of Persons', 'Voluntary combination of persons for a common purpose'),
('BOI', 'Body of Individuals', 'Conglomeration of individuals holding an income-producing asset'),
('TRUST', 'Trust / Institution', 'Charitable or religious trust or political party'),
('COOPERATIVE', 'Co-operative Society', 'Co-operative society registered under Co-operative Societies Act');

-- Residential Status
INSERT OR IGNORE INTO residential_status (code, name, description) VALUES
('RESIDENT', 'Resident & Ordinarily Resident (ROR)', 'Taxable on global income in India'),
('RNOR', 'Resident but Not Ordinarily Resident (RNOR)', 'Special transitory status for recent returns to India'),
('NON_RESIDENT', 'Non-Resident Indian (NRI)', 'Taxable only on income accrued or received in India');

-- Income Heads
INSERT OR IGNORE INTO income_heads (head_code, name, description) VALUES
('SALARY', 'Income from Salaries', 'Sections 15 to 17 including allowances and standard deduction'),
('HOUSE_PROPERTY', 'Income from House Property', 'Sections 22 to 27 (SOP, LOP, DLOP)'),
('BUSINESS_PROFESSION', 'Profits and Gains of Business or Profession', 'Sections 28 to 44DB including 44AD, 44ADA, 44AE'),
('CAPITAL_GAINS', 'Capital Gains', 'Sections 45 to 55A (STCG 111A, LTCG 112, LTCG 112A)'),
('OTHER_SOURCES', 'Income from Other Sources', 'Sections 56 to 59 (Dividend, Interest, Lottery, VDA 115BBH)');

-- Deduction Master (Chapter VI-A)
INSERT OR IGNORE INTO deduction_master (section_code, title, description, eligible_in_old, eligible_in_new, overall_limit_parent_code) VALUES
('80C', 'Life Insurance, PPF, EPF, ELSS, Tuition fees, Principal Repayment', 'Investments in specified securities and expenditures', 1, 0, '80CCE'),
('80CCC', 'Contribution to Certain Pension Funds', 'Annuity plans of LIC or other insurers for receiving pension', 1, 0, '80CCE'),
('80CCD(1)', 'Employee/Individual Contribution to NPS', 'National Pension System tier-1 account contribution', 1, 0, '80CCE'),
('80CCD(1B)', 'Additional Self-Contribution to NPS', 'Exclusive additional deduction up to Rs. 50,000', 1, 0, NULL),
('80CCD(2)', 'Employer Contribution to NPS', 'Employer contribution up to 10% (14% for Central/State Govt)', 1, 1, NULL),
('80D', 'Health Insurance Premium & Preventive Health Check-up', 'Medical insurance for self, family, and senior citizen parents', 1, 0, NULL),
('80DD', 'Maintenance / Medical Treatment of Handicapped Dependent', 'Fixed deduction of Rs. 75,000 or Rs. 1,25,000 for severe disability', 1, 0, NULL),
('80DDB', 'Medical Treatment of Specified Diseases', 'Treatment of malignant cancers, neurological diseases, etc.', 1, 0, NULL),
('80E', 'Interest on Higher Education Loan', 'Interest paid on higher education loan for 8 consecutive years', 1, 0, NULL),
('80EE', 'Interest on Home Loan (First-time home buyers)', 'Sanctioned during FY 2016-17 up to Rs. 50,000', 1, 0, NULL),
('80EEA', 'Interest on Affordable Housing Loan', 'Sanctioned between 1 Apr 2019 and 31 Mar 2022 up to Rs. 1.5 Lakhs', 1, 0, NULL),
('80EEB', 'Interest on Electric Vehicle Loan', 'Loan for purchasing electric vehicle up to Rs. 1.5 Lakhs', 1, 0, NULL),
('80G', 'Donations to Charitable Funds and Institutions', 'Donations eligible for 100% or 50% deduction with or without limit', 1, 0, NULL),
('80GG', 'Rent Paid in lieu of HRA', 'Deduction for rent paid by individuals not receiving HRA', 1, 0, NULL),
('80GGA', 'Donations for Scientific Research or Rural Development', '100% deduction for specified research funds', 1, 0, NULL),
('80GGC', 'Contributions to Political Parties or Electoral Trusts', 'Non-cash contributions to political parties', 1, 0, NULL),
('80TTA', 'Interest on Savings Bank Accounts (Non-Seniors)', 'Deduction up to Rs. 10,000 for individuals & HUF below 60', 1, 0, NULL),
('80TTB', 'Interest on Deposits in Bank/PO for Senior Citizens', 'Deduction up to Rs. 50,000 for senior citizens (includes FD)', 1, 0, NULL),
('80U', 'Deduction in case of Person with Disability', 'Fixed deduction of Rs. 75,000 or Rs. 1,25,000 for severe disability', 1, 0, NULL);

-- Return Status Master
INSERT OR IGNORE INTO return_status (status_code, name, description) VALUES
('NOT_FILED', 'Not Filed Earlier', 'Assessee failed to file original, belated or revised return'),
('SEC_139_1', 'Filed on or before Due Date u/s 139(1)', 'Original return filed within statutory timeline'),
('BELATED_139_4', 'Filed Belated Return u/s 139(4)', 'Return filed after due date but on/before 31st December of AY'),
('REVISED_139_5', 'Filed Revised Return u/s 139(5)', 'Return filed to correct an error or omission'),
('UPDATED_139_8A', 'Previously Filed Updated Return u/s 139(8A)', 'Subsequent update to previously filed ITR-U within 24-month window');

-- Assessment Years & Financial Years (AY 2022-23 to AY 2031-32)
INSERT OR IGNORE INTO financial_year (fy_id, start_date, end_date) VALUES
('2021-22', '2021-04-01', '2022-03-31'),
('2022-23', '2022-04-01', '2023-03-31'),
('2023-24', '2023-04-01', '2024-03-31'),
('2024-25', '2024-04-01', '2025-03-31'),
('2025-26', '2025-04-01', '2026-03-31'),
('2026-27', '2026-04-01', '2027-03-31'),
('2027-28', '2027-04-01', '2028-03-31'),
('2028-29', '2028-04-01', '2029-03-31'),
('2029-30', '2029-04-01', '2030-03-31'),
('2030-31', '2030-04-01', '2031-03-31');

INSERT OR IGNORE INTO assessment_year (ay_id, fy_id, start_date, end_date, default_regime, is_active) VALUES
('2022-23', '2021-22', '2022-04-01', '2023-03-31', 'OLD', 1),
('2023-24', '2022-23', '2023-04-01', '2024-03-31', 'OLD', 1),
('2024-25', '2023-24', '2024-04-01', '2025-03-31', 'NEW', 1),
('2025-26', '2024-25', '2025-04-01', '2026-03-31', 'NEW', 1),
('2026-27', '2025-26', '2026-04-01', '2027-03-31', 'NEW', 1),
('2027-28', '2026-27', '2027-04-01', '2028-03-31', 'NEW', 1),
('2028-29', '2027-28', '2028-04-01', '2029-03-31', 'NEW', 1),
('2029-30', '2028-29', '2029-04-01', '2030-03-31', 'NEW', 1),
('2030-31', '2029-30', '2030-04-01', '2031-03-31', 'NEW', 1),
('2031-32', '2030-31', '2031-04-01', '2032-03-31', 'NEW', 1);

-- Finance Act Rules per AY
INSERT OR IGNORE INTO finance_act_rules (ay_id, finance_act_name, standard_deduction_old, standard_deduction_new, rebate_87a_limit_old, rebate_87a_max_old, rebate_87a_limit_new, rebate_87a_max_new, rebate_87a_marginal_relief_new, health_education_cess_rate, stcg_111a_rate, ltcg_112_rate, ltcg_112a_rate, ltcg_112a_exemption_limit, vda_115bbh_rate, lottery_115bb_rate, interest_rate_234a, interest_rate_234b, interest_rate_234c) VALUES
('2022-23', 'Finance Act, 2021', 50000.0, 0.0,     500000.0, 12500.0, 0.0,      0.0,     0, 4.0, 15.0, 20.0, 10.0, 100000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2023-24', 'Finance Act, 2022', 50000.0, 0.0,     500000.0, 12500.0, 0.0,      0.0,     0, 4.0, 15.0, 20.0, 10.0, 100000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2024-25', 'Finance Act, 2023', 50000.0, 50000.0, 500000.0, 12500.0, 700000.0, 25000.0, 1, 4.0, 15.0, 20.0, 10.0, 100000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2025-26', 'Finance (No. 2) Act, 2024', 50000.0, 75000.0, 500000.0, 12500.0, 700000.0, 25000.0, 1, 4.0, 20.0, 12.5, 12.5, 125000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2026-27', 'Finance Act, 2025 (Projected)', 50000.0, 75000.0, 500000.0, 12500.0, 700000.0, 25000.0, 1, 4.0, 20.0, 12.5, 12.5, 125000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2027-28', 'Finance Act, 2026 (Projected)', 50000.0, 75000.0, 500000.0, 12500.0, 700000.0, 25000.0, 1, 4.0, 20.0, 12.5, 12.5, 125000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2028-29', 'Finance Act, 2027 (Projected)', 50000.0, 75000.0, 500000.0, 12500.0, 700000.0, 25000.0, 1, 4.0, 20.0, 12.5, 12.5, 125000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2029-30', 'Finance Act, 2028 (Projected)', 50000.0, 75000.0, 500000.0, 12500.0, 700000.0, 25000.0, 1, 4.0, 20.0, 12.5, 12.5, 125000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2030-31', 'Finance Act, 2029 (Projected)', 50000.0, 75000.0, 500000.0, 12500.0, 700000.0, 25000.0, 1, 4.0, 20.0, 12.5, 12.5, 125000.0, 30.0, 30.0, 1.0, 1.0, 1.0),
('2031-32', 'Finance Act, 2030 (Projected)', 50000.0, 75000.0, 500000.0, 12500.0, 700000.0, 25000.0, 1, 4.0, 20.0, 12.5, 12.5, 125000.0, 30.0, 30.0, 1.0, 1.0, 1.0);

-- Deduction Limits for 80C, 80CCD(1B), 80D, etc.
-- Let's populate for AY 2022-23 to AY 2031-32
INSERT OR IGNORE INTO deduction_limits (ay_id, section_code, max_limit, conditions)
SELECT ay.ay_id, '80C', 150000.0, 'Subject to overall cap of Rs. 1.5 Lakhs u/s 80CCE' FROM assessment_year ay;

INSERT OR IGNORE INTO deduction_limits (ay_id, section_code, max_limit, conditions)
SELECT ay.ay_id, '80CCC', 150000.0, 'Subject to overall cap of Rs. 1.5 Lakhs u/s 80CCE' FROM assessment_year ay;

INSERT OR IGNORE INTO deduction_limits (ay_id, section_code, max_limit, conditions)
SELECT ay.ay_id, '80CCD(1)', 150000.0, 'Subject to overall cap of Rs. 1.5 Lakhs u/s 80CCE' FROM assessment_year ay;

INSERT OR IGNORE INTO deduction_limits (ay_id, section_code, max_limit, conditions)
SELECT ay.ay_id, '80CCD(1B)', 50000.0, 'Exclusive additional deduction for NPS' FROM assessment_year ay;

INSERT OR IGNORE INTO deduction_limits (ay_id, section_code, max_limit, conditions)
SELECT ay.ay_id, '80D', 100000.0, 'Up to Rs 25,000 for self/family + Rs 25,000 parents (Rs 50,000 if senior citizen)' FROM assessment_year ay;

INSERT OR IGNORE INTO deduction_limits (ay_id, section_code, max_limit, conditions)
SELECT ay.ay_id, '80TTA', 10000.0, 'Savings bank interest for individuals below 60' FROM assessment_year ay;

INSERT OR IGNORE INTO deduction_limits (ay_id, section_code, max_limit, conditions)
SELECT ay.ay_id, '80TTB', 50000.0, 'Interest on deposits for senior citizens aged 60 and above' FROM assessment_year ay;

-- Tax Slabs: Old Regime - Individual General (Age < 60) & HUF
-- 0 - 2.5L: 0% | 2.5L - 5L: 5% | 5L - 10L: 20% | > 10L: 30%
INSERT INTO tax_slabs (ay_id, regime, assessee_type, age_category, from_amount, to_amount, tax_rate, slab_order)
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'GENERAL', 0, 250000, 0.0, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'GENERAL', 250000, 500000, 5.0, 2 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'GENERAL', 500000, 1000000, 20.0, 3 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'GENERAL', 1000000, NULL, 30.0, 4 FROM assessment_year ay;

-- Tax Slabs: Old Regime - Senior Citizen (Age 60 to 79)
-- 0 - 3L: 0% | 3L - 5L: 5% | 5L - 10L: 20% | > 10L: 30%
INSERT INTO tax_slabs (ay_id, regime, assessee_type, age_category, from_amount, to_amount, tax_rate, slab_order)
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'SENIOR', 0, 300000, 0.0, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'SENIOR', 300000, 500000, 5.0, 2 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'SENIOR', 500000, 1000000, 20.0, 3 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'SENIOR', 1000000, NULL, 30.0, 4 FROM assessment_year ay;

-- Tax Slabs: Old Regime - Super Senior Citizen (Age 80+)
-- 0 - 5L: 0% | 5L - 10L: 20% | > 10L: 30%
INSERT INTO tax_slabs (ay_id, regime, assessee_type, age_category, from_amount, to_amount, tax_rate, slab_order)
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'SUPER_SENIOR', 0, 500000, 0.0, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'SUPER_SENIOR', 500000, 1000000, 20.0, 2 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 'SUPER_SENIOR', 1000000, NULL, 30.0, 3 FROM assessment_year ay;

-- Tax Slabs: Old Regime - Firm / LLP (Flat 30%)
INSERT INTO tax_slabs (ay_id, regime, assessee_type, age_category, from_amount, to_amount, tax_rate, slab_order)
SELECT ay.ay_id, 'OLD', 'FIRM', 'ALL', 0, NULL, 30.0, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'LLP', 'ALL', 0, NULL, 30.0, 1 FROM assessment_year ay;

-- Tax Slabs: Old Regime - Domestic Company (Flat 25% or 30% standard)
INSERT INTO tax_slabs (ay_id, regime, assessee_type, age_category, from_amount, to_amount, tax_rate, slab_order)
SELECT ay.ay_id, 'OLD', 'DOMESTIC_COMPANY', 'ALL', 0, NULL, 25.0, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'FOREIGN_COMPANY', 'ALL', 0, NULL, 40.0, 1 FROM assessment_year ay;

-- Tax Slabs: New Regime (Section 115BAC)
-- For AY 2022-23 and AY 2023-24 (Old 115BAC slabs):
-- 0-2.5L: 0% | 2.5-5L: 5% | 5-7.5L: 10% | 7.5-10L: 15% | 10-12.5L: 20% | 12.5-15L: 25% | >15L: 30%
INSERT INTO tax_slabs (ay_id, regime, assessee_type, age_category, from_amount, to_amount, tax_rate, slab_order)
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 0, 250000, 0.0, 1 FROM assessment_year ay WHERE ay.ay_id IN ('2022-23', '2023-24') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 250000, 500000, 5.0, 2 FROM assessment_year ay WHERE ay.ay_id IN ('2022-23', '2023-24') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 500000, 750000, 10.0, 3 FROM assessment_year ay WHERE ay.ay_id IN ('2022-23', '2023-24') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 750000, 1000000, 15.0, 4 FROM assessment_year ay WHERE ay.ay_id IN ('2022-23', '2023-24') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 1000000, 1250000, 20.0, 5 FROM assessment_year ay WHERE ay.ay_id IN ('2022-23', '2023-24') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 1250000, 1500000, 25.0, 6 FROM assessment_year ay WHERE ay.ay_id IN ('2022-23', '2023-24') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 1500000, NULL, 30.0, 7 FROM assessment_year ay WHERE ay.ay_id IN ('2022-23', '2023-24');

-- For AY 2024-25 (Finance Act 2023 New Slabs):
-- 0-3L: 0% | 3-6L: 5% | 6-9L: 10% | 9-12L: 15% | 12-15L: 20% | >15L: 30%
INSERT INTO tax_slabs (ay_id, regime, assessee_type, age_category, from_amount, to_amount, tax_rate, slab_order)
SELECT '2024-25', 'NEW', 'INDIVIDUAL', 'ALL', 0, 300000, 0.0, 1 UNION ALL
SELECT '2024-25', 'NEW', 'INDIVIDUAL', 'ALL', 300000, 600000, 5.0, 2 UNION ALL
SELECT '2024-25', 'NEW', 'INDIVIDUAL', 'ALL', 600000, 900000, 10.0, 3 UNION ALL
SELECT '2024-25', 'NEW', 'INDIVIDUAL', 'ALL', 900000, 1200000, 15.0, 4 UNION ALL
SELECT '2024-25', 'NEW', 'INDIVIDUAL', 'ALL', 1200000, 1500000, 20.0, 5 UNION ALL
SELECT '2024-25', 'NEW', 'INDIVIDUAL', 'ALL', 1500000, NULL, 30.0, 6;

-- For AY 2025-26 through AY 2031-32 (Finance (No. 2) Act 2024 New Slabs):
-- 0-3L: 0% | 3-7L: 5% | 7-10L: 10% | 10-12L: 15% | 12-15L: 20% | >15L: 30%
INSERT INTO tax_slabs (ay_id, regime, assessee_type, age_category, from_amount, to_amount, tax_rate, slab_order)
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 0, 300000, 0.0, 1 FROM assessment_year ay WHERE ay.ay_id NOT IN ('2022-23', '2023-24', '2024-25') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 300000, 700000, 5.0, 2 FROM assessment_year ay WHERE ay.ay_id NOT IN ('2022-23', '2023-24', '2024-25') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 700000, 1000000, 10.0, 3 FROM assessment_year ay WHERE ay.ay_id NOT IN ('2022-23', '2023-24', '2024-25') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 1000000, 1200000, 15.0, 4 FROM assessment_year ay WHERE ay.ay_id NOT IN ('2022-23', '2023-24', '2024-25') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 1200000, 1500000, 20.0, 5 FROM assessment_year ay WHERE ay.ay_id NOT IN ('2022-23', '2023-24', '2024-25') UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 'ALL', 1500000, NULL, 30.0, 6 FROM assessment_year ay WHERE ay.ay_id NOT IN ('2022-23', '2023-24', '2024-25');

-- Surcharge Slabs for Individuals (Old vs New)
-- Old Regime: 50L-1Cr: 10% | 1Cr-2Cr: 15% | 2Cr-5Cr: 25% | >5Cr: 37%
INSERT INTO surcharge (ay_id, regime, assessee_type, from_income, to_income, surcharge_rate, cap_special_rate_income, marginal_relief_applicable)
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 5000000, 10000000, 10.0, 1, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 10000000, 20000000, 15.0, 1, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 20000000, 50000000, 25.0, 1, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'OLD', 'INDIVIDUAL', 50000000, NULL, 37.0, 1, 1 FROM assessment_year ay;

-- New Regime: Surcharge capped at 25% for income > 2Cr (AY 2024-25 onwards)
INSERT INTO surcharge (ay_id, regime, assessee_type, from_income, to_income, surcharge_rate, cap_special_rate_income, marginal_relief_applicable)
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 5000000, 10000000, 10.0, 1, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 10000000, 20000000, 15.0, 1, 1 FROM assessment_year ay UNION ALL
SELECT ay.ay_id, 'NEW', 'INDIVIDUAL', 20000000, NULL, 25.0, 1, 1 FROM assessment_year ay;

-- Rebates u/s 87A
INSERT INTO rebates (ay_id, section, regime, max_income_limit, max_rebate_amount, marginal_relief_formula)
SELECT ay.ay_id, '87A', 'OLD', 500000.0, 12500.0, 'Income up to 5 Lakhs rebate 100% tax up to 12,500' FROM assessment_year ay UNION ALL
SELECT ay.ay_id, '87A', 'NEW', 700000.0, 25000.0, 'Marginal relief allowed where income slightly exceeds 7 Lakhs' FROM assessment_year ay WHERE ay.ay_id NOT IN ('2022-23', '2023-24');

-- Cess Master (4% Health and Education Cess)
INSERT INTO cess (ay_id, name, rate)
SELECT ay.ay_id, 'Health and Education Cess', 4.0 FROM assessment_year ay;

-- Application Settings
INSERT OR IGNORE INTO application_settings (setting_key, setting_value, description) VALUES
('APP_NAME', 'Professional Indian Income Tax & ITR-U Calculator', 'Software title'),
('DEFAULT_AY', '2025-26', 'Default Assessment Year'),
('VERSION', '3.5.0', 'Tax Software Release Version'),
('CA_FIRM_NAME', 'Bansal & Associates, Chartered Accountants', 'Default CA Firm Name for Reports'),
('MEMBERSHIP_NO', 'CA-509124', 'ICAI Membership No');
