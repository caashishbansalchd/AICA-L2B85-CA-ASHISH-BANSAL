import React from 'react';
import { TaxRegime, isTaxYear, getFinancialYear } from '../types';
import { ASSESSMENT_YEARS } from '../engine/statutoryRules';
import { Calculator, CheckCircle2, AlertTriangle, HardDrive } from 'lucide-react';

interface HeaderProps {
  clientName: string;
  clientPan: string;
  selectedAy: string;
  onSelectAy: (ay: string) => void;
  regime: TaxRegime;
  onToggleRegime: (regime: TaxRegime) => void;
  onCalculate: () => void;
  isComplianceOk: boolean;
  onOpenDesktopModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  clientName,
  clientPan,
  selectedAy,
  onSelectAy,
  regime,
  onToggleRegime,
  onCalculate,
  isComplianceOk,
  onOpenDesktopModal,
}) => {
  const currentIsTaxYear = isTaxYear(selectedAy);
  const currentFy = getFinancialYear(selectedAy);

  return (
    <header
      id="app-header"
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 select-none z-10"
    >
      <div className="flex items-center gap-6">
        {/* Current Client */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Current Client
          </span>
          <span className="text-sm font-semibold text-slate-800 truncate max-w-[220px]">
            {clientName || 'Assessee'} | <span className="font-mono">{clientPan || 'PAN PENDING'}</span>
          </span>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

        {/* Assessment Year / Tax Year Dropdown */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              {currentIsTaxYear ? 'Tax Year' : 'Assessment Year'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              (FY {currentFy})
            </span>
          </div>
          <div className="relative">
            <select
              id="header-ay-select"
              value={selectedAy}
              onChange={(e) => onSelectAy(e.target.value)}
              aria-label={currentIsTaxYear ? 'Tax Year' : 'Assessment Year'}
              className="bg-transparent text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer pr-5 py-0 focus:outline-none focus:ring-0 border-none -ml-1"
            >
              {ASSESSMENT_YEARS.map((ay) => (
                <option key={ay.ayId} value={ay.ayId} className="text-slate-800 font-medium">
                  {ay.label} {ay.ayId === '2025-26' ? '• Budget 2024' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

        {/* Regime Switcher */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Tax Regime
          </span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 mt-0.5">
            <button
              id="btn-regime-new"
              onClick={() => onToggleRegime('NEW')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                regime === 'NEW'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New (115BAC)
            </button>
            <button
              id="btn-regime-old"
              onClick={() => onToggleRegime('OLD')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                regime === 'OLD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Old Regime
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Compliance Status */}
        <div className="hidden sm:flex items-center">
          {isComplianceOk ? (
            <span
              id="badge-compliance-ok"
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full border border-green-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              COMPLIANCE OK
            </span>
          ) : (
            <span
              id="badge-compliance-warning"
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              DELAY / SHORTFALL
            </span>
          )}
        </div>

        {/* Desktop EXE / BAT Modal Trigger */}
        {onOpenDesktopModal && (
          <button
            id="btn-header-desktop-modal"
            onClick={onOpenDesktopModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors shadow-2xs"
            title="Download Windows Executable & Batch Launcher"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Desktop (.EXE / .BAT)</span>
            <span className="md:hidden">.EXE</span>
          </button>
        )}

        {/* Calculate Tax Button */}
        <button
          id="btn-calculate-tax"
          onClick={onCalculate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Calculator className="w-4 h-4" />
          <span>Calculate Tax</span>
        </button>
      </div>
    </header>
  );
};
