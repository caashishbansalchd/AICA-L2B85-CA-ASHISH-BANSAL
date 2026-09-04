/**
 * Indian Income Tax & ITR-U Calculator Data Types
 * Compliant with Income-tax Act, 1961, AY 2022-23 to AY 2031-32
 */

export type AssesseeType =
  | 'INDIVIDUAL'
  | 'HUF'
  | 'FIRM'
  | 'LLP'
  | 'DOMESTIC_COMPANY'
  | 'FOREIGN_COMPANY'
  | 'AOP'
  | 'BOI';

export type AgeCategory = 'GENERAL' | 'SENIOR' | 'SUPER_SENIOR';
export type TaxRegime = 'NEW' | 'OLD';
export type ResidentialStatus = 'RESIDENT' | 'RNOR' | 'NON_RESIDENT';

export type OriginalReturnStatus =
  | 'NOT_FILED'
  | 'SEC_139_1'
  | 'BELATED_139_4'
  | 'REVISED_139_5'
  | 'UPDATED_139_8A';

export interface ClientProfile {
  name: string;
  pan: string;
  assesseeType: AssesseeType;
  dob: string;
  residentialStatus: ResidentialStatus;
  employerType: 'CENTRAL_GOVT' | 'STATE_GOVT' | 'PSU' | 'PRIVATE' | 'OTHER';
  filingDueDate: string;
  actualFilingDate: string;
  originalReturnStatus: OriginalReturnStatus;
  originalAckNumber?: string;
  originalAckDate?: string;
}

export interface SalaryInput {
  basic: number;
  da: number;
  hraReceived: number;
  rentPaid: number;
  isMetro: boolean;
  otherAllowances: number;
  profTax: number;
}

export interface HousePropertyInput {
  propertyType: 'SOP' | 'LOP' | 'DLOP';
  grossAnnualValue: number;
  municipalTaxes: number;
  interest24b: number;
}

export interface BusinessInput {
  scheme: 'NORMAL' | '44AD' | '44ADA';
  grossReceiptsDigital: number;
  grossReceiptsCash: number;
  professionalReceipts: number;
  normalProfit: number;
}

export interface CapitalGainsInput {
  stcg111a: number; // 15% or 20%
  stcgNormal: number; // slab rate
  ltcg112: number; // 20% or 12.5%
  ltcg112a: number; // 10% or 12.5% above exemption
}

export interface OtherSourcesInput {
  savingsInterest: number;
  fdInterest: number;
  dividend: number;
  lottery115bb: number; // 30% flat
  vda115bbh: number; // 30% crypto/NFT
  otherGeneral: number;
}

export interface DeductionsInput {
  sec80C: number;
  sec80CCC: number;
  sec80CCD1: number;
  sec80CCD1B: number; // NPS self 50k
  sec80CCD2: number; // Employer NPS
  sec80D_self: number;
  sec80D_parents: number;
  sec80D_parentsSenior: boolean;
  sec80E: number;
  sec80G: number;
  sec80TTA: number;
  sec80TTB: number;
  secOther: number;
}

export interface PrepaidTaxesInput {
  tdsSalary: number;
  tdsOther: number;
  tcs: number;
  advQ1: number; // By June 15
  advQ2: number; // By Sept 15
  advQ3: number; // By Dec 15
  advQ4: number; // By March 15
  selfAssessmentTax: number;
  previousTaxPaid: number; // for ITR-U
}

export interface TaxSlabBreakdown {
  fromAmount: number;
  toAmount: number | null;
  taxRate: number;
  taxableInSlab: number;
  slabTax: number;
  label: string;
}

export interface TaxComputationResult {
  ayId: string;
  regime: TaxRegime;
  ageCategory: AgeCategory;
  
  // Gross Incomes
  salaryGross: number;
  hraExemption: number;
  salaryStandardDeduction: number;
  salaryProfTax: number;
  netSalary: number;

  netHouseProperty: number;
  netBusiness: number;
  netCapitalGains: number;
  netOtherSources: number;

  grossTotalIncome: number;

  // Chapter VI-A Deductions
  allowedDeductions: number;
  deductionBreakdown: Record<string, number>;

  taxableTotalIncome: number;

  // Tax on Incomes
  taxOnNormalIncome: number;
  taxOnSpecialIncome: number;
  specialTaxBreakdown: {
    stcg111aTax: number;
    ltcg112Tax: number;
    ltcg112aTax: number;
    lotteryTax: number;
    vdaTax: number;
  };
  slabBreakdown: TaxSlabBreakdown[];

  grossTaxBeforeRebate: number;
  taxOnIncome: number;
  rebate87a: number;
  rebate87aNote: string;
  taxAfterRebate: number;

  surchargeRate: number;
  surchargeAmount: number;
  surcharge: number;
  marginalReliefSurcharge: number;
  taxPlusSurcharge: number;

  healthEducationCess: number;
  totalTaxLiability: number;

  // Prepaid and Balance
  totalPrepaidTaxes: number;
  advanceTaxTotal: number;
  tdsTcsTotal: number;
  netTaxPayableOrRefund: number;

  calculationLogs: string[];
}

export interface InterestResult {
  months: number;
  shortfall: number;
  ratePerMonth?: number;
  interest: number;
  isApplicable: boolean;
  notes: string;
}

export type ItruReasonCode =
  | 'NOT_FILED_EARLIER'
  | 'INCOME_NOT_REPORTED'
  | 'WRONG_HEADS_CHOSEN'
  | 'REDUCTION_CARRIED_FORWARD_LOSS'
  | 'REDUCTION_UNABSORBED_DEP'
  | 'REDUCTION_TAX_CREDIT'
  | 'WRONG_RATE_OF_TAX'
  | 'OTHERS';

export interface InterestComputation {
  assessedTax: number;
  sec234a: InterestResult;
  sec234b: InterestResult;
  sec234c: {
    q1Shortfall: number;
    q1Interest: number;
    q2Shortfall: number;
    q2Interest: number;
    q3Shortfall: number;
    q3Interest: number;
    q4Shortfall: number;
    q4Interest: number;
    totalInterest: number;
    notes: string;
  };
  fee234f: number;
  totalInterestAndFees: number;
}

export interface ItruEligibilityResult {
  ayId: string;
  filingDate: string;
  ayEndDate: string;
  monthsElapsedFromAyEnd: number;
  isEligible: boolean;
  timeWindowCategory: 'WITHIN_12_MONTHS' | 'BETWEEN_12_AND_24_MONTHS' | 'EXPIRED';
  additionalTaxRate: number; // 25 or 50 or 0
  statutoryReason: string;
  revisedTaxLiability: number;
  totalInterest: number;
  fee234f: number;
  previousTaxCredited: number;
  baseTaxAndInterestPayable: number;
  baseTaxFor140B: number;
  additionalTax140B: number;
  totalPayableUnder140B: number;
  totalPayableWithItru: number;
  isLossDisallowed: boolean;
  isRefundDisallowed: boolean;
}

export interface AssessmentYearConfig {
  ayId: string;
  fyId: string;
  defaultRegime: TaxRegime;
  financeActName: string;
  standardDeductionOld: number;
  standardDeductionNew: number;
  rebate87aLimitOld: number;
  rebate87aMaxOld: number;
  rebate87aLimitNew: number;
  rebate87aMaxNew: number;
  stcg111aRate: number;
  ltcg112Rate: number;
  ltcg112aRate: number;
  ltcg112aExemption: number;
  label?: string;
  isTaxYear?: boolean;
}

/**
 * Returns whether a given period id is classified as a Tax Year (TY)
 * instead of an Assessment Year (AY).
 * Statutory Rule: From FY 2026-27 onwards, it is Tax Year (not AY).
 * Thus, AY 2026-27 (which is for FY 2025-26) is still Assessment Year,
 * while from FY 2026-27 onwards (period 2027-28 onwards) it is Tax Year.
 */
export function isTaxYear(ayId: string): boolean {
  const fy = getFinancialYear(ayId);
  return fy >= '2026-27';
}

/**
 * Derives the corresponding Financial Year for an AY/TY string.
 * For example: '2024-25' -> '2023-24', '2027-28' -> '2026-27'
 */
export function getFinancialYear(ayId: string): string {
  const parts = ayId.split('-');
  const startYr = parseInt(parts[0], 10);
  const fyStart = startYr - 1;
  const fyEnd = startYr;
  const fyEndShort = String(fyEnd).slice(-2);
  return `${fyStart}-${fyEndShort}`;
}

/**
 * Returns the statutory term: "Tax Year" for FY 2026-27 onwards, or "Assessment Year" / "AY" prior.
 */
export function getYearLabel(ayId: string, short: boolean = false): string {
  if (isTaxYear(ayId)) {
    return short ? 'TY' : 'Tax Year';
  }
  return short ? 'AY' : 'Assessment Year';
}

/**
 * Returns the complete formatted display label with FY in bracket.
 * Examples:
 * - '2024-25' -> 'AY 2024-25 (FY 2023-24)'
 * - '2026-27' -> 'AY 2026-27 (FY 2025-26)'
 * - '2027-28' -> 'Tax Year 2026-27 (FY 2026-27)'
 */
export function formatYearWithFy(ayId: string, options?: { short?: boolean; showAct?: boolean }): string {
  const fy = getFinancialYear(ayId);
  const isTy = fy >= '2026-27';
  if (isTy) {
    const prefix = options?.short ? 'TY' : 'Tax Year';
    return `${prefix} ${fy} (FY ${fy})`;
  } else {
    const prefix = options?.short ? 'AY' : 'Assessment Year';
    return `${prefix} ${ayId} (FY ${fy})`;
  }
}

/**
 * Person Types under the Income-tax Act, 1961 for Statutory Rate Cards
 */
export type DirectoryPersonType =
  | 'INDIVIDUAL_GENERAL'
  | 'INDIVIDUAL_SENIOR'
  | 'INDIVIDUAL_SUPER_SENIOR'
  | 'HUF'
  | 'FIRM_LLP'
  | 'DOMESTIC_COMPANY_LT400CR'
  | 'DOMESTIC_COMPANY_GT400CR'
  | 'DOMESTIC_COMPANY_115BAA'
  | 'FOREIGN_COMPANY'
  | 'COOPERATIVE_SOCIETY'
  | 'AOP_BOI'
  | 'LOCAL_AUTHORITY';

export type AssessmentOrderType =
  | 'CIT_APPEALS_250'
  | 'SCRUTINY_143_3'
  | 'REASSESSMENT_147'
  | 'BEST_JUDGMENT_144'
  | 'ITAT_254'
  | 'RECTIFICATION_154';

export interface AssessmentOrderInput {
  ayId: string;
  orderType: AssessmentOrderType;
  orderNumber: string;
  orderDate: string;
  demandNoticeDate: string; // Date of service of Notice of Demand u/s 156
  asOnDate: string; // Target payment/calculation date
  personType: DirectoryPersonType;
  regime: TaxRegime;
  filingDueDate: string;
  actualFilingDate: string;
  wasReturnFiled: boolean;

  // Income & Additions
  returnedIncome: number;
  regularAdditions: number; // Disallowances, unverified creditors, ad-hoc business additions
  additions115BBE: number; // Unexplained money/credit u/s 68/69/69A taxed @ 60% + 25% surcharge + cess
  stcgAdditions: number; // Short term capital gain additions
  ltcgAdditions: number; // Long term capital gain additions
  disallowedDeductions: number; // Disallowance of Chapter VI-A deductions

  // Pre-paid Taxes & Previous Payments
  tdsCredit: number;
  tcsCredit: number;
  advanceTaxPaid: number;
  satPaid: number; // Self Assessment Tax paid u/s 140A
  priorDemandPaid: number; // Taxes paid after original assessment (e.g. 20% deposit during appeal)
  refundAlreadyGranted: number; // Refund previously received from IT Department
  interest244aReceived: number; // Interest u/s 244A received with prior refund
}

export interface AssessmentDemandResult {
  ayId: string;
  fyId: string;
  orderType: AssessmentOrderType;
  orderTypeLabel: string;
  orderNumber: string;
  orderDate: string;
  demandNoticeDate: string;
  asOnDate: string;

  // Income summary
  returnedIncome: number;
  totalAdditions: number;
  assessedTotalIncome: number;

  // Tax computation breakdown
  taxOnNormalAssessedIncome: number;
  taxOn115BBE: number; // 60% flat tax on unexplained cash credit/investments
  taxOnSTCG: number;
  taxOnLTCG: number;
  grossTaxBeforeRebate: number;
  rebate87a: number;
  taxAfterRebate: number;
  surchargeAmount: number;
  surchargeRatePct: number;
  cessAmount: number;
  cessRatePct: number; // 3% for pre-AY 2019-20, 4% for AY 2019-20 onwards
  totalAssessedTax: number;

  // Interest breakdown
  interest234A: number;
  interest234AMonths: number;
  interest234B: number;
  interest234BMonths: number;
  interest234C: number;
  totalInterest234: number;

  // Total tax & interest assessed
  totalAssessedTaxAndInterest: number;

  // Credits and payments
  totalPrepaidCredits: number;
  refundAnd244ARecoverable: number;
  netBaseDemandBefore220: number;

  // Section 220(2) Interest
  interest220_2: number;
  interest220_2Months: number;
  demandDueDate: string; // 30 days after Notice of Demand served date

  // Final statutory liability as on date
  netTaxPayableAsOnDate: number;
  isRefund: boolean;
  notes: string[];
}

/**
 * Statutory Advance Tax Schedule & Due Dates for Persons (Sections 208, 211, 234C)
 */
export type AdvanceTaxAssesseeCategory =
  | 'NORMAL' // Corporate & Non-Corporate assessees (4 installments: 15%, 45%, 75%, 100%)
  | 'PRESUMPTIVE_44AD_44ADA' // Section 44AD / 44ADA (1 installment: 100% on or before 15th March)
  | 'SENIOR_CITIZEN_NO_BUSINESS'; // Section 207(2) Resident senior citizen with no business income (Exempt)

export interface AdvanceTaxInstallment {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  title: string; // e.g., "1st Installment (On or before June 15)"
  dueDate: string; // e.g., "15-Jun-2026"
  dueDateIso: string; // e.g., "2026-06-15"
  cumulativeRatePct: number; // 15, 45, 75, 100
  incrementalRatePct: number; // 15, 30, 30, 25
  cumulativeTaxDue: number; // Statutory liability to be paid before that date
  incrementalTaxDue: number; // Minimum tax required in this installment
  taxPaidUpToDate: number; // Tax actually paid up to this installment
  taxPaidInQuarter: number; // Tax paid specifically in this quarter
  safeHarborAmount: number; // Buffer threshold (e.g. 12% for Q1, 36% for Q2)
  shortfall: number; // Shortfall for 234C interest computation
  interest234CRatePct: number; // 1% per month
  interest234CMonths: number; // 3 months for Q1/Q2/Q3, 1 month for Q4
  interest234CAmount: number; // Calculated interest
  isCompliant: boolean;
  statusLabel: 'Compliant' | 'Partial Shortfall' | 'Default / Unpaid' | 'Exempt';
}

export interface AdvanceTaxScheduleResult {
  ayId: string;
  fyId: string;
  totalTaxLiability: number;
  tdsTcsDeducted: number;
  assessedTaxLiability: number; // Net of TDS/TCS (Section 208 threshold base)
  isLiabilityBelowThreshold: boolean; // < ₹10,000 u/s 208
  isExemptSeniorCitizen: boolean; // u/s 207(2)
  assesseeCategory: AdvanceTaxAssesseeCategory;
  categoryLabel: string;
  installments: AdvanceTaxInstallment[];
  totalAdvanceTaxDue: number;
  totalAdvanceTaxPaid: number;
  total234CInterest: number;
  statutoryNotes: string[];
}

/**
 * Saved Tax Calculation Report History Model
 */
export interface SavedTaxReport {
  id: string;
  clientName: string;
  pan: string;
  assesseeType: AssesseeType;
  selectedAy: string;
  yearLabel: string;
  dateGenerated: string; // ISO date string
  formattedDate: string; // e.g., "04 Sep 2026, 05:30 PM"
  regime: TaxRegime;

  // Key figures
  grossTotalIncome: number;
  totalDeductions: number;
  taxableTotalIncome: number;
  totalTaxLiability: number;
  totalPrepaidTaxes: number;
  advanceTaxPaid: number;
  interest234A: number;
  interest234B: number;
  interest234C: number;
  totalInterestAndFees: number;
  netTaxPayableOrRefund: number;
  itruAdditionalTax140B?: number;
  totalPayableWithItru?: number;

  // Stored State Snapshot for 1-Click Restoration
  snapshot: {
    profile: ClientProfile;
    salary: SalaryInput;
    hp: HousePropertyInput;
    business: BusinessInput;
    cg: CapitalGainsInput;
    other: OtherSourcesInput;
    deductions: DeductionsInput;
    prepaid: PrepaidTaxesInput;
    selectedAy: string;
    regime: TaxRegime;
  };
}

