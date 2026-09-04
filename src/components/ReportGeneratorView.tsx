import React, { useState } from 'react';
import {
  ClientProfile,
  TaxComputationResult,
  InterestComputation,
  ItruEligibilityResult,
  SalaryInput,
  HousePropertyInput,
  BusinessInput,
  CapitalGainsInput,
  OtherSourcesInput,
  PrepaidTaxesInput,
  isTaxYear,
  getFinancialYear,
  formatYearWithFy,
} from '../types';
import { Printer, Download, FileText, CheckCircle2, BookmarkPlus, Calendar, Clock } from 'lucide-react';
import { computeAdvanceTaxSchedule } from '../engine/advanceTaxEngine';

interface ReportGeneratorViewProps {
  profile: ClientProfile;
  currentResult: TaxComputationResult;
  interest: InterestComputation;
  itruResult: ItruEligibilityResult;
  selectedAy: string;
  salary: SalaryInput;
  hp: HousePropertyInput;
  business: BusinessInput;
  cg: CapitalGainsInput;
  other: OtherSourcesInput;
  prepaid?: PrepaidTaxesInput;
  onSaveReport?: () => void;
}

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({
  profile,
  currentResult,
  interest,
  itruResult,
  selectedAy,
  salary,
  hp,
  business,
  cg,
  other,
  prepaid = {
    tdsSalary: 0,
    tdsOther: 0,
    tcs: 0,
    advQ1: 0,
    advQ2: 0,
    advQ3: 0,
    advQ4: 0,
    selfAssessmentTax: 0,
    previousTaxPaid: 0,
  },
  onSaveReport,
}) => {
  const [saveNotice, setSaveNotice] = useState<boolean>(false);
  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSaveReport) {
      onSaveReport();
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 3500);
    }
  };

  const advanceTaxSchedule = computeAdvanceTaxSchedule(
    selectedAy,
    currentResult.totalTaxLiability,
    prepaid,
    {
      hasBusinessIncome: business.normalProfit > 0 || business.grossReceiptsDigital > 0 || business.professionalReceipts > 0,
    }
  );

  const totalAdvanceTaxPaid = prepaid.advQ1 + prepaid.advQ2 + prepaid.advQ3 + prepaid.advQ4;
  const totalTdsTcs = prepaid.tdsSalary + prepaid.tdsOther + prepaid.tcs;
  const totalCredits = totalAdvanceTaxPaid + totalTdsTcs + prepaid.selfAssessmentTax;
  const netFinalPayable = (itruResult.totalPayableWithItru || (currentResult.totalTaxLiability + interest.totalInterestAndFees)) - totalCredits;

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-slate-800">
            Statutory Tax Computation Sheet &amp; Audit Memorandum
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {onSaveReport && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Save Report to History</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 print:hidden animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Report for {profile.name} saved to Saved Reports tab with generation timestamp!</span>
        </div>
      )}

      {/* Formal Printable Document */}
      <div
        id="printable-computation-memo"
        className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-sm font-sans max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 text-slate-900"
      >
        {/* Document Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-lg font-bold tracking-tight uppercase">
            Statement of Total Income &amp; Tax Computation
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Prepared in accordance with the provisions of the Income-tax Act, 1961
          </p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">
            {formatYearWithFy(selectedAy)}
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-1 flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3 text-blue-600 inline" />
            <span>Date of Generation: <strong>{currentDateFormatted}</strong></span>
          </p>
        </div>

        {/* Assessee Information Table */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <p><span className="font-semibold text-slate-500">Name of Assessee:</span> <strong className="text-slate-800">{profile.name}</strong></p>
            <p className="mt-1"><span className="font-semibold text-slate-500">Permanent Account Number (PAN):</span> <strong className="font-mono text-slate-800">{profile.pan}</strong></p>
            <p className="mt-1"><span className="font-semibold text-slate-500">Date of Birth / Incorporation:</span> {profile.dob}</p>
          </div>
          <div>
            <p><span className="font-semibold text-slate-500">Status / Category:</span> {profile.assesseeType}</p>
            <p className="mt-1"><span className="font-semibold text-slate-500">Residential Status:</span> {profile.residentialStatus}</p>
            <p className="mt-1"><span className="font-semibold text-slate-500">Selected Tax Regime:</span> <strong className="text-blue-700">{currentResult.regime === 'NEW' ? 'Section 115BAC (New Regime)' : 'Old Tax Regime'}</strong></p>
          </div>
        </div>

        {/* Computation Table */}
        <table className="w-full text-xs border-collapse mb-6">
          <thead>
            <tr className="border-y border-slate-300 bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider">
              <th className="py-2 text-left pl-2">Particulars of Income / Deductions</th>
              <th className="py-2 text-right">Details (₹)</th>
              <th className="py-2 text-right pr-2">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* 1. Salary */}
            <tr>
              <td className="py-2 pl-2 font-semibold text-slate-800">1. Income under the Head Salaries</td>
              <td className="py-2 text-right font-mono">
                {salary.basic > 0
                  ? (salary.basic + salary.da + salary.hraReceived + salary.otherAllowances).toLocaleString('en-IN')
                  : (currentResult.salaryGross > 0 ? currentResult.salaryGross.toLocaleString('en-IN') : '-')}
              </td>
              <td className="py-2 text-right pr-2 font-mono font-medium"></td>
            </tr>
            <tr>
              <td className="py-1.5 pl-6 text-slate-500">Less: Standard Deduction u/s 16(ia)</td>
              <td className="py-1.5 text-right font-mono text-rose-600 font-medium">
                (-{(currentResult.salaryStandardDeduction ?? 0).toLocaleString('en-IN')})
              </td>
              <td className="py-1.5 text-right pr-2 font-mono"></td>
            </tr>
            {currentResult.regime === 'OLD' && (currentResult.hraExemption > 0 || currentResult.salaryProfTax > 0) && (
              <tr>
                <td className="py-1.5 pl-6 text-slate-500">Less: HRA Exemption u/s 10(13A) &amp; Prof. Tax</td>
                <td className="py-1.5 text-right font-mono text-slate-500">
                  (-{(((currentResult.hraExemption || 0) + (currentResult.salaryProfTax || 0))).toLocaleString('en-IN')})
                </td>
                <td className="py-1.5 text-right pr-2 font-mono"></td>
              </tr>
            )}
            <tr className="bg-slate-50/50">
              <td className="py-2 pl-4 text-slate-700 font-medium">Net Salary Income</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono font-semibold">{(currentResult.netSalary ?? 0).toLocaleString('en-IN')}</td>
            </tr>

            {/* 2. House Property */}
            <tr>
              <td className="py-2 pl-2 font-semibold text-slate-800">2. Income / Loss from House Property</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono font-semibold">
                {currentResult.netHouseProperty < 0 ? `(${Math.abs(currentResult.netHouseProperty).toLocaleString('en-IN')})` : (currentResult.netHouseProperty ?? 0).toLocaleString('en-IN')}
              </td>
            </tr>

            {/* 3. Business */}
            <tr>
              <td className="py-2 pl-2 font-semibold text-slate-800">3. Profits and Gains of Business or Profession (PGBP)</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono font-semibold">{(currentResult.netBusiness ?? 0).toLocaleString('en-IN')}</td>
            </tr>

            {/* 4. Capital Gains */}
            <tr>
              <td className="py-2 pl-2 font-semibold text-slate-800">4. Capital Gains (Short Term + Long Term)</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono font-semibold">{(currentResult.netCapitalGains ?? 0).toLocaleString('en-IN')}</td>
            </tr>

            {/* 5. Other Sources */}
            <tr>
              <td className="py-2 pl-2 font-semibold text-slate-800">5. Income from Other Sources (IFOS)</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono font-semibold">{(currentResult.netOtherSources ?? 0).toLocaleString('en-IN')}</td>
            </tr>

            {/* GTI */}
            <tr className="border-t-2 border-slate-300 bg-slate-100/50 font-bold">
              <td className="py-2.5 pl-2 text-slate-800">Gross Total Income (GTI)</td>
              <td className="py-2.5 text-right font-mono"></td>
              <td className="py-2.5 text-right pr-2 font-mono text-slate-900">{(currentResult.grossTotalIncome ?? 0).toLocaleString('en-IN')}</td>
            </tr>

            {/* Chapter VI-A */}
            <tr>
              <td className="py-2 pl-2 text-slate-700">Less: Deductions under Chapter VI-A</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono text-red-600">({(currentResult.allowedDeductions ?? 0).toLocaleString('en-IN')})</td>
            </tr>

            {/* Total Income */}
            <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-50 font-bold text-sm">
              <td className="py-2.5 pl-2 text-slate-900">Total Income (Rounded off u/s 288A)</td>
              <td className="py-2.5 text-right font-mono"></td>
              <td className="py-2.5 text-right pr-2 font-mono text-slate-900">{(currentResult.taxableTotalIncome ?? 0).toLocaleString('en-IN')}</td>
            </tr>

            {/* Tax Computation */}
            <tr>
              <td className="py-2 pl-2 text-slate-700">Tax on Total Income (Normal Slabs + Special Rates)</td>
              <td className="py-2 text-right font-mono">{(currentResult.taxOnIncome ?? currentResult.grossTaxBeforeRebate ?? 0).toLocaleString('en-IN')}</td>
              <td className="py-2 text-right pr-2 font-mono"></td>
            </tr>
            {currentResult.rebate87a > 0 && (
              <tr>
                <td className="py-1.5 pl-6 text-slate-500">Less: Rebate u/s 87A (including marginal relief)</td>
                <td className="py-1.5 text-right font-mono text-emerald-600">({currentResult.rebate87a.toLocaleString('en-IN')})</td>
                <td className="py-1.5 text-right pr-2 font-mono"></td>
              </tr>
            )}
            {currentResult.surcharge > 0 && (
              <tr>
                <td className="py-1.5 pl-6 text-slate-500">Add: Surcharge</td>
                <td className="py-1.5 text-right font-mono">{currentResult.surcharge.toLocaleString('en-IN')}</td>
                <td className="py-1.5 text-right pr-2 font-mono"></td>
              </tr>
            )}
            <tr>
              <td className="py-1.5 pl-6 text-slate-500">Add: Health &amp; Education Cess @ 4%</td>
              <td className="py-1.5 text-right font-mono">{currentResult.healthEducationCess.toLocaleString('en-IN')}</td>
              <td className="py-1.5 text-right pr-2 font-mono"></td>
            </tr>
            <tr className="font-semibold">
              <td className="py-2 pl-2 text-slate-800">Total Tax Liability (Rounded off u/s 288B)</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono">{currentResult.totalTaxLiability.toLocaleString('en-IN')}</td>
            </tr>

            {/* Interest */}
            <tr>
              <td className="py-2 pl-2 text-slate-700">Add: Interest u/s 234A, 234B &amp; 234C + Fee 234F</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono">{interest.totalInterestAndFees.toLocaleString('en-IN')}</td>
            </tr>

            {/* ITR-U 140B */}
            {itruResult.additionalTax140B > 0 && (
              <tr className="bg-orange-50/50">
                <td className="py-2 pl-2 text-orange-900 font-semibold">Add: Additional Tax on Updated Return u/s 140B ({itruResult.additionalTaxRate}%)</td>
                <td className="py-2 text-right font-mono"></td>
                <td className="py-2 text-right pr-2 font-mono font-bold text-orange-800">{itruResult.additionalTax140B.toLocaleString('en-IN')}</td>
              </tr>
            )}

            {/* Total Tax & Statutory Interest Assessed */}
            <tr className="bg-slate-50 font-semibold">
              <td className="py-2 pl-2 text-slate-800">Gross Aggregate Demand Assessed</td>
              <td className="py-2 text-right font-mono"></td>
              <td className="py-2 text-right pr-2 font-mono">
                ₹{(itruResult.totalPayableWithItru || (currentResult.totalTaxLiability + interest.totalInterestAndFees)).toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Tax Credits & Advance Tax Offset */}
            {totalAdvanceTaxPaid > 0 && (
              <tr>
                <td className="py-1.5 pl-6 text-slate-600">Less: Advance Tax Paid u/s 211 (Q1 to Q4)</td>
                <td className="py-1.5 text-right font-mono text-emerald-600">({totalAdvanceTaxPaid.toLocaleString('en-IN')})</td>
                <td className="py-1.5 text-right pr-2 font-mono"></td>
              </tr>
            )}
            {totalTdsTcs > 0 && (
              <tr>
                <td className="py-1.5 pl-6 text-slate-600">Less: TDS (Form 16/16A) &amp; TCS Claimed u/s 199 / 206C</td>
                <td className="py-1.5 text-right font-mono text-emerald-600">({totalTdsTcs.toLocaleString('en-IN')})</td>
                <td className="py-1.5 text-right pr-2 font-mono"></td>
              </tr>
            )}
            {prepaid.selfAssessmentTax > 0 && (
              <tr>
                <td className="py-1.5 pl-6 text-slate-600">Less: Self Assessment Tax Paid u/s 140A</td>
                <td className="py-1.5 text-right font-mono text-emerald-600">({prepaid.selfAssessmentTax.toLocaleString('en-IN')})</td>
                <td className="py-1.5 text-right pr-2 font-mono"></td>
              </tr>
            )}

            {/* Final Net Balance Payable / Refund */}
            <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-100 font-bold text-sm">
              <td className="py-3 pl-2 text-slate-900 uppercase">
                {netFinalPayable < 0 ? 'Net Refund Due u/s 237' : 'Net Amount Payable u/s 156'}
              </td>
              <td className="py-3 text-right font-mono"></td>
              <td className="py-3 text-right pr-2 font-mono text-blue-700">
                ₹{Math.abs(netFinalPayable).toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Advance Tax Due Dates & Installment Schedule Section */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Schedule of Statutory Advance Tax Due Dates &amp; Tax Liability (Section 211)
          </h4>
          <table className="w-full text-[11px] border-collapse border border-slate-200 text-left mb-6">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold">
                <th className="py-1.5 px-2 border-b border-slate-200">Installment &amp; Due Date</th>
                <th className="py-1.5 px-2 text-center border-b border-slate-200">Cumulative %</th>
                <th className="py-1.5 px-2 text-right border-b border-slate-200">Tax Liability Required</th>
                <th className="py-1.5 px-2 text-right border-b border-slate-200">Amount Deposited (₹)</th>
                <th className="py-1.5 px-2 text-right border-b border-slate-200">Interest 234C</th>
                <th className="py-1.5 px-2 text-center border-b border-slate-200">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {advanceTaxSchedule.installments.map((inst) => (
                <tr key={inst.quarter}>
                  <td className="py-1.5 px-2 font-sans font-medium text-slate-800">
                    {inst.title} ({inst.dueDate})
                  </td>
                  <td className="py-1.5 px-2 text-center">{inst.cumulativeRatePct}%</td>
                  <td className="py-1.5 px-2 text-right">₹{inst.cumulativeTaxDue.toLocaleString('en-IN')}</td>
                  <td className="py-1.5 px-2 text-right font-bold text-slate-900">₹{inst.taxPaidUpToDate.toLocaleString('en-IN')}</td>
                  <td className="py-1.5 px-2 text-right text-red-600">
                    {inst.interest234CAmount > 0 ? `₹${inst.interest234CAmount.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                  <td className="py-1.5 px-2 text-center font-sans font-semibold">
                    <span className={inst.isCompliant ? 'text-emerald-700' : 'text-amber-700'}>
                      {inst.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification / Signature Blocks */}
        <div className="grid grid-cols-2 gap-8 pt-10 mt-6 border-t border-slate-200 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-800 mb-10">Prepared By:</p>
            <p className="border-t border-slate-300 pt-1 font-semibold text-slate-700">Authorized Signatory / Tax Preparer</p>
            <p className="text-[10px] text-slate-500">Income Tax Computation Cell</p>
          </div>
          <div>
            <p className="font-bold text-slate-800 mb-10 text-right">Assessee Verification:</p>
            <p className="border-t border-slate-300 pt-1 text-right font-semibold text-slate-700">{profile.name}</p>
            <p className="text-[10px] text-slate-500 text-right font-mono">{profile.pan}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
