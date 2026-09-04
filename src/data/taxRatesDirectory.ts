/**
 * Statutory Income Tax Rates Directory for All Persons Across Financial / Assessment Years
 * Covers Individual (<60, 60-79, 80+), HUF, Firm/LLP, Domestic Co, Foreign Co,
 * Co-operative Society, AOP/BOI, Local Authority
 * Historical & Current: AY 2017-18 through AY 2026-27 & Tax Year 2026-27 onwards
 */

import { DirectoryPersonType, TaxRegime, getFinancialYear } from '../types';

export interface TaxSlabBracket {
  fromAmount: number;
  toAmount: number | null;
  taxRate: number; // in percentage
}

export interface SurchargeSlab {
  threshold: string;
  rate: number; // percentage
  conditions?: string;
}

export interface StatutoryYearlyRates {
  ayId: string;
  fyId: string;
  financeAct: string;
  isTaxYear: boolean;
  cessRatePct: number; // 3% pre-AY 2019-20, 4% post
  cessDescription: string;
  stdDeductionOld: number;
  stdDeductionNew: number;
  rebate87aOld: { maxIncome: number; maxRebate: number };
  rebate87aNew: { maxIncome: number; maxRebate: number };
  notes: string[];
}

export interface PersonRateCard {
  personType: DirectoryPersonType;
  personName: string;
  category: 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE' | 'OTHER';
  statutoryRef: string;
  basicExemptionOld: number;
  basicExemptionNew?: number;
  slabsOld: TaxSlabBracket[];
  slabsNew?: TaxSlabBracket[];
  flatRateOld?: number; // For Firm/Co/LLP
  flatRateNew?: number;
  surchargeSlabs: SurchargeSlab[];
  specialProvisions: string[];
}

export const PERSON_DEFINITIONS: {
  id: DirectoryPersonType;
  label: string;
  category: 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE' | 'OTHER';
  section: string;
  summary: string;
}[] = [
  {
    id: 'INDIVIDUAL_GENERAL',
    label: 'Individual (General / Below 60 Years)',
    category: 'INDIVIDUAL',
    section: 'Sec. 2(31)(i)',
    summary: 'Resident & Non-Resident Individuals aged below 60 years at any time during the Previous Year.',
  },
  {
    id: 'INDIVIDUAL_SENIOR',
    label: 'Individual - Senior Citizen (Age 60 to 79 Years)',
    category: 'INDIVIDUAL',
    section: 'Sec. 2(31)(i) r.w. Finance Act',
    summary: 'Resident Individuals who are 60 years or older but less than 80 years during the Previous Year.',
  },
  {
    id: 'INDIVIDUAL_SUPER_SENIOR',
    label: 'Individual - Super Senior Citizen (Age 80 Years & Above)',
    category: 'INDIVIDUAL',
    section: 'Sec. 2(31)(i) r.w. Finance Act',
    summary: 'Resident Individuals who are 80 years or older at any time during the Previous Year.',
  },
  {
    id: 'HUF',
    label: 'Hindu Undivided Family (HUF)',
    category: 'INDIVIDUAL',
    section: 'Sec. 2(31)(ii)',
    summary: 'Hindu Undivided Family taxed at same graduated slab rates as an individual (General).',
  },
  {
    id: 'FIRM_LLP',
    label: 'Partnership Firm & Limited Liability Partnership (LLP)',
    category: 'BUSINESS',
    section: 'Sec. 2(31)(iv) & LLP Act',
    summary: 'Flat statutory tax rate of 30% on total income plus applicable surcharge and cess.',
  },
  {
    id: 'DOMESTIC_COMPANY_LT400CR',
    label: 'Domestic Company (Turnover ≤ ₹400 Crores)',
    category: 'CORPORATE',
    section: 'Sec. 2(31)(iv) r.w. Finance Act',
    summary: 'Domestic companies where gross receipts or turnover in the baseline previous year was up to ₹400 Cr (Tax Rate 25%).',
  },
  {
    id: 'DOMESTIC_COMPANY_GT400CR',
    label: 'Domestic Company (Turnover > ₹400 Crores)',
    category: 'CORPORATE',
    section: 'Sec. 2(31)(iv)',
    summary: 'Large domestic corporations with turnover exceeding ₹400 Crores (Standard Corporate Tax Rate 30%).',
  },
  {
    id: 'DOMESTIC_COMPANY_115BAA',
    label: 'Domestic Company (Sec. 115BAA / Concessional 22%)',
    category: 'CORPORATE',
    section: 'Sec. 115BAA',
    summary: 'Concessional tax scheme @ 22% flat rate + 10% flat surcharge + 4% cess (Effective Rate 25.168%) without incentives/MAT.',
  },
  {
    id: 'FOREIGN_COMPANY',
    label: 'Foreign Company',
    category: 'CORPORATE',
    section: 'Sec. 2(23A)',
    summary: 'Non-domestic corporate entities. Standard rate 40% (reduced to 35% by Finance (No. 2) Act 2024 from AY 2025-26).',
  },
  {
    id: 'COOPERATIVE_SOCIETY',
    label: 'Co-operative Society',
    category: 'OTHER',
    section: 'Sec. 2(31)(vii)',
    summary: 'Graduated slabs (10%, 20%, 30%) or optional concessional scheme under Section 115BAD (22%) / 115BAE (15%).',
  },
  {
    id: 'AOP_BOI',
    label: 'Association of Persons (AOP) & Body of Individuals (BOI)',
    category: 'OTHER',
    section: 'Sec. 2(31)(v)',
    summary: 'Taxed at normal individual slab rates, or Maximum Marginal Rate (MMR) if member shares are indeterminate.',
  },
  {
    id: 'LOCAL_AUTHORITY',
    label: 'Local Authority',
    category: 'OTHER',
    section: 'Sec. 2(31)(vi)',
    summary: 'Municipal corporations, district boards, port commissioners taxed at flat 30% rate.',
  },
];

export const DIRECTORY_YEARS: {
  ayId: string;
  fyId: string;
  label: string;
  financeAct: string;
  isTaxYear: boolean;
  cessPct: number;
  cessName: string;
  stdDeductionOld: number;
  stdDeductionNew: number;
  rebate87aOld: { maxIncome: number; maxRebate: number };
  rebate87aNew: { maxIncome: number; maxRebate: number };
}[] = [
  {
    ayId: '2017-18',
    fyId: '2016-17',
    label: 'AY 2017-18 (FY 2016-17)',
    financeAct: 'Finance Act, 2016',
    isTaxYear: false,
    cessPct: 3,
    cessName: '3% (2% Education Cess + 1% Secondary & Higher Edu Cess)',
    stdDeductionOld: 0,
    stdDeductionNew: 0,
    rebate87aOld: { maxIncome: 500000, maxRebate: 5000 },
    rebate87aNew: { maxIncome: 0, maxRebate: 0 },
  },
  {
    ayId: '2018-19',
    fyId: '2017-18',
    label: 'AY 2018-19 (FY 2017-18)',
    financeAct: 'Finance Act, 2017',
    isTaxYear: false,
    cessPct: 3,
    cessName: '3% (2% Education Cess + 1% Secondary & Higher Edu Cess)',
    stdDeductionOld: 0,
    stdDeductionNew: 0,
    rebate87aOld: { maxIncome: 350000, maxRebate: 2500 },
    rebate87aNew: { maxIncome: 0, maxRebate: 0 },
  },
  {
    ayId: '2019-20',
    fyId: '2018-19',
    label: 'AY 2019-20 (FY 2018-19)',
    financeAct: 'Finance Act, 2018',
    isTaxYear: false,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 40000,
    stdDeductionNew: 0,
    rebate87aOld: { maxIncome: 350000, maxRebate: 2500 },
    rebate87aNew: { maxIncome: 0, maxRebate: 0 },
  },
  {
    ayId: '2020-21',
    fyId: '2019-20',
    label: 'AY 2020-21 (FY 2019-20)',
    financeAct: 'Finance (No. 2) Act, 2019',
    isTaxYear: false,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 50000,
    stdDeductionNew: 0,
    rebate87aOld: { maxIncome: 500000, maxRebate: 12500 },
    rebate87aNew: { maxIncome: 0, maxRebate: 0 },
  },
  {
    ayId: '2021-22',
    fyId: '2020-21',
    label: 'AY 2021-22 (FY 2020-21)',
    financeAct: 'Finance Act, 2020 (Introduction of Sec 115BAC)',
    isTaxYear: false,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 50000,
    stdDeductionNew: 0,
    rebate87aOld: { maxIncome: 500000, maxRebate: 12500 },
    rebate87aNew: { maxIncome: 0, maxRebate: 0 },
  },
  {
    ayId: '2022-23',
    fyId: '2021-22',
    label: 'AY 2022-23 (FY 2021-22)',
    financeAct: 'Finance Act, 2021',
    isTaxYear: false,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 50000,
    stdDeductionNew: 0,
    rebate87aOld: { maxIncome: 500000, maxRebate: 12500 },
    rebate87aNew: { maxIncome: 0, maxRebate: 0 },
  },
  {
    ayId: '2023-24',
    fyId: '2022-23',
    label: 'AY 2023-24 (FY 2022-23)',
    financeAct: 'Finance Act, 2022',
    isTaxYear: false,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 50000,
    stdDeductionNew: 0,
    rebate87aOld: { maxIncome: 500000, maxRebate: 12500 },
    rebate87aNew: { maxIncome: 0, maxRebate: 0 },
  },
  {
    ayId: '2024-25',
    fyId: '2023-24',
    label: 'AY 2024-25 (FY 2023-24)',
    financeAct: 'Finance Act, 2023 (New Regime Made Default)',
    isTaxYear: false,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 50000,
    stdDeductionNew: 50000,
    rebate87aOld: { maxIncome: 500000, maxRebate: 12500 },
    rebate87aNew: { maxIncome: 700000, maxRebate: 25000 },
  },
  {
    ayId: '2025-26',
    fyId: '2024-25',
    label: 'AY 2025-26 (FY 2024-25)',
    financeAct: 'Finance (No. 2) Act, 2024',
    isTaxYear: false,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 50000,
    stdDeductionNew: 75000,
    rebate87aOld: { maxIncome: 500000, maxRebate: 12500 },
    rebate87aNew: { maxIncome: 700000, maxRebate: 25000 },
  },
  {
    ayId: '2026-27',
    fyId: '2025-26',
    label: 'AY 2026-27 (FY 2025-26)',
    financeAct: 'Finance Act, 2025',
    isTaxYear: false,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 50000,
    stdDeductionNew: 75000,
    rebate87aOld: { maxIncome: 500000, maxRebate: 12500 },
    rebate87aNew: { maxIncome: 1200000, maxRebate: 60000 },
  },
  {
    ayId: '2027-28',
    fyId: '2026-27',
    label: 'Tax Year 2026-27 (FY 2026-27)',
    financeAct: 'Direct Tax Code / Finance Act, 2025 (Tax Year 2026-27)',
    isTaxYear: true,
    cessPct: 4,
    cessName: '4% Health & Education Cess (H&EC)',
    stdDeductionOld: 50000,
    stdDeductionNew: 75000,
    rebate87aOld: { maxIncome: 500000, maxRebate: 12500 },
    rebate87aNew: { maxIncome: 1200000, maxRebate: 60000 },
  },
];

/**
 * Retrieves the complete Rate Card for a Person and Assessment Year
 */
export function getPersonRateCard(
  personType: DirectoryPersonType,
  ayId: string
): PersonRateCard {
  const yr = DIRECTORY_YEARS.find((y) => y.ayId === ayId) || DIRECTORY_YEARS[0];
  const yearStart = parseInt(ayId.split('-')[0], 10);

  // 1. INDIVIDUAL GENERAL
  if (personType === 'INDIVIDUAL_GENERAL') {
    let slabsOld: TaxSlabBracket[] = [];
    if (yearStart === 2017) {
      // AY 2017-18: 0-2.5L Nil, 2.5L-5L 10%, 5L-10L 20%, >10L 30%
      slabsOld = [
        { fromAmount: 0, toAmount: 250000, taxRate: 0 },
        { fromAmount: 250000, toAmount: 500000, taxRate: 10 },
        { fromAmount: 500000, toAmount: 1000000, taxRate: 20 },
        { fromAmount: 1000000, toAmount: null, taxRate: 30 },
      ];
    } else {
      // AY 2018-19 onwards: 0-2.5L Nil, 2.5L-5L 5%, 5L-10L 20%, >10L 30%
      slabsOld = [
        { fromAmount: 0, toAmount: 250000, taxRate: 0 },
        { fromAmount: 250000, toAmount: 500000, taxRate: 5 },
        { fromAmount: 500000, toAmount: 1000000, taxRate: 20 },
        { fromAmount: 1000000, toAmount: null, taxRate: 30 },
      ];
    }

    let slabsNew: TaxSlabBracket[] | undefined = undefined;
    if (yearStart >= 2021 && yearStart <= 2023) {
      slabsNew = [
        { fromAmount: 0, toAmount: 250000, taxRate: 0 },
        { fromAmount: 250000, toAmount: 500000, taxRate: 5 },
        { fromAmount: 500000, toAmount: 750000, taxRate: 10 },
        { fromAmount: 750000, toAmount: 1000000, taxRate: 15 },
        { fromAmount: 1000000, toAmount: 1250000, taxRate: 20 },
        { fromAmount: 1250000, toAmount: 1500000, taxRate: 25 },
        { fromAmount: 1500000, toAmount: null, taxRate: 30 },
      ];
    } else if (yearStart === 2024) {
      slabsNew = [
        { fromAmount: 0, toAmount: 300000, taxRate: 0 },
        { fromAmount: 300000, toAmount: 600000, taxRate: 5 },
        { fromAmount: 600000, toAmount: 900000, taxRate: 10 },
        { fromAmount: 900000, toAmount: 1200000, taxRate: 15 },
        { fromAmount: 1200000, toAmount: 1500000, taxRate: 20 },
        { fromAmount: 1500000, toAmount: null, taxRate: 30 },
      ];
    } else if (yearStart === 2025) {
      // AY 2025-26 (Finance (No. 2) Act, 2024 revised slabs)
      slabsNew = [
        { fromAmount: 0, toAmount: 300000, taxRate: 0 },
        { fromAmount: 300000, toAmount: 700000, taxRate: 5 },
        { fromAmount: 700000, toAmount: 1000000, taxRate: 10 },
        { fromAmount: 1000000, toAmount: 1200000, taxRate: 15 },
        { fromAmount: 1200000, toAmount: 1500000, taxRate: 20 },
        { fromAmount: 1500000, toAmount: null, taxRate: 30 },
      ];
    } else if (yearStart >= 2026) {
      // AY 2026-27 onwards (Finance Act, 2025 revised slabs)
      slabsNew = [
        { fromAmount: 0, toAmount: 400000, taxRate: 0 },
        { fromAmount: 400000, toAmount: 800000, taxRate: 5 },
        { fromAmount: 800000, toAmount: 1200000, taxRate: 10 },
        { fromAmount: 1200000, toAmount: 1600000, taxRate: 15 },
        { fromAmount: 1600000, toAmount: 2000000, taxRate: 20 },
        { fromAmount: 2000000, toAmount: 2400000, taxRate: 25 },
        { fromAmount: 2400000, toAmount: null, taxRate: 30 },
      ];
    }

    let surchargeSlabs: SurchargeSlab[] = [];
    if (yearStart === 2017) {
      surchargeSlabs = [{ threshold: 'Total Income > ₹1 Crore', rate: 15, conditions: 'Marginal relief applicable' }];
    } else if (yearStart === 2018 || yearStart === 2019) {
      surchargeSlabs = [
        { threshold: '₹50 Lakhs to ₹1 Crore', rate: 10, conditions: 'Marginal relief applicable' },
        { threshold: 'Total Income > ₹1 Crore', rate: 15, conditions: 'Marginal relief applicable' },
      ];
    } else if (yearStart >= 2020) {
      surchargeSlabs = [
        { threshold: '₹50 Lakhs to ₹1 Crore', rate: 10, conditions: 'Marginal relief applicable' },
        { threshold: '₹1 Crore to ₹2 Crores', rate: 15, conditions: 'Marginal relief applicable' },
        { threshold: '₹2 Crores to ₹5 Crores', rate: 25, conditions: 'Marginal relief applicable' },
        { threshold: 'Exceeding ₹5 Crores', rate: yearStart >= 2024 ? 25 : 37, conditions: 'In New Regime max surcharge is capped at 25%' },
      ];
    }

    return {
      personType,
      personName: 'Individual (General / Below 60)',
      category: 'INDIVIDUAL',
      statutoryRef: 'First Schedule to Finance Act',
      basicExemptionOld: 250000,
      basicExemptionNew: yearStart >= 2026 ? 400000 : (yearStart >= 2024 ? 300000 : 250000),
      slabsOld,
      slabsNew,
      surchargeSlabs,
      specialProvisions: [
        `Rebate u/s 87A: Max ₹${yr.rebate87aOld.maxRebate.toLocaleString('en-IN')} for taxable income up to ₹${yr.rebate87aOld.maxIncome.toLocaleString('en-IN')} (Old Regime).`,
        yearStart >= 2026
          ? 'Rebate u/s 87A (New Regime): 100% Tax Rebate up to ₹60,000 for taxable income up to ₹12,00,000 with marginal relief (Finance Act, 2025).'
          : (yearStart >= 2024
            ? 'Rebate u/s 87A (New Regime): Max ₹25,000 for income up to ₹7,00,000 with marginal relief.'
            : 'New regime rebate applicable from AY 2024-25.'),
        `Standard Deduction: ₹${yr.stdDeductionOld.toLocaleString('en-IN')} (Old) vs ₹${yr.stdDeductionNew.toLocaleString('en-IN')} (New).`,
      ],
    };
  }

  // 2. INDIVIDUAL SENIOR CITIZEN (60 to 79)
  if (personType === 'INDIVIDUAL_SENIOR') {
    const card = getPersonRateCard('INDIVIDUAL_GENERAL', ayId);
    return {
      ...card,
      personType,
      personName: 'Individual - Senior Citizen (Age 60 to 79)',
      basicExemptionOld: 300000,
      slabsOld: [
        { fromAmount: 0, toAmount: 300000, taxRate: 0 },
        { fromAmount: 300000, toAmount: 500000, taxRate: 5 },
        { fromAmount: 500000, toAmount: 1000000, taxRate: 20 },
        { fromAmount: 1000000, toAmount: null, taxRate: 30 },
      ],
      specialProvisions: [
        'Higher Basic Exemption Limit of ₹3,00,000 under Old Regime.',
        'Under Section 115BAC (New Regime), slab rates are uniform across all age groups.',
        'Deduction u/s 80TTB for interest on deposits up to ₹50,000 available in Old Regime.',
        'Deduction u/s 80D for medical insurance/expenses up to ₹50,000 in Old Regime.',
      ],
    };
  }

  // 3. INDIVIDUAL SUPER SENIOR CITIZEN (80+)
  if (personType === 'INDIVIDUAL_SUPER_SENIOR') {
    const card = getPersonRateCard('INDIVIDUAL_GENERAL', ayId);
    return {
      ...card,
      personType,
      personName: 'Individual - Super Senior Citizen (Age 80+)',
      basicExemptionOld: 500000,
      slabsOld: [
        { fromAmount: 0, toAmount: 500000, taxRate: 0 },
        { fromAmount: 500000, toAmount: 1000000, taxRate: 20 },
        { fromAmount: 1000000, toAmount: null, taxRate: 30 },
      ],
      specialProvisions: [
        'Highest Basic Exemption Limit of ₹5,00,000 under Old Regime (Zero tax up to ₹5 Lakhs).',
        'Under Section 115BAC (New Regime), standard uniform slabs apply.',
        'Deduction u/s 80TTB for interest on deposits up to ₹50,000 available in Old Regime.',
      ],
    };
  }

  // 4. HUF
  if (personType === 'HUF') {
    const card = getPersonRateCard('INDIVIDUAL_GENERAL', ayId);
    return {
      ...card,
      personType,
      personName: 'Hindu Undivided Family (HUF)',
      specialProvisions: [
        'Taxed at same graduated slab rates as an Individual (General Category).',
        'Eligible for Chapter VI-A deductions (80C, 80D) in Old Regime.',
        'Not eligible for Section 87A rebate (Rebate 87A is available only to Resident Individuals).',
      ],
    };
  }

  // 5. PARTNERSHIP FIRM / LLP
  if (personType === 'FIRM_LLP') {
    return {
      personType,
      personName: 'Partnership Firm & LLP',
      category: 'BUSINESS',
      statutoryRef: 'Section 167B / First Schedule Part I',
      basicExemptionOld: 0,
      flatRateOld: 30,
      slabsOld: [{ fromAmount: 0, toAmount: null, taxRate: 30 }],
      surchargeSlabs: [
        {
          threshold: 'Total Income > ₹1 Crore',
          rate: 12,
          conditions: 'Subject to marginal relief (tax + surcharge cannot exceed tax on ₹1 Cr + excess income)',
        },
      ],
      specialProvisions: [
        'Flat tax rate of 30% from the first rupee of taxable profit.',
        'Alternate Minimum Tax (AMT) u/s 115JC applies @ 18.5% (15% for IFSC units).',
        'Partner remuneration & interest on capital allowed as per Section 40(b) statutory limits.',
        'No Section 87A rebate available.',
      ],
    };
  }

  // 6. DOMESTIC COMPANY <= 400 CR
  if (personType === 'DOMESTIC_COMPANY_LT400CR') {
    return {
      personType,
      personName: 'Domestic Company (Turnover ≤ ₹400 Cr)',
      category: 'CORPORATE',
      statutoryRef: 'First Schedule Part I Paragraph E',
      basicExemptionOld: 0,
      flatRateOld: 25,
      slabsOld: [{ fromAmount: 0, toAmount: null, taxRate: 25 }],
      surchargeSlabs: [
        { threshold: '₹1 Crore to ₹10 Crores', rate: 7, conditions: 'Marginal relief applicable' },
        { threshold: 'Total Income > ₹10 Crores', rate: 12, conditions: 'Marginal relief applicable' },
      ],
      specialProvisions: [
        'Base corporate tax rate of 25% if turnover in baseline prior year was ≤ ₹400 Crores (₹250 Cr for pre-AY 2020-21).',
        'Minimum Alternate Tax (MAT) u/s 115JB applies @ 15% (plus surcharge and cess).',
      ],
    };
  }

  // 7. DOMESTIC COMPANY > 400 CR
  if (personType === 'DOMESTIC_COMPANY_GT400CR') {
    return {
      personType,
      personName: 'Domestic Company (Turnover > ₹400 Cr)',
      category: 'CORPORATE',
      statutoryRef: 'First Schedule Part I Paragraph E',
      basicExemptionOld: 0,
      flatRateOld: 30,
      slabsOld: [{ fromAmount: 0, toAmount: null, taxRate: 30 }],
      surchargeSlabs: [
        { threshold: '₹1 Crore to ₹10 Crores', rate: 7, conditions: 'Marginal relief applicable' },
        { threshold: 'Total Income > ₹10 Crores', rate: 12, conditions: 'Marginal relief applicable' },
      ],
      specialProvisions: [
        'Standard base corporate tax rate of 30% on total income.',
        'Minimum Alternate Tax (MAT) u/s 115JB applies @ 15%.',
      ],
    };
  }

  // 8. DOMESTIC COMPANY SEC 115BAA
  if (personType === 'DOMESTIC_COMPANY_115BAA') {
    return {
      personType,
      personName: 'Domestic Company (Sec. 115BAA / 22% Concessional)',
      category: 'CORPORATE',
      statutoryRef: 'Section 115BAA',
      basicExemptionOld: 0,
      flatRateOld: 22,
      slabsOld: [{ fromAmount: 0, toAmount: null, taxRate: 22 }],
      surchargeSlabs: [
        { threshold: 'All Income Levels (Flat Surcharge)', rate: 10, conditions: 'Mandatory 10% surcharge irrespective of total income' },
      ],
      specialProvisions: [
        'Effective tax rate is 25.168% [22% + 10% Surcharge + 4% H&EC].',
        'Exempt from Minimum Alternate Tax (MAT) u/s 115JB.',
        'Company cannot claim specific tax incentives, deductions u/s 10AA, 32AD, 33AB, 35, or Chapter VI-A (except 80M/80JJAA).',
      ],
    };
  }

  // 9. FOREIGN COMPANY
  if (personType === 'FOREIGN_COMPANY') {
    const rate = yearStart >= 2025 ? 35 : 40;
    return {
      personType,
      personName: 'Foreign Company',
      category: 'CORPORATE',
      statutoryRef: 'Section 2(23A) / First Schedule',
      basicExemptionOld: 0,
      flatRateOld: rate,
      slabsOld: [{ fromAmount: 0, toAmount: null, taxRate: rate }],
      surchargeSlabs: [
        { threshold: '₹1 Crore to ₹10 Crores', rate: 2, conditions: 'Marginal relief applicable' },
        { threshold: 'Total Income > ₹10 Crores', rate: 5, conditions: 'Marginal relief applicable' },
      ],
      specialProvisions: [
        `Base tax rate: ${rate}% (reduced from 40% to 35% by Finance (No. 2) Act 2024 from AY 2025-26 onwards).`,
        'Lower surcharge rate compared to domestic companies (2% for ₹1Cr-10Cr, 5% for >₹10Cr).',
        'Tax Treaty (DTAA) benefit under Section 90 can override domestic rates if more beneficial.',
      ],
    };
  }

  // 10. CO-OPERATIVE SOCIETY
  if (personType === 'COOPERATIVE_SOCIETY') {
    return {
      personType,
      personName: 'Co-operative Society',
      category: 'OTHER',
      statutoryRef: 'First Schedule Part I Paragraph B & Sec. 115BAD',
      basicExemptionOld: 0,
      slabsOld: [
        { fromAmount: 0, toAmount: 10000, taxRate: 10 },
        { fromAmount: 10000, toAmount: 20000, taxRate: 20 },
        { fromAmount: 20000, toAmount: null, taxRate: 30 },
      ],
      surchargeSlabs: [
        { threshold: '₹1 Crore to ₹10 Crores', rate: 7, conditions: 'Marginal relief applicable' },
        { threshold: 'Total Income > ₹10 Crores', rate: 12, conditions: 'Marginal relief applicable' },
      ],
      specialProvisions: [
        'Graduated rates: Up to ₹10k @ 10%, ₹10k-20k @ 20%, Above ₹20k @ 30%.',
        'Optional concessional scheme under Section 115BAD @ 22% (+10% surcharge + 4% cess).',
        'Manufacturing co-operatives formed on or after 01.04.2023 eligible for 15% rate u/s 115BAE.',
        'Deductions under Section 80P available in normal provisions.',
      ],
    };
  }

  // 11. AOP / BOI
  if (personType === 'AOP_BOI') {
    const card = getPersonRateCard('INDIVIDUAL_GENERAL', ayId);
    return {
      ...card,
      personType,
      personName: 'Association of Persons (AOP) & BOI',
      category: 'OTHER',
      statutoryRef: 'Section 167B',
      specialProvisions: [
        'Taxed at Individual slab rates if member shares are determinate and no member has taxable income exceeding basic exemption limit.',
        'Taxed at Maximum Marginal Rate (MMR) if shares of members are indeterminate or any member has taxable income at normal rates.',
        'Surcharge on AOP consisting only of companies is capped at 15%.',
      ],
    };
  }

  // 12. LOCAL AUTHORITY
  return {
    personType: 'LOCAL_AUTHORITY',
    personName: 'Local Authority',
    category: 'OTHER',
    statutoryRef: 'First Schedule Part I Paragraph D',
    basicExemptionOld: 0,
    flatRateOld: 30,
    slabsOld: [{ fromAmount: 0, toAmount: null, taxRate: 30 }],
    surchargeSlabs: [
      { threshold: 'Total Income > ₹1 Crore', rate: 12, conditions: 'Marginal relief applicable' },
    ],
    specialProvisions: [
      'Flat 30% tax rate on total income.',
      'Income exempted under Section 10(20) for local authority duties.',
    ],
  };
}

/**
 * Calculates quick statutory tax for any Person, Year, and Taxable Income
 */
export function computeQuickTaxForPerson(params: {
  personType: DirectoryPersonType;
  ayId: string;
  regime: TaxRegime;
  taxableIncome: number;
}): {
  basicTax: number;
  rebate87a: number;
  taxAfterRebate: number;
  surcharge: number;
  surchargeRatePct: number;
  cess: number;
  cessRatePct: number;
  totalTax: number;
  effectiveRatePct: number;
} {
  const { personType, ayId, regime, taxableIncome } = params;
  const rateCard = getPersonRateCard(personType, ayId);
  const yr = DIRECTORY_YEARS.find((y) => y.ayId === ayId) || DIRECTORY_YEARS[0];

  let basicTax = 0;
  const slabs =
    regime === 'NEW' && rateCard.slabsNew
      ? rateCard.slabsNew
      : rateCard.slabsOld;

  if (rateCard.flatRateOld !== undefined && regime === 'OLD') {
    basicTax = (taxableIncome * rateCard.flatRateOld) / 100;
  } else {
    for (const slab of slabs) {
      if (taxableIncome > slab.fromAmount) {
        const taxableInSlab =
          slab.toAmount !== null
            ? Math.min(taxableIncome, slab.toAmount) - slab.fromAmount
            : taxableIncome - slab.fromAmount;
        if (taxableInSlab > 0) {
          basicTax += (taxableInSlab * slab.taxRate) / 100;
        }
      }
    }
  }

  // Rebate 87A (Resident individuals only)
  let rebate87a = 0;
  const isInd =
    personType === 'INDIVIDUAL_GENERAL' ||
    personType === 'INDIVIDUAL_SENIOR' ||
    personType === 'INDIVIDUAL_SUPER_SENIOR';

  if (isInd) {
    if (regime === 'NEW') {
      if (yr.rebate87aNew.maxIncome > 0 && taxableIncome <= yr.rebate87aNew.maxIncome) {
        rebate87a = Math.min(basicTax, yr.rebate87aNew.maxRebate);
      } else if (yr.rebate87aNew.maxIncome > 0) {
        // Marginal relief under Section 87A for New Regime (Finance Act 2023 / Finance Act 2025)
        const excessIncome = taxableIncome - yr.rebate87aNew.maxIncome;
        if (basicTax > excessIncome) {
          rebate87a = basicTax - excessIncome;
        }
      }
    } else {
      if (yr.rebate87aOld.maxIncome > 0 && taxableIncome <= yr.rebate87aOld.maxIncome) {
        rebate87a = Math.min(basicTax, yr.rebate87aOld.maxRebate);
      }
    }
  }

  const taxAfterRebate = Math.max(0, basicTax - rebate87a);

  // Surcharge
  let surchargeRatePct = 0;
  if (personType.startsWith('INDIVIDUAL') || personType === 'HUF' || personType === 'AOP_BOI') {
    const yearStart = parseInt(ayId.split('-')[0], 10);
    if (taxableIncome > 50000000) {
      surchargeRatePct = regime === 'NEW' && yearStart >= 2024 ? 25 : 37;
    } else if (taxableIncome > 20000000) {
      surchargeRatePct = 25;
    } else if (taxableIncome > 10000000) {
      surchargeRatePct = 15;
    } else if (taxableIncome > 5000000) {
      surchargeRatePct = yearStart === 2017 ? 0 : 10;
    }
  } else if (personType === 'FIRM_LLP' || personType === 'LOCAL_AUTHORITY') {
    if (taxableIncome > 10000000) surchargeRatePct = 12;
  } else if (personType === 'DOMESTIC_COMPANY_115BAA') {
    surchargeRatePct = 10;
  } else if (personType.startsWith('DOMESTIC_COMPANY')) {
    if (taxableIncome > 100000000) surchargeRatePct = 12;
    else if (taxableIncome > 10000000) surchargeRatePct = 7;
  } else if (personType === 'FOREIGN_COMPANY') {
    if (taxableIncome > 100000000) surchargeRatePct = 5;
    else if (taxableIncome > 10000000) surchargeRatePct = 2;
  } else if (personType === 'COOPERATIVE_SOCIETY') {
    if (taxableIncome > 100000000) surchargeRatePct = 12;
    else if (taxableIncome > 10000000) surchargeRatePct = 7;
  }

  const surcharge = (taxAfterRebate * surchargeRatePct) / 100;
  const cessRatePct = yr.cessPct;
  const cess = ((taxAfterRebate + surcharge) * cessRatePct) / 100;
  const totalTax = Math.round(taxAfterRebate + surcharge + cess);
  const effectiveRatePct = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    basicTax: Math.round(basicTax),
    rebate87a: Math.round(rebate87a),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    surchargeRatePct,
    cess: Math.round(cess),
    cessRatePct,
    totalTax,
    effectiveRatePct: Number(effectiveRatePct.toFixed(2)),
  };
}
