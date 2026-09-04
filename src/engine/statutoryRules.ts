/**
 * Statutory Rules and Constants for Indian Income Tax
 * Covering AY 2022-23 to AY 2031-32 as per Finance Acts
 */

import { AssessmentYearConfig, AgeCategory, TaxRegime, isTaxYear, formatYearWithFy } from '../types';

export const ASSESSMENT_YEARS: AssessmentYearConfig[] = [
  {
    ayId: '2022-23',
    fyId: '2021-22',
    defaultRegime: 'OLD',
    financeActName: 'Finance Act, 2021',
    isTaxYear: false,
    label: 'AY 2022-23 (FY 2021-22)',
    standardDeductionOld: 50000,
    standardDeductionNew: 0,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 0,
    rebate87aMaxNew: 0,
    stcg111aRate: 15,
    ltcg112Rate: 20,
    ltcg112aRate: 10,
    ltcg112aExemption: 100000,
  },
  {
    ayId: '2023-24',
    fyId: '2022-23',
    defaultRegime: 'OLD',
    financeActName: 'Finance Act, 2022',
    isTaxYear: false,
    label: 'AY 2023-24 (FY 2022-23)',
    standardDeductionOld: 50000,
    standardDeductionNew: 0,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 0,
    rebate87aMaxNew: 0,
    stcg111aRate: 15,
    ltcg112Rate: 20,
    ltcg112aRate: 10,
    ltcg112aExemption: 100000,
  },
  {
    ayId: '2024-25',
    fyId: '2023-24',
    defaultRegime: 'NEW',
    financeActName: 'Finance Act, 2023',
    isTaxYear: false,
    label: 'AY 2024-25 (FY 2023-24)',
    standardDeductionOld: 50000,
    standardDeductionNew: 50000,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 700000,
    rebate87aMaxNew: 25000,
    stcg111aRate: 15,
    ltcg112Rate: 20,
    ltcg112aRate: 10,
    ltcg112aExemption: 100000,
  },
  {
    ayId: '2025-26',
    fyId: '2024-25',
    defaultRegime: 'NEW',
    financeActName: 'Finance (No. 2) Act, 2024',
    isTaxYear: false,
    label: 'AY 2025-26 (FY 2024-25)',
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 700000,
    rebate87aMaxNew: 25000,
    stcg111aRate: 20,
    ltcg112Rate: 12.5,
    ltcg112aRate: 12.5,
    ltcg112aExemption: 125000,
  },
  {
    ayId: '2026-27',
    fyId: '2025-26',
    defaultRegime: 'NEW',
    financeActName: 'Finance Act, 2025',
    isTaxYear: false,
    label: 'AY 2026-27 (FY 2025-26)',
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 1200000,
    rebate87aMaxNew: 60000,
    stcg111aRate: 20,
    ltcg112Rate: 12.5,
    ltcg112aRate: 12.5,
    ltcg112aExemption: 125000,
  },
  {
    ayId: '2027-28',
    fyId: '2026-27',
    defaultRegime: 'NEW',
    financeActName: 'Finance Act, 2025 / Tax Year 2026-27',
    isTaxYear: true,
    label: 'Tax Year 2026-27 (FY 2026-27)',
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 1200000,
    rebate87aMaxNew: 60000,
    stcg111aRate: 20,
    ltcg112Rate: 12.5,
    ltcg112aRate: 12.5,
    ltcg112aExemption: 125000,
  },
  {
    ayId: '2028-29',
    fyId: '2027-28',
    defaultRegime: 'NEW',
    financeActName: 'Finance Act, 2025 (Tax Year 2027-28)',
    isTaxYear: true,
    label: 'Tax Year 2027-28 (FY 2027-28)',
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 1200000,
    rebate87aMaxNew: 60000,
    stcg111aRate: 20,
    ltcg112Rate: 12.5,
    ltcg112aRate: 12.5,
    ltcg112aExemption: 125000,
  },
  {
    ayId: '2029-30',
    fyId: '2028-29',
    defaultRegime: 'NEW',
    financeActName: 'Finance Act, 2025 (Tax Year 2028-29)',
    isTaxYear: true,
    label: 'Tax Year 2028-29 (FY 2028-29)',
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 1200000,
    rebate87aMaxNew: 60000,
    stcg111aRate: 20,
    ltcg112Rate: 12.5,
    ltcg112aRate: 12.5,
    ltcg112aExemption: 125000,
  },
  {
    ayId: '2030-31',
    fyId: '2029-30',
    defaultRegime: 'NEW',
    financeActName: 'Finance Act, 2025 (Tax Year 2029-30)',
    isTaxYear: true,
    label: 'Tax Year 2029-30 (FY 2029-30)',
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 1200000,
    rebate87aMaxNew: 60000,
    stcg111aRate: 20,
    ltcg112Rate: 12.5,
    ltcg112aRate: 12.5,
    ltcg112aExemption: 125000,
  },
  {
    ayId: '2031-32',
    fyId: '2030-31',
    defaultRegime: 'NEW',
    financeActName: 'Finance Act, 2025 (Tax Year 2030-31)',
    isTaxYear: true,
    label: 'Tax Year 2030-31 (FY 2030-31)',
    standardDeductionOld: 50000,
    standardDeductionNew: 75000,
    rebate87aLimitOld: 500000,
    rebate87aMaxOld: 12500,
    rebate87aLimitNew: 1200000,
    rebate87aMaxNew: 60000,
    stcg111aRate: 20,
    ltcg112Rate: 12.5,
    ltcg112aRate: 12.5,
    ltcg112aExemption: 125000,
  },
];

export interface SlabRule {
  fromAmount: number;
  toAmount: number | null;
  taxRate: number;
}

export function getTaxSlabs(
  ayId: string,
  regime: TaxRegime,
  ageCategory: AgeCategory
): SlabRule[] {
  if (regime === 'OLD') {
    if (ageCategory === 'SUPER_SENIOR') {
      // 80+ years
      return [
        { fromAmount: 0, toAmount: 500000, taxRate: 0 },
        { fromAmount: 500000, toAmount: 1000000, taxRate: 20 },
        { fromAmount: 1000000, toAmount: null, taxRate: 30 },
      ];
    } else if (ageCategory === 'SENIOR') {
      // 60 - 79 years
      return [
        { fromAmount: 0, toAmount: 300000, taxRate: 0 },
        { fromAmount: 300000, toAmount: 500000, taxRate: 5 },
        { fromAmount: 500000, toAmount: 1000000, taxRate: 20 },
        { fromAmount: 1000000, toAmount: null, taxRate: 30 },
      ];
    } else {
      // General (<60 years)
      return [
        { fromAmount: 0, toAmount: 250000, taxRate: 0 },
        { fromAmount: 250000, toAmount: 500000, taxRate: 5 },
        { fromAmount: 500000, toAmount: 1000000, taxRate: 20 },
        { fromAmount: 1000000, toAmount: null, taxRate: 30 },
      ];
    }
  } else {
    // NEW REGIME
    if (ayId === '2022-23' || ayId === '2023-24') {
      return [
        { fromAmount: 0, toAmount: 250000, taxRate: 0 },
        { fromAmount: 250000, toAmount: 500000, taxRate: 5 },
        { fromAmount: 500000, toAmount: 750000, taxRate: 10 },
        { fromAmount: 750000, toAmount: 1000000, taxRate: 15 },
        { fromAmount: 1000000, toAmount: 1250000, taxRate: 20 },
        { fromAmount: 1250000, toAmount: 1500000, taxRate: 25 },
        { fromAmount: 1500000, toAmount: null, taxRate: 30 },
      ];
    } else if (ayId === '2024-25') {
      // Finance Act 2023
      return [
        { fromAmount: 0, toAmount: 300000, taxRate: 0 },
        { fromAmount: 300000, toAmount: 600000, taxRate: 5 },
        { fromAmount: 600000, toAmount: 900000, taxRate: 10 },
        { fromAmount: 900000, toAmount: 1200000, taxRate: 15 },
        { fromAmount: 1200000, toAmount: 1500000, taxRate: 20 },
        { fromAmount: 1500000, toAmount: null, taxRate: 30 },
      ];
    } else if (ayId === '2025-26') {
      // AY 2025-26 (Finance (No. 2) Act, 2024 revised slabs)
      return [
        { fromAmount: 0, toAmount: 300000, taxRate: 0 },
        { fromAmount: 300000, toAmount: 700000, taxRate: 5 },
        { fromAmount: 700000, toAmount: 1000000, taxRate: 10 },
        { fromAmount: 1000000, toAmount: 1200000, taxRate: 15 },
        { fromAmount: 1200000, toAmount: 1500000, taxRate: 20 },
        { fromAmount: 1500000, toAmount: null, taxRate: 30 },
      ];
    } else {
      // AY 2026-27 and future (Finance Act, 2025 revised slabs)
      return [
        { fromAmount: 0, toAmount: 400000, taxRate: 0 },
        { fromAmount: 400000, toAmount: 800000, taxRate: 5 },
        { fromAmount: 800000, toAmount: 1200000, taxRate: 10 },
        { fromAmount: 1200000, toAmount: 1600000, taxRate: 15 },
        { fromAmount: 1600000, toAmount: 2000000, taxRate: 20 },
        { fromAmount: 2000000, toAmount: 2400000, taxRate: 25 },
        { fromAmount: 2400000, toAmount: null, taxRate: 30 },
      ];
    }
  }
}

export const ITR_U_REASONS: { code: import('../types').ItruReasonCode; label: string; description: string }[] = [
  {
    code: 'NOT_FILED_EARLIER',
    label: 'A. Return previously not filed',
    description: 'Assessee failed to furnish return u/s 139(1) or belated return u/s 139(4)',
  },
  {
    code: 'INCOME_NOT_REPORTED',
    label: 'B. Income not reported correctly',
    description: 'Omission of taxable income, capital gains, interest, or overseas credits',
  },
  {
    code: 'WRONG_HEADS_CHOSEN',
    label: 'C. Wrong heads of income chosen',
    description: 'Income misclassified under incorrect statutory head of income',
  },
  {
    code: 'REDUCTION_CARRIED_FORWARD_LOSS',
    label: 'D. Reduction of carried forward loss',
    description: 'Correction in quantum of business loss or capital loss carried forward',
  },
  {
    code: 'REDUCTION_UNABSORBED_DEP',
    label: 'E. Reduction of unabsorbed depreciation',
    description: 'Adjustment to unabsorbed depreciation claimed in preceding years',
  },
  {
    code: 'REDUCTION_TAX_CREDIT',
    label: 'F. Reduction of tax credit u/s 115JB/115JC',
    description: 'MAT / AMT credit adjustment',
  },
  {
    code: 'WRONG_RATE_OF_TAX',
    label: 'G. Wrong rate of tax applied',
    description: 'Application of regular slab instead of special rates (111A, 112, 115BB)',
  },
  {
    code: 'OTHERS',
    label: 'H. Others',
    description: 'Other statutory disclosures under Section 139(8A)',
  },
];
