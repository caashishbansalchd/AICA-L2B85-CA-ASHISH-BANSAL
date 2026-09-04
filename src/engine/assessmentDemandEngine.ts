/**
 * Assessment Order & Appeal Demand Calculator Engine
 * Handles Scrutiny u/s 143(3), Re-assessment u/s 147, CIT (Appeals) orders u/s 250, ITAT u/s 254
 * Exact calculation of Tax, Surcharge, Cess, Sec 234A/B/C, and Sec 220(2) Interest as on date
 */

import {
  AssessmentOrderInput,
  AssessmentDemandResult,
  getFinancialYear,
} from '../types';
import { getPersonRateCard, DIRECTORY_YEARS } from '../data/taxRatesDirectory';

/**
 * Calculates month difference (part of a month counts as a full month as per Rule 119A)
 */
export function calculateMonthsRule119A(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return 0;
  }

  // Count months or part of a month
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  // If end day is strictly after start day, it's an additional part of month
  if (end.getDate() > start.getDate()) {
    months += 1;
  }
  // Minimum 1 month if end > start
  return Math.max(1, months);
}

/**
 * Adds days to a date string (YYYY-MM-DD)
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Core Assessment Demand Calculator
 */
export function computeAssessmentDemand(input: AssessmentOrderInput): AssessmentDemandResult {
  const fyId = getFinancialYear(input.ayId);
  const yrConfig = DIRECTORY_YEARS.find((y) => y.ayId === input.ayId) || DIRECTORY_YEARS[0];
  const rateCard = getPersonRateCard(input.personType, input.ayId);
  const notes: string[] = [];

  // 1. Assessed Total Income Computation
  const returnedIncome = Math.max(0, input.returnedIncome || 0);
  const regularAdditions = Math.max(0, input.regularAdditions || 0);
  const additions115BBE = Math.max(0, input.additions115BBE || 0);
  const stcgAdditions = Math.max(0, input.stcgAdditions || 0);
  const ltcgAdditions = Math.max(0, input.ltcgAdditions || 0);
  const disallowedDeductions = Math.max(0, input.disallowedDeductions || 0);

  const totalAdditions =
    regularAdditions + additions115BBE + stcgAdditions + ltcgAdditions + disallowedDeductions;

  // Assessed Total Income rounded off to nearest 10 u/s 288A
  const unroundedAssessedTotalIncome = returnedIncome + totalAdditions;
  const assessedTotalIncome = Math.round(unroundedAssessedTotalIncome / 10) * 10;

  // 2. Tax Computation Breakdown
  // Normal income subject to regular slabs
  const normalAssessedIncome = Math.max(
    0,
    assessedTotalIncome - additions115BBE - stcgAdditions - ltcgAdditions
  );

  let taxOnNormalAssessedIncome = 0;
  const slabs =
    input.regime === 'NEW' && rateCard.slabsNew
      ? rateCard.slabsNew
      : rateCard.slabsOld;

  if (rateCard.flatRateOld !== undefined && input.regime === 'OLD') {
    taxOnNormalAssessedIncome = (normalAssessedIncome * rateCard.flatRateOld) / 100;
  } else {
    for (const slab of slabs) {
      if (normalAssessedIncome > slab.fromAmount) {
        const taxable =
          slab.toAmount !== null
            ? Math.min(normalAssessedIncome, slab.toAmount) - slab.fromAmount
            : normalAssessedIncome - slab.fromAmount;
        if (taxable > 0) {
          taxOnNormalAssessedIncome += (taxable * slab.taxRate) / 100;
        }
      }
    }
  }

  // Tax on Section 115BBE additions (Unexplained cash credit u/s 68, 69, 69A etc.)
  // Statutory flat rate of 60%
  const taxOn115BBE = (additions115BBE * 60) / 100;
  if (additions115BBE > 0) {
    notes.push(
      `Additions u/s 115BBE of ₹${additions115BBE.toLocaleString('en-IN')} taxed at flat 60% + 25% surcharge.`
    );
  }

  // Tax on Capital Gains additions
  const yearStart = parseInt(input.ayId.split('-')[0], 10);
  const stcgRate = yearStart >= 2025 ? 20 : 15;
  const ltcgRate = yearStart >= 2025 ? 12.5 : 20;

  const taxOnSTCG = (stcgAdditions * stcgRate) / 100;
  const taxOnLTCG = (ltcgAdditions * ltcgRate) / 100;

  const grossTaxBeforeRebate =
    taxOnNormalAssessedIncome + taxOn115BBE + taxOnSTCG + taxOnLTCG;

  // Rebate u/s 87A (Only for resident individuals and only on normal income)
  let rebate87a = 0;
  const isIndividual =
    input.personType === 'INDIVIDUAL_GENERAL' ||
    input.personType === 'INDIVIDUAL_SENIOR' ||
    input.personType === 'INDIVIDUAL_SUPER_SENIOR';

  if (isIndividual) {
    if (input.regime === 'OLD') {
      if (assessedTotalIncome <= yrConfig.rebate87aOld.maxIncome) {
        rebate87a = Math.min(taxOnNormalAssessedIncome, yrConfig.rebate87aOld.maxRebate);
      }
    } else {
      if (yrConfig.rebate87aNew.maxIncome > 0 && assessedTotalIncome <= yrConfig.rebate87aNew.maxIncome) {
        rebate87a = Math.min(taxOnNormalAssessedIncome, yrConfig.rebate87aNew.maxRebate);
      } else if (yrConfig.rebate87aNew.maxIncome > 0) {
        // Marginal relief under Section 87A (New Regime)
        const excessIncome = assessedTotalIncome - yrConfig.rebate87aNew.maxIncome;
        if (taxOnNormalAssessedIncome > excessIncome) {
          rebate87a = taxOnNormalAssessedIncome - excessIncome;
        }
      }
    }
  }

  const taxAfterRebate = Math.max(0, grossTaxBeforeRebate - rebate87a);

  // Surcharge Calculation
  let surchargeRatePct = 0;
  if (
    input.personType.startsWith('INDIVIDUAL') ||
    input.personType === 'HUF' ||
    input.personType === 'AOP_BOI'
  ) {
    if (assessedTotalIncome > 50000000) {
      surchargeRatePct = input.regime === 'NEW' && yearStart >= 2024 ? 25 : 37;
    } else if (assessedTotalIncome > 20000000) {
      surchargeRatePct = 25;
    } else if (assessedTotalIncome > 10000000) {
      surchargeRatePct = 15;
    } else if (assessedTotalIncome > 5000000) {
      surchargeRatePct = yearStart === 2017 ? 0 : 10;
    }
  } else if (input.personType === 'FIRM_LLP' || input.personType === 'LOCAL_AUTHORITY') {
    if (assessedTotalIncome > 10000000) surchargeRatePct = 12;
  } else if (input.personType === 'DOMESTIC_COMPANY_115BAA') {
    surchargeRatePct = 10;
  } else if (input.personType.startsWith('DOMESTIC_COMPANY')) {
    if (assessedTotalIncome > 100000000) surchargeRatePct = 12;
    else if (assessedTotalIncome > 10000000) surchargeRatePct = 7;
  } else if (input.personType === 'FOREIGN_COMPANY') {
    if (assessedTotalIncome > 100000000) surchargeRatePct = 5;
    else if (assessedTotalIncome > 10000000) surchargeRatePct = 2;
  } else if (input.personType === 'COOPERATIVE_SOCIETY') {
    if (assessedTotalIncome > 100000000) surchargeRatePct = 12;
    else if (assessedTotalIncome > 10000000) surchargeRatePct = 7;
  }

  // Normal surcharge
  let normalSurcharge = (Math.max(0, taxAfterRebate - taxOn115BBE) * surchargeRatePct) / 100;
  // Surcharge on 115BBE is mandatory 25% under section 115BBE(2)
  let surcharge115BBE = additions115BBE > 0 ? (taxOn115BBE * 25) / 100 : 0;
  const surchargeAmount = Math.round(normalSurcharge + surcharge115BBE);

  // Health and Education Cess (3% pre-AY 2019-20, 4% post)
  const cessRatePct = yrConfig.cessPct;
  const cessAmount = Math.round(((taxAfterRebate + surchargeAmount) * cessRatePct) / 100);

  const totalAssessedTax = Math.round(taxAfterRebate + surchargeAmount + cessAmount);

  // 3. Pre-paid Taxes Credits
  const tdsCredit = Math.max(0, input.tdsCredit || 0);
  const tcsCredit = Math.max(0, input.tcsCredit || 0);
  const advanceTaxPaid = Math.max(0, input.advanceTaxPaid || 0);
  const satPaid = Math.max(0, input.satPaid || 0);
  const priorDemandPaid = Math.max(0, input.priorDemandPaid || 0);

  const totalPrepaidCredits =
    tdsCredit + tcsCredit + advanceTaxPaid + satPaid + priorDemandPaid;

  const refundAlreadyGranted = Math.max(0, input.refundAlreadyGranted || 0);
  const interest244aReceived = Math.max(0, input.interest244aReceived || 0);
  const refundAnd244ARecoverable = refundAlreadyGranted + interest244aReceived;

  // 4. Interest under Section 234A (Delay in filing return)
  // Assessed tax for 234A = Total Assessed Tax - (TDS + TCS + Advance Tax paid before due date)
  const taxFor234A = Math.max(0, totalAssessedTax - (tdsCredit + tcsCredit + advanceTaxPaid));
  let interest234A = 0;
  let interest234AMonths = 0;

  if (input.wasReturnFiled) {
    if (input.actualFilingDate && input.filingDueDate && input.actualFilingDate > input.filingDueDate) {
      interest234AMonths = calculateMonthsRule119A(input.filingDueDate, input.actualFilingDate);
      // 1% per month on shortfall rounded to lower 100 u/s 119A
      const principal234A = Math.floor(taxFor234A / 100) * 100;
      interest234A = Math.round((principal234A * 1 * interest234AMonths) / 100);
    }
  } else {
    // Return not filed: from due date to order date
    if (input.filingDueDate && input.orderDate) {
      interest234AMonths = calculateMonthsRule119A(input.filingDueDate, input.orderDate);
      const principal234A = Math.floor(taxFor234A / 100) * 100;
      interest234A = Math.round((principal234A * 1 * interest234AMonths) / 100);
    }
  }

  // 5. Interest under Section 234B (Default in advance tax payment)
  // Assessed tax for 234B = Total Assessed Tax - (TDS + TCS)
  const assessedTaxFor234B = Math.max(0, totalAssessedTax - (tdsCredit + tcsCredit));
  let interest234B = 0;
  let interest234BMonths = 0;

  // If advance tax paid is less than 90% of assessed tax
  if (advanceTaxPaid < assessedTaxFor234B * 0.9) {
    // Period: 1st April of AY to date of determination of total income / assessment order
    const startOfAy = `${yearStart}-04-01`;
    const orderDate = input.orderDate || `${yearStart + 1}-12-31`;
    interest234BMonths = calculateMonthsRule119A(startOfAy, orderDate);
    const shortfall = Math.max(0, assessedTaxFor234B - advanceTaxPaid);
    const principal234B = Math.floor(shortfall / 100) * 100;
    interest234B = Math.round((principal234B * 1 * interest234BMonths) / 100);
  }

  // 6. Interest under Section 234C (Estimated deferment)
  let interest234C = 0;
  if (assessedTaxFor234B > 10000 && advanceTaxPaid < assessedTaxFor234B) {
    // Standard deferment estimate if advance tax had major shortfall
    const shortfallAdv = assessedTaxFor234B - advanceTaxPaid;
    interest234C = Math.round((shortfallAdv * 0.03) / 100) * 100;
  }

  const totalInterest234 = interest234A + interest234B + interest234C;
  const totalAssessedTaxAndInterest = totalAssessedTax + totalInterest234;

  // Base Demand Before 220(2)
  const netBaseDemandBefore220 =
    totalAssessedTaxAndInterest + refundAnd244ARecoverable - totalPrepaidCredits;

  // 7. Interest under Section 220(2) (Default in payment beyond 30 days of Notice of Demand u/s 156)
  // As per Section 220(1), assessee has 30 days to pay.
  // Proviso to Section 220(2): Even if demand is modified/sustained in appeal by CIT(A),
  // interest runs from the expiry of the original 30-day notice period on the sustained demand!
  let interest220_2 = 0;
  let interest220_2Months = 0;
  const demandNoticeDate = input.demandNoticeDate || input.orderDate;
  const demandDueDate = addDays(demandNoticeDate, 30);
  const asOnDate = input.asOnDate || new Date().toISOString().split('T')[0];

  if (netBaseDemandBefore220 > 0 && asOnDate > demandDueDate) {
    interest220_2Months = calculateMonthsRule119A(demandDueDate, asOnDate);
    // 1% per month on principal demand rounded off u/s 119A
    const principal220 = Math.floor(netBaseDemandBefore220 / 100) * 100;
    interest220_2 = Math.round((principal220 * 1 * interest220_2Months) / 100);
    notes.push(
      `Sec. 220(2) interest charged @ 1% per month for ${interest220_2Months} months (from due date ${demandDueDate} to ${asOnDate}) as per statutory notice u/s 156.`
    );
  }

  // Net Tax Payable as on date, rounded off to nearest multiple of 10 u/s 288B
  const unroundedPayable = netBaseDemandBefore220 + interest220_2;
  const isRefund = unroundedPayable < 0;
  const netTaxPayableAsOnDate = Math.round(Math.abs(unroundedPayable) / 10) * 10 * (isRefund ? -1 : 1);

  // Order type label
  let orderTypeLabel = 'Order of Commissioner of Income Tax (Appeals) u/s 250';
  if (input.orderType === 'SCRUTINY_143_3') {
    orderTypeLabel = 'Scrutiny Assessment Order u/s 143(3)';
  } else if (input.orderType === 'REASSESSMENT_147') {
    orderTypeLabel = 'Re-assessment / Escaped Income Order u/s 147';
  } else if (input.orderType === 'BEST_JUDGMENT_144') {
    orderTypeLabel = 'Best Judgment Assessment Order u/s 144';
  } else if (input.orderType === 'ITAT_254') {
    orderTypeLabel = 'Income Tax Appellate Tribunal (ITAT) Order u/s 254';
  } else if (input.orderType === 'RECTIFICATION_154') {
    orderTypeLabel = 'Rectification Order u/s 154';
  }

  return {
    ayId: input.ayId,
    fyId,
    orderType: input.orderType,
    orderTypeLabel,
    orderNumber: input.orderNumber || 'CIT(A)/NFAC/DEL/2024-25/10492',
    orderDate: input.orderDate,
    demandNoticeDate,
    asOnDate,

    returnedIncome,
    totalAdditions,
    assessedTotalIncome,

    taxOnNormalAssessedIncome: Math.round(taxOnNormalAssessedIncome),
    taxOn115BBE: Math.round(taxOn115BBE),
    taxOnSTCG: Math.round(taxOnSTCG),
    taxOnLTCG: Math.round(taxOnLTCG),
    grossTaxBeforeRebate: Math.round(grossTaxBeforeRebate),
    rebate87a: Math.round(rebate87a),
    taxAfterRebate: Math.round(taxAfterRebate),
    surchargeAmount,
    surchargeRatePct,
    cessAmount,
    cessRatePct,
    totalAssessedTax,

    interest234A,
    interest234AMonths,
    interest234B,
    interest234BMonths,
    interest234C,
    totalInterest234,

    totalAssessedTaxAndInterest,
    totalPrepaidCredits,
    refundAnd244ARecoverable,
    netBaseDemandBefore220,

    interest220_2,
    interest220_2Months,
    demandDueDate,

    netTaxPayableAsOnDate,
    isRefund,
    notes,
  };
}
