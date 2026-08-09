'use client';

import React from 'react';
import { Shield, Radio, Activity, Layers, AlertTriangle, Cpu, Network, Sliders, LineChart, Play, Zap } from 'lucide-react';

export type SOCTab = 'overview' | 'slices' | 'threats' | 'marl' | 'federated' | 'controls' | 'analytics' | 'experiments' | 'simulator';

interface SOCNavbarProps {
  activeTab: SOCTab;
  setActiveTab: (tab: SOCTab) => void;
  isWsConnected: boolean;
  isBackendConnected: boolean;
  autoDefenseEnabled: boolean;
  onToggleAutoDefense: () => void;
}

export const SOCNavbar: React.FC<SOCNavbarProps> = ({
  activeTab,
  setActiveTab,
  isWsConnected,
  isBackendConnected,
  autoDefenseEnabled,
  onToggleAutoDefense,
}) => {
  const tabs: { id: SOCTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview (SOC)', icon: <Shield className="w-4 h-4" /> },
    { id: 'slices', label: 'Network Slices', icon: <Radio className="w-4 h-4" /> },
    { id: 'threats', label: 'Threat Monitoring', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'marl', label: 'MARL Security Agents', icon: <Cpu className="w-4 h-4" /> },
    { id: 'federated', label: 'Federated Learning', icon: <Layers className="w-4 h-4" /> },
    { id: 'controls', label: 'Security Controls', icon: <Sliders className="w-4 h-4" /> },
    { id: 'analytics', label: 'Real-Time Analytics', icon: <LineChart className="w-4 h-4" /> },
    { id: 'experiments', label: 'Experiments & Research', icon: <Activity className="w-4 h-4" /> },
    { id: 'simulator', label: 'Attack Simulator', icon: <Play className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-network-dark/90 backdrop-blur-md border-b border-network-border shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between h-16 border-b border-network-border/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-network-cyan to-network-blue rounded-xl text-network-dark shadow-lg shadow-network-cyan/20">
              <Shield className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-wide uppercase">5G/6G SOC Engine</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-network-cyan/20 text-network-cyan border border-network-cyan/30">
                  Security Operations Center
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Adaptive Cross-Layer Security Framework &bull; Reinforcement Learning</p>
            </div>
          </div>

          {/* Connection Status & Auto-Defense Switch */}
          <div className="flex items-center space-x-3 text-xs">
            {/* WebSocket Stream Badge */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border font-mono font-semibold ${
              isWsConnected
                ? 'bg-network-emerald/10 border-network-emerald/40 text-network-emerald'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'animate-pulse' : ''}`} />
              <span>{isWsConnected ? 'WebSocket Live (1.5s)' : 'Polling Mode'}</span>
            </div>

            {/* Backend REST Health Badge */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border font-mono font-semibold ${
              isBackendConnected
                ? 'bg-network-cyan/10 border-network-cyan/40 text-network-cyan'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
            }`}>
              <Activity className="w-3.5 h-3.5" />
              <span>{isBackendConnected ? 'FastAPI 8000 OK' : 'Backend Disconnected'}</span>
            </div>

            {/* Auto-Defense Button */}
            <button
              onClick={onToggleAutoDefense}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border font-bold text-xs transition-all ${
                autoDefenseEnabled
                  ? 'bg-network-cyan/20 border-network-cyan text-network-cyan shadow-sm shadow-network-cyan/20'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Defense: {autoDefenseEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-network-cyan text-network-dark shadow-md shadow-network-cyan/20'
                    : 'text-gray-400 hover:text-white hover:bg-network-card/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
