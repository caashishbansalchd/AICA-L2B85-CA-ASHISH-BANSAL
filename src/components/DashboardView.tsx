import React, { useState } from 'react';
import {
  TaxComputationResult,
  InterestComputation,
  ItruEligibilityResult,
  formatYearWithFy,
} from '../types';
import { BookOpen, Gavel, FolderArchive, Calendar, BookmarkPlus, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  currentResult: TaxComputationResult;
  comparisonResult: TaxComputationResult;
  interest: InterestComputation;
  itruResult: ItruEligibilityResult;
  onNavigateToItru: () => void;
  onNavigateToInterest: () => void;
  onToggleRegime?: (r: 'NEW' | 'OLD') => void;
  onNavigateToTaxRates?: () => void;
  onNavigateToAssessmentCalc?: () => void;
  onNavigateToSavedReports?: () => void;
  onSaveCurrentCalculation?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentResult,
  comparisonResult,
  interest,
  itruResult,
  onNavigateToItru,
  onNavigateToInterest,
  onToggleRegime,
  onNavigateToTaxRates,
  onNavigateToAssessmentCalc,
  onNavigateToSavedReports,
  onSaveCurrentCalculation,
}) => {
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = () => {
    if (onSaveCurrentCalculation) {
      onSaveCurrentCalculation();
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3500);
    }
  };

  // Determine Old vs New
  const oldRes = currentResult.regime === 'OLD' ? currentResult : comparisonResult;
  const newRes = currentResult.regime === 'NEW' ? currentResult : comparisonResult;

  const isNewBeneficial = newRes.totalTaxLiability <= oldRes.totalTaxLiability;
  const savings = Math.abs(oldRes.totalTaxLiability - newRes.totalTaxLiability);

  // ITR-U adjusted tax is current total tax liability + interest
  const itruTax = currentResult.totalTaxLiability;
  const itruAddlTaxRate = itruResult.additionalTaxRate;
  const itruAddlTaxAmount = itruResult.additionalTax140B;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 8-col: Regime Comparison & ITR-U Analysis Table */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-700 text-sm">
              Regime Comparison &amp; ITR-U Analysis
            </h3>
            <p className="text-[11px] text-slate-500">
              Comparative analysis under Section 115BAC vs Old Statutory Framework
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onSaveCurrentCalculation && (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                title="Save current calculation to Saved Reports archive"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save Calculation</span>
              </button>
            )}

            {onToggleRegime && (
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-300/80 text-xs">
                <button
                  type="button"
                  onClick={() => onToggleRegime('OLD')}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                    currentResult.regime === 'OLD'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Old Regime
                </button>
                <button
                  type="button"
                  onClick={() => onToggleRegime('NEW')}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                    currentResult.regime === 'NEW'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New (115BAC)
                </button>
              </div>
            )}
            <span
              id="regime-benefit-tag"
              className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200"
            >
              {isNewBeneficial
                ? `Section 115BAC Preferred • Saves ₹${savings.toLocaleString('en-IN')}`
                : `Old Regime Preferred • Saves ₹${savings.toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>

        {saveToast && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Calculation successfully saved to Saved Reports tab!</span>
          </div>
        )}

        <div className="flex-1 p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-bold">Component</th>
                <th className="pb-3 font-bold text-right">Old Regime</th>
                <th className="pb-3 font-bold text-right">New Regime (115BAC)</th>
                <th className="pb-3 font-bold text-right text-blue-600">Selected ({currentResult.regime}) / ITR-U</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {/* Gross Salaries */}
              <tr>
                <td className="py-3 font-semibold text-slate-700">1. Salaries &amp; Allowances (Gross Sec. 17)</td>
                <td className="py-3 text-right font-mono font-medium text-slate-700">
                  ₹{oldRes.salaryGross.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right font-mono font-medium text-slate-700">
                  ₹{newRes.salaryGross.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right font-mono font-medium text-slate-800">
                  ₹{currentResult.salaryGross.toLocaleString('en-IN')}
                </td>
              </tr>

              {/* Standard Deduction u/s 16(ia) - SHOWN AS MINUS */}
              <tr className="bg-rose-50/50 text-xs">
                <td className="py-2.5 pl-6 font-semibold text-rose-700 flex items-center gap-1.5">
                  <span>↳ Less: Standard Deduction u/s 16(ia)</span>
                </td>
                <td className="py-2.5 text-right font-mono font-bold text-rose-700">
                  -₹{oldRes.salaryStandardDeduction.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 text-right font-mono font-bold text-rose-700">
                  {newRes.salaryStandardDeduction > 0
                    ? `-₹${newRes.salaryStandardDeduction.toLocaleString('en-IN')}`
                    : '₹0 (Disallowed)'}
                </td>
                <td className="py-2.5 text-right font-mono font-bold text-rose-800">
                  -₹{currentResult.salaryStandardDeduction.toLocaleString('en-IN')}
                </td>
              </tr>

              {/* HRA Exemption row if applicable */}
              {(oldRes.hraExemption > 0 || currentResult.hraExemption > 0) && (
                <tr className="bg-slate-50/70 text-xs">
                  <td className="py-1.5 pl-6 text-slate-600">
                    ↳ Less: HRA Exemption u/s 10(13A)
                  </td>
                  <td className="py-1.5 text-right font-mono text-slate-600">
                    {oldRes.hraExemption > 0 ? `-₹${oldRes.hraExemption.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                  <td className="py-1.5 text-right font-mono text-slate-400">
                    ₹0 (Disallowed in New)
                  </td>
                  <td className="py-1.5 text-right font-mono text-slate-700">
                    {currentResult.hraExemption > 0 ? `-₹${currentResult.hraExemption.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                </tr>
              )}

              {/* Professional Tax row if applicable */}
              {(oldRes.salaryProfTax > 0 || currentResult.salaryProfTax > 0) && (
                <tr className="bg-slate-50/70 text-xs">
                  <td className="py-1.5 pl-6 text-slate-600">
                    ↳ Less: Professional Tax u/s 16(iii)
                  </td>
                  <td className="py-1.5 text-right font-mono text-slate-600">
                    -₹{oldRes.salaryProfTax.toLocaleString('en-IN')}
                  </td>
                  <td className="py-1.5 text-right font-mono text-slate-400">
                    ₹0 (Disallowed in New)
                  </td>
                  <td className="py-1.5 text-right font-mono text-slate-700">
                    -₹{currentResult.salaryProfTax.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}

              {/* Net Income from Salaries */}
              <tr className="bg-slate-100/70 text-xs font-semibold">
                <td className="py-2 pl-4 text-slate-800">
                  = Net Chargeable Income from Salaries
                </td>
                <td className="py-2 text-right font-mono text-slate-900 font-bold">
                  ₹{oldRes.netSalary.toLocaleString('en-IN')}
                </td>
                <td className="py-2 text-right font-mono text-slate-900 font-bold">
                  ₹{newRes.netSalary.toLocaleString('en-IN')}
                </td>
                <td className="py-2 text-right font-mono text-slate-900 font-bold">
                  ₹{currentResult.netSalary.toLocaleString('en-IN')}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 text-slate-600">House Property (NAV / Interest)</td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-700">
                  {oldRes.netHouseProperty < 0 ? '-' : ''}₹{Math.abs(oldRes.netHouseProperty).toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-700">
                  <span>{newRes.netHouseProperty < 0 ? '-' : ''}₹{Math.abs(newRes.netHouseProperty).toLocaleString('en-IN')}</span>
                  {oldRes.netHouseProperty < 0 && newRes.netHouseProperty === 0 && (
                    <span className="block text-[10px] text-amber-600 font-sans font-normal">
                      Loss Disallowed u/s 115BAC
                    </span>
                  )}
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-800">
                  <span>{currentResult.netHouseProperty < 0 ? '-' : ''}₹{Math.abs(currentResult.netHouseProperty).toLocaleString('en-IN')}</span>
                  {currentResult.regime === 'NEW' && oldRes.netHouseProperty < 0 && (
                    <span className="block text-[10px] text-amber-600 font-sans font-normal">
                      Loss Disallowed
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 text-slate-600">Business / Profession (44AD/ADA)</td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-700">
                  ₹{oldRes.netBusiness.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-700">
                  ₹{newRes.netBusiness.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-800">
                  ₹{currentResult.netBusiness.toLocaleString('en-IN')}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 text-slate-600">Capital Gains &amp; Other Sources</td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-700">
                  ₹{(oldRes.netCapitalGains + oldRes.netOtherSources).toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-700">
                  ₹{(newRes.netCapitalGains + newRes.netOtherSources).toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-slate-800">
                  ₹{(currentResult.netCapitalGains + currentResult.netOtherSources).toLocaleString('en-IN')}
                </td>
              </tr>

              <tr className="bg-slate-50/30">
                <td className="py-3 text-slate-700 font-semibold">Gross Total Income (GTI)</td>
                <td className="py-3 text-right font-mono font-semibold text-slate-800">
                  ₹{oldRes.grossTotalIncome.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right font-mono font-semibold text-slate-800">
                  ₹{newRes.grossTotalIncome.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right font-mono font-semibold text-slate-900">
                  ₹{currentResult.grossTotalIncome.toLocaleString('en-IN')}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 text-slate-600">
                  Exemptions &amp; Chapter VI-A Deductions
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-red-600">
                  (₹{oldRes.allowedDeductions.toLocaleString('en-IN')})
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-red-600">
                  (₹{newRes.allowedDeductions.toLocaleString('en-IN')})
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-red-600">
                  (₹{currentResult.allowedDeductions.toLocaleString('en-IN')})
                </td>
              </tr>

              <tr className="bg-slate-50/60 font-semibold">
                <td className="py-3 text-slate-800">Net Taxable Total Income</td>
                <td className="py-3 text-right font-mono text-slate-900">
                  ₹{oldRes.taxableTotalIncome.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right font-mono text-slate-900">
                  ₹{newRes.taxableTotalIncome.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right font-mono text-slate-900">
                  ₹{currentResult.taxableTotalIncome.toLocaleString('en-IN')}
                </td>
              </tr>

              <tr>
                <td className="py-3.5 text-slate-600">Rebate u/s 87A</td>
                <td className="py-3.5 text-right font-mono font-medium text-emerald-600">
                  {oldRes.rebate87a > 0 ? `(₹${oldRes.rebate87a.toLocaleString('en-IN')})` : '₹0'}
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-emerald-600">
                  {newRes.rebate87a > 0 ? `(₹${newRes.rebate87a.toLocaleString('en-IN')})` : '₹0'}
                </td>
                <td className="py-3.5 text-right font-mono font-medium text-emerald-600">
                  {currentResult.rebate87a > 0 ? `(₹${currentResult.rebate87a.toLocaleString('en-IN')})` : '₹0'}
                </td>
              </tr>

              <tr className="border-t-2 border-slate-200">
                <td className="py-4 font-bold text-slate-800">Total Tax Payable (inc. Cess)</td>
                <td className="py-4 text-right font-mono font-bold text-slate-800 text-base">
                  ₹{oldRes.totalTaxLiability.toLocaleString('en-IN')}
                </td>
                <td className="py-4 text-right font-mono font-bold text-blue-600 text-base">
                  ₹{newRes.totalTaxLiability.toLocaleString('en-IN')}
                </td>
                <td className="py-4 text-right font-mono font-bold text-slate-900 text-base">
                  ₹{itruTax.toLocaleString('en-IN')}
                </td>
              </tr>

              <tr className="bg-slate-50/80">
                <td className="py-4 px-2 font-bold text-slate-800">
                  Additional Tax (Sec 140B)
                </td>
                <td className="py-4 text-right font-mono text-slate-400">—</td>
                <td className="py-4 text-right font-mono text-slate-400">—</td>
                <td className="py-4 px-2 text-right font-mono font-bold text-orange-600">
                  ₹{itruAddlTaxAmount.toLocaleString('en-IN')} ({itruAddlTaxRate}%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4-col: Interest Engine & ITR-U Eligibility */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Interest Calculation Engine Card */}
        <div
          id="card-interest-engine-summary"
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 text-sm">
                Interest Calculation Engine
              </h3>
              <button
                onClick={onNavigateToInterest}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                View Details →
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Section 234A (Delay in Filing)</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{interest.sec234a.interest.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Section 234B (Advance Tax Default)</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{interest.sec234b.interest.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Section 234C (Installment Deferment)</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{interest.sec234c.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>
              {interest.fee234f > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Section 234F (Late Fee)</span>
                  <span className="font-mono font-bold text-amber-600">
                    ₹{interest.fee234f.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Total Interest &amp; Fees</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  ₹{interest.totalInterestAndFees.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 p-3 rounded-lg text-[11px] text-blue-700 leading-relaxed border border-blue-100">
            <strong className="block mb-1 underline">Statutory Logic (CBDT):</strong>
            Default interest calculated @ 1% p.m. from April 1st for 234B and as per quarterly
            installments (15%, 45%, 75%, 100%) for 234C.
          </div>
        </div>

        {/* ITR-U Eligibility Card */}
        <div
          id="card-itru-eligibility-summary"
          className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg text-white"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white text-sm">ITR-U Eligibility</h3>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                itruResult.isEligible ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            ></span>
          </div>

          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            {itruResult.isEligible ? (
              <>
                Assessee is within the statutory window for {formatYearWithFy(itruResult.ayId)}.{' '}
                {itruResult.statutoryReason}{' '}
                Total additional tax liability payable under Section 140B is{' '}
                <strong className="text-white">
                  ₹{itruResult.additionalTax140B.toLocaleString('en-IN')}
                </strong>
                .
              </>
            ) : (
              <span className="text-red-300 font-medium">
                {itruResult.statutoryReason}
              </span>
            )}
          </p>

          <button
            onClick={onNavigateToItru}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded border border-slate-700 transition-colors uppercase tracking-wider text-center"
          >
            Open ITR-U Module &amp; XML
          </button>
        </div>

        {/* Quick Tools: Tax Rates Directory & Assessment Demand Calc & Saved Reports & Advance Tax */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Statutory Practice Utilities
          </span>

          <button
            type="button"
            onClick={onNavigateToInterest}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex items-start gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                Advance Tax Due Dates &amp; Schedule
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Check statutory quarterly installment due dates (15 June, 15 Sep, 15 Dec, 15 Mar) &amp; tax liability for persons.
              </p>
            </div>
          </button>

          {onNavigateToSavedReports && (
            <button
              type="button"
              onClick={onNavigateToSavedReports}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FolderArchive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-purple-800">
                  Saved Reports &amp; Audit Archive
                </div>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Browse client tax computation reports calculated using this tool along with date of generation.
                </p>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToTaxRates}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-start gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                Tax Rates Directory (Yearwise)
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Access statutory income tax slabs and rates across all legal persons &amp; assessment years.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onNavigateToAssessmentCalc}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-start gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-800">
                Assessment Order &amp; Appeal Demand Calc
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Calculate exact tax liability on additions made in CIT(A) / 143(3) / 147 orders with Sec 220(2) interest.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
