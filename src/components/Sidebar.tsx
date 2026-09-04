import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Coins,
  Percent,
  Clock,
  RefreshCw,
  Printer,
  ShieldCheck,
  BookOpen,
  Gavel,
  HardDrive,
  FolderArchive,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'client'
  | 'income'
  | 'deductions'
  | 'interest'
  | 'tax-rates'
  | 'assessment-calc'
  | 'itru'
  | 'reports'
  | 'saved-reports';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  clientName: string;
  isItruEligible: boolean;
  onOpenDesktopModal?: () => void;
  savedReportsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isItruEligible,
  onOpenDesktopModal,
  savedReportsCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'client',
      label: 'Client Profile',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'income',
      label: 'Income Heads',
      icon: <Coins className="w-4 h-4" />,
    },
    {
      id: 'deductions',
      label: 'Deductions',
      icon: <Percent className="w-4 h-4" />,
    },
    {
      id: 'interest',
      label: 'Interest (234A/B/C)',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'tax-rates',
      label: 'Tax Rates Directory',
      icon: <BookOpen className="w-4 h-4" />,
      badge: 'Yearwise',
    },
    {
      id: 'assessment-calc',
      label: 'Assessment Order Calc',
      icon: <Gavel className="w-4 h-4" />,
      badge: 'CIT(A) Demand',
    },
    {
      id: 'itru',
      label: 'ITR-U Module',
      icon: <RefreshCw className="w-4 h-4" />,
      badge: isItruEligible ? 'Sec 139(8A)' : 'Expired',
    },
    {
      id: 'reports',
      label: 'Report Generator',
      icon: <Printer className="w-4 h-4" />,
    },
    {
      id: 'saved-reports',
      label: 'Saved Reports',
      icon: <FolderArchive className="w-4 h-4" />,
      badge: savedReportsCount > 0 ? `${savedReportsCount}` : undefined,
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none h-full"
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-900/30">
          T
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white tracking-tight text-lg leading-tight">
            TaxEngine Pro
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Income-tax Act, 1961
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Statutory Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isItruSpecial = item.id === 'itru';

          let buttonClasses =
            'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left';

          if (isActive) {
            if (isItruSpecial) {
              buttonClasses +=
                ' border-l-2 border-blue-500 bg-slate-800/60 text-blue-400 rounded-r-md pl-2.5';
            } else {
              buttonClasses += ' bg-slate-800 text-white shadow-sm';
            }
          } else {
            buttonClasses +=
              ' text-slate-400 hover:bg-slate-800/70 hover:text-slate-200';
          }

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={buttonClasses}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center flex items-center justify-center opacity-90">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isActive
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-6 px-3 space-y-3">
          {onOpenDesktopModal && (
            <button
              id="btn-sidebar-desktop-app"
              onClick={onOpenDesktopModal}
              className="w-full flex items-center justify-between p-2.5 bg-blue-950/70 hover:bg-blue-900/90 border border-blue-800/80 rounded-lg text-xs font-semibold text-blue-300 transition-colors shadow-xs group"
              title="Download Windows Executable (.EXE) & Batch (.BAT) Launcher"
            >
              <div className="flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                <span>Offline Desktop</span>
              </div>
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                .EXE / .BAT
              </span>
            </button>
          )}

          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-300 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Rule Engine Active</span>
            </div>
            <p className="text-[10px] text-slate-500">
              CBDT Notification No. 48/2022 & Finance (No. 2) Act 2024 compliant.
            </p>
          </div>
        </div>
      </nav>
    </aside>
  );
};
