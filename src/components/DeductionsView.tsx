import React from 'react';
import { DeductionsInput, TaxRegime, AgeCategory } from '../types';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface DeductionsViewProps {
  deductions: DeductionsInput;
  onChangeDeductions: (d: DeductionsInput) => void;
  regime: TaxRegime;
  ageCategory: AgeCategory;
  onToggleRegime?: (r: TaxRegime) => void;
}

export const DeductionsView: React.FC<DeductionsViewProps> = ({
  deductions,
  onChangeDeductions,
  regime,
  ageCategory,
  onToggleRegime,
}) => {
  const handleChange = (field: keyof DeductionsInput, val: any) => {
    onChangeDeductions({
      ...deductions,
      [field]: val,
    });
  };

  const cceTotal = (deductions.sec80C || 0) + (deductions.sec80CCC || 0) + (deductions.sec80CCD1 || 0);
  const cceCapped = Math.min(150000, cceTotal);

  return (
    <div className="space-y-6">
      {/* Banner / Regime Alert */}
      {regime === 'NEW' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <strong className="block font-bold mb-0.5">
                Section 115BAC (New Tax Regime) Currently Active:
              </strong>
              Under Section 115BAC, Chapter VI-A deductions (80C, 80D, 80E, 80TTA/TTB, etc.) are statutorily disallowed.
              Only <strong>Section 80CCD(2)</strong> (Employer NPS) &amp; Standard Deduction remain allowed.
            </div>
          </div>
          {onToggleRegime && (
            <button
              type="button"
              onClick={() => onToggleRegime('OLD')}
              className="shrink-0 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
            >
              Switch to Old Regime to Claim Deductions
            </button>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800">
              <strong className="block font-bold mb-0.5">Old Tax Regime Active:</strong>
              All Chapter VI-A statutory deductions (80C up to ₹1.5L, 80CCD(1B) NPS ₹50k, 80D medical, 80G, 80TTA/TTB) are active and deducted against your taxable income.
            </div>
          </div>
          {onToggleRegime && (
            <button
              type="button"
              onClick={() => onToggleRegime('NEW')}
              className="shrink-0 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-colors shadow-xs"
            >
              Switch to New Regime (115BAC)
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 80C, 80CCC, 80CCD(1) Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-700 text-sm">
                Section 80CCE Limit (Cap: ₹1,50,000)
              </h3>
              <p className="text-[10px] text-slate-400">
                Aggregated cap on 80C, 80CCC and 80CCD(1)
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                regime === 'NEW'
                  ? 'bg-slate-100 text-slate-400 line-through'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              Allowed: ₹{regime === 'OLD' ? cceCapped.toLocaleString('en-IN') : 0}
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              80C (PPF, EPF, ELSS, Life Insurance, Tuition Fees)
            </label>
            <input
              type="number"
              value={deductions.sec80C || ''}
              onChange={(e) => handleChange('sec80C', parseFloat(e.target.value) || 0)}
              disabled={regime === 'NEW'}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              80CCC (Pension Fund Contributions)
            </label>
            <input
              type="number"
              value={deductions.sec80CCC || ''}
              onChange={(e) => handleChange('sec80CCC', parseFloat(e.target.value) || 0)}
              disabled={regime === 'NEW'}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              80CCD(1) (Employee / Self NPS Tier 1)
            </label>
            <input
              type="number"
              value={deductions.sec80CCD1 || ''}
              onChange={(e) => handleChange('sec80CCD1', parseFloat(e.target.value) || 0)}
              disabled={regime === 'NEW'}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Progress bar for 80CCE cap */}
          <div className="pt-2">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Section 80CCE Utilized:</span>
              <span className="font-mono font-bold">
                ₹{cceCapped.toLocaleString('en-IN')} / ₹1,50,000
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (cceTotal / 150000) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* NPS & Medical (80CCD & 80D) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100">
            NPS Exclusives &amp; Health Insurance (80D)
          </h3>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              80CCD(1B) (Exclusive Additional NPS up to ₹50,000)
            </label>
            <input
              type="number"
              value={deductions.sec80CCD1B || ''}
              onChange={(e) => handleChange('sec80CCD1B', parseFloat(e.target.value) || 0)}
              disabled={regime === 'NEW'}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1">
                80CCD(2) (Employer NPS Contribution)
              </label>
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">
                ALLOWED IN BOTH REGIMES
              </span>
            </div>
            <input
              type="number"
              value={deductions.sec80CCD2 || ''}
              onChange={(e) => handleChange('sec80CCD2', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[10px] text-blue-700 mt-1 block">
              Up to 10% of (Basic + DA) for private sector, 14% for Govt employees.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                80D Self &amp; Family (Max ₹25k)
              </label>
              <input
                type="number"
                value={deductions.sec80D_self || ''}
                onChange={(e) =>
                  handleChange('sec80D_self', parseFloat(e.target.value) || 0)
                }
                disabled={regime === 'NEW'}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                80D Parents (Max ₹25k / ₹50k)
              </label>
              <input
                type="number"
                value={deductions.sec80D_parents || ''}
                onChange={(e) =>
                  handleChange('sec80D_parents', parseFloat(e.target.value) || 0)
                }
                disabled={regime === 'NEW'}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="parents-senior"
              checked={deductions.sec80D_parentsSenior}
              onChange={(e) => handleChange('sec80D_parentsSenior', e.target.checked)}
              disabled={regime === 'NEW'}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <label
              htmlFor="parents-senior"
              className="text-xs text-slate-700 font-medium cursor-pointer"
            >
              Parents are Senior Citizens (Increases limit from ₹25,000 to ₹50,000)
            </label>
          </div>
        </div>

        {/* Other Chapter VI-A Deductions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100">
            Other Sections (80E, 80G, 80TTA/TTB)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                80E (Higher Education Loan Interest)
              </label>
              <input
                type="number"
                value={deductions.sec80E || ''}
                onChange={(e) => handleChange('sec80E', parseFloat(e.target.value) || 0)}
                disabled={regime === 'NEW'}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">No upper monetary ceiling</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                80G (Charitable Donations)
              </label>
              <input
                type="number"
                value={deductions.sec80G || ''}
                onChange={(e) => handleChange('sec80G', parseFloat(e.target.value) || 0)}
                disabled={regime === 'NEW'}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {ageCategory === 'GENERAL'
                  ? '80TTA (Savings Interest up to ₹10k)'
                  : '80TTB (Senior Deposits up to ₹50k)'}
              </label>
              <input
                type="number"
                value={
                  (ageCategory === 'GENERAL' ? deductions.sec80TTA : deductions.sec80TTB) || ''
                }
                onChange={(e) =>
                  handleChange(
                    ageCategory === 'GENERAL' ? 'sec80TTA' : 'sec80TTB',
                    parseFloat(e.target.value) || 0
                  )
                }
                disabled={regime === 'NEW'}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
