import React, { useState, useMemo } from 'react';
import {
  Gavel,
  Calculator,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Printer,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import {
  AssessmentOrderInput,
  AssessmentOrderType,
  DirectoryPersonType,
  TaxRegime,
} from '../types';
import { computeAssessmentDemand } from '../engine/assessmentDemandEngine';
import { DIRECTORY_YEARS, PERSON_DEFINITIONS } from '../data/taxRatesDirectory';

export const AssessmentDemandCalcView: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [input, setInput] = useState<AssessmentOrderInput>({
    ayId: '2018-19', // Default as per user's specific request
    orderType: 'CIT_APPEALS_250',
    orderNumber: 'CIT(A)/NFAC/DEL/2024-25/8921',
    orderDate: '2024-03-25',
    demandNoticeDate: '2024-04-05',
    asOnDate: todayStr,
    personType: 'INDIVIDUAL_GENERAL',
    regime: 'OLD',
    filingDueDate: '2018-07-31',
    actualFilingDate: '2018-07-28',
    wasReturnFiled: true,

    returnedIncome: 850000,
    regularAdditions: 450000, // Disallowance u/s 40(a)(ia) / unverified creditors
    additions115BBE: 0,
    stcgAdditions: 0,
    ltcgAdditions: 0,
    disallowedDeductions: 50000,

    tdsCredit: 75000,
    tcsCredit: 0,
    advanceTaxPaid: 25000,
    satPaid: 0,
    priorDemandPaid: 20000, // 20% deposited during appeal
    refundAlreadyGranted: 0,
    interest244aReceived: 0,
  });

  const result = useMemo(() => {
    return computeAssessmentDemand(input);
  }, [input]);

  const handleInputChange = (field: keyof AssessmentOrderInput, value: any) => {
    setInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Preset for user's explicit CIT(A) case for AY 2018-19
  const loadUserScenario = () => {
    setInput({
      ayId: '2018-19',
      orderType: 'CIT_APPEALS_250',
      orderNumber: 'CIT(A)/NFAC/2024-25/10492',
      orderDate: '2024-03-20',
      demandNoticeDate: '2024-04-02',
      asOnDate: todayStr,
      personType: 'INDIVIDUAL_GENERAL',
      regime: 'OLD',
      filingDueDate: '2018-07-31',
      actualFilingDate: '2018-07-25',
      wasReturnFiled: true,

      returnedIncome: 950000,
      regularAdditions: 500000, // Sustained addition by CIT(A)
      additions115BBE: 0,
      stcgAdditions: 0,
      ltcgAdditions: 0,
      disallowedDeductions: 0,

      tdsCredit: 85000,
      tcsCredit: 0,
      advanceTaxPaid: 35000,
      satPaid: 5000,
      priorDemandPaid: 30000, // 20% stay deposit paid earlier
      refundAlreadyGranted: 0,
      interest244aReceived: 0,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Gavel className="w-4 h-4" />
              Statutory Post-Assessment Demand Computation
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Assessment Order &amp; Appeal Demand Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Compute current tax liability as on date following an Assessment Order or CIT (Appeals) decision under Section 250, 143(3), 147, or 154, including Section 234A/B/C and Section 220(2) interest.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadUserScenario}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load CIT(A) AY 2018-19 Example
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Demand Sheet
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Assessment & Additions Input Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Details & Assessee Profile */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Gavel className="w-4 h-4 text-blue-600" />
                1. Order &amp; Assessment Information
              </h3>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Income-tax Act, 1961
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assessment Year (AY)
                </label>
                <select
                  id="order-ay-select"
                  value={input.ayId}
                  onChange={(e) => handleInputChange('ayId', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {DIRECTORY_YEARS.map((yr) => (
                    <option key={yr.ayId} value={yr.ayId}>
                      {yr.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nature / Stage of Assessment Order
                </label>
                <select
                  id="order-type-select"
                  value={input.orderType}
                  onChange={(e) => handleInputChange('orderType', e.target.value as AssessmentOrderType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="CIT_APPEALS_250">CIT (Appeals) Order u/s 250 (NFAC)</option>
                  <option value="SCRUTINY_143_3">Scrutiny Assessment Order u/s 143(3)</option>
                  <option value="REASSESSMENT_147">Re-assessment / Escaped Income u/s 147</option>
                  <option value="BEST_JUDGMENT_144">Best Judgment Assessment u/s 144</option>
                  <option value="ITAT_254">ITAT Order giving appeal effect u/s 254</option>
                  <option value="RECTIFICATION_154">Rectification Order u/s 154</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assessee Category
                </label>
                <select
                  id="order-person-select"
                  value={input.personType}
                  onChange={(e) => handleInputChange('personType', e.target.value as DirectoryPersonType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {PERSON_DEFINITIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DIN / Order Reference Number
                </label>
                <input
                  type="text"
                  value={input.orderNumber}
                  onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                  placeholder="e.g. CIT(A)/NFAC/2024-25/10492"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Income & Additions Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  2. Income Returned &amp; Additions Made by AO / CIT(A)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter returned income as per original ITR and additions confirmed or made in the order
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Returned Income (As per original return u/s 139) (₹)
                </label>
                <input
                  type="number"
                  value={input.returnedIncome}
                  onChange={(e) => handleInputChange('returnedIncome', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Regular Additions (Normal Slabs) (₹)
                  </label>
                  <input
                    type="number"
                    value={input.regularAdditions}
                    onChange={(e) => handleInputChange('regularAdditions', Number(e.target.value))}
                    placeholder="Disallowances u/s 40(a)(ia), 37(1), creditors"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    e.g. Disallowed expenses, unverified creditors, ad-hoc additions
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span>Unexplained Additions u/s 115BBE (₹)</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                      Flat 60%
                    </span>
                  </label>
                  <input
                    type="number"
                    value={input.additions115BBE}
                    onChange={(e) => handleInputChange('additions115BBE', Number(e.target.value))}
                    placeholder="Cash credit u/s 68, 69, 69A"
                    className="w-full bg-rose-50/50 border border-rose-200 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-rose-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Sec 68, 69, 69A: Flat 60% + 25% surcharge + 4% cess
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disallowed Chapter VI-A Deductions (₹)
                  </label>
                  <input
                    type="number"
                    value={input.disallowedDeductions}
                    onChange={(e) => handleInputChange('disallowedDeductions', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capital Gains Additions (STCG / LTCG) (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={input.stcgAdditions}
                      onChange={(e) => handleInputChange('stcgAdditions', Number(e.target.value))}
                      placeholder="STCG u/s 111A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-900"
                    />
                    <input
                      type="number"
                      value={input.ltcgAdditions}
                      onChange={(e) => handleInputChange('ltcgAdditions', Number(e.target.value))}
                      placeholder="LTCG u/s 112"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 rounded-lg p-3 flex justify-between items-center text-xs font-mono font-bold text-slate-800">
                <span>Computed Assessed Total Income (u/s 288A):</span>
                <span className="text-base text-blue-700">
                  ₹{result.assessedTotalIncome.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Pre-paid Taxes, Past Payments & Refunds */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              3. Taxes Paid Earlier &amp; Prior Refund Received
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  TDS / TCS Credit Allowed (₹)
                </label>
                <input
                  type="number"
                  value={input.tdsCredit}
                  onChange={(e) => handleInputChange('tdsCredit', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Advance Tax Paid (₹)
                </label>
                <input
                  type="number"
                  value={input.advanceTaxPaid}
                  onChange={(e) => handleInputChange('advanceTaxPaid', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Self Assessment Tax Paid (₹)
                </label>
                <input
                  type="number"
                  value={input.satPaid}
                  onChange={(e) => handleInputChange('satPaid', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Prior Demand Tax Paid (e.g. 20% Deposit) (₹)
                </label>
                <input
                  type="number"
                  value={input.priorDemandPaid}
                  onChange={(e) => handleInputChange('priorDemandPaid', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold"
                />
                <span className="text-[10px] text-slate-500">Taxes paid after original 143(3) / stay</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Refund Earlier Issued (u/s 143(1)) (₹)
                </label>
                <input
                  type="number"
                  value={input.refundAlreadyGranted}
                  onChange={(e) => handleInputChange('refundAlreadyGranted', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Interest u/s 244A Received (₹)
                </label>
                <input
                  type="number"
                  value={input.interest244aReceived}
                  onChange={(e) => handleInputChange('interest244aReceived', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Statutory Dates for Section 234 and Section 220(2) Calculation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  4. Statutory Dates for Interest Computation (234A/B/C &amp; 220(2))
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accurate dates ensure exact statutory interest calculation as on your payment date
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date u/s 139(1)
                </label>
                <input
                  type="date"
                  value={input.filingDueDate}
                  onChange={(e) => handleInputChange('filingDueDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Date of Return Filing
                </label>
                <input
                  type="date"
                  value={input.actualFilingDate}
                  onChange={(e) => handleInputChange('actualFilingDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assessment / CIT(A) Order Date
                </label>
                <input
                  type="date"
                  value={input.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice of Demand u/s 156 Served Date
                </label>
                <input
                  type="date"
                  value={input.demandNoticeDate}
                  onChange={(e) => handleInputChange('demandNoticeDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  Notice provides 30 days statutory period u/s 220(1)
                </span>
              </div>

              <div className="sm:col-span-2 bg-blue-50/60 border border-blue-200 rounded-lg p-3">
                <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Target Calculation Date ("As on Date")
                </label>
                <input
                  type="date"
                  value={input.asOnDate}
                  onChange={(e) => handleInputChange('asOnDate', e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-blue-900 shadow-xs focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-blue-700 mt-1 block">
                  Interest under Section 220(2) @ 1% per month will be calculated up to this exact date.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Demand Computation Result & Audit Sheet */}
        <div className="lg:col-span-5 space-y-6">
          {/* Statutory Liability Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-4">
            <div className="bg-slate-900 text-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Demand Notice Computation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  AY {result.ayId} (FY {result.fyId})
                </span>
              </div>

              <div className="mt-3">
                <span className="text-xs text-slate-300 block">
                  Total Tax Liability Payable As On Date:
                </span>
                <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
                  {result.isRefund ? (
                    <span className="text-emerald-400">
                      Refund: ₹{Math.abs(result.netTaxPayableAsOnDate).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    `₹${result.netTaxPayableAsOnDate.toLocaleString('en-IN')}`
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Calculated as on <strong>{result.asOnDate}</strong> (Rounded off u/s 288B)
                </span>
              </div>
            </div>

            {/* Detailed Itemized Computation Sheet */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="pb-3 border-b border-slate-100 space-y-2">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Assessed Total Income:</span>
                  <span className="font-mono">₹{result.assessedTotalIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 pl-3">
                  <span>↳ Income Returned:</span>
                  <span className="font-mono">₹{result.returnedIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 pl-3">
                  <span>↳ Additions Confirmed:</span>
                  <span className="font-mono text-rose-600 font-semibold">
                    +₹{result.totalAdditions.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Tax on Assessed Income */}
              <div className="pb-3 border-b border-slate-100 space-y-2 font-mono">
                <div className="flex justify-between text-slate-700 font-sans">
                  <span>Tax on Assessed Income:</span>
                  <span className="font-bold">₹{result.grossTaxBeforeRebate.toLocaleString('en-IN')}</span>
                </div>

                {result.taxOn115BBE > 0 && (
                  <div className="flex justify-between text-rose-700 text-[11px] pl-3">
                    <span>↳ Tax on Sec 115BBE @ 60%:</span>
                    <span>₹{result.taxOn115BBE.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {result.rebate87a > 0 && (
                  <div className="flex justify-between text-emerald-700 pl-3">
                    <span>Less: Rebate u/s 87A:</span>
                    <span>-₹{result.rebate87a.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {result.surchargeAmount > 0 && (
                  <div className="flex justify-between text-amber-700 pl-3">
                    <span>Add: Surcharge:</span>
                    <span>+₹{result.surchargeAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 pl-3">
                  <span>Add: Cess ({result.cessRatePct}%):</span>
                  <span>+₹{result.cessAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-dashed border-slate-200">
                  <span className="font-sans">Total Assessed Tax:</span>
                  <span>₹{result.totalAssessedTax.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Statutory Interest (234A/B/C) */}
              <div className="pb-3 border-b border-slate-100 space-y-1.5 font-mono">
                <span className="font-bold text-slate-800 font-sans block mb-1">
                  Statutory Interest u/s 234:
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Interest u/s 234A ({result.interest234AMonths} mos):</span>
                  <span>₹{result.interest234A.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Interest u/s 234B ({result.interest234BMonths} mos):</span>
                  <span>₹{result.interest234B.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Interest u/s 234C:</span>
                  <span>₹{result.interest234C.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-200">
                  <span className="font-sans">Total 234 Interest:</span>
                  <span>₹{result.totalInterest234.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Deductions of Prepaid Taxes */}
              <div className="pb-3 border-b border-slate-100 space-y-1.5 font-mono">
                <div className="flex justify-between text-emerald-700 font-semibold font-sans">
                  <span>Less: Total Taxes Already Paid:</span>
                  <span>-₹{result.totalPrepaidCredits.toLocaleString('en-IN')}</span>
                </div>
                {result.refundAnd244ARecoverable > 0 && (
                  <div className="flex justify-between text-rose-700 font-sans">
                    <span>Add: Refund Recoverable + 244A:</span>
                    <span>+₹{result.refundAnd244ARecoverable.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                  <span className="font-sans">Base Demand Before 220(2):</span>
                  <span>₹{result.netBaseDemandBefore220.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Section 220(2) Interest */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    Interest u/s 220(2):
                  </span>
                  <span className="font-mono text-sm">
                    ₹{result.interest220_2.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-amber-800 leading-tight">
                  1% per month for <strong>{result.interest220_2Months} months</strong> on unpaid demand from 30 days after Notice of Demand served date ({result.demandDueDate}) up to {result.asOnDate}.
                </p>
              </div>

              {/* Final Statutory Total */}
              <div className="pt-2 flex justify-between items-baseline font-bold text-slate-900 text-sm">
                <span>Net Amount Payable As on Date:</span>
                <span className="text-lg font-mono text-blue-700">
                  ₹{result.netTaxPayableAsOnDate.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Statutory Order Reference Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 block mb-0.5">
                Statutory Order Reference:
              </span>
              <span>{result.orderTypeLabel}</span>
              <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                Ref No: {result.orderNumber}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
