import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Layers,
  Calculator,
  Info,
  CheckCircle2,
  HelpCircle,
  TableProperties,
} from 'lucide-react';
import { DirectoryPersonType, TaxRegime } from '../types';
import {
  PERSON_DEFINITIONS,
  DIRECTORY_YEARS,
  getPersonRateCard,
  computeQuickTaxForPerson,
} from '../data/taxRatesDirectory';

export const TaxRatesDirectoryView: React.FC = () => {
  const [selectedPerson, setSelectedPerson] =
    useState<DirectoryPersonType>('INDIVIDUAL_GENERAL');
  const [selectedAy, setSelectedAy] = useState<string>('2024-25');
  const [viewMode, setViewMode] = useState<'detail' | 'matrix'>('detail');
  const [testIncome, setTestIncome] = useState<number>(1200000);
  const [simRegime, setSimRegime] = useState<TaxRegime>('NEW');

  const currentPersonDef =
    PERSON_DEFINITIONS.find((p) => p.id === selectedPerson) || PERSON_DEFINITIONS[0];
  const rateCard = getPersonRateCard(selectedPerson, selectedAy);
  const currentYearConfig =
    DIRECTORY_YEARS.find((y) => y.ayId === selectedAy) || DIRECTORY_YEARS[0];

  // Quick simulation
  const simResult = computeQuickTaxForPerson({
    personType: selectedPerson,
    ayId: selectedAy,
    regime: simRegime,
    taxableIncome: testIncome,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              Statutory Rate Reference Manual
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Income Tax Rates Directory (Yearwise &amp; Personwise)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Official statutory income tax slabs, base rates, surcharge thresholds,
              cess, Section 87A rebates, and standard deductions under the Income-tax Act, 1961
              from AY 2017-18 to Tax Year 2026-27 and future years.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('detail')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'detail'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Year Rate Card
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              Multi-Year Comparison
            </button>
          </div>
        </div>

        {/* Filters: Person Type & Assessment Year */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="md:col-span-7">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Person Category (Section 2(31))
            </label>
            <select
              id="tax-rates-person-select"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value as DirectoryPersonType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <optgroup label="Individuals & Family">
                <option value="INDIVIDUAL_GENERAL">Individual (General / Below 60 Years)</option>
                <option value="INDIVIDUAL_SENIOR">Individual - Senior Citizen (Age 60 - 79)</option>
                <option value="INDIVIDUAL_SUPER_SENIOR">Individual - Super Senior (Age 80+)</option>
                <option value="HUF">Hindu Undivided Family (HUF)</option>
              </optgroup>
              <optgroup label="Firms & Companies">
                <option value="FIRM_LLP">Partnership Firm &amp; LLP (Flat 30%)</option>
                <option value="DOMESTIC_COMPANY_LT400CR">Domestic Company (Turnover ≤ ₹400 Cr - 25%)</option>
                <option value="DOMESTIC_COMPANY_GT400CR">Domestic Company (Turnover &gt; ₹400 Cr - 30%)</option>
                <option value="DOMESTIC_COMPANY_115BAA">Domestic Company (Sec 115BAA - Concessional 22%)</option>
                <option value="FOREIGN_COMPANY">Foreign Company (40% / 35%)</option>
              </optgroup>
              <optgroup label="Other Legal Entities">
                <option value="COOPERATIVE_SOCIETY">Co-operative Society</option>
                <option value="AOP_BOI">Association of Persons (AOP) / BOI</option>
                <option value="LOCAL_AUTHORITY">Local Authority (Flat 30%)</option>
              </optgroup>
            </select>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
              <span className="font-semibold text-blue-400">{currentPersonDef.section}:</span>
              <span>{currentPersonDef.summary}</span>
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Assessment Year / Tax Year
            </label>
            <select
              id="tax-rates-year-select"
              value={selectedAy}
              onChange={(e) => setSelectedAy(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
            >
              {DIRECTORY_YEARS.map((yr) => (
                <option key={yr.ayId} value={yr.ayId}>
                  {yr.label} • {yr.financeAct}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Cess applicable: </span>
              <strong className="text-white">{currentYearConfig.cessName}</strong>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'detail' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Rate Card: 8 Columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Slabs Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {rateCard.personName} — Income Tax Slabs &amp; Rates
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applicable for {currentYearConfig.label} ({currentYearConfig.financeAct})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-full">
                    {rateCard.statutoryRef}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Check if flat rate or slabs */}
                {rateCard.flatRateOld !== undefined ? (
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                          Statutory Flat Tax Rate
                        </span>
                        <p className="text-xs text-blue-700 mt-1">
                          No progressive slabs apply to this category. Tax is levied at a flat statutory percentage on total taxable income.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-blue-700 font-mono">
                          {rateCard.flatRateOld}%
                        </span>
                        <span className="block text-[10px] text-blue-600 font-semibold">
                          + Surcharge + {currentYearConfig.cessPct}% Cess
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Old Regime Slabs */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                        <div className="font-bold text-xs text-slate-800">
                          Old Tax Regime
                        </div>
                        <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          Basic Exemption: ₹{rateCard.basicExemptionOld.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-200">
                            <th className="pb-1.5 text-left font-semibold">Income Bracket</th>
                            <th className="pb-1.5 text-right font-semibold">Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {rateCard.slabsOld.map((slab, idx) => (
                            <tr key={idx} className="hover:bg-slate-100/50">
                              <td className="py-2 text-slate-700">
                                {slab.fromAmount === 0 ? 'Up to ' : `₹${(slab.fromAmount).toLocaleString('en-IN')} - `}
                                {slab.toAmount !== null
                                  ? `₹${(slab.toAmount).toLocaleString('en-IN')}`
                                  : 'Above'}
                              </td>
                              <td className="py-2 text-right font-bold text-slate-900">
                                {slab.taxRate === 0 ? (
                                  <span className="text-emerald-700 font-semibold">Nil</span>
                                ) : (
                                  `${slab.taxRate}%`
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
                        Allows Chapter VI-A (80C, 80D, 80CCD) deductions and statutory exemptions.
                      </p>
                    </div>

                    {/* New Regime Slabs (if applicable) */}
                    <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200">
                        <div className="font-bold text-xs text-blue-900">
                          New Regime (Section 115BAC)
                        </div>
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {rateCard.slabsNew ? `Basic Exemption: ₹${(rateCard.basicExemptionNew ?? 250000).toLocaleString('en-IN')}` : 'Not Applicable'}
                        </span>
                      </div>

                      {rateCard.slabsNew ? (
                        <>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-blue-700 border-b border-blue-200">
                                <th className="pb-1.5 text-left font-semibold">Income Bracket</th>
                                <th className="pb-1.5 text-right font-semibold">Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100 font-mono">
                              {rateCard.slabsNew.map((slab, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/80">
                                  <td className="py-2 text-slate-700">
                                    {slab.fromAmount === 0 ? 'Up to ' : `₹${(slab.fromAmount).toLocaleString('en-IN')} - `}
                                    {slab.toAmount !== null
                                      ? `₹${(slab.toAmount).toLocaleString('en-IN')}`
                                      : 'Above'}
                                  </td>
                                  <td className="py-2 text-right font-bold text-blue-900">
                                    {slab.taxRate === 0 ? (
                                      <span className="text-emerald-700 font-semibold">Nil</span>
                                    ) : (
                                      `${slab.taxRate}%`
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="text-[11px] text-blue-700 mt-3 pt-2 border-t border-blue-200">
                            Concessional tax slabs; Chapter VI-A deductions disallowed (except 80CCD(2)).
                          </p>
                        </>
                      ) : (
                        <div className="py-8 text-center text-xs text-slate-500">
                          Section 115BAC concessional regime was not enacted for this assessment year (introduced from AY 2021-22).
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Surcharge Structure */}
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                    Applicable Statutory Surcharge Rates
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {rateCard.surchargeSlabs.map((sc, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs"
                      >
                        <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                          {sc.threshold}
                        </span>
                        <div className="text-lg font-bold text-slate-900 font-mono">
                          {sc.rate}%
                        </div>
                        {sc.conditions && (
                          <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
                            {sc.conditions}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Notes & Special Provisions */}
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                    Key Provisions &amp; Deductions for {currentYearConfig.label}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {rateCard.specialProvisions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Special Rates of Tax Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                Special Rates of Income Tax under the Act
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Specific categories of income taxed at flat statutory special rates regardless of normal slab thresholds
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3 text-left">Section</th>
                      <th className="py-2.5 px-3 text-left">Nature of Income</th>
                      <th className="py-2.5 px-3 text-right">Tax Rate</th>
                      <th className="py-2.5 px-3 text-left">Statutory Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">Sec. 111A</td>
                      <td className="py-2.5 px-3 text-slate-700">Short Term Capital Gain (STT paid listed equity/units)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {parseInt(selectedAy.split('-')[0], 10) >= 2025 ? '20%' : '15%'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">Subject to STT; basic exemption shortfall can be set off</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">Sec. 112A</td>
                      <td className="py-2.5 px-3 text-slate-700">Long Term Capital Gain (STT paid listed equity)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {parseInt(selectedAy.split('-')[0], 10) >= 2025 ? '12.5%' : '10%'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {parseInt(selectedAy.split('-')[0], 10) >= 2025
                          ? 'In excess of ₹1.25 Lakh exemption limit'
                          : 'In excess of ₹1.00 Lakh exemption limit (introduced AY 2019-20)'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">Sec. 112</td>
                      <td className="py-2.5 px-3 text-slate-700">LTCG on other capital assets (Real estate, unlisted shares)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {parseInt(selectedAy.split('-')[0], 10) >= 2025 ? '12.5%' : '20%'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">With indexation benefit pre-Budget 2024 / without indexation post</td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-900">Sec. 115BBE</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-900">
                        Unexplained money, cash credit, investments u/s 68, 69, 69A, 69B, 69C, 69D
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-amber-900">
                        60%
                      </td>
                      <td className="py-2.5 px-3 text-amber-800">
                        + 25% mandatory surcharge + 4% cess = Effective 77.25% (no deduction or set-off allowed)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">Sec. 115BB</td>
                      <td className="py-2.5 px-3 text-slate-700">Winnings from lottery, crossword puzzles, card games</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">30%</td>
                      <td className="py-2.5 px-3 text-slate-500">Gross basis; no expenditure or basic exemption allowance</td>
                    </tr>
                    {parseInt(selectedAy.split('-')[0], 10) >= 2023 && (
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">Sec. 115BBH</td>
                        <td className="py-2.5 px-3 text-slate-700">Income from transfer of Virtual Digital Assets (Crypto / NFT)</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">30%</td>
                        <td className="py-2.5 px-3 text-slate-500">Only cost of acquisition deductible; loss cannot be set off</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Simulator & Summary: 4 Columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Interactive Tax Estimator */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Quick Tax Estimator
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Test tax computation for {rateCard.personName} under {currentYearConfig.label}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Taxable Income (₹)
                  </label>
                  <input
                    type="number"
                    value={testIncome}
                    step={50000}
                    onChange={(e) => setTestIncome(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {rateCard.slabsNew && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Regime Selection
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSimRegime('OLD')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          simRegime === 'OLD'
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        Old Regime
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimRegime('NEW')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          simRegime === 'NEW'
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        New (115BAC)
                      </button>
                    </div>
                  </div>
                )}

                {/* Calculation breakdown */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-xs border border-slate-200 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Tax on Normal Slabs:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{simResult.basicTax.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {simResult.rebate87a > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Less: Rebate u/s 87A:</span>
                      <span className="font-semibold">
                        -₹{simResult.rebate87a.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {simResult.surcharge > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Add: Surcharge ({simResult.surchargeRatePct}%):</span>
                      <span className="font-semibold">
                        +₹{simResult.surcharge.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Add: Cess ({simResult.cessRatePct}%):</span>
                    <span className="font-semibold text-slate-800">
                      +₹{simResult.cess.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold">
                    <span className="text-slate-900 font-sans">Total Tax Payable:</span>
                    <span className="text-base text-blue-700">
                      ₹{simResult.totalTax.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-right text-slate-500 font-sans">
                    Effective Tax Rate: <strong className="text-slate-800">{simResult.effectiveRatePct}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Statutory Factsheet */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Year Parameters Factsheet
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Finance Act:</span>
                  <span className="font-semibold text-slate-800 text-right">{currentYearConfig.financeAct}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Health &amp; Edu. Cess:</span>
                  <span className="font-semibold text-slate-800">{currentYearConfig.cessPct}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Std Deduction (Old):</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{currentYearConfig.stdDeductionOld.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Std Deduction (New):</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{currentYearConfig.stdDeductionNew.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Rebate 87A Max (Old):</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{currentYearConfig.rebate87aOld.maxRebate.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-slate-500">
                      (Income ≤ ₹{(currentYearConfig.rebate87aOld.maxIncome / 100000).toFixed(0)}L)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Rebate 87A Max (New):</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {currentYearConfig.rebate87aNew.maxIncome > 0 ? (
                      <>
                        ₹{currentYearConfig.rebate87aNew.maxRebate.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-emerald-600 font-sans font-medium">
                          (Income ≤ ₹{(currentYearConfig.rebate87aNew.maxIncome / 100000).toFixed(0)}L)
                        </span>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Multi-Year Comparison Matrix */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-base">
              {rateCard.personName} — Multi-Year Historical Tax Rates Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Comparative overview of basic exemption, tax slabs, cess, rebate, and deductions from AY 2017-18 to Tax Year 2026-27
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3 text-left">Assessment Year</th>
                  <th className="py-3 px-3 text-left">Governing Act</th>
                  <th className="py-3 px-3 text-right">Basic Exemption</th>
                  <th className="py-3 px-3 text-center">First Tax Slab</th>
                  <th className="py-3 px-3 text-center">Cess %</th>
                  <th className="py-3 px-3 text-right">Std. Deduction</th>
                  <th className="py-3 px-3 text-right">Rebate 87A</th>
                  <th className="py-3 px-3 text-center">New Regime (115BAC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {DIRECTORY_YEARS.map((yr) => {
                  const card = getPersonRateCard(selectedPerson, yr.ayId);
                  const isSelected = yr.ayId === selectedAy;
                  return (
                    <tr
                      key={yr.ayId}
                      onClick={() => {
                        setSelectedAy(yr.ayId);
                        setViewMode('detail');
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 font-sans">
                        {yr.label}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-sans">{yr.financeAct}</td>
                      <td className="py-3 px-3 text-right text-slate-800">
                        ₹{card.basicExemptionOld.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-800">
                        {card.slabsOld[1] ? `${card.slabsOld[1].taxRate}%` : (card.flatRateOld ? `${card.flatRateOld}%` : '-')}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {yr.cessPct}%
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {yr.stdDeductionOld > 0 ? `₹${yr.stdDeductionOld.toLocaleString('en-IN')}` : 'Nil'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        <div>
                          {yr.rebate87aOld.maxRebate > 0
                            ? `Old: ₹${(yr.rebate87aOld.maxRebate / 1000).toFixed(1)}k`
                            : 'Nil'}
                        </div>
                        {yr.rebate87aNew.maxIncome > 0 && (
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            New: ₹{(yr.rebate87aNew.maxRebate / 1000).toFixed(0)}k (≤ ₹{(yr.rebate87aNew.maxIncome / 100000).toFixed(0)}L)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {card.slabsNew ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                            Available
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
