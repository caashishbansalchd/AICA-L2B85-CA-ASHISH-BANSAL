import React from 'react';
import { PrepaidTaxesInput, InterestComputation, TaxComputationResult, formatYearWithFy, getYearLabel } from '../types';
import { Clock, ShieldAlert, Calendar, CheckCircle2 } from 'lucide-react';
import { AdvanceTaxScheduleCard } from './AdvanceTaxScheduleCard';

interface InterestEngineViewProps {
  prepaid: PrepaidTaxesInput;
  onChangePrepaid: (p: PrepaidTaxesInput) => void;
  interest: InterestComputation;
  currentResult: TaxComputationResult;
  filingDueDate: string;
  actualFilingDate: string;
  selectedAy?: string;
  isSeniorCitizen?: boolean;
  hasBusinessIncome?: boolean;
}

export const InterestEngineView: React.FC<InterestEngineViewProps> = ({
  prepaid,
  onChangePrepaid,
  interest,
  currentResult,
  filingDueDate,
  actualFilingDate,
  selectedAy = '2027-28',
  isSeniorCitizen = false,
  hasBusinessIncome = false,
}) => {
  const handleChange = (field: keyof PrepaidTaxesInput, val: number) => {
    onChangePrepaid({
      ...prepaid,
      [field]: val,
    });
  };

  const totalAdvancePaid = prepaid.advQ1 + prepaid.advQ2 + prepaid.advQ3 + prepaid.advQ4;
  const totalTdsTcs = prepaid.tdsSalary + prepaid.tdsOther + prepaid.tcs;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Assessed Tax (Net of TDS/TCS)
          </p>
          <p className="text-xl font-bold text-slate-800 font-mono">
            ₹{interest.assessedTax.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Tax liability less TDS/TCS</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Advance Tax Paid
          </p>
          <p className="text-xl font-bold text-slate-800 font-mono">
            ₹{totalAdvancePaid.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Sum of Q1 to Q4 installments</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Section 234B Status
          </p>
          <p className="text-xl font-bold font-mono">
            {interest.sec234b.isApplicable ? (
              <span className="text-red-600">Defaulted (₹{interest.sec234b.interest.toLocaleString('en-IN')})</span>
            ) : (
              <span className="text-green-600">Compliant (₹0)</span>
            )}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">90% Threshold: ₹{(0.9 * interest.assessedTax).toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md text-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Statutory Interest &amp; Fees
          </p>
          <p className="text-2xl font-bold text-amber-400 font-mono">
            ₹{interest.totalInterestAndFees.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Sum of 234A, 234B, 234C &amp; 234F</p>
        </div>
      </div>

      {/* Statutory Advance Tax Due Dates & Liability for Persons */}
      <AdvanceTaxScheduleCard
        selectedAy={selectedAy}
        currentResult={currentResult}
        prepaid={prepaid}
        onChangePrepaid={onChangePrepaid}
        isSeniorCitizen={isSeniorCitizen}
        hasBusinessIncome={hasBusinessIncome}
      />

      {/* Prepaid Taxes & Other Credit Inputs */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>TDS, TCS &amp; Other Tax Credits Claimed (Form 26AS / AIS / TIS)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              TDS on Salary (Form 16)
            </label>
            <input
              type="number"
              value={prepaid.tdsSalary || ''}
              onChange={(e) => handleChange('tdsSalary', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              TDS on Non-Salary (Form 16A)
            </label>
            <input
              type="number"
              value={prepaid.tdsOther || ''}
              onChange={(e) => handleChange('tdsOther', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Tax Collected at Source (TCS)
            </label>
            <input
              type="number"
              value={prepaid.tcs || ''}
              onChange={(e) => handleChange('tcs', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Self Assessment Tax u/s 140A
            </label>
            <input
              type="number"
              value={prepaid.selfAssessmentTax || ''}
              onChange={(e) =>
                handleChange('selfAssessmentTax', parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-600 font-medium">Total Credit Claimed (26AS / AIS + Self Assessment):</span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            ₹{(totalTdsTcs + prepaid.selfAssessmentTax).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Statutory Section Drilldown Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-slate-700 text-sm mb-4">
          Statutory Interest Calculation Audit (Sections 234A, 234B, 234C &amp; 234F)
        </h3>

        <table className="w-full text-left text-sm border-collapse min-w-[600px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="pb-3">Section</th>
              <th className="pb-3">Trigger Condition</th>
              <th className="pb-3 text-right">Shortfall (Rounded u/s 119A)</th>
              <th className="pb-3 text-right">Months / Rate</th>
              <th className="pb-3 text-right">Interest Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            <tr>
              <td className="py-3 font-bold font-sans text-slate-800">Section 234A</td>
              <td className="py-3 font-sans text-slate-600">
                Delay in return filing beyond due date ({filingDueDate} vs {actualFilingDate})
              </td>
              <td className="py-3 text-right text-slate-700">
                ₹{interest.sec234a.shortfall.toLocaleString('en-IN')}
              </td>
              <td className="py-3 text-right text-slate-700">
                {interest.sec234a.months} month(s) @ 1%
              </td>
              <td className="py-3 text-right font-bold text-slate-900">
                ₹{interest.sec234a.interest.toLocaleString('en-IN')}
              </td>
            </tr>

            <tr>
              <td className="py-3 font-bold font-sans text-slate-800">Section 234B</td>
              <td className="py-3 font-sans text-slate-600">
                Advance tax paid (&lt;90% of assessed tax) from 1st April of {selectedAy ? formatYearWithFy(selectedAy, { short: true }) : 'AY'}
              </td>
              <td className="py-3 text-right text-slate-700">
                ₹{interest.sec234b.shortfall.toLocaleString('en-IN')}
              </td>
              <td className="py-3 text-right text-slate-700">
                {interest.sec234b.months} month(s) @ 1%
              </td>
              <td className="py-3 text-right font-bold text-slate-900">
                ₹{interest.sec234b.interest.toLocaleString('en-IN')}
              </td>
            </tr>

            <tr>
              <td className="py-3 font-bold font-sans text-slate-800">Section 234C</td>
              <td className="py-3 font-sans text-slate-600">
                Deferment of quarterly advance tax installments
              </td>
              <td className="py-3 text-right text-slate-700">
                Multiple quarters
              </td>
              <td className="py-3 text-right text-slate-700">
                3m/3m/3m/1m @ 1%
              </td>
              <td className="py-3 text-right font-bold text-slate-900">
                ₹{interest.sec234c.totalInterest.toLocaleString('en-IN')}
              </td>
            </tr>

            {interest.fee234f > 0 && (
              <tr>
                <td className="py-3 font-bold font-sans text-slate-800">Section 234F</td>
                <td className="py-3 font-sans text-slate-600">
                  Late filing fee for belated return
                </td>
                <td className="py-3 text-right text-slate-400">—</td>
                <td className="py-3 text-right text-slate-400">—</td>
                <td className="py-3 text-right font-bold text-amber-600">
                  ₹{interest.fee234f.toLocaleString('en-IN')}
                </td>
              </tr>
            )}

            <tr className="bg-slate-50/70 font-bold">
              <td colSpan={4} className="py-3 px-2 font-sans text-slate-800">
                Total Statutory Interest &amp; Fees Payable
              </td>
              <td className="py-3 px-2 text-right text-slate-900 text-sm">
                ₹{interest.totalInterestAndFees.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
