import React, { useState } from 'react';
import {
  AdvanceTaxAssesseeCategory,
  PrepaidTaxesInput,
  TaxComputationResult,
  formatYearWithFy,
} from '../types';
import { computeAdvanceTaxSchedule } from '../engine/advanceTaxEngine';
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';

interface AdvanceTaxScheduleCardProps {
  selectedAy: string;
  currentResult: TaxComputationResult;
  prepaid: PrepaidTaxesInput;
  onChangePrepaid: (p: PrepaidTaxesInput) => void;
  isSeniorCitizen?: boolean;
  hasBusinessIncome?: boolean;
}

export const AdvanceTaxScheduleCard: React.FC<AdvanceTaxScheduleCardProps> = ({
  selectedAy,
  currentResult,
  prepaid,
  onChangePrepaid,
  isSeniorCitizen = false,
  hasBusinessIncome = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AdvanceTaxAssesseeCategory>(
    isSeniorCitizen && !hasBusinessIncome ? 'SENIOR_CITIZEN_NO_BUSINESS' : 'NORMAL'
  );

  const schedule = computeAdvanceTaxSchedule(
    selectedAy,
    currentResult.totalTaxLiability,
    prepaid,
    {
      forcedCategory: selectedCategory,
      isSeniorCitizen,
      hasBusinessIncome,
    }
  );

  const handlePaidChange = (field: 'advQ1' | 'advQ2' | 'advQ3' | 'advQ4', val: number) => {
    onChangePrepaid({
      ...prepaid,
      [field]: val,
    });
  };

  // 1-Click: Auto-fill compliant installments
  const handleAutoFillCompliant = () => {
    if (schedule.assesseeCategory === 'SENIOR_CITIZEN_NO_BUSINESS' || schedule.isLiabilityBelowThreshold) {
      onChangePrepaid({
        ...prepaid,
        advQ1: 0,
        advQ2: 0,
        advQ3: 0,
        advQ4: 0,
      });
      return;
    }

    if (schedule.assesseeCategory === 'PRESUMPTIVE_44AD_44ADA') {
      onChangePrepaid({
        ...prepaid,
        advQ1: 0,
        advQ2: 0,
        advQ3: 0,
        advQ4: schedule.assessedTaxLiability,
      });
      return;
    }

    // Normal: Q1=15%, Q2=30%, Q3=30%, Q4=25%
    const q1 = Math.round(schedule.assessedTaxLiability * 0.15);
    const q2 = Math.round(schedule.assessedTaxLiability * 0.30);
    const q3 = Math.round(schedule.assessedTaxLiability * 0.30);
    const q4 = Math.max(0, schedule.assessedTaxLiability - (q1 + q2 + q3));

    onChangePrepaid({
      ...prepaid,
      advQ1: q1,
      advQ2: q2,
      advQ3: q3,
      advQ4: q4,
    });
  };

  const handleReset = () => {
    onChangePrepaid({
      ...prepaid,
      advQ1: 0,
      advQ2: 0,
      advQ3: 0,
      advQ4: 0,
    });
  };

  return (
    <div id="advance-tax-schedule-card" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold tracking-tight">
              Advance Tax Due Dates &amp; Statutory Liability for Persons
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded">
              Sec 208 • Sec 211 • Sec 234C
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Applicable for {formatYearWithFy(selectedAy)} (FY {schedule.fyId}). Tax liability required to be deposited before each statutory due date.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoFillCompliant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            title="Auto-fill exact compliant amounts to achieve ₹0 Section 234C interest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Fill Compliant Schedule</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
            title="Reset advance tax payments to zero"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Person Category Selector & Key Metrics Bar */}
      <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        {/* Category Pill Switcher */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Select Person / Assessee Classification:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('NORMAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                selectedCategory === 'NORMAL'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Normal Assessees (4 Quarters: 15%, 45%, 75%, 100%)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('PRESUMPTIVE_44AD_44ADA')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                selectedCategory === 'PRESUMPTIVE_44AD_44ADA'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Presumptive Business (Sec 44AD / 44ADA - 100% by 15 March)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('SENIOR_CITIZEN_NO_BUSINESS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                selectedCategory === 'SENIOR_CITIZEN_NO_BUSINESS'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Senior Citizen w/o Business (Sec 207(2) - Exempt)
            </button>
          </div>
        </div>

        {/* Calculation Summary KPIs */}
        <div className="flex items-center gap-5 text-right font-mono">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 font-sans">
              Gross Tax
            </span>
            <span className="text-xs font-bold text-slate-700">
              ₹{currentResult.totalTaxLiability.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 font-sans">
              Less: TDS / TCS
            </span>
            <span className="text-xs font-bold text-emerald-600">
              -₹{schedule.tdsTcsDeducted.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="pl-4 border-l border-slate-200">
            <span className="block text-[10px] uppercase font-bold text-blue-700 font-sans">
              Net Advance Tax Base (Sec 208)
            </span>
            <span className="text-sm font-bold text-blue-900">
              ₹{schedule.assessedTaxLiability.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Status Notice Banner */}
      {schedule.isLiabilityBelowThreshold ? (
        <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong>Section 208 Non-Applicability:</strong> Net assessed tax liability after TDS/TCS (₹
            {schedule.assessedTaxLiability.toLocaleString('en-IN')}) is less than ₹10,000.
            This person is <strong>not required</strong> to deposit advance tax for FY {schedule.fyId}.
          </div>
        </div>
      ) : schedule.isExemptSeniorCitizen ? (
        <div className="mx-6 mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-900">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <strong>Section 207(2) Statutory Exemption:</strong> Resident individual aged 60 or above with no business income
            is <strong>fully exempt</strong> from advance tax. No liability or 234C interest will be levied.
          </div>
        </div>
      ) : null}

      {/* Schedule Table */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border-b border-slate-200">
              <th className="py-3 px-3">Statutory Due Date</th>
              <th className="py-3 px-3 text-center">Cumulative %</th>
              <th className="py-3 px-3 text-right">Tax Liability to Pay Before Date</th>
              <th className="py-3 px-3 text-right">Quarterly Due</th>
              <th className="py-3 px-3 text-center min-w-[150px]">Tax Actually Paid (₹)</th>
              <th className="py-3 px-3 text-right">Shortfall</th>
              <th className="py-3 px-3 text-right">Sec 234C Interest</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {schedule.installments.map((inst, idx) => {
              const fieldName =
                inst.quarter === 'Q1'
                  ? 'advQ1'
                  : inst.quarter === 'Q2'
                  ? 'advQ2'
                  : inst.quarter === 'Q3'
                  ? 'advQ3'
                  : 'advQ4';

              return (
                <tr
                  key={inst.quarter}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    !inst.isCompliant && !schedule.isLiabilityBelowThreshold && !schedule.isExemptSeniorCitizen
                      ? 'bg-amber-50/30'
                      : ''
                  }`}
                >
                  {/* Due Date */}
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{inst.dueDate}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{inst.title}</span>
                  </td>

                  {/* Cumulative % */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-blue-100 text-blue-800">
                      {inst.cumulativeRatePct}%
                    </span>
                  </td>

                  {/* Cumulative Tax Liability To Pay Before Date */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                    ₹{inst.cumulativeTaxDue.toLocaleString('en-IN')}
                    {inst.safeHarborAmount > 0 && inst.safeHarborAmount !== inst.cumulativeTaxDue && (
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Safe Harbor: ₹{inst.safeHarborAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>

                  {/* Incremental / Quarterly Amount */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                    ₹{inst.incrementalTaxDue.toLocaleString('en-IN')}
                  </td>

                  {/* Editable Paid Input */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="number"
                      value={prepaid[fieldName] || ''}
                      onChange={(e) => handlePaidChange(fieldName, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full max-w-[130px] mx-auto px-2.5 py-1.5 text-sm font-mono text-right bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </td>

                  {/* Shortfall */}
                  <td className="py-3.5 px-3 text-right font-mono font-semibold">
                    {inst.shortfall > 0 ? (
                      <span className="text-red-600">₹{inst.shortfall.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Sec 234C Interest */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold">
                    {inst.interest234CAmount > 0 ? (
                      <span className="text-red-600">+₹{inst.interest234CAmount.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-emerald-600">₹0</span>
                    )}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      @ 1% × {inst.interest234CMonths}m
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center">
                    {inst.statusLabel === 'Exempt' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Exempt
                      </span>
                    ) : inst.statusLabel === 'Compliant' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Compliant</span>
                      </span>
                    ) : inst.statusLabel === 'Partial Shortfall' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3 h-3" />
                        <span>Shortfall</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        Unpaid
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-xs text-slate-900">
              <td className="py-3 px-3 uppercase tracking-wider">Total Advance Tax</td>
              <td className="py-3 px-3 text-center font-mono">100%</td>
              <td className="py-3 px-3 text-right font-mono text-sm">
                ₹{schedule.totalAdvanceTaxDue.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-500">—</td>
              <td className="py-3 px-3 text-center font-mono text-sm text-blue-900">
                ₹{schedule.totalAdvanceTaxPaid.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-3 text-right font-mono text-slate-500">—</td>
              <td className="py-3 px-3 text-right font-mono text-sm text-red-600">
                ₹{schedule.total234CInterest.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-3 text-center">
                {schedule.total234CInterest === 0 ? (
                  <span className="text-emerald-700 text-[11px]">No Deferment</span>
                ) : (
                  <span className="text-red-700 text-[11px]">Interest Payable</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Statutory Footnotes & Legal Notes */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 space-y-1.5">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Statutory Rules under Income-tax Act, 1961:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-slate-500">
          {schedule.statutoryNotes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
          <li>
            <strong>Payment before 31st March:</strong> Any amount paid by way of advance tax on or before the 31st day of March
            shall also be treated as advance tax paid during the financial year ending on that day.
          </li>
        </ul>
      </div>
    </div>
  );
};
