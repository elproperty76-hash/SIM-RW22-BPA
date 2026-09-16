import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  HeartHandshake,
  Activity,
  Wallet,
  FileText,
  Radio,
} from 'lucide-react';

export type TabKey = 'dashboard' | 'warga' | 'pengurus' | 'pkk' | 'posyandu' | 'kas' | 'laporan' | 'portal';

interface NavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  counts: {
    warga: number;
    pengurus: number;
    pkk: number;
    posyandu: number;
    transaksi: number;
    laporan: number;
  };
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  counts,
}) => {
  const tabs = [
    {
      key: 'dashboard' as TabKey,
      label: 'Ringkasan RW',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      key: 'warga' as TabKey,
      label: 'Data Warga & Import RT',
      icon: Users,
      badge: counts.warga,
    },
    {
      key: 'pengurus' as TabKey,
      label: 'Kelola Pengurus',
      icon: ShieldCheck,
      badge: counts.pengurus,
    },
    {
      key: 'pkk' as TabKey,
      label: 'PKK RW 22',
      icon: HeartHandshake,
      badge: counts.pkk,
    },
    {
      key: 'posyandu' as TabKey,
      label: 'Posyandu Anggrek Bulan',
      icon: Activity,
      badge: counts.posyandu,
    },
    {
      key: 'kas' as TabKey,
      label: 'Keuangan Kas',
      icon: Wallet,
      badge: null,
    },
    {
      key: 'laporan' as TabKey,
      label: 'Laporan Bulanan',
      icon: FileText,
      badge: counts.laporan,
    },
    {
      key: 'portal' as TabKey,
      label: 'Portal Warga',
      icon: Radio,
      badge: 'Publik',
      highlight: true,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`tab-btn-${tab.key}`}
                onClick={() => onSelectTab(tab.key)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                  isActive
                    ? tab.highlight
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : tab.highlight
                    ? 'text-amber-700 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-current' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.highlight
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
