import React, { useState } from 'react';
import {
  ItruEligibilityResult,
  TaxComputationResult,
  InterestComputation,
  ClientProfile,
  ItruReasonCode,
  formatYearWithFy,
} from '../types';
import { ITR_U_REASONS } from '../engine/statutoryRules';
import { RefreshCw, Download, FileCode, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';

interface ItruModuleViewProps {
  itruResult: ItruEligibilityResult;
  currentResult: TaxComputationResult;
  interest: InterestComputation;
  profile: ClientProfile;
  selectedAy: string;
}

export const ItruModuleView: React.FC<ItruModuleViewProps> = ({
  itruResult,
  currentResult,
  interest,
  profile,
  selectedAy,
}) => {
  const [selectedReason, setSelectedReason] = useState<ItruReasonCode>('INCOME_NOT_REPORTED');
  const [copied, setCopied] = useState(false);

  // Generate CBDT Schema compliant ITR-U JSON
  const itruJson = {
    ITR: {
      FormName: 'ITR-U',
      AssessmentYear: selectedAy,
      Verification: {
        Declaration: 'I declare that to the best of my knowledge and belief, the information given in the return is correct and complete.',
        Capacity: 'Self',
        PAN: profile.pan,
        Date: new Date().toISOString().split('T')[0],
      },
      PartA_139_8A: {
        PAN: profile.pan,
        AssesseeName: profile.name,
        AadhaarCardNo: 'XXXXXXXXXXXX',
        ResidentialStatus: profile.residentialStatus,
        IsUpdatedReturnWithin12Months: itruResult.additionalTaxRate === 25 ? 'Y' : 'N',
        IsUpdatedReturnWithin24Months: itruResult.additionalTaxRate === 50 ? 'Y' : 'N',
        ReasonsForFilingUpdatedReturn: selectedReason,
        OriginalFilingStatus: profile.originalReturnStatus,
        OriginalAckNumber: profile.originalAckNumber || null,
        OriginalFilingDate: profile.originalAckDate || null,
      },
      PartB_140B_Computation: {
        GrossTotalIncome: currentResult.grossTotalIncome,
        TotalDeductions: currentResult.allowedDeductions,
        TotalTaxableIncome: currentResult.taxableTotalIncome,
        TaxOnTotalIncome: currentResult.taxOnIncome,
        Rebate87A: currentResult.rebate87a,
        Surcharge: currentResult.surcharge,
        HealthAndEducationCess: currentResult.healthEducationCess,
        TotalTaxLiability: currentResult.totalTaxLiability,
        Interest234A: interest.sec234a.interest,
        Interest234B: interest.sec234b.interest,
        Interest234C: interest.sec234c.totalInterest,
        Fee234F: interest.fee234f,
        AggregateTaxAndInterestBefore140B: itruResult.baseTaxFor140B,
        AdditionalTaxRateUnder140B: `${itruResult.additionalTaxRate}%`,
        AdditionalTaxAmountUnder140B: itruResult.additionalTax140B,
        NetPayableOnUpdatedReturn: itruResult.totalPayableWithItru,
      },
    },
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(itruJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(itruJson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ITR_U_${profile.pan || 'CLIENT'}_AY${selectedAy}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Eligibility Header Banner */}
      <div
        className={`p-6 rounded-xl border shadow-sm ${
          itruResult.isEligible
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                itruResult.isEligible ? 'bg-blue-600 text-white' : 'bg-red-200 text-red-800'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Section 139(8A) &amp; Section 140B Updated Return (ITR-U)
              </h2>
              <p className={`text-xs mt-0.5 ${itruResult.isEligible ? 'text-slate-400' : 'text-red-700'}`}>
                {itruResult.statutoryReason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold block opacity-75">
                Section 140B Surcharge Slab:
              </span>
              <span className="text-lg font-bold font-mono">
                {itruResult.isEligible ? `${itruResult.additionalTaxRate}% Additional Tax` : 'Ineligible'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs & Statutory Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Reason Selection & Parameters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Part A - 139(8A): Statutory Reason for Updating Return</span>
            </h3>

            <p className="text-xs text-slate-500">
              Select the statutory ground under CBDT Notification No. 48/2022 for filing this updated return:
            </p>

            <div className="space-y-2.5">
              {ITR_U_REASONS.map((r) => (
                <label
                  key={r.code}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedReason === r.code
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="itru_reason"
                    value={r.code}
                    checked={selectedReason === r.code}
                    onChange={() => setSelectedReason(r.code)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <strong className="block font-bold">{r.label}</strong>
                    <span className="text-slate-500 font-mono text-[11px]">{r.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Statutory Ineligibility Check (Provisos to Sec 139(8A))</span>
            </h3>

            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
              <li>Cannot be filed if it results in a nil return, loss, or increases existing refund claim.</li>
              <li>Cannot be filed if search initiated u/s 132 or survey conducted u/s 133A.</li>
              <li>Cannot be filed if notice issued for reassessment or proceeding is pending/completed.</li>
              <li>Only one updated return allowed for any given Assessment Year.</li>
            </ul>
          </div>
        </div>

        {/* Right 5 cols: Section 140B Computation Statement */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Section 140B Tax Statement</span>
              <span className="text-[10px] font-mono text-slate-400">{formatYearWithFy(selectedAy)}</span>
            </h3>

            <div className="space-y-3 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Assessed Tax (inc. Surcharge &amp; Cess)</span>
                <span className="font-mono font-semibold text-slate-800">
                  ₹{currentResult.totalTaxLiability.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Interest u/s 234A</span>
                <span className="font-mono font-semibold text-slate-800">
                  ₹{interest.sec234a.interest.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Interest u/s 234B</span>
                <span className="font-mono font-semibold text-slate-800">
                  ₹{interest.sec234b.interest.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Interest u/s 234C</span>
                <span className="font-mono font-semibold text-slate-800">
                  ₹{interest.sec234c.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>

              {interest.fee234f > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Late Fee u/s 234F</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ₹{interest.fee234f.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                <span>Aggregate Tax &amp; Interest Base:</span>
                <span className="font-mono">
                  ₹{itruResult.baseTaxFor140B.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 flex justify-between items-center text-orange-900 font-bold">
                <div>
                  <span>Additional Tax u/s 140B</span>
                  <span className="block text-[10px] text-orange-700 font-normal">
                    {itruResult.additionalTaxRate}% of aggregate tax &amp; interest
                  </span>
                </div>
                <span className="font-mono text-base">
                  ₹{itruResult.additionalTax140B.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Net Total Payable for ITR-U:</span>
                <span className="font-mono text-lg text-blue-600">
                  ₹{itruResult.totalPayableWithItru.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons: Download and Copy JSON */}
          <div className="pt-6 space-y-2.5">
            <button
              onClick={handleDownloadJson}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors uppercase tracking-wider"
            >
              <Download className="w-4 h-4" />
              <span>Download Official ITR-U JSON</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CBDT JSON Payload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
