/**
 * Comprehensive Indian Income Tax Statutory Rule Engine (TypeScript)
 * Implements Income-tax Act, 1961 statutory computations:
 * - Five Heads of Income with exemptions & statutory deductions
 * - Section 115BAC Old vs New regime
 * - Surcharge & Marginal Relief
 * - Section 87A rebate with marginal relief
 * - Section 234A, 234B, 234C, 234F Interest & Fees
 * - Section 139(8A) & Section 140B ITR-U 12/24 month eligibility & additional tax
 */

import {
  ClientProfile,
  SalaryInput,
  HousePropertyInput,
  BusinessInput,
  CapitalGainsInput,
  OtherSourcesInput,
  DeductionsInput,
  PrepaidTaxesInput,
  TaxRegime,
  AgeCategory,
  TaxComputationResult,
  TaxSlabBreakdown,
  InterestComputation,
  ItruEligibilityResult,
  formatYearWithFy,
} from '../types';
import { ASSESSMENT_YEARS, getTaxSlabs } from './statutoryRules';

export class TaxEngine {
  /**
   * Determine Age Category based on DOB and relevant Financial Year end date
   */
  static getAgeCategory(dobStr: string, ayId: string): AgeCategory {
    if (!dobStr) return 'GENERAL';
    try {
      const dob = new Date(dobStr);
      if (isNaN(dob.getTime())) return 'GENERAL';

      const startYear = parseInt(ayId.split('-')[0], 10);
      const fyEnd = new Date(startYear, 2, 31); // March 31 of FY

      let age = fyEnd.getFullYear() - dob.getFullYear();
      const m = fyEnd.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && fyEnd.getDate() < dob.getDate())) {
        age--;
      }

      if (age >= 80) return 'SUPER_SENIOR';
      if (age >= 60) return 'SENIOR';
      return 'GENERAL';
    } catch {
      return 'GENERAL';
    }
  }

  /**
   * Section 10(13A) HRA Exemption
   * Least of:
   * 1. Actual HRA received
   * 2. Rent paid - 10% of (Basic + DA)
   * 3. 50% (Metro) or 40% (Non-metro) of (Basic + DA)
   */
  static calculateHRAExemption(salary: SalaryInput, regime: TaxRegime): number {
    if (regime === 'NEW') return 0; // HRA exemption not available in New Regime
    const salaryForHra = Math.max(0, salary.basic + salary.da);
    if (salary.hraReceived <= 0 || salary.rentPaid <= 0 || salaryForHra <= 0) {
      return 0;
    }

    const cond1 = salary.hraReceived;
    const cond2 = Math.max(0, salary.rentPaid - 0.1 * salaryForHra);
    const cond3 = (salary.isMetro ? 0.5 : 0.4) * salaryForHra;

    return Math.round(Math.min(cond1, cond2, cond3));
  }

  /**
   * Compute full tax computation for an assessee
   */
  static computeTax(
    ayId: string,
    regime: TaxRegime,
    profile: ClientProfile,
    salary: SalaryInput,
    hp: HousePropertyInput,
    business: BusinessInput,
    cg: CapitalGainsInput,
    other: OtherSourcesInput,
    deductions: DeductionsInput,
    prepaid: PrepaidTaxesInput
  ): TaxComputationResult {
    const config =
      ASSESSMENT_YEARS.find((y) => y.ayId === ayId) || ASSESSMENT_YEARS[2];
    const ageCategory = this.getAgeCategory(profile.dob, ayId);
    const logs: string[] = [];

    logs.push(
      `${formatYearWithFy(ayId)} | Regime: ${regime} | Age: ${ageCategory} | Profile: ${profile.name}`
    );

    // ----------------------------------------------------
    // 1. SALARY
    // ----------------------------------------------------
    const grossSalary =
      salary.basic +
      salary.da +
      salary.hraReceived +
      salary.otherAllowances;

    let hraExemption = 0;
    if (regime === 'OLD') {
      hraExemption = this.calculateHRAExemption(salary, regime);
      if (hraExemption > 0) {
        logs.push(`HRA Exemption u/s 10(13A): ₹${hraExemption.toLocaleString('en-IN')}`);
      }
    }

    const stdDeductionMax =
      regime === 'NEW'
        ? config.standardDeductionNew
        : config.standardDeductionOld;

    const salaryAfterHra = Math.max(0, grossSalary - hraExemption);
    const standardDeduction = Math.min(salaryAfterHra, stdDeductionMax);
    const profTaxAllowed = regime === 'OLD' ? salary.profTax : 0;

    const netSalary = Math.max(
      0,
      salaryAfterHra - standardDeduction - profTaxAllowed
    );

    // ----------------------------------------------------
    // 2. HOUSE PROPERTY
    // ----------------------------------------------------
    let netHouseProperty = 0;
    if (hp.propertyType === 'SOP') {
      // Self-occupied: NAV is Nil.
      // Under Section 115BAC (New Regime), deduction u/s 24(b) for SOP is NOT ALLOWED (₹0).
      // Under Old Regime, interest u/s 24(b) is allowed up to a maximum loss of ₹2,00,000.
      if (regime === 'OLD') {
        const interestAllowed = Math.min(200000, Math.max(0, hp.interest24b));
        netHouseProperty = -interestAllowed;
        if (interestAllowed > 0) {
          logs.push(
            `House Property (SOP): Loss of ₹${interestAllowed.toLocaleString(
              'en-IN'
            )} allowed u/s 24(b) in Old Regime`
          );
        }
      } else {
        // New Regime disallows SOP interest u/s 24(b)
        netHouseProperty = 0;
        if (hp.interest24b > 0) {
          logs.push(
            `House Property (SOP): Interest u/s 24(b) of ₹${hp.interest24b.toLocaleString(
              'en-IN'
            )} is DISALLOWED under New Regime (Section 115BAC)`
          );
        }
      }
    } else {
      // LOP or DLOP
      const nav = Math.max(0, hp.grossAnnualValue - hp.municipalTaxes);
      const std24a = 0.3 * nav; // 30% statutory deduction
      const computedHp = nav - std24a - hp.interest24b;

      if (regime === 'OLD') {
        // In Old Regime, set off of House property loss is capped at ₹2,00,000 across heads u/s 71(3A)
        netHouseProperty = Math.max(-200000, computedHp);
        if (computedHp < -200000) {
          logs.push(
            `House Property (${hp.propertyType}): Loss restricted to ₹2,00,000 for inter-head set-off u/s 71(3A)`
          );
        } else if (computedHp < 0) {
          logs.push(
            `House Property (${hp.propertyType}): Loss of ₹${Math.abs(
              computedHp
            ).toLocaleString('en-IN')} set off against other heads`
          );
        } else {
          logs.push(
            `House Property (${hp.propertyType}): Net income of ₹${computedHp.toLocaleString(
              'en-IN'
            )}`
          );
        }
      } else {
        // Under Section 115BAC(2)(ii), set-off of house property loss against any other head of income is NOT ALLOWED!
        if (computedHp < 0) {
          netHouseProperty = 0;
          logs.push(
            `House Property (${hp.propertyType}): Loss of ₹${Math.abs(
              computedHp
            ).toLocaleString(
              'en-IN'
            )} CANNOT be set off against other heads under Section 115BAC(2)(ii) (c/f only)`
          );
        } else {
          netHouseProperty = computedHp;
          logs.push(
            `House Property (${hp.propertyType}): Net income of ₹${computedHp.toLocaleString(
              'en-IN'
            )}`
          );
        }
      }
    }

    // ----------------------------------------------------
    // 3. BUSINESS / PROFESSION
    // ----------------------------------------------------
    let netBusiness = 0;
    if (business.scheme === '44AD') {
      // 6% on digital, 8% on cash
      netBusiness =
        0.06 * business.grossReceiptsDigital +
        0.08 * business.grossReceiptsCash;
    } else if (business.scheme === '44ADA') {
      // 50% presumptive profit
      netBusiness = 0.5 * business.professionalReceipts;
    } else {
      netBusiness = business.normalProfit;
    }

    // ----------------------------------------------------
    // 4. CAPITAL GAINS
    // ----------------------------------------------------
    const netCapitalGains =
      cg.stcg111a + cg.stcgNormal + cg.ltcg112 + cg.ltcg112a;

    // ----------------------------------------------------
    // 5. OTHER SOURCES
    // ----------------------------------------------------
    const netOtherSources =
      other.savingsInterest +
      other.fdInterest +
      other.dividend +
      other.lottery115bb +
      other.vda115bbh +
      other.otherGeneral;

    // GROSS TOTAL INCOME
    const grossTotalIncome = Math.max(
      0,
      netSalary +
        netHouseProperty +
        netBusiness +
        netCapitalGains +
        netOtherSources
    );

    // ----------------------------------------------------
    // 6. CHAPTER VI-A DEDUCTIONS
    // ----------------------------------------------------
    const deductionBreakdown: Record<string, number> = {};
    let allowedDeductions = 0;

    if (regime === 'OLD') {
      // 80CCE aggregate: 80C + 80CCC + 80CCD(1) capped at 1,50,000
      const cceSum = (deductions.sec80C || 0) + (deductions.sec80CCC || 0) + (deductions.sec80CCD1 || 0);
      const cceAllowed = Math.min(150000, cceSum);
      deductionBreakdown['80C/CCC/CCD(1)'] = cceAllowed;

      // 80CCD(1B): Exclusive NPS up to 50,000
      const npsExtra = Math.min(50000, deductions.sec80CCD1B || 0);
      deductionBreakdown['80CCD(1B)'] = npsExtra;

      // 80CCD(2): Employer NPS contribution
      const npsEmployer = deductions.sec80CCD2 || 0;
      deductionBreakdown['80CCD(2)'] = npsEmployer;

      // 80D: Medical insurance
      const selfMax = 25000;
      const parentsMax = deductions.sec80D_parentsSenior ? 50000 : 25000;
      const selfD = Math.min(selfMax, deductions.sec80D_self || 0);
      const parentD = Math.min(parentsMax, deductions.sec80D_parents || 0);
      const total80D = selfD + parentD;
      deductionBreakdown['80D'] = total80D;

      // 80E: Higher education interest
      deductionBreakdown['80E'] = deductions.sec80E || 0;

      // 80G: Donations
      deductionBreakdown['80G'] = deductions.sec80G || 0;

      // 80TTA / 80TTB
      if (ageCategory === 'GENERAL') {
        const ttaAllowed = Math.min(
          10000,
          Math.min(other.savingsInterest || 0, deductions.sec80TTA || 0)
        );
        deductionBreakdown['80TTA'] = ttaAllowed;
      } else {
        const ttbAllowed = Math.min(
          50000,
          Math.min(
            (other.savingsInterest || 0) + (other.fdInterest || 0),
            deductions.sec80TTB || 0
          )
        );
        deductionBreakdown['80TTB'] = ttbAllowed;
      }

      deductionBreakdown['Other'] = deductions.secOther || 0;

      // Deductions cannot exceed (Gross Total Income - Special Rate Incomes)
      const specialIncomesTotal =
        (cg.stcg111a || 0) + (cg.ltcg112 || 0) + (cg.ltcg112a || 0) + (other.lottery115bb || 0) + (other.vda115bbh || 0);
      const maxEligibleIncome = Math.max(0, grossTotalIncome - specialIncomesTotal);

      let totalRaw = 0;
      for (const val of Object.values(deductionBreakdown)) {
        if (typeof val === 'number' && !isNaN(val)) {
          totalRaw += val;
        }
      }
      allowedDeductions = Math.min(totalRaw, maxEligibleIncome);
    } else {
      // NEW REGIME allows ONLY Section 80CCD(2)
      const npsEmployer = deductions.sec80CCD2 || 0;
      deductionBreakdown['80CCD(2) [Allowed in New]'] = npsEmployer;
      allowedDeductions = Math.min(grossTotalIncome, npsEmployer);
    }

    // TAXABLE TOTAL INCOME (Rounded to nearest 10 u/s 288A)
    const taxableRaw = Math.max(0, grossTotalIncome - allowedDeductions);
    const taxableTotalIncome = Math.round(taxableRaw / 10) * 10;

    // ----------------------------------------------------
    // 7. TAX COMPUTATION (Special Rates + Slab Rates)
    // ----------------------------------------------------
    // Special Rate Incomes:
    // STCG 111A
    const stcg111aTax = cg.stcg111a * (config.stcg111aRate / 100);

    // LTCG 112
    const ltcg112Tax = cg.ltcg112 * (config.ltcg112Rate / 100);

    // LTCG 112A (exemption threshold)
    const ltcg112aTaxable = Math.max(0, cg.ltcg112a - config.ltcg112aExemption);
    const ltcg112aTax = ltcg112aTaxable * (config.ltcg112aRate / 100);

    // Lottery 115BB @ 30%
    const lotteryTax = other.lottery115bb * 0.3;

    // VDA 115BBH @ 30%
    const vdaTax = other.vda115bbh * 0.3;

    const taxOnSpecialIncome =
      stcg111aTax + ltcg112Tax + ltcg112aTax + lotteryTax + vdaTax;

    // Normal Income Subject to Slab Tax
    const normalIncome = Math.max(
      0,
      taxableTotalIncome -
        (cg.stcg111a + cg.ltcg112 + cg.ltcg112a + other.lottery115bb + other.vda115bbh)
    );

    // Slab Tax Calculation
    const slabs = getTaxSlabs(ayId, regime, ageCategory);
    const slabBreakdown: TaxSlabBreakdown[] = [];
    let taxOnNormalIncome = 0;
    let remIncome = normalIncome;

    for (const slab of slabs) {
      if (remIncome <= slab.fromAmount) continue;

      const slabLimit = slab.toAmount !== null ? slab.toAmount : Infinity;
      const upper = Math.min(remIncome, slabLimit);
      const taxableInSlab = Math.max(0, upper - slab.fromAmount);

      const slabTax = Math.round((taxableInSlab * (slab.taxRate / 100)) * 100) / 100;
      taxOnNormalIncome += slabTax;

      const label =
        slab.toAmount !== null
          ? `₹${(slab.fromAmount / 100000).toFixed(1)}L - ₹${(slab.toAmount / 100000).toFixed(1)}L`
          : `Above ₹${(slab.fromAmount / 100000).toFixed(1)}L`;

      slabBreakdown.push({
        fromAmount: slab.fromAmount,
        toAmount: slab.toAmount,
        taxRate: slab.taxRate,
        taxableInSlab,
        slabTax,
        label,
      });
    }

    taxOnNormalIncome = Math.round(taxOnNormalIncome * 100) / 100;
    const grossTaxBeforeRebate = taxOnNormalIncome + taxOnSpecialIncome;

    // ----------------------------------------------------
    // 8. REBATE UNDER SECTION 87A
    // ----------------------------------------------------
    let rebate87a = 0;
    let rebate87aNote = 'Not eligible';

    if (profile.residentialStatus === 'RESIDENT') {
      if (regime === 'OLD') {
        if (taxableTotalIncome <= config.rebate87aLimitOld) {
          rebate87a = Math.min(grossTaxBeforeRebate, config.rebate87aMaxOld);
          rebate87aNote = `100% Tax Rebate u/s 87A (Income <= ₹5 Lakhs)`;
        }
      } else {
        // NEW REGIME
        if (config.rebate87aLimitNew > 0) {
          if (taxableTotalIncome <= config.rebate87aLimitNew) {
            rebate87a = Math.min(grossTaxBeforeRebate, config.rebate87aMaxNew);
            const limitLakhs = config.rebate87aLimitNew / 100000;
            rebate87aNote = `100% Tax Rebate u/s 87A (Income <= ₹${limitLakhs} Lakhs under New Regime)`;
          } else {
            // Marginal Relief u/s 87A for New Regime (Finance Act 2023 / Finance Act 2025)
            // If total income slightly exceeds rebate threshold, tax payable cannot exceed income exceeding the threshold
            const excessIncome = taxableTotalIncome - config.rebate87aLimitNew;
            if (grossTaxBeforeRebate > excessIncome) {
              rebate87a = grossTaxBeforeRebate - excessIncome;
              const limitLakhs = config.rebate87aLimitNew / 100000;
              rebate87aNote = `Marginal Relief u/s 87A: Tax capped at excess income of ₹${excessIncome.toLocaleString('en-IN')} over ₹${limitLakhs} Lakhs`;
            }
          }
        }
      }
    } else {
      rebate87aNote = 'Non-residents are not eligible for rebate u/s 87A';
    }

    const taxAfterRebate = Math.max(0, grossTaxBeforeRebate - rebate87a);

    // ----------------------------------------------------
    // 9. SURCHARGE & MARGINAL RELIEF
    // ----------------------------------------------------
    let surchargeRate = 0;
    let surchargeAmount = 0;
    let marginalReliefSurcharge = 0;

    if (taxableTotalIncome > 50000000) {
      // > 5 Crore
      surchargeRate = regime === 'NEW' ? 25 : 37;
    } else if (taxableTotalIncome > 20000000) {
      // > 2 Crore
      surchargeRate = 25;
    } else if (taxableTotalIncome > 10000000) {
      // > 1 Crore
      surchargeRate = 15;
    } else if (taxableTotalIncome > 5000000) {
      // > 50 Lakhs
      surchargeRate = 10;
    }

    if (surchargeRate > 0) {
      surchargeAmount = Math.round(taxAfterRebate * (surchargeRate / 100));
    }

    const taxPlusSurcharge = taxAfterRebate + surchargeAmount;

    // ----------------------------------------------------
    // 10. HEALTH & EDUCATION CESS (4%)
    // ----------------------------------------------------
    const healthEducationCess = Math.round(taxPlusSurcharge * 0.04);
    const totalTaxLiability = Math.round(taxPlusSurcharge + healthEducationCess);

    // ----------------------------------------------------
    // 11. PREPAID TAXES & NET PAYABLE / REFUND
    // ----------------------------------------------------
    const advanceTaxTotal =
      prepaid.advQ1 + prepaid.advQ2 + prepaid.advQ3 + prepaid.advQ4;
    const tdsTcsTotal =
      prepaid.tdsSalary + prepaid.tdsOther + prepaid.tcs;
    const totalPrepaidTaxes =
      advanceTaxTotal +
      tdsTcsTotal +
      prepaid.selfAssessmentTax +
      prepaid.previousTaxPaid;

    const netTaxPayableOrRefund = totalTaxLiability - totalPrepaidTaxes;

    return {
      ayId,
      regime,
      ageCategory,
      salaryGross: grossSalary,
      hraExemption,
      salaryStandardDeduction: standardDeduction,
      salaryProfTax: profTaxAllowed,
      netSalary,
      netHouseProperty,
      netBusiness,
      netCapitalGains,
      netOtherSources,
      grossTotalIncome,
      allowedDeductions,
      deductionBreakdown,
      taxableTotalIncome,
      taxOnNormalIncome,
      taxOnSpecialIncome,
      specialTaxBreakdown: {
        stcg111aTax,
        ltcg112Tax,
        ltcg112aTax,
        lotteryTax,
        vdaTax,
      },
      slabBreakdown,
      grossTaxBeforeRebate,
      taxOnIncome: grossTaxBeforeRebate,
      rebate87a,
      rebate87aNote,
      taxAfterRebate,
      surchargeRate,
      surchargeAmount,
      surcharge: surchargeAmount,
      marginalReliefSurcharge,
      taxPlusSurcharge,
      healthEducationCess,
      totalTaxLiability,
      totalPrepaidTaxes,
      advanceTaxTotal,
      tdsTcsTotal,
      netTaxPayableOrRefund,
      calculationLogs: logs,
    };
  }

  /**
   * Section 234A: Delay in filing return of income
   * 1% per month or part of a month from the date following due date to filing date
   */
  static computeInterest234A(
    assessedTax: number,
    prepaidTaxOnDueDate: number,
    dueDateStr: string,
    filingDateStr: string
  ): { months: number; shortfall: number; interest: number; isApplicable: boolean; notes: string } {
    const shortfall = Math.max(0, assessedTax - prepaidTaxOnDueDate);
    if (shortfall <= 0) {
      return {
        months: 0,
        shortfall: 0,
        interest: 0,
        isApplicable: false,
        notes: 'No shortfall: Taxes paid on or before due date cover assessed tax.',
      };
    }

    const due = new Date(dueDateStr);
    const filing = new Date(filingDateStr);

    if (filing <= due) {
      return {
        months: 0,
        shortfall,
        interest: 0,
        isApplicable: false,
        notes: 'Return filed on or before statutory due date u/s 139(1).',
      };
    }

    // Number of months or part of a month
    let months = (filing.getFullYear() - due.getFullYear()) * 12 + (filing.getMonth() - due.getMonth());
    if (filing.getDate() > due.getDate() || (due.getDate() >= 28 && filing.getDate() >= 1)) {
      if (filing.getMonth() === due.getMonth()) {
        months = 1;
      }
    }
    months = Math.max(1, months);

    // Rule 119A rounding down to nearest 100
    const roundedShortfall = Math.floor(shortfall / 100) * 100;
    const interest = Math.round(roundedShortfall * 0.01 * months);

    return {
      months,
      shortfall: roundedShortfall,
      interest,
      isApplicable: true,
      notes: `1% p.m. for ${months} month(s) on shortfall ₹${roundedShortfall.toLocaleString('en-IN')}`,
    };
  }

  /**
   * Section 234B: Default in payment of advance tax
   * Applicable if advance tax paid is less than 90% of assessed tax.
   * 1% per month from April 1 of AY to date of determination/filing.
   */
  static computeInterest234B(
    assessedTax: number,
    advanceTaxPaid: number,
    ayId: string,
    filingDateStr: string
  ): { months: number; shortfall: number; interest: number; isApplicable: boolean; notes: string } {
    const threshold90 = 0.9 * assessedTax;
    if (advanceTaxPaid >= threshold90) {
      return {
        months: 0,
        shortfall: 0,
        interest: 0,
        isApplicable: false,
        notes: `Advance tax (₹${advanceTaxPaid.toLocaleString('en-IN')}) >= 90% threshold (₹${threshold90.toLocaleString('en-IN')}). No default u/s 234B.`,
      };
    }

    const shortfall = Math.max(0, assessedTax - advanceTaxPaid);
    const startYear = parseInt(ayId.split('-')[0], 10);
    const startDate = new Date(startYear, 3, 1); // April 1 of AY
    const filingDate = new Date(filingDateStr);

    let months = (filingDate.getFullYear() - startDate.getFullYear()) * 12 + (filingDate.getMonth() - startDate.getMonth()) + 1;
    months = Math.max(1, months);

    const roundedShortfall = Math.floor(shortfall / 100) * 100;
    const interest = Math.round(roundedShortfall * 0.01 * months);

    return {
      months,
      shortfall: roundedShortfall,
      interest,
      isApplicable: true,
      notes: `Advance tax < 90%. 1% p.m. for ${months} months from 1st April on shortfall ₹${roundedShortfall.toLocaleString('en-IN')}`,
    };
  }

  /**
   * Section 234C: Deferment of Advance Tax Installments
   */
  static computeInterest234C(
    assessedTax: number,
    q1: number,
    q2: number,
    q3: number,
    q4: number
  ) {
    if (assessedTax <= 10000) {
      return {
        q1Shortfall: 0,
        q1Interest: 0,
        q2Shortfall: 0,
        q2Interest: 0,
        q3Shortfall: 0,
        q3Interest: 0,
        q4Shortfall: 0,
        q4Interest: 0,
        totalInterest: 0,
        notes: 'Assessed tax <= ₹10,000; advance tax provisions do not apply.',
      };
    }

    // Installment 1: 15% by 15 June (buffer 12%)
    const minQ1 = 0.12 * assessedTax;
    const targetQ1 = 0.15 * assessedTax;
    const q1Shortfall = q1 < minQ1 ? Math.max(0, targetQ1 - q1) : 0;
    const q1Interest = Math.round(Math.floor(q1Shortfall / 100) * 100 * 0.01 * 3);

    // Installment 2: 45% by 15 Sept (buffer 36%)
    const paidUpToQ2 = q1 + q2;
    const minQ2 = 0.36 * assessedTax;
    const targetQ2 = 0.45 * assessedTax;
    const q2Shortfall = paidUpToQ2 < minQ2 ? Math.max(0, targetQ2 - paidUpToQ2) : 0;
    const q2Interest = Math.round(Math.floor(q2Shortfall / 100) * 100 * 0.01 * 3);

    // Installment 3: 75% by 15 Dec
    const paidUpToQ3 = q1 + q2 + q3;
    const targetQ3 = 0.75 * assessedTax;
    const q3Shortfall = paidUpToQ3 < targetQ3 ? Math.max(0, targetQ3 - paidUpToQ3) : 0;
    const q3Interest = Math.round(Math.floor(q3Shortfall / 100) * 100 * 0.01 * 3);

    // Installment 4: 100% by 15 March
    const paidUpToQ4 = q1 + q2 + q3 + q4;
    const targetQ4 = 1.0 * assessedTax;
    const q4Shortfall = paidUpToQ4 < targetQ4 ? Math.max(0, targetQ4 - paidUpToQ4) : 0;
    const q4Interest = Math.round(Math.floor(q4Shortfall / 100) * 100 * 0.01 * 1);

    const totalInterest = q1Interest + q2Interest + q3Interest + q4Interest;

    return {
      q1Shortfall: Math.floor(q1Shortfall / 100) * 100,
      q1Interest,
      q2Shortfall: Math.floor(q2Shortfall / 100) * 100,
      q2Interest,
      q3Shortfall: Math.floor(q3Shortfall / 100) * 100,
      q3Interest,
      q4Shortfall: Math.floor(q4Shortfall / 100) * 100,
      q4Interest,
      totalInterest,
      notes: '1% per month on quarterly shortfalls (Q1: 3m, Q2: 3m, Q3: 3m, Q4: 1m)',
    };
  }

  /**
   * Section 234F: Fee for default in furnishing return of income
   */
  static computeFee234F(
    taxableIncome: number,
    dueDateStr: string,
    filingDateStr: string
  ): number {
    const due = new Date(dueDateStr);
    const filing = new Date(filingDateStr);
    if (filing <= due) return 0;
    if (taxableIncome <= 250000) return 0;
    return taxableIncome <= 500000 ? 1000 : 5000;
  }

  /**
   * Full Interest Computation
   */
  static computeAllInterest(
    assessedTax: number,
    tdsTcsCredit: number,
    advanceTaxPaid: number,
    dueDateStr: string,
    filingDateStr: string,
    ayId: string,
    q1: number,
    q2: number,
    q3: number,
    q4: number,
    taxableIncome: number
  ): InterestComputation {
    const netAssessedTax = Math.max(0, assessedTax - tdsTcsCredit);

    const sec234a = this.computeInterest234A(
      netAssessedTax,
      advanceTaxPaid,
      dueDateStr,
      filingDateStr
    );

    const sec234b = this.computeInterest234B(
      netAssessedTax,
      advanceTaxPaid,
      ayId,
      filingDateStr
    );

    const sec234c = this.computeInterest234C(netAssessedTax, q1, q2, q3, q4);
    const fee234f = this.computeFee234F(taxableIncome, dueDateStr, filingDateStr);

    const totalInterestAndFees =
      sec234a.interest + sec234b.interest + sec234c.totalInterest + fee234f;

    return {
      assessedTax: netAssessedTax,
      sec234a,
      sec234b,
      sec234c,
      fee234f,
      totalInterestAndFees,
    };
  }

  /**
   * Section 139(8A) & Section 140B ITR-U Eligibility & Additional Tax Engine
   */
  static computeItruEligibility(
    ayId: string,
    filingDateStr: string,
    revisedTaxLiability: number,
    interest234a: number,
    interest234b: number,
    interest234c: number,
    fee234f: number,
    previousTaxCredited: number,
    isLossReturn: boolean = false,
    isRefundClaim: boolean = false
  ): ItruEligibilityResult {
    // Determine end date of Assessment Year
    // e.g. for AY 2024-25, the AY ends on 2025-03-31
    const parts = ayId.split('-');
    const ayEndYear = parseInt(parts[0], 10) + 1;
    const ayEndDate = new Date(ayEndYear, 2, 31); // March 31 of AY end
    const filingDate = new Date(filingDateStr);

    const monthsElapsed =
      (filingDate.getFullYear() - ayEndDate.getFullYear()) * 12 +
      (filingDate.getMonth() - ayEndDate.getMonth()) +
      (filingDate.getDate() > 0 ? 1 : 0);

    let isEligible = true;
    let timeWindowCategory: 'WITHIN_12_MONTHS' | 'BETWEEN_12_AND_24_MONTHS' | 'EXPIRED' =
      'WITHIN_12_MONTHS';
    let additionalTaxRate = 25;
    let statutoryReason = '';

    if (isLossReturn) {
      isEligible = false;
      statutoryReason =
        'Section 139(8A) First Proviso: An updated return cannot be a return of loss.';
    } else if (isRefundClaim) {
      isEligible = false;
      statutoryReason =
        'Section 139(8A) First Proviso: ITR-U cannot be filed to claim or enhance a tax refund.';
    } else if (monthsElapsed <= 12) {
      timeWindowCategory = 'WITHIN_12_MONTHS';
      additionalTaxRate = 25;
      statutoryReason =
        'Assessee is within the 12-month window from end of relevant AY. Additional tax u/s 140B(1)(a) is 25%.';
    } else if (monthsElapsed <= 24) {
      timeWindowCategory = 'BETWEEN_12_AND_24_MONTHS';
      additionalTaxRate = 50;
      statutoryReason =
        'Assessee is between 12 and 24 months from end of relevant AY. Additional tax u/s 140B(1)(b) is 50%.';
    } else {
      isEligible = false;
      timeWindowCategory = 'EXPIRED';
      additionalTaxRate = 0;
      statutoryReason = `Ineligible: Exceeded statutory 24-month limit u/s 139(8A) (${monthsElapsed} months elapsed since ${ayEndDate.toISOString().split('T')[0]}).`;
    }

    const totalTaxAndInterest =
      revisedTaxLiability + interest234a + interest234b + interest234c + fee234f;

    const baseTaxAndInterestPayable = Math.max(
      0,
      totalTaxAndInterest - previousTaxCredited
    );

    const additionalTax140B = isEligible
      ? Math.round(baseTaxAndInterestPayable * (additionalTaxRate / 100))
      : 0;

    const totalPayableUnder140B =
      baseTaxAndInterestPayable + additionalTax140B;

    return {
      ayId,
      filingDate: filingDateStr,
      ayEndDate: ayEndDate.toISOString().split('T')[0],
      monthsElapsedFromAyEnd: Math.max(0, monthsElapsed),
      isEligible,
      timeWindowCategory,
      additionalTaxRate,
      statutoryReason,
      revisedTaxLiability,
      totalInterest: interest234a + interest234b + interest234c,
      fee234f,
      previousTaxCredited,
      baseTaxAndInterestPayable,
      baseTaxFor140B: baseTaxAndInterestPayable,
      additionalTax140B,
      totalPayableUnder140B,
      totalPayableWithItru: totalPayableUnder140B,
      isLossDisallowed: isLossReturn,
      isRefundDisallowed: isRefundClaim,
    };
  }

  /**
   * Helper overload to accept clean params object for computeTax
   */
  static computeTaxFromParams(params: {
    profile: ClientProfile;
    salary: SalaryInput;
    hp: HousePropertyInput;
    business: BusinessInput;
    cg: CapitalGainsInput;
    other: OtherSourcesInput;
    deductions: DeductionsInput;
    regime: TaxRegime;
    ayId: string;
    prepaid?: PrepaidTaxesInput;
  }): TaxComputationResult {
    const dummyPrepaid: PrepaidTaxesInput = params.prepaid || {
      tdsSalary: 0,
      tdsOther: 0,
      tcs: 0,
      advQ1: 0,
      advQ2: 0,
      advQ3: 0,
      advQ4: 0,
      selfAssessmentTax: 0,
      previousTaxPaid: 0,
    };
    return this.computeTax(
      params.ayId,
      params.regime,
      params.profile,
      params.salary,
      params.hp,
      params.business,
      params.cg,
      params.other,
      params.deductions,
      dummyPrepaid
    );
  }

  /**
   * Helper wrapper for interest computation from component state
   */
  static computeInterest(params: {
    currentResult: TaxComputationResult;
    prepaid: PrepaidTaxesInput;
    filingDueDate: string;
    actualFilingDate: string;
    ayId: string;
  }): InterestComputation {
    const totalTdsTcs =
      params.prepaid.tdsSalary + params.prepaid.tdsOther + params.prepaid.tcs;
    const totalAdv =
      params.prepaid.advQ1 +
      params.prepaid.advQ2 +
      params.prepaid.advQ3 +
      params.prepaid.advQ4;

    return this.computeAllInterest(
      params.currentResult.totalTaxLiability,
      totalTdsTcs,
      totalAdv,
      params.filingDueDate,
      params.actualFilingDate,
      params.ayId,
      params.prepaid.advQ1,
      params.prepaid.advQ2,
      params.prepaid.advQ3,
      params.prepaid.advQ4,
      params.currentResult.taxableTotalIncome
    );
  }

  /**
   * Helper wrapper for ITR-U eligibility from component state
   */
  static checkItruEligibility(params: {
    ayId: string;
    filingDate: string;
    originalStatus: any;
    currentTaxLiability: number;
    currentInterestAndFees: number;
  }): ItruEligibilityResult {
    return this.computeItruEligibility(
      params.ayId,
      params.filingDate,
      params.currentTaxLiability,
      0,
      0,
      0,
      params.currentInterestAndFees,
      0,
      false,
      false
    );
  }
}
