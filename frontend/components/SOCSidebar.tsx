'use client';

import React from 'react';
import {
  Shield,
  Radio,
  Activity,
  Layers,
  AlertTriangle,
  Cpu,
  Sliders,
  LineChart,
  Zap,
  Network,
  X,
  Sparkles,
} from 'lucide-react';

export type SOCTab =
  | 'overview'
  | 'connectivity'
  | 'ovs'
  | 'slices'
  | 'threats'
  | 'marl'
  | 'federated'
  | 'controls'
  | 'analytics'
  | 'experiments';

interface NavItem {
  id: SOCTab;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SOCSidebarProps {
  activeTab: SOCTab;
  setActiveTab: (tab: SOCTab) => void;
  isWsConnected: boolean;
  isBackendConnected: boolean;
  autoDefenseEnabled: boolean;
  onToggleAutoDefense: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SOCSidebar: React.FC<SOCSidebarProps> = ({
  activeTab,
  setActiveTab,
  isWsConnected,
  isBackendConnected,
  autoDefenseEnabled,
  onToggleAutoDefense,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'SOC Overview', icon: Shield },
    { id: 'connectivity', label: 'Network Connectivity', badge: 'Live Flow', icon: Activity },
    { id: 'ovs', label: 'Open vSwitch (OVN)', badge: 'Live VNet', icon: Network },
    { id: 'slices', label: 'Network Slices', badge: '3 Slices', icon: Radio },
    { id: 'threats', label: 'Threat Monitoring', icon: AlertTriangle },
    { id: 'marl', label: 'MARL Security', badge: '4 Agents', icon: Cpu },
    { id: 'federated', label: 'Federated FL', badge: 'FedAvg', icon: Layers },
    { id: 'controls', label: 'Security Controller', icon: Sliders },
    { id: 'analytics', label: 'Telemetry Analytics', icon: LineChart },
    { id: 'experiments', label: 'Research Benchmark', badge: '3-Way', icon: Sparkles },
  ];

  return (
    <>
      {/* Desktop Floating Slim Navigation Rail */}
      <aside className="hidden lg:flex flex-col items-center justify-between w-16 py-1 shrink-0 select-none">
        {/* Top Logo Pill Card */}
        <button
          onClick={() => setActiveTab('overview')}
          className="w-13 h-13 p-2.5 bg-white dark:bg-[#1A1D26] rounded-2xl shadow-xs border border-[#EFEFEF] dark:border-[#2E3344] flex items-center justify-center transition-transform hover:scale-105 group relative"
          aria-label="SOC Overview Home"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1A3C6F] to-[#179F99] flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4.5 h-4.5 stroke-[2.4]" />
          </div>
          <span className="absolute left-16 px-2.5 py-1 bg-[#1A3C6F] text-white text-[11px] font-semibold rounded-[10px] shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            5G/6G SOC v1.0
          </span>
        </button>

        {/* Middle Navigation Capsule */}
        <nav className="my-auto bg-white dark:bg-[#1A1D26] rounded-[24px] p-2 shadow-xs border border-[#EFEFEF] dark:border-[#2E3344] flex flex-col items-center space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#1A3C6F] text-white shadow-xs scale-105'
                      : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6] hover:bg-[#F5F5F7] dark:hover:bg-[#222632]'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 stroke-[2]" />
                </button>

                {/* Floating Tooltip Pill on Hover */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#1A3C6F] text-white text-xs font-semibold rounded-[10px] shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center space-x-1.5">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[10px] bg-[#179F99] text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Action Card: Auto-Defense / Quick Status Toggle */}
        <button
          onClick={onToggleAutoDefense}
          title={autoDefenseEnabled ? 'RL Auto-Defense: Active' : 'RL Auto-Defense: Paused'}
          className="w-13 h-13 p-2.5 bg-white dark:bg-[#1A1D26] rounded-2xl shadow-xs border border-[#EFEFEF] dark:border-[#2E3344] flex items-center justify-center transition-all hover:scale-105 group relative cursor-pointer"
          aria-label="Toggle RL Auto-Defense"
        >
          {/* Solid dark background with clean white text as strictly required in Section 4 & 13 */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              autoDefenseEnabled
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-700 text-white'
            }`}
          >
            <Zap className={`w-4 h-4 ${autoDefenseEnabled ? 'fill-current' : ''}`} />
          </div>

          {/* Indicator Dot */}
          <span
            className={`absolute top-2 right-2 w-2 h-2 rounded-full border border-white ${
              autoDefenseEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
            }`}
          />

          <span className="absolute left-16 px-2.5 py-1 bg-[#1A3C6F] text-white text-[11px] font-semibold rounded-[10px] shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            RL Auto-Defense: {autoDefenseEnabled ? 'Active' : 'Paused'}
          </span>
        </button>
      </aside>

      {/* Mobile Drawer (Responsive Menu) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-[#1A1D26] h-full p-6 shadow-2xl flex flex-col justify-between z-10 animate-fadeIn border-r border-[#EFEFEF] dark:border-[#2E3344]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#EFEFEF] dark:border-[#2E3344]">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1A3C6F] to-[#179F99] text-white flex items-center justify-center shadow-xs">
                    <Shield className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-[#111111] dark:text-[#F3F4F6] uppercase tracking-tight">
                      5G/6G SOC
                    </span>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Security Operations Center</p>
                  </div>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F5F7] dark:hover:bg-[#222632]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1A3C6F] text-white shadow-xs'
                          : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6] hover:bg-[#F5F5F7] dark:hover:bg-[#222632]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] ${
                            isActive
                              ? 'bg-[#179F99] text-white'
                              : 'bg-[#1A3C6F] text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Footer Toggle */}
            <div className="pt-4 border-t border-[#EFEFEF] dark:border-[#2E3344]">
              <button
                onClick={onToggleAutoDefense}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  autoDefenseEnabled
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-slate-700 border-slate-800 text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>RL Auto-Defense</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-[10px] bg-black/20">
                  {autoDefenseEnabled ? 'ACTIVE' : 'OFF'}
                </span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
