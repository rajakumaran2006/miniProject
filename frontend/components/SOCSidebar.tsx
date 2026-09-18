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
  Settings,
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
      {/* Desktop Floating Slim Navigation Rail (matching reference image) */}
      <aside className="hidden lg:flex flex-col items-center justify-between w-16 py-1 shrink-0 select-none">
        {/* Top Logo Pill Card */}
        <button
          onClick={() => setActiveTab('overview')}
          className="w-13 h-13 p-3 bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-200/80 flex items-center justify-center transition-transform hover:scale-105 group relative"
          aria-label="SOC Overview Home"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Shield className="w-4.5 h-4.5 stroke-[2.4]" />
          </div>
          <span className="absolute left-16 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            5G/6G SOC v1.0
          </span>
        </button>

        {/* Middle Navigation Capsule */}
        <nav className="my-auto bg-white rounded-[30px] p-2 shadow-[0_4px_25px_-3px_rgba(0,0,0,0.05)] border border-slate-200/80 flex flex-col items-center space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/25 scale-105'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 stroke-[2]" />
                </button>

                {/* Floating Tooltip Pill on Hover */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center space-x-1.5">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
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
          className="w-13 h-13 p-3 bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-200/80 flex items-center justify-center transition-all hover:scale-105 group relative"
          aria-label="Toggle RL Auto-Defense"
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              autoDefenseEnabled
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <Zap className={`w-4 h-4 ${autoDefenseEnabled ? 'fill-current animate-pulse' : ''}`} />
          </div>

          {/* Indicator Dot */}
          <span
            className={`absolute top-2 right-2 w-2 h-2 rounded-full border border-white ${
              autoDefenseEnabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          />

          <span className="absolute left-16 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            RL Auto-Defense: {autoDefenseEnabled ? 'Active' : 'Paused'}
          </span>
        </button>
      </aside>

      {/* Mobile Drawer (Responsive Menu) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full p-6 shadow-2xl flex flex-col justify-between z-10 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Shield className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
                      5G/6G SOC
                    </span>
                    <p className="text-[11px] text-slate-500">Security Operations Center</p>
                  </div>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
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
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={onToggleAutoDefense}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  autoDefenseEnabled
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>RL Auto-Defense</span>
                </div>
                <span className="font-mono text-[10px]">{autoDefenseEnabled ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
