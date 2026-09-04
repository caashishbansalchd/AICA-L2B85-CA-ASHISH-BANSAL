import { SavedTaxReport } from '../types';

const STORAGE_KEY = 'indian_tax_saved_reports';

/**
 * Default sample reports for Tax Year 2026-27 (FY 2026-27)
 */
const DEFAULT_SAMPLE_REPORTS: SavedTaxReport[] = [
  {
    id: 'sample-report-2026-27-01',
    clientName: 'Rajesh Malhotra',
    pan: 'ABCPM1234E',
    assesseeType: 'INDIVIDUAL',
    selectedAy: '2027-28',
    yearLabel: 'Tax Year 2026-27 (FY 2026-27)',
    dateGenerated: '2026-09-04T10:30:00.000Z',
    formattedDate: '04 Sep 2026, 04:00 PM',
    regime: 'NEW',
    grossTotalIncome: 1845000,
    totalDeductions: 0,
    taxableTotalIncome: 1770000,
    totalTaxLiability: 180960,
    totalPrepaidTaxes: 180000,
    advanceTaxPaid: 120000,
    interest234A: 0,
    interest234B: 0,
    interest234C: 0,
    totalInterestAndFees: 0,
    netTaxPayableOrRefund: 960,
    itruAdditionalTax140B: 0,
    totalPayableWithItru: 960,
    snapshot: {
      profile: {
        name: 'Rajesh Malhotra',
        pan: 'ABCPM1234E',
        dob: '1988-06-15',
        assesseeType: 'INDIVIDUAL',
        residentialStatus: 'RESIDENT',
        employerType: 'PRIVATE',
        filingDueDate: '2027-07-31',
        actualFilingDate: '2027-07-15',
        originalReturnStatus: 'SEC_139_1',
      },
      salary: {
        basic: 1450000,
        da: 145000,
        hraReceived: 240000,
        otherAllowances: 120000,
        profTax: 2500,
        rentPaid: 260000,
        isMetro: true,
      },
      hp: {
        propertyType: 'SOP',
        grossAnnualValue: 0,
        municipalTaxes: 0,
        interest24b: 0,
      },
      business: {
        scheme: 'NORMAL',
        grossReceiptsDigital: 0,
        grossReceiptsCash: 0,
        professionalReceipts: 0,
        normalProfit: 0,
      },
      cg: {
        stcg111a: 0,
        stcgNormal: 0,
        ltcg112: 0,
        ltcg112a: 0,
      },
      other: {
        savingsInterest: 18500,
        fdInterest: 42000,
        dividend: 15000,
        lottery115bb: 0,
        vda115bbh: 0,
        otherGeneral: 0,
      },
      deductions: {
        sec80C: 150000,
        sec80CCC: 0,
        sec80CCD1: 0,
        sec80CCD1B: 50000,
        sec80CCD2: 0,
        sec80D_self: 25000,
        sec80D_parents: 0,
        sec80D_parentsSenior: false,
        sec80E: 0,
        sec80G: 0,
        sec80TTA: 10000,
        sec80TTB: 0,
        secOther: 0,
      },
      prepaid: {
        tdsSalary: 60000,
        tdsOther: 0,
        tcs: 0,
        advQ1: 18000,
        advQ2: 36000,
        advQ3: 36000,
        advQ4: 30000,
        selfAssessmentTax: 0,
        previousTaxPaid: 0,
      },
      selectedAy: '2027-28',
      regime: 'NEW',
    },
  },
  {
    id: 'sample-report-2026-27-02',
    clientName: 'Sunita Mehra & Sons HUF',
    pan: 'AABHS9812K',
    assesseeType: 'HUF',
    selectedAy: '2027-28',
    yearLabel: 'Tax Year 2026-27 (FY 2026-27)',
    dateGenerated: '2026-09-04T11:45:00.000Z',
    formattedDate: '04 Sep 2026, 05:15 PM',
    regime: 'NEW',
    grossTotalIncome: 1150000,
    totalDeductions: 0,
    taxableTotalIncome: 1150000,
    totalTaxLiability: 0,
    totalPrepaidTaxes: 15000,
    advanceTaxPaid: 0,
    interest234A: 0,
    interest234B: 0,
    interest234C: 0,
    totalInterestAndFees: 0,
    netTaxPayableOrRefund: -15000,
    itruAdditionalTax140B: 0,
    totalPayableWithItru: 0,
    snapshot: {
      profile: {
        name: 'Sunita Mehra & Sons HUF',
        pan: 'AABHS9812K',
        dob: '2005-04-01',
        assesseeType: 'HUF',
        residentialStatus: 'RESIDENT',
        employerType: 'OTHER',
        filingDueDate: '2027-07-31',
        actualFilingDate: '2027-07-20',
        originalReturnStatus: 'SEC_139_1',
      },
      salary: {
        basic: 0,
        da: 0,
        hraReceived: 0,
        otherAllowances: 0,
        profTax: 0,
        rentPaid: 0,
        isMetro: false,
      },
      hp: {
        propertyType: 'LOP',
        grossAnnualValue: 600000,
        municipalTaxes: 30000,
        interest24b: 0,
      },
      business: {
        scheme: '44AD',
        grossReceiptsDigital: 8500000,
        grossReceiptsCash: 0,
        professionalReceipts: 0,
        normalProfit: 510000,
      },
      cg: {
        stcg111a: 0,
        stcgNormal: 0,
        ltcg112: 0,
        ltcg112a: 0,
      },
      other: {
        savingsInterest: 12000,
        fdInterest: 228000,
        dividend: 0,
        lottery115bb: 0,
        vda115bbh: 0,
        otherGeneral: 0,
      },
      deductions: {
        sec80C: 0,
        sec80CCC: 0,
        sec80CCD1: 0,
        sec80CCD1B: 0,
        sec80CCD2: 0,
        sec80D_self: 0,
        sec80D_parents: 0,
        sec80D_parentsSenior: false,
        sec80E: 0,
        sec80G: 0,
        sec80TTA: 0,
        sec80TTB: 0,
        secOther: 0,
      },
      prepaid: {
        tdsSalary: 0,
        tdsOther: 15000,
        tcs: 0,
        advQ1: 0,
        advQ2: 0,
        advQ3: 0,
        advQ4: 0,
        selfAssessmentTax: 0,
        previousTaxPaid: 0,
      },
      selectedAy: '2027-28',
      regime: 'NEW',
    },
  },
];

export const savedReportsService = {
  getSavedReports(): SavedTaxReport[] {
    if (typeof window === 'undefined') return DEFAULT_SAMPLE_REPORTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Initialize with default samples for immediate rich demonstration
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_REPORTS));
        return DEFAULT_SAMPLE_REPORTS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_SAMPLE_REPORTS;
    } catch (e) {
      console.error('Failed to read saved tax reports from localStorage:', e);
      return DEFAULT_SAMPLE_REPORTS;
    }
  },

  saveReport(report: Omit<SavedTaxReport, 'id' | 'dateGenerated' | 'formattedDate'>): SavedTaxReport {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newReport: SavedTaxReport = {
      ...report,
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      dateGenerated: now.toISOString(),
      formattedDate,
    };

    const currentList = this.getSavedReports();
    // Add to the top of the list
    const updatedList = [newReport, ...currentList.filter((r) => r.id !== newReport.id)];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save tax report to localStorage:', e);
    }

    return newReport;
  },

  deleteReport(id: string): SavedTaxReport[] {
    const currentList = this.getSavedReports();
    const updatedList = currentList.filter((r) => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to delete report:', e);
    }
    return updatedList;
  },

  clearAllReports(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear reports:', e);
    }
  },

  exportReportsAsJson(reports: SavedTaxReport[]): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `IndianTaxCalculator_SavedReports_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },
};
