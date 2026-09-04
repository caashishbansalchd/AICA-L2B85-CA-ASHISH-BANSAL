import {
  AdvanceTaxAssesseeCategory,
  AdvanceTaxInstallment,
  AdvanceTaxScheduleResult,
  PrepaidTaxesInput,
  getFinancialYear,
} from '../types';

/**
 * Computes statutory advance tax due dates and installment liability for persons
 * under Sections 208, 209, 211, and 234C of the Income-tax Act, 1961.
 */
export function computeAdvanceTaxSchedule(
  ayId: string,
  totalTaxLiability: number,
  prepaid: PrepaidTaxesInput,
  options?: {
    forcedCategory?: AdvanceTaxAssesseeCategory;
    isSeniorCitizen?: boolean;
    hasBusinessIncome?: boolean;
  }
): AdvanceTaxScheduleResult {
  const fyId = getFinancialYear(ayId);
  const parts = fyId.split('-');
  const fyStart = parseInt(parts[0], 10);
  const fyEnd = fyStart + 1;

  // Exact statutory due dates for this financial year
  const q1Date = `15-Jun-${fyStart}`;
  const q1DateIso = `${fyStart}-06-15`;

  const q2Date = `15-Sep-${fyStart}`;
  const q2DateIso = `${fyStart}-09-15`;

  const q3Date = `15-Dec-${fyStart}`;
  const q3DateIso = `${fyStart}-12-15`;

  const q4Date = `15-Mar-${fyEnd}`;
  const q4DateIso = `${fyEnd}-03-15`;

  // Total TDS & TCS available as credit
  const tdsTcsDeducted = (prepaid.tdsSalary || 0) + (prepaid.tdsOther || 0) + (prepaid.tcs || 0);

  // Assessed tax liability for Advance Tax (Section 208)
  const assessedTaxLiability = Math.max(0, totalTaxLiability - tdsTcsDeducted);

  const isLiabilityBelowThreshold = assessedTaxLiability < 10000;
  const isSeniorCitizenNoBusiness =
    Boolean(options?.isSeniorCitizen) && !Boolean(options?.hasBusinessIncome);

  let assesseeCategory: AdvanceTaxAssesseeCategory = 'NORMAL';
  if (options?.forcedCategory) {
    assesseeCategory = options.forcedCategory;
  } else if (isSeniorCitizenNoBusiness) {
    assesseeCategory = 'SENIOR_CITIZEN_NO_BUSINESS';
  }

  let categoryLabel = 'All Persons / Companies / LLPs (Normal 4 Installments)';
  if (assesseeCategory === 'PRESUMPTIVE_44AD_44ADA') {
    categoryLabel = 'Presumptive Taxation Assessee (Sec 44AD / 44ADA)';
  } else if (assesseeCategory === 'SENIOR_CITIZEN_NO_BUSINESS') {
    categoryLabel = 'Resident Senior Citizen with No Business Income (Sec 207(2))';
  }

  const statutoryNotes: string[] = [];

  if (isLiabilityBelowThreshold) {
    statutoryNotes.push(
      `Section 208 Threshold: Net tax liability after TDS/TCS (₹${assessedTaxLiability.toLocaleString(
        'en-IN'
      )}) is below ₹10,000. Advance tax is not mandatory.`
    );
  } else {
    statutoryNotes.push(
      `Section 208 Mandate: Net tax liability after TDS/TCS exceeds ₹10,000. Assessee is legally required to pay advance tax before the specified due dates.`
    );
  }

  if (assesseeCategory === 'SENIOR_CITIZEN_NO_BUSINESS') {
    statutoryNotes.push(
      `Section 207(2) Exemption: A resident individual who is 60 years or older and does not have any income under "Profits and gains of business or profession" is fully exempt from paying advance tax.`
    );
  } else if (assesseeCategory === 'PRESUMPTIVE_44AD_44ADA') {
    statutoryNotes.push(
      `Section 211(1)(b): An eligible assessee opting for the presumptive taxation scheme u/s 44AD or 44ADA is liable to pay 100% of advance tax in a single installment on or before 15th March.`
    );
  } else {
    statutoryNotes.push(
      `Section 211(1)(a): All corporate and non-corporate assessees must pay advance tax in 4 installments: 15% by 15 June, 45% by 15 Sept, 75% by 15 Dec, and 100% by 15 March.`
    );
    statutoryNotes.push(
      `Section 234C Safe Harbor: No interest is charged for Q1 if payment is at least 12%, and for Q2 if payment is at least 36% of the returned tax.`
    );
  }

  const q1Paid = prepaid.advQ1 || 0;
  const q2Paid = prepaid.advQ2 || 0;
  const q3Paid = prepaid.advQ3 || 0;
  const q4Paid = prepaid.advQ4 || 0;

  const totalAdvanceTaxPaid = q1Paid + q2Paid + q3Paid + q4Paid;

  const installments: AdvanceTaxInstallment[] = [];

  if (assesseeCategory === 'SENIOR_CITIZEN_NO_BUSINESS' || isLiabilityBelowThreshold) {
    // Exempt / Below Threshold Schedule
    const dates = [
      { q: 'Q1' as const, d: q1Date, iso: q1DateIso, t: '1st Installment (On or before 15 June)', paid: q1Paid },
      { q: 'Q2' as const, d: q2Date, iso: q2DateIso, t: '2nd Installment (On or before 15 Sept)', paid: q2Paid },
      { q: 'Q3' as const, d: q3Date, iso: q3DateIso, t: '3rd Installment (On or before 15 Dec)', paid: q3Paid },
      { q: 'Q4' as const, d: q4Date, iso: q4DateIso, t: '4th Installment (On or before 15 March)', paid: q4Paid },
    ];

    let cumPaid = 0;
    for (const item of dates) {
      cumPaid += item.paid;
      installments.push({
        quarter: item.q,
        title: item.t,
        dueDate: item.d,
        dueDateIso: item.iso,
        cumulativeRatePct: 0,
        incrementalRatePct: 0,
        cumulativeTaxDue: 0,
        incrementalTaxDue: 0,
        taxPaidUpToDate: cumPaid,
        taxPaidInQuarter: item.paid,
        safeHarborAmount: 0,
        shortfall: 0,
        interest234CRatePct: 1,
        interest234CMonths: item.q === 'Q4' ? 1 : 3,
        interest234CAmount: 0,
        isCompliant: true,
        statusLabel: 'Exempt',
      });
    }

    return {
      ayId,
      fyId,
      totalTaxLiability,
      tdsTcsDeducted,
      assessedTaxLiability,
      isLiabilityBelowThreshold,
      isExemptSeniorCitizen: assesseeCategory === 'SENIOR_CITIZEN_NO_BUSINESS',
      assesseeCategory,
      categoryLabel,
      installments,
      totalAdvanceTaxDue: 0,
      totalAdvanceTaxPaid,
      total234CInterest: 0,
      statutoryNotes,
    };
  }

  if (assesseeCategory === 'PRESUMPTIVE_44AD_44ADA') {
    // Single installment on 15th March
    // Q1, Q2, Q3 have 0 liability
    installments.push({
      quarter: 'Q1',
      title: '1st Installment (On or before 15 June)',
      dueDate: q1Date,
      dueDateIso: q1DateIso,
      cumulativeRatePct: 0,
      incrementalRatePct: 0,
      cumulativeTaxDue: 0,
      incrementalTaxDue: 0,
      taxPaidUpToDate: q1Paid,
      taxPaidInQuarter: q1Paid,
      safeHarborAmount: 0,
      shortfall: 0,
      interest234CRatePct: 1,
      interest234CMonths: 3,
      interest234CAmount: 0,
      isCompliant: true,
      statusLabel: 'Compliant',
    });

    installments.push({
      quarter: 'Q2',
      title: '2nd Installment (On or before 15 Sept)',
      dueDate: q2Date,
      dueDateIso: q2DateIso,
      cumulativeRatePct: 0,
      incrementalRatePct: 0,
      cumulativeTaxDue: 0,
      incrementalTaxDue: 0,
      taxPaidUpToDate: q1Paid + q2Paid,
      taxPaidInQuarter: q2Paid,
      safeHarborAmount: 0,
      shortfall: 0,
      interest234CRatePct: 1,
      interest234CMonths: 3,
      interest234CAmount: 0,
      isCompliant: true,
      statusLabel: 'Compliant',
    });

    installments.push({
      quarter: 'Q3',
      title: '3rd Installment (On or before 15 Dec)',
      dueDate: q3Date,
      dueDateIso: q3DateIso,
      cumulativeRatePct: 0,
      incrementalRatePct: 0,
      cumulativeTaxDue: 0,
      incrementalTaxDue: 0,
      taxPaidUpToDate: q1Paid + q2Paid + q3Paid,
      taxPaidInQuarter: q3Paid,
      safeHarborAmount: 0,
      shortfall: 0,
      interest234CRatePct: 1,
      interest234CMonths: 3,
      interest234CAmount: 0,
      isCompliant: true,
      statusLabel: 'Compliant',
    });

    // Q4: 100% due by 15 March
    const q4Due = assessedTaxLiability;
    const paidUpToQ4 = totalAdvanceTaxPaid;
    const q4Shortfall = Math.max(0, q4Due - paidUpToQ4);
    const q4Interest = Math.round(Math.floor(q4Shortfall / 100) * 100 * 0.01 * 1);

    installments.push({
      quarter: 'Q4',
      title: '4th Installment (On or before 15 March - 100% Due)',
      dueDate: q4Date,
      dueDateIso: q4DateIso,
      cumulativeRatePct: 100,
      incrementalRatePct: 100,
      cumulativeTaxDue: q4Due,
      incrementalTaxDue: q4Due,
      taxPaidUpToDate: paidUpToQ4,
      taxPaidInQuarter: q4Paid,
      safeHarborAmount: q4Due,
      shortfall: Math.floor(q4Shortfall / 100) * 100,
      interest234CRatePct: 1,
      interest234CMonths: 1,
      interest234CAmount: q4Interest,
      isCompliant: q4Shortfall === 0,
      statusLabel: q4Shortfall === 0 ? 'Compliant' : paidUpToQ4 > 0 ? 'Partial Shortfall' : 'Default / Unpaid',
    });

    return {
      ayId,
      fyId,
      totalTaxLiability,
      tdsTcsDeducted,
      assessedTaxLiability,
      isLiabilityBelowThreshold: false,
      isExemptSeniorCitizen: false,
      assesseeCategory,
      categoryLabel,
      installments,
      totalAdvanceTaxDue: assessedTaxLiability,
      totalAdvanceTaxPaid,
      total234CInterest: q4Interest,
      statutoryNotes,
    };
  }

  // NORMAL Category: 4 Installments (15%, 45%, 75%, 100%)
  // Q1 (15 June): 15% due (safe harbor 12%)
  const q1Due = Math.round(assessedTaxLiability * 0.15);
  const q1Buffer = Math.round(assessedTaxLiability * 0.12);
  const q1Shortfall = q1Paid < q1Buffer ? Math.max(0, q1Due - q1Paid) : 0;
  const q1Interest = Math.round(Math.floor(q1Shortfall / 100) * 100 * 0.01 * 3);

  installments.push({
    quarter: 'Q1',
    title: '1st Installment (On or before 15 June)',
    dueDate: q1Date,
    dueDateIso: q1DateIso,
    cumulativeRatePct: 15,
    incrementalRatePct: 15,
    cumulativeTaxDue: q1Due,
    incrementalTaxDue: q1Due,
    taxPaidUpToDate: q1Paid,
    taxPaidInQuarter: q1Paid,
    safeHarborAmount: q1Buffer,
    shortfall: Math.floor(q1Shortfall / 100) * 100,
    interest234CRatePct: 1,
    interest234CMonths: 3,
    interest234CAmount: q1Interest,
    isCompliant: q1Shortfall === 0,
    statusLabel: q1Shortfall === 0 ? 'Compliant' : q1Paid > 0 ? 'Partial Shortfall' : 'Default / Unpaid',
  });

  // Q2 (15 Sept): 45% cumulative (safe harbor 36%)
  const q2Due = Math.round(assessedTaxLiability * 0.45);
  const q2IncrementalDue = Math.round(assessedTaxLiability * 0.30);
  const q2Buffer = Math.round(assessedTaxLiability * 0.36);
  const paidUpToQ2 = q1Paid + q2Paid;
  const q2Shortfall = paidUpToQ2 < q2Buffer ? Math.max(0, q2Due - paidUpToQ2) : 0;
  const q2Interest = Math.round(Math.floor(q2Shortfall / 100) * 100 * 0.01 * 3);

  installments.push({
    quarter: 'Q2',
    title: '2nd Installment (On or before 15 September)',
    dueDate: q2Date,
    dueDateIso: q2DateIso,
    cumulativeRatePct: 45,
    incrementalRatePct: 30,
    cumulativeTaxDue: q2Due,
    incrementalTaxDue: q2IncrementalDue,
    taxPaidUpToDate: paidUpToQ2,
    taxPaidInQuarter: q2Paid,
    safeHarborAmount: q2Buffer,
    shortfall: Math.floor(q2Shortfall / 100) * 100,
    interest234CRatePct: 1,
    interest234CMonths: 3,
    interest234CAmount: q2Interest,
    isCompliant: q2Shortfall === 0,
    statusLabel: q2Shortfall === 0 ? 'Compliant' : paidUpToQ2 > 0 ? 'Partial Shortfall' : 'Default / Unpaid',
  });

  // Q3 (15 Dec): 75% cumulative
  const q3Due = Math.round(assessedTaxLiability * 0.75);
  const q3IncrementalDue = Math.round(assessedTaxLiability * 0.30);
  const paidUpToQ3 = q1Paid + q2Paid + q3Paid;
  const q3Shortfall = paidUpToQ3 < q3Due ? Math.max(0, q3Due - paidUpToQ3) : 0;
  const q3Interest = Math.round(Math.floor(q3Shortfall / 100) * 100 * 0.01 * 3);

  installments.push({
    quarter: 'Q3',
    title: '3rd Installment (On or before 15 December)',
    dueDate: q3Date,
    dueDateIso: q3DateIso,
    cumulativeRatePct: 75,
    incrementalRatePct: 30,
    cumulativeTaxDue: q3Due,
    incrementalTaxDue: q3IncrementalDue,
    taxPaidUpToDate: paidUpToQ3,
    taxPaidInQuarter: q3Paid,
    safeHarborAmount: q3Due,
    shortfall: Math.floor(q3Shortfall / 100) * 100,
    interest234CRatePct: 1,
    interest234CMonths: 3,
    interest234CAmount: q3Interest,
    isCompliant: q3Shortfall === 0,
    statusLabel: q3Shortfall === 0 ? 'Compliant' : paidUpToQ3 > 0 ? 'Partial Shortfall' : 'Default / Unpaid',
  });

  // Q4 (15 March): 100% cumulative
  const q4Due = assessedTaxLiability;
  const q4IncrementalDue = Math.round(assessedTaxLiability * 0.25);
  const paidUpToQ4 = totalAdvanceTaxPaid;
  const q4Shortfall = paidUpToQ4 < q4Due ? Math.max(0, q4Due - paidUpToQ4) : 0;
  const q4Interest = Math.round(Math.floor(q4Shortfall / 100) * 100 * 0.01 * 1);

  installments.push({
    quarter: 'Q4',
    title: '4th Installment (On or before 15 March)',
    dueDate: q4Date,
    dueDateIso: q4DateIso,
    cumulativeRatePct: 100,
    incrementalRatePct: 25,
    cumulativeTaxDue: q4Due,
    incrementalTaxDue: q4IncrementalDue,
    taxPaidUpToDate: paidUpToQ4,
    taxPaidInQuarter: q4Paid,
    safeHarborAmount: q4Due,
    shortfall: Math.floor(q4Shortfall / 100) * 100,
    interest234CRatePct: 1,
    interest234CMonths: 1,
    interest234CAmount: q4Interest,
    isCompliant: q4Shortfall === 0,
    statusLabel: q4Shortfall === 0 ? 'Compliant' : paidUpToQ4 > 0 ? 'Partial Shortfall' : 'Default / Unpaid',
  });

  const total234CInterest = q1Interest + q2Interest + q3Interest + q4Interest;

  return {
    ayId,
    fyId,
    totalTaxLiability,
    tdsTcsDeducted,
    assessedTaxLiability,
    isLiabilityBelowThreshold: false,
    isExemptSeniorCitizen: false,
    assesseeCategory,
    categoryLabel,
    installments,
    totalAdvanceTaxDue: assessedTaxLiability,
    totalAdvanceTaxPaid,
    total234CInterest,
    statutoryNotes,
  };
}
