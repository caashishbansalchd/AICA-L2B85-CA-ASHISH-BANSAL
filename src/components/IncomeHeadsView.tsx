import React, { useState } from 'react';
import {
  SalaryInput,
  HousePropertyInput,
  BusinessInput,
  CapitalGainsInput,
  OtherSourcesInput,
  TaxRegime,
  formatYearWithFy,
} from '../types';
import { TaxEngine } from '../engine/taxEngine';
import { Briefcase, Home, TrendingUp, DollarSign, HelpCircle, Layers } from 'lucide-react';

interface IncomeHeadsViewProps {
  salary: SalaryInput;
  onChangeSalary: (s: SalaryInput) => void;
  hp: HousePropertyInput;
  onChangeHp: (hp: HousePropertyInput) => void;
  business: BusinessInput;
  onChangeBusiness: (b: BusinessInput) => void;
  cg: CapitalGainsInput;
  onChangeCg: (cg: CapitalGainsInput) => void;
  other: OtherSourcesInput;
  onChangeOther: (o: OtherSourcesInput) => void;
  regime: TaxRegime;
  selectedAy: string;
}

export const IncomeHeadsView: React.FC<IncomeHeadsViewProps> = ({
  salary,
  onChangeSalary,
  hp,
  onChangeHp,
  business,
  onChangeBusiness,
  cg,
  onChangeCg,
  other,
  onChangeOther,
  regime,
  selectedAy,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'salary' | 'house_property' | 'business' | 'capital_gains' | 'other'
  >('salary');

  const hraExemption = TaxEngine.calculateHRAExemption(salary, regime);
  const stdDeduction =
    regime === 'NEW'
      ? selectedAy >= '2025-26'
        ? 75000
        : 50000
      : 50000;

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'salary', label: '1. Salary', icon: <Briefcase className="w-3.5 h-3.5" /> },
          { id: 'house_property', label: '2. House Property', icon: <Home className="w-3.5 h-3.5" /> },
          { id: 'business', label: '3. Business (44AD/ADA)', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: 'capital_gains', label: '4. Capital Gains', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'other', label: '5. Other Sources (IFOS)', icon: <DollarSign className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. SALARY */}
      {activeSubTab === 'salary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Salary Breakdown (Section 17)</span>
              <span className="text-[10px] text-slate-400 font-mono">FORM 16 PART-B</span>
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Basic Salary (Annual)
              </label>
              <input
                type="number"
                value={salary.basic || ''}
                onChange={(e) =>
                  onChangeSalary({ ...salary, basic: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Dearness Allowance (DA Forming Part)
              </label>
              <input
                type="number"
                value={salary.da || ''}
                onChange={(e) =>
                  onChangeSalary({ ...salary, da: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                House Rent Allowance (HRA) Received
              </label>
              <input
                type="number"
                value={salary.hraReceived || ''}
                onChange={(e) =>
                  onChangeSalary({ ...salary, hraReceived: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Special / Other Taxable Allowances
              </label>
              <input
                type="number"
                value={salary.otherAllowances || ''}
                onChange={(e) =>
                  onChangeSalary({
                    ...salary,
                    otherAllowances: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Professional Tax Paid (Sec 16(iii))
              </label>
              <input
                type="number"
                value={salary.profTax || ''}
                onChange={(e) =>
                  onChangeSalary({ ...salary, profTax: parseFloat(e.target.value) || 0 })
                }
                placeholder="2500"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {regime === 'NEW'
                  ? 'Note: Professional tax is not deductible under Section 115BAC New Regime.'
                  : 'Deductible up to ₹2,500 under Old Regime.'}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>HRA Exemption Calculator u/s 10(13A)</span>
                <span className="text-[10px] text-blue-600 font-bold">AUTOMATED</span>
              </h3>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Actual Annual Rent Paid
                  </label>
                  <input
                    type="number"
                    value={salary.rentPaid || ''}
                    onChange={(e) =>
                      onChangeSalary({ ...salary, rentPaid: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is-metro"
                    checked={salary.isMetro}
                    onChange={(e) =>
                      onChangeSalary({ ...salary, isMetro: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="is-metro" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Accommodation located in Metro City (Mumbai, Delhi, Kolkata, Chennai - 50% rule)
                  </label>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Statutory Standard Deduction:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{stdDeduction.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Computed HRA Exemption:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {regime === 'OLD' ? `₹${hraExemption.toLocaleString('en-IN')}` : '₹0 (Disallowed in New)'}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-700">Net Taxable Salary:</span>
                  <span className="font-mono text-slate-900">
                    ₹{Math.max(
                      0,
                      salary.basic +
                        salary.da +
                        salary.hraReceived +
                        salary.otherAllowances -
                        (regime === 'OLD' ? hraExemption + salary.profTax : 0) -
                        stdDeduction
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-[11px] text-blue-700 leading-relaxed border border-blue-100">
              {regime === 'NEW' ? (
                <span>
                  <strong>New Regime Policy:</strong> Standard Deduction of ₹
                  {stdDeduction.toLocaleString('en-IN')} is applicable. HRA exemption u/s 10(13A) is
                  barred.
                </span>
              ) : (
                <span>
                  <strong>Old Regime Policy:</strong> HRA is exempt as minimum of actual HRA, rent
                  paid minus 10% salary, or 40%/50% of basic + DA.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. HOUSE PROPERTY */}
      {activeSubTab === 'house_property' && (() => {
        const hpNav = hp.propertyType === 'SOP' ? 0 : Math.max(0, hp.grossAnnualValue - hp.municipalTaxes);
        const hpStd30 = hp.propertyType === 'SOP' ? 0 : 0.3 * hpNav;
        const rawHpNet = hp.propertyType === 'SOP' ? -hp.interest24b : hpNav - hpStd30 - hp.interest24b;

        let effectiveHpNet = 0;
        let hpStatusNote = '';

        if (regime === 'OLD') {
          if (hp.propertyType === 'SOP') {
            const allowedInterest = Math.min(200000, Math.max(0, hp.interest24b));
            effectiveHpNet = -allowedInterest;
            hpStatusNote = allowedInterest > 0 
              ? `Loss of ₹${allowedInterest.toLocaleString('en-IN')} allowed u/s 24(b) (Capped at ₹2,00,000)` 
              : 'No interest claimed';
          } else {
            effectiveHpNet = Math.max(-200000, rawHpNet);
            if (rawHpNet < -200000) {
              hpStatusNote = `Loss restricted to ₹2,00,000 for inter-head set-off u/s 71(3A) (Excess ₹${Math.abs(rawHpNet + 200000).toLocaleString('en-IN')} c/f)`;
            } else if (rawHpNet < 0) {
              hpStatusNote = `Full loss of ₹${Math.abs(rawHpNet).toLocaleString('en-IN')} set off against other income heads`;
            } else {
              hpStatusNote = `Taxable rental income of ₹${rawHpNet.toLocaleString('en-IN')}`;
            }
          }
        } else {
          // NEW REGIME
          if (hp.propertyType === 'SOP') {
            effectiveHpNet = 0;
            hpStatusNote = hp.interest24b > 0 
              ? 'Interest u/s 24(b) for Self-Occupied Property is DISALLOWED under New Regime (Section 115BAC(2)(i)(a)). Net loss = ₹0.' 
              : 'Nil income / loss';
          } else {
            if (rawHpNet < 0) {
              effectiveHpNet = 0;
              hpStatusNote = `Computed loss of ₹${Math.abs(rawHpNet).toLocaleString('en-IN')} CANNOT be set off against other heads under Section 115BAC(2)(ii) (c/f only). Net set-off = ₹0.`;
            } else {
              effectiveHpNet = rawHpNet;
              hpStatusNote = `Taxable rental income of ₹${rawHpNet.toLocaleString('en-IN')}`;
            }
          }
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Income / Loss from House Property (Sections 22 to 27)</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  regime === 'NEW' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {regime === 'NEW' ? 'NEW REGIME RULES' : 'OLD REGIME RULES'}
                </span>
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Property Occupancy Classification
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'SOP', label: 'Self Occupied (SOP)' },
                    { id: 'LOP', label: 'Let Out Property (LOP)' },
                    { id: 'DLOP', label: 'Deemed Let Out (DLOP)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onChangeHp({ ...hp, propertyType: opt.id as any })}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                        hp.propertyType === opt.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hp.propertyType !== 'SOP' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Gross Annual Rent / Value (GAV)
                    </label>
                    <input
                      type="number"
                      value={hp.grossAnnualValue || ''}
                      onChange={(e) =>
                        onChangeHp({ ...hp, grossAnnualValue: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Municipal Taxes Actually Paid
                    </label>
                    <input
                      type="number"
                      value={hp.municipalTaxes || ''}
                      onChange={(e) =>
                        onChangeHp({ ...hp, municipalTaxes: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Interest on Borrowed Capital u/s 24(b)
                </label>
                <input
                  type="number"
                  value={hp.interest24b || ''}
                  onChange={(e) =>
                    onChangeHp({ ...hp, interest24b: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {hp.propertyType === 'SOP' ? (
                    regime === 'NEW' ? (
                      <span className="text-rose-600 font-medium">
                        Disallowed in New Regime (Section 115BAC(2)(i)(a)). No interest deduction is permitted for SOP.
                      </span>
                    ) : (
                      'For Self-Occupied Property in Old Regime, maximum deduction is capped at ₹2,00,000.'
                    )
                  ) : (
                    regime === 'NEW' ? (
                      <span className="text-amber-700 font-medium">
                        Deductible against rental NAV. However, net loss cannot be set off against other income heads u/s 115BAC(2)(ii).
                      </span>
                    ) : (
                      'For Let-out Property in Old Regime, interest is deductible against NAV. Inter-head loss set off capped at ₹2,00,000.'
                    )
                  )}
                </span>
              </div>
            </div>

            {/* House property computation & statutory audit */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>House Property Computation Summary</span>
                  <span className="text-slate-400 font-mono text-[10px]">{hp.propertyType}</span>
                </h4>

                {hp.propertyType !== 'SOP' ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Annual Value (GAV):</span>
                      <span className="font-mono">₹{hp.grossAnnualValue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Less: Municipal Taxes Paid:</span>
                      <span className="font-mono">₹{hp.municipalTaxes.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-700 pt-1 border-t border-slate-100">
                      <span>Net Annual Value (NAV):</span>
                      <span className="font-mono">₹{hpNav.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Less: Statutory Deduction u/s 24(a) (30%):</span>
                      <span className="font-mono">₹{hpStd30.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Less: Interest on Loan u/s 24(b):</span>
                      <span className="font-mono">₹{hp.interest24b.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Annual Value (NAV for SOP):</span>
                      <span className="font-mono">₹0 (Nil u/s 23(2))</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Interest on Housing Loan u/s 24(b):</span>
                      <span className="font-mono">₹{hp.interest24b.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Allowed Deduction u/s 24(b):</span>
                      <span className="font-mono font-medium text-slate-800">
                        {regime === 'NEW' ? '₹0 (Disallowed in New Regime)' : `₹${Math.min(200000, hp.interest24b).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-800">Net Taxable / Set-Off under Head:</span>
                    <span className={`font-mono text-base ${
                      effectiveHpNet < 0 
                        ? 'text-rose-600' 
                        : effectiveHpNet > 0 
                        ? 'text-slate-900' 
                        : 'text-slate-500'
                    }`}>
                      {effectiveHpNet < 0 
                        ? `-₹${Math.abs(effectiveHpNet).toLocaleString('en-IN')}` 
                        : `₹${effectiveHpNet.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                    {hpStatusNote}
                  </p>
                </div>
              </div>

              {/* Statutory Legal Callout */}
              <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                regime === 'NEW' 
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
                  : 'bg-blue-50/70 border-blue-200 text-blue-900'
              }`}>
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {regime === 'NEW' ? 'Section 115BAC (New Tax Regime) Statutory Rules:' : 'Old Tax Regime House Property Rules:'}
                </div>
                {regime === 'NEW' ? (
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>
                      <strong>Self-Occupied Property (SOP):</strong> Deduction for interest on housing loan u/s 24(b) is <strong>completely disallowed</strong> u/s 115BAC(2)(i)(a). The taxable income/loss is ₹0.
                    </li>
                    <li>
                      <strong>Let-Out Property (LOP/DLOP):</strong> Deductions u/s 24(a) (30%) &amp; 24(b) (interest) are allowed against rental income. However, <strong>set-off of any loss against salary or other income heads is strictly barred</strong> u/s 115BAC(2)(ii).
                    </li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>
                      <strong>Self-Occupied Property (SOP):</strong> Interest on borrowed capital u/s 24(b) is deductible up to a maximum loss of ₹2,00,000.
                    </li>
                    <li>
                      <strong>Inter-Head Set-off u/s 71(3A):</strong> Loss from house property can be set off against Salary, Business, Capital Gains, and Other Sources up to ₹2,00,000. Any remaining loss is carried forward for up to 8 assessment years u/s 71B.
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. BUSINESS / PROFESSION */}
      {activeSubTab === 'business' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl space-y-5">
          <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100">
            Profits and Gains of Business or Profession (PGBP)
          </h3>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Taxation Method / Presumptive Scheme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '44AD', label: 'Section 44AD (6% / 8%)' },
                { id: '44ADA', label: 'Section 44ADA (50% Prof.)' },
                { id: 'NORMAL', label: 'Normal Books & P&L' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChangeBusiness({ ...business, scheme: opt.id as any })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                    business.scheme === opt.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {business.scheme === '44AD' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Gross Receipts (Digital / Banking @ 6%)
                </label>
                <input
                  type="number"
                  value={business.grossReceiptsDigital || ''}
                  onChange={(e) =>
                    onChangeBusiness({
                      ...business,
                      grossReceiptsDigital: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Gross Receipts (Cash @ 8%)
                </label>
                <input
                  type="number"
                  value={business.grossReceiptsCash || ''}
                  onChange={(e) =>
                    onChangeBusiness({
                      ...business,
                      grossReceiptsCash: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {business.scheme === '44ADA' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Gross Professional Receipts (Presumptive Profit = 50%)
              </label>
              <input
                type="number"
                value={business.professionalReceipts || ''}
                onChange={(e) =>
                  onChangeBusiness({
                    ...business,
                    professionalReceipts: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          {business.scheme === 'NORMAL' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Net Profit as per Audited Profit &amp; Loss Account
              </label>
              <input
                type="number"
                value={business.normalProfit || ''}
                onChange={(e) =>
                  onChangeBusiness({
                    ...business,
                    normalProfit: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. CAPITAL GAINS */}
      {activeSubTab === 'capital_gains' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl space-y-5">
          <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100 flex justify-between items-center">
            <span>Capital Gains (Sections 45 to 55A)</span>
            <span className="text-[10px] text-blue-600 font-mono">
              {formatYearWithFy(selectedAy)} • {selectedAy >= '2025-26' ? 'BUDGET 2024 RATES' : 'PRE-BUDGET RATES'}
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                STCG u/s 111A ({selectedAy >= '2025-26' ? '20%' : '15%'})
              </label>
              <input
                type="number"
                value={cg.stcg111a || ''}
                onChange={(e) =>
                  onChangeCg({ ...cg, stcg111a: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Listed equities &amp; units</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                STCG (Other / Normal Slab)
              </label>
              <input
                type="number"
                value={cg.stcgNormal || ''}
                onChange={(e) =>
                  onChangeCg({ ...cg, stcgNormal: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Debt MFs, short-term assets</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                LTCG u/s 112 ({selectedAy >= '2025-26' ? '12.5%' : '20%'})
              </label>
              <input
                type="number"
                value={cg.ltcg112 || ''}
                onChange={(e) =>
                  onChangeCg({ ...cg, ltcg112: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Immovable property, unlisted</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                LTCG u/s 112A (Exemption ₹{selectedAy >= '2025-26' ? '1.25L' : '1.0L'})
              </label>
              <input
                type="number"
                value={cg.ltcg112a || ''}
                onChange={(e) =>
                  onChangeCg({ ...cg, ltcg112a: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {selectedAy >= '2025-26' ? '12.5% above ₹1,25,000' : '10% above ₹1,00,000'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. OTHER SOURCES */}
      {activeSubTab === 'other' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h3 className="font-bold text-slate-700 text-sm pb-2 border-b border-slate-100">
            Income from Other Sources (IFOS) (Sections 56 to 59)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Savings Account Interest
              </label>
              <input
                type="number"
                value={other.savingsInterest || ''}
                onChange={(e) =>
                  onChangeOther({
                    ...other,
                    savingsInterest: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Eligible for 80TTA (₹10K) / 80TTB (₹50K) in Old Regime
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Fixed Deposit (FD) / Term Interest
              </label>
              <input
                type="number"
                value={other.fdInterest || ''}
                onChange={(e) =>
                  onChangeOther({ ...other, fdInterest: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Dividend Income
              </label>
              <input
                type="number"
                value={other.dividend || ''}
                onChange={(e) =>
                  onChangeOther({ ...other, dividend: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                General Other Incomes
              </label>
              <input
                type="number"
                value={other.otherGeneral || ''}
                onChange={(e) =>
                  onChangeOther({
                    ...other,
                    otherGeneral: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Lottery / Winnings u/s 115BB (30% Flat)
              </label>
              <input
                type="number"
                value={other.lottery115bb || ''}
                onChange={(e) =>
                  onChangeOther({
                    ...other,
                    lottery115bb: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Virtual Digital Assets (VDA) u/s 115BBH (30% Flat)
              </label>
              <input
                type="number"
                value={other.vda115bbh || ''}
                onChange={(e) =>
                  onChangeOther({
                    ...other,
                    vda115bbh: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
