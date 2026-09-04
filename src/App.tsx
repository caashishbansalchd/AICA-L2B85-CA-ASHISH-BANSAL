import React, { useState, useMemo } from 'react';
import {
  ClientProfile,
  SalaryInput,
  HousePropertyInput,
  BusinessInput,
  CapitalGainsInput,
  OtherSourcesInput,
  DeductionsInput,
  PrepaidTaxesInput,
  TaxRegime,
} from './types';
import { TaxEngine } from './engine/taxEngine';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { DashboardView } from './components/DashboardView';
import { ClientProfileView } from './components/ClientProfileView';
import { IncomeHeadsView } from './components/IncomeHeadsView';
import { DeductionsView } from './components/DeductionsView';
import { InterestEngineView } from './components/InterestEngineView';
import { ItruModuleView } from './components/ItruModuleView';
import { ReportGeneratorView } from './components/ReportGeneratorView';
import { TaxRatesDirectoryView } from './components/TaxRatesDirectoryView';
import { AssessmentDemandCalcView } from './components/AssessmentDemandCalcView';
import { DesktopRunnerModal } from './components/DesktopRunnerModal';
import { SavedReportsView } from './components/SavedReportsView';
import { savedReportsService } from './services/savedReportsService';
import { SavedTaxReport, formatYearWithFy } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  // Default to Tax Year 2026-27 (FY 2026-27 / AY 2027-28)
  const [selectedAy, setSelectedAy] = useState<string>('2027-28');
  const [regime, setRegime] = useState<TaxRegime>('NEW');
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState<boolean>(false);
  const [savedReportsCount, setSavedReportsCount] = useState<number>(() => {
    return savedReportsService.getSavedReports().length;
  });

  // Client Master Profile
  const [profile, setProfile] = useState<ClientProfile>({
    name: 'Rajesh Malhotra',
    pan: 'ABCPM1234E',
    dob: '1988-06-15',
    assesseeType: 'INDIVIDUAL',
    residentialStatus: 'RESIDENT',
    employerType: 'PRIVATE',
    filingDueDate: '2027-07-31',
    actualFilingDate: '2027-07-15',
    originalReturnStatus: 'NOT_FILED',
  });

  // 1. Salary
  const [salary, setSalary] = useState<SalaryInput>({
    basic: 1450000,
    da: 145000,
    hraReceived: 240000,
    otherAllowances: 120000,
    profTax: 2500,
    rentPaid: 260000,
    isMetro: true,
  });

  // 2. House Property
  const [hp, setHp] = useState<HousePropertyInput>({
    propertyType: 'SOP',
    grossAnnualValue: 0,
    municipalTaxes: 0,
    interest24b: 180000,
  });

  // 3. Business
  const [business, setBusiness] = useState<BusinessInput>({
    scheme: 'NORMAL',
    grossReceiptsDigital: 0,
    grossReceiptsCash: 0,
    professionalReceipts: 0,
    normalProfit: 0,
  });

  // 4. Capital Gains
  const [cg, setCg] = useState<CapitalGainsInput>({
    stcg111a: 65000,
    stcgNormal: 0,
    ltcg112: 0,
    ltcg112a: 145000,
  });

  // 5. Other Sources
  const [other, setOther] = useState<OtherSourcesInput>({
    savingsInterest: 18500,
    fdInterest: 42000,
    dividend: 15000,
    lottery115bb: 0,
    vda115bbh: 0,
    otherGeneral: 0,
  });

  // Deductions (Chapter VI-A)
  const [deductions, setDeductions] = useState<DeductionsInput>({
    sec80C: 150000,
    sec80CCC: 0,
    sec80CCD1: 0,
    sec80CCD1B: 50000,
    sec80CCD2: 75000,
    sec80D_self: 25000,
    sec80D_parents: 45000,
    sec80D_parentsSenior: true,
    sec80E: 0,
    sec80G: 0,
    sec80TTA: 10000,
    sec80TTB: 0,
  });

  // Prepaid Taxes (TDS / Advance Tax / Self-Assessment)
  const [prepaid, setPrepaid] = useState<PrepaidTaxesInput>({
    tdsSalary: 110000,
    tdsOther: 6500,
    tcs: 0,
    advQ1: 15000,
    advQ2: 25000,
    advQ3: 25000,
    advQ4: 25000,
    selfAssessmentTax: 0,
  });

  // Computation Engine
  const currentResult = useMemo(() => {
    return TaxEngine.computeTaxFromParams({
      profile,
      salary,
      hp,
      business,
      cg,
      other,
      deductions,
      regime,
      ayId: selectedAy,
    });
  }, [profile, salary, hp, business, cg, other, deductions, regime, selectedAy]);

  const comparisonResult = useMemo(() => {
    const oppRegime = regime === 'NEW' ? 'OLD' : 'NEW';
    return TaxEngine.computeTaxFromParams({
      profile,
      salary,
      hp,
      business,
      cg,
      other,
      deductions,
      regime: oppRegime,
      ayId: selectedAy,
    });
  }, [profile, salary, hp, business, cg, other, deductions, regime, selectedAy]);

  const interest = useMemo(() => {
    return TaxEngine.computeInterest({
      currentResult,
      prepaid,
      filingDueDate: profile.filingDueDate,
      actualFilingDate: profile.actualFilingDate,
      ayId: selectedAy,
    });
  }, [currentResult, prepaid, profile.filingDueDate, profile.actualFilingDate, selectedAy]);

  const itruResult = useMemo(() => {
    return TaxEngine.checkItruEligibility({
      ayId: selectedAy,
      filingDate: profile.actualFilingDate,
      originalStatus: profile.originalReturnStatus,
      currentTaxLiability: currentResult.totalTaxLiability,
      currentInterestAndFees: interest.totalInterestAndFees,
    });
  }, [
    selectedAy,
    profile.actualFilingDate,
    profile.originalReturnStatus,
    currentResult.totalTaxLiability,
    interest.totalInterestAndFees,
  ]);

  const ageCategory = useMemo(() => {
    return TaxEngine.getAgeCategory(profile.dob, selectedAy);
  }, [profile.dob, selectedAy]);

  const isComplianceOk = interest.sec234a.interest === 0 && interest.sec234b.interest === 0;

  // Preset scenarios for instant testing
  const loadScenario = (type: 'salaried' | 'trader' | 'itru_belated') => {
    if (type === 'salaried') {
      setSelectedAy('2024-25');
      setRegime('NEW');
      setProfile((prev) => ({
        ...prev,
        name: 'Rajesh Malhotra',
        pan: 'ABCPM1234E',
        dob: '1988-06-15',
        originalReturnStatus: 'NOT_FILED',
        actualFilingDate: '2024-11-20',
      }));
      setSalary({
        basic: 1450000,
        da: 145000,
        hraReceived: 240000,
        otherAllowances: 120000,
        profTax: 2500,
        rentPaid: 260000,
        isMetro: true,
      });
      setCg({ stcg111a: 65000, stcgNormal: 0, ltcg112: 0, ltcg112a: 145000 });
      setActiveTab('dashboard');
    } else if (type === 'trader') {
      setSelectedAy('2024-25');
      setRegime('OLD');
      setProfile((prev) => ({
        ...prev,
        name: 'Vikram Mehta & Sons',
        pan: 'AAHFM5678K',
        dob: '1975-03-22',
        assesseeType: 'HUF',
        originalReturnStatus: 'SEC_139_1',
      }));
      setSalary({ basic: 0, da: 0, hraReceived: 0, otherAllowances: 0, profTax: 0, rentPaid: 0, isMetro: false });
      setBusiness({
        scheme: '44AD',
        grossReceiptsDigital: 4500000,
        grossReceiptsCash: 1200000,
        professionalReceipts: 0,
        normalProfit: 0,
      });
      setCg({ stcg111a: 180000, stcgNormal: 40000, ltcg112: 120000, ltcg112a: 250000 });
      setActiveTab('dashboard');
    } else if (type === 'itru_belated') {
      setSelectedAy('2023-24');
      setRegime('OLD');
      setProfile((prev) => ({
        ...prev,
        name: 'Ananya Deshmukh',
        pan: 'BKAPD9876Q',
        dob: '1992-09-10',
        originalReturnStatus: 'NOT_FILED',
        actualFilingDate: '2024-10-15',
      }));
      setSalary({
        basic: 1800000,
        da: 0,
        hraReceived: 300000,
        otherAllowances: 200000,
        profTax: 2500,
        rentPaid: 320000,
        isMetro: true,
      });
      setCg({ stcg111a: 200000, stcgNormal: 50000, ltcg112: 0, ltcg112a: 350000 });
      setActiveTab('itru');
    }
  };

  // Save current calculation to Saved Reports history
  const handleSaveCurrentCalculation = () => {
    const yearLabel = formatYearWithFy(selectedAy);
    const totalPrepaid =
      prepaid.tdsSalary +
      prepaid.tdsOther +
      prepaid.tcs +
      prepaid.advQ1 +
      prepaid.advQ2 +
      prepaid.advQ3 +
      prepaid.advQ4 +
      prepaid.selfAssessmentTax;

    const netTaxPayable =
      currentResult.totalTaxLiability + interest.totalInterestAndFees - totalPrepaid;

    const newReport = savedReportsService.saveReport({
      clientName: profile.name,
      pan: profile.pan,
      assesseeType: profile.assesseeType,
      selectedAy,
      yearLabel,
      regime,
      grossTotalIncome: currentResult.grossTotalIncome,
      totalDeductions: currentResult.totalDeductions,
      taxableTotalIncome: currentResult.taxableTotalIncome,
      totalTaxLiability: currentResult.totalTaxLiability,
      totalPrepaidTaxes: totalPrepaid,
      advanceTaxPaid: prepaid.advQ1 + prepaid.advQ2 + prepaid.advQ3 + prepaid.advQ4,
      interest234A: interest.sec234a.interest,
      interest234B: interest.sec234b.interest,
      interest234C: interest.sec234c.totalInterest,
      totalInterestAndFees: interest.totalInterestAndFees,
      netTaxPayableOrRefund: netTaxPayable,
      itruAdditionalTax140B: itruResult.additionalTax140B,
      totalPayableWithItru: itruResult.totalPayableWithItru,
      snapshot: {
        profile: { ...profile },
        salary: { ...salary },
        hp: { ...hp },
        business: { ...business },
        cg: { ...cg },
        other: { ...other },
        deductions: { ...deductions },
        prepaid: { ...prepaid },
        selectedAy,
        regime,
      },
    });

    setSavedReportsCount(savedReportsService.getSavedReports().length);
    return newReport;
  };

  // Restore calculation from a saved report snapshot
  const handleLoadSnapshot = (snapshot: SavedTaxReport['snapshot']) => {
    setProfile(snapshot.profile);
    setSalary(snapshot.salary);
    setHp(snapshot.hp);
    setBusiness(snapshot.business);
    setCg(snapshot.cg);
    setOther(snapshot.other);
    setDeductions(snapshot.deductions);
    setPrepaid(snapshot.prepaid);
    setSelectedAy(snapshot.selectedAy);
    setRegime(snapshot.regime);
    setActiveTab('dashboard');
  };

  return (
    <div
      id="app-root-container"
      className="h-screen w-full flex bg-slate-50 text-slate-800 font-sans overflow-hidden"
    >
      {/* Sleek Theme Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        clientName={profile.name}
        isItruEligible={itruResult.isEligible}
        savedReportsCount={savedReportsCount}
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Sleek Theme Header */}
        <Header
          clientName={profile.name}
          clientPan={profile.pan}
          selectedAy={selectedAy}
          onSelectAy={setSelectedAy}
          regime={regime}
          onToggleRegime={setRegime}
          onCalculate={() => setActiveTab('dashboard')}
          isComplianceOk={isComplianceOk}
          onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
        />

        {/* Scrollable Work Canvas */}
        <main id="app-main-canvas" className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Quick Presets Bar */}
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-2xs print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Case Scenarios:
                </span>
                <button
                  onClick={() => loadScenario('salaried')}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  Salaried Professional (AY 2024-25 [FY 2023-24])
                </button>
                <button
                  onClick={() => loadScenario('trader')}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  Business Trader 44AD / HUF
                </button>
                <button
                  onClick={() => loadScenario('itru_belated')}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors border border-blue-200"
                >
                  ITR-U Case (AY 2023-24 [FY 2022-23], 25% Sec 140B)
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono hidden md:block">
                Tax Engine Version: <span className="font-bold text-slate-700">v2.4.1 (CBDT 2024-25)</span>
              </div>
            </div>

            {/* 4 Stat Hero Cards (hidden on statutory directory, assessment calc and saved reports) */}
            {activeTab !== 'tax-rates' && activeTab !== 'assessment-calc' && activeTab !== 'saved-reports' && (
              <StatCards computation={currentResult} />
            )}

            {/* Active View Router */}
            {activeTab === 'dashboard' && (
              <DashboardView
                currentResult={currentResult}
                comparisonResult={comparisonResult}
                interest={interest}
                itruResult={itruResult}
                onNavigateToItru={() => setActiveTab('itru')}
                onNavigateToInterest={() => setActiveTab('interest')}
                onToggleRegime={setRegime}
                onNavigateToTaxRates={() => setActiveTab('tax-rates')}
                onNavigateToAssessmentCalc={() => setActiveTab('assessment-calc')}
                onNavigateToSavedReports={() => setActiveTab('saved-reports')}
                onSaveCurrentCalculation={handleSaveCurrentCalculation}
              />
            )}

            {activeTab === 'client' && (
              <ClientProfileView
                profile={profile}
                onChangeProfile={setProfile}
                selectedAy={selectedAy}
                regime={regime}
                onChangeRegime={setRegime}
              />
            )}

            {activeTab === 'income' && (
              <IncomeHeadsView
                salary={salary}
                onChangeSalary={setSalary}
                hp={hp}
                onChangeHp={setHp}
                business={business}
                onChangeBusiness={setBusiness}
                cg={cg}
                onChangeCg={setCg}
                other={other}
                onChangeOther={setOther}
                regime={regime}
                selectedAy={selectedAy}
              />
            )}

            {activeTab === 'deductions' && (
              <DeductionsView
                deductions={deductions}
                onChangeDeductions={setDeductions}
                regime={regime}
                ageCategory={ageCategory}
                onToggleRegime={setRegime}
              />
            )}

            {activeTab === 'interest' && (
              <InterestEngineView
                prepaid={prepaid}
                onChangePrepaid={setPrepaid}
                interest={interest}
                currentResult={currentResult}
                filingDueDate={profile.filingDueDate}
                actualFilingDate={profile.actualFilingDate}
                selectedAy={selectedAy}
                isSeniorCitizen={ageCategory !== 'GENERAL'}
                hasBusinessIncome={business.normalProfit > 0 || business.grossReceiptsDigital > 0 || business.professionalReceipts > 0}
              />
            )}

            {activeTab === 'tax-rates' && <TaxRatesDirectoryView />}

            {activeTab === 'assessment-calc' && <AssessmentDemandCalcView />}

            {activeTab === 'itru' && (
              <ItruModuleView
                itruResult={itruResult}
                currentResult={currentResult}
                interest={interest}
                profile={profile}
                selectedAy={selectedAy}
              />
            )}

            {activeTab === 'reports' && (
              <ReportGeneratorView
                profile={profile}
                currentResult={currentResult}
                interest={interest}
                itruResult={itruResult}
                selectedAy={selectedAy}
                salary={salary}
                hp={hp}
                business={business}
                cg={cg}
                other={other}
                prepaid={prepaid}
                onSaveReport={handleSaveCurrentCalculation}
              />
            )}

            {activeTab === 'saved-reports' && (
              <SavedReportsView
                onLoadSnapshot={handleLoadSnapshot}
                onSaveCurrentCalculation={handleSaveCurrentCalculation}
                currentClientName={profile.name}
              />
            )}
          </div>
        </main>
      </div>

      {/* Standalone Windows Desktop Runner Modal (.EXE & .BAT) */}
      <DesktopRunnerModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </div>
  );
}
