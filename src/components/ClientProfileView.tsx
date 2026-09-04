import React from 'react';
import { ClientProfile, AssesseeType, ResidentialStatus, OriginalReturnStatus, formatYearWithFy } from '../types';
import { TaxEngine } from '../engine/taxEngine';
import { User, Calendar, FileText, CheckCircle } from 'lucide-react';

interface ClientProfileViewProps {
  profile: ClientProfile;
  onChangeProfile: (profile: ClientProfile) => void;
  selectedAy: string;
  regime?: 'NEW' | 'OLD';
  onChangeRegime?: (r: 'NEW' | 'OLD') => void;
}

export const ClientProfileView: React.FC<ClientProfileViewProps> = ({
  profile,
  onChangeProfile,
  selectedAy,
  regime = 'NEW',
  onChangeRegime,
}) => {
  const ageCategory = TaxEngine.getAgeCategory(profile.dob, selectedAy);

  const handleChange = (field: keyof ClientProfile, value: any) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Assessee Master Profile &amp; Statutory Credentials
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Required for determining basic exemption limit (General ₹2.5L / Senior ₹3.0L / Super
            Senior ₹5.0L), residential taxation scope, and ITR eligibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Detected Age Class:
          </span>
          <span
            id="badge-age-category"
            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 font-mono"
          >
            {ageCategory === 'SUPER_SENIOR'
              ? 'Super Senior Citizen (80+ Yrs)'
              : ageCategory === 'SENIOR'
              ? 'Senior Citizen (60-79 Yrs)'
              : 'General Assessee (<60 Yrs)'}
          </span>
        </div>
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Entity Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-700 text-sm">Assessee Information</h3>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              id="input-client-name"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Rajesh Malhotra"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                id="input-client-pan"
                maxLength={10}
                value={profile.pan}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                placeholder="e.g. ABCPM1234E"
                className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Date of Birth / Inc.
              </label>
              <input
                type="date"
                id="input-client-dob"
                value={profile.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Assessee Type
              </label>
              <select
                id="select-assessee-type"
                value={profile.assesseeType}
                onChange={(e) => handleChange('assesseeType', e.target.value as AssesseeType)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="HUF">Hindu Undivided Family (HUF)</option>
                <option value="FIRM">Partnership Firm</option>
                <option value="LLP">Limited Liability Partnership</option>
                <option value="DOMESTIC_COMPANY">Domestic Company</option>
                <option value="FOREIGN_COMPANY">Foreign Company</option>
                <option value="AOP">Association of Persons (AOP)</option>
                <option value="BOI">Body of Individuals (BOI)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Residential Status
              </label>
              <select
                id="select-residential-status"
                value={profile.residentialStatus}
                onChange={(e) =>
                  handleChange('residentialStatus', e.target.value as ResidentialStatus)
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="RESIDENT">Resident &amp; Ordinarily Resident (ROR)</option>
                <option value="RNOR">Resident but Not Ordinarily Resident (RNOR)</option>
                <option value="NON_RESIDENT">Non-Resident (NRI)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Employer Category (For Salaried)
            </label>
            <select
              id="select-employer-type"
              value={profile.employerType}
              onChange={(e) => handleChange('employerType', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="PRIVATE">Private Sector</option>
              <option value="CENTRAL_GOVT">Central Government (14% NPS)</option>
              <option value="STATE_GOVT">State Government (14% NPS)</option>
              <option value="PSU">Public Sector Undertaking (PSU)</option>
              <option value="OTHER">Others</option>
            </select>
          </div>

          {onChangeRegime && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Statutory Tax Regime
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onChangeRegime('NEW')}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-all ${
                    regime === 'NEW'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="block font-bold">New Regime (115BAC)</span>
                    <span className="text-[10px] text-slate-500">Concessional Slabs</span>
                  </div>
                  {regime === 'NEW' && <span className="text-blue-600 font-bold">✓ Active</span>}
                </button>
                <button
                  type="button"
                  onClick={() => onChangeRegime('OLD')}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-all ${
                    regime === 'OLD'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="block font-bold">Old Tax Regime</span>
                    <span className="text-[10px] text-slate-500">Full 80C, 80D, HRA</span>
                  </div>
                  {regime === 'OLD' && <span className="text-blue-600 font-bold">✓ Active</span>}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {regime === 'NEW'
                  ? 'Concessional slabs with standard deduction; Chapter VI-A deductions (80C, 80D, etc.) are disallowed.'
                  : 'Allows full Chapter VI-A deductions, HRA exemptions, and section 16(ia) standard deduction.'}
              </p>
            </div>
          )}
        </div>

        {/* Return Filing Compliance & Prior Return Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-700 text-sm">
              Filing Timelines &amp; Prior ITR Status
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Statutory Due Date
              </label>
              <input
                type="date"
                id="input-filing-due-date"
                value={profile.filingDueDate}
                onChange={(e) => handleChange('filingDueDate', e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Non-audit: 31 July | Audit: 31 Oct
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Actual / Proposed Filing Date
              </label>
              <input
                type="date"
                id="input-actual-filing-date"
                value={profile.actualFilingDate}
                onChange={(e) => handleChange('actualFilingDate', e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Controls 234A/B/C and ITR-U months
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Prior Return Status for {formatYearWithFy(selectedAy)}
            </label>
            <select
              id="select-original-return-status"
              value={profile.originalReturnStatus}
              onChange={(e) =>
                handleChange('originalReturnStatus', e.target.value as OriginalReturnStatus)
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
            >
              <option value="NOT_FILED">Not Filed Earlier (Eligible for ITR-U)</option>
              <option value="SEC_139_1">Filed on or before Due Date u/s 139(1)</option>
              <option value="BELATED_139_4">Filed Belated Return u/s 139(4)</option>
              <option value="REVISED_139_5">Filed Revised Return u/s 139(5)</option>
              <option value="UPDATED_139_8A">Previously Filed Updated Return u/s 139(8A)</option>
            </select>
          </div>

          {profile.originalReturnStatus !== 'NOT_FILED' && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Original Acknowledgment #
                </label>
                <input
                  type="text"
                  value={profile.originalAckNumber || ''}
                  onChange={(e) => handleChange('originalAckNumber', e.target.value)}
                  placeholder="e.g. 123456789012345"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Date of Original Filing
                </label>
                <input
                  type="date"
                  value={profile.originalAckDate || ''}
                  onChange={(e) => handleChange('originalAckDate', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Rule 119A Verification:</strong> All interest
              shortfalls and taxable total incomes will be mathematically truncated and rounded to
              the statutory nearest multi-unit.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
