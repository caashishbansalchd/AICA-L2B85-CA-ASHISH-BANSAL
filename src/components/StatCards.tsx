import React from 'react';
import { TaxComputationResult } from '../types';

interface StatCardsProps {
  computation: TaxComputationResult;
  comparisonDiff?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  computation,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none">
      {/* Gross Total Income */}
      <div
        id="card-gross-total-income"
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Gross Total Income
        </p>
        <p className="text-2xl font-bold text-slate-800 font-mono">
          ₹{computation.grossTotalIncome.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-green-600 mt-2 font-medium flex items-center gap-1">
          <span>↑</span>
          <span>5 Heads Aggregated & Exemptions Applied</span>
        </p>
      </div>

      {/* Total Deductions */}
      <div
        id="card-total-deductions"
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Total Deductions
        </p>
        <p className="text-2xl font-bold text-slate-800 font-mono">
          ₹{computation.allowedDeductions.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">
          {computation.regime === 'OLD'
            ? 'Chapter VI-A (80C, 80D, 80CCD, etc.)'
            : 'Section 80CCD(2) Allowed in New Regime'}
        </p>
      </div>

      {/* Net Taxable Income */}
      <div
        id="card-net-taxable-income"
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Net Taxable Income
        </p>
        <p className="text-2xl font-bold text-slate-800 font-mono">
          ₹{computation.taxableTotalIncome.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-blue-500 mt-2 font-medium">
          Standard Deduction of ₹{computation.salaryStandardDeduction.toLocaleString('en-IN')} Applied
        </p>
      </div>

      {/* Total Tax Liability (Hero accent card) */}
      <div
        id="card-total-tax-liability"
        className="bg-blue-600 p-5 rounded-xl border border-blue-700 shadow-lg shadow-blue-200 text-white transition-all hover:bg-blue-700"
      >
        <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">
          Total Tax Liability
        </p>
        <p className="text-2xl font-bold text-white font-mono">
          ₹{computation.totalTaxLiability.toLocaleString('en-IN')}
        </p>
        <p className="text-[10px] text-blue-200 mt-2 font-medium">
          Incl. 4% Health & Ed. Cess (₹{computation.healthEducationCess.toLocaleString('en-IN')})
        </p>
      </div>
    </div>
  );
};
