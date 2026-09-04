import React, { useState, useEffect } from 'react';
import {
  SavedTaxReport,
  ClientProfile,
  SalaryInput,
  HousePropertyInput,
  BusinessInput,
  CapitalGainsInput,
  OtherSourcesInput,
  DeductionsInput,
  PrepaidTaxesInput,
  TaxRegime,
  formatYearWithFy,
} from '../types';
import { savedReportsService } from '../services/savedReportsService';
import {
  FolderArchive,
  Calendar,
  Clock,
  User,
  CreditCard,
  Download,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  BookmarkPlus,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface SavedReportsViewProps {
  onLoadSnapshot: (snapshot: SavedTaxReport['snapshot']) => void;
  onSaveCurrentCalculation: () => void;
  currentClientName: string;
}

export const SavedReportsView: React.FC<SavedReportsViewProps> = ({
  onLoadSnapshot,
  onSaveCurrentCalculation,
  currentClientName,
}) => {
  const [reports, setReports] = useState<SavedTaxReport[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeReportForModal, setActiveReportForModal] = useState<SavedTaxReport | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const list = savedReportsService.getSavedReports();
    setReports(list);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the saved report for "${name}"?`)) {
      const updated = savedReportsService.deleteReport(id);
      setReports(updated);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved reports? This cannot be undone.')) {
      savedReportsService.clearAllReports();
      setReports([]);
    }
  };

  const handleSaveCurrent = () => {
    onSaveCurrentCalculation();
    loadReports();
    setSaveSuccessNotice('Current calculation successfully saved to report history!');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleExportJson = () => {
    savedReportsService.exportReportsAsJson(reports);
  };

  const filteredReports = reports.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.clientName.toLowerCase().includes(q) ||
      r.pan.toLowerCase().includes(q) ||
      r.yearLabel.toLowerCase().includes(q) ||
      r.selectedAy.toLowerCase().includes(q) ||
      r.formattedDate.toLowerCase().includes(q)
    );
  });

  return (
    <div id="saved-reports-view" className="space-y-6">
      {/* Top Action & Welcome Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Saved Reports &amp; Calculation Archive
              </h2>
              <p className="text-xs text-slate-500">
                All tax computations generated using this tool along with date of generation, regime, and audit figures.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveCurrent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            title={`Save current calculation for ${currentClientName}`}
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Save Current Calculation</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            disabled={reports.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive</span>
          </button>

          {reports.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear all saved reports"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccessNotice}</span>
        </div>
      )}

      {/* Search Bar & Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved reports by Client Name, PAN, Tax Year, or Date..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>

        <div className="md:col-span-4 flex items-center justify-end gap-3 text-xs font-mono text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <span>Saved: <strong className="text-slate-900 font-sans">{filteredReports.length}</strong></span>
          <span>•</span>
          <span className="truncate">Latest: <strong className="text-slate-900 font-sans">{reports[0]?.formattedDate?.split(',')[0] || '—'}</strong></span>
        </div>
      </div>

      {/* Saved Reports Cards / Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-800">No Saved Reports Found</h3>
            <p className="text-xs text-slate-500">
              {searchTerm
                ? 'No reports matched your search term. Try a different query or clear the filter.'
                : 'You have not saved any tax calculations yet. Click "Save Current Calculation" to archive your current computation.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveCurrent}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Save Current Calculation ({currentClientName})</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const isRefund = report.netTaxPayableOrRefund < 0;
            const isZero = report.netTaxPayableOrRefund === 0;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {report.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{report.clientName}</span>
                        <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-200 text-slate-800 font-semibold rounded">
                          {report.pan}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                          {report.regime === 'NEW' ? 'New (115BAC)' : 'Old Regime'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{report.yearLabel}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>Generated: <strong>{report.formattedDate}</strong></span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onLoadSnapshot(report.snapshot)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                      title="Load this client and calculation into the calculator"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Load into Calculator</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveReportForModal(report)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                      title="View complete Statement of Income & Tax"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Statement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(report.id, report.clientName)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete this saved calculation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider mb-0.5">
                      Gross Total Income
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{report.grossTotalIncome.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider mb-0.5">
                      Net Taxable Income
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{report.taxableTotalIncome.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider mb-0.5">
                      Total Tax Liability
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{report.totalTaxLiability.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider mb-0.5">
                      Advance Tax Paid
                    </span>
                    <span className="font-bold text-blue-700 text-sm">
                      ₹{report.advanceTaxPaid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 font-sans uppercase tracking-wider mb-0.5">
                      Interest 234A/B/C
                    </span>
                    <span className={`font-bold text-sm ${report.totalInterestAndFees > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                      ₹{report.totalInterestAndFees.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="block text-[10px] font-bold font-sans uppercase tracking-wider mb-0.5 text-slate-500">
                      {isRefund ? 'Refund Due' : 'Net Tax Payable'}
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        isRefund ? 'text-emerald-600' : isZero ? 'text-slate-600' : 'text-blue-700'
                      }`}
                    >
                      ₹{Math.abs(report.netTaxPayableOrRefund).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal Dialog if user clicks "View Statement" */}
      {activeReportForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setActiveReportForModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden text-slate-800 my-6 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">{activeReportForModal.clientName}</h3>
                  <p className="text-[11px] text-slate-400">
                    Generated on {activeReportForModal.formattedDate} • {activeReportForModal.yearLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveReportForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">PAN</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{activeReportForModal.pan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Assessee</span>
                  <span className="font-bold text-slate-800">{activeReportForModal.assesseeType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Regime</span>
                  <span className="font-bold text-blue-700">{activeReportForModal.regime === 'NEW' ? 'Section 115BAC' : 'Old Framework'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Filing Due Date</span>
                  <span className="font-mono font-bold text-slate-800">{activeReportForModal.snapshot.profile.filingDueDate}</span>
                </div>
              </div>

              {/* Summary Table */}
              <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="bg-slate-50 font-bold font-sans">
                    <td className="py-2.5 px-3">Particulars</td>
                    <td className="py-2.5 px-3 text-right">Amount (₹)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Gross Total Income (GTI)</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      ₹{activeReportForModal.grossTotalIncome.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Less: Chapter VI-A Deductions</td>
                    <td className="py-2 px-3 text-right text-emerald-600">
                      (₹{activeReportForModal.totalDeductions.toLocaleString('en-IN')})
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70 font-bold">
                    <td className="py-2.5 px-3 font-sans text-slate-900">Total Taxable Income (NTI)</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 text-sm">
                      ₹{activeReportForModal.taxableTotalIncome.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Total Tax Liability (including Cess)</td>
                    <td className="py-2 px-3 text-right text-slate-900">
                      ₹{activeReportForModal.totalTaxLiability.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Add: Interest u/s 234A, 234B &amp; 234C</td>
                    <td className="py-2 px-3 text-right text-slate-900">
                      ₹{activeReportForModal.totalInterestAndFees.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">Less: Total Advance Tax Paid</td>
                    <td className="py-2 px-3 text-right text-blue-700">
                      (₹{activeReportForModal.advanceTaxPaid.toLocaleString('en-IN')})
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-sm border-t-2 border-slate-300">
                    <td className="py-3 px-3 font-sans text-slate-900 uppercase">
                      {activeReportForModal.netTaxPayableOrRefund < 0 ? 'Refund Due' : 'Net Amount Payable'}
                    </td>
                    <td className="py-3 px-3 text-right text-blue-700">
                      ₹{Math.abs(activeReportForModal.netTaxPayableOrRefund).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  onLoadSnapshot(activeReportForModal.snapshot);
                  setActiveReportForModal(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors"
              >
                Restore into Active Calculator
              </button>
              <button
                onClick={() => setActiveReportForModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
