'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SOCSidebar, SOCTab } from '@/components/SOCSidebar';
import { SOCOverviewCard } from '@/components/SOCOverviewCard';
import { IntegratedPipelineCard } from '@/components/IntegratedPipelineCard';
import { HealthStatus } from '@/components/HealthStatus';
import { SimulationControls } from '@/components/SimulationControls';
import { SliceOverview } from '@/components/SliceOverview';
import { AttackControls } from '@/components/AttackControls';
import { AttackFeed } from '@/components/AttackFeed';
import { MARLCard } from '@/components/MARLCard';
import { RLAgentCard } from '@/components/RLAgentCard';
import { FederatedLearningCard } from '@/components/FederatedLearningCard';
import { SecurityControllerCard } from '@/components/SecurityControllerCard';
import { AnomalyDetectorCard } from '@/components/AnomalyDetectorCard';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { ExperimentsView } from '@/components/ExperimentsView';
import { ArchitectureCard } from '@/components/ArchitectureCard';
import { OVSNetworkCard } from '@/components/OVSNetworkCard';
import { NetworkConnectivityView } from '@/components/NetworkConnectivityView';

import { useWebSocket } from '@/hooks/useWebSocket';
import {
  fetchHealthStatus,
  fetchNetworkSlices,
  fetchSimulationState,
  fetchActiveAttacks,
  toggleAutoDefense,
  fetchOrchestratorState,
} from '@/lib/api';
import { HealthCheckResponse, NetworkSlice, SimulationState, AttackEvent } from '@/types';
import {
  Menu,
  Shield,
  Activity,
  Radio,
  Cpu,
  Sliders,
  LineChart,
  Layers,
  AlertTriangle,
  Network,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/api/v1/ws/telemetry';

export default function SOCDashboardPage() {
  const [activeTab, setActiveTab] = useState<SOCTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // WebSocket Live Stream Data
  const { data: wsFrame, isConnected: isWsConnected } = useWebSocket(WS_URL);

  // REST State
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [slices, setSlices] = useState<NetworkSlice[]>([]);
  const [slicesError, setSlicesError] = useState<string | null>(null);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [activeAttacks, setActiveAttacks] = useState<AttackEvent[]>([]);
  const [autoDefenseEnabled, setAutoDefenseEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const healthRes = await fetchHealthStatus();
    setHealth(healthRes.data);
    setLatencyMs(healthRes.latencyMs);
    setHealthError(healthRes.error);

    const slicesRes = await fetchNetworkSlices();
    setSlices(slicesRes.data);
    setSlicesError(slicesRes.error);

    const simRes = await fetchSimulationState();
    setSimState(simRes.data);

    const attacksRes = await fetchActiveAttacks();
    setActiveAttacks(attacksRes.data);

    const orchRes = await fetchOrchestratorState();
    if (orchRes) setAutoDefenseEnabled(orchRes.auto_defense_enabled);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Sync slices & attacks if WebSocket stream frame is available
  useEffect(() => {
    if (wsFrame?.slices_telemetry && slices.length > 0) {
      const updatedSlices = slices.map((s) => {
        const frameData = wsFrame.slices_telemetry[s.slice_id];
        if (!frameData) return s;
        return {
          ...s,
          latency: frameData.latency,
          cpu_usage: frameData.cpu_usage,
          packet_loss: frameData.packet_loss,
          anomaly_score: frameData.anomaly_score,
          security_level: frameData.security_level,
          current_status: frameData.current_status,
        };
      });
      setSlices(updatedSlices);
    }

    if (wsFrame?.active_attacks) {
      setActiveAttacks(wsFrame.active_attacks as any);
    }
  }, [wsFrame]);

  const handleToggleAutoDefense = async () => {
    const nextState = !autoDefenseEnabled;
    const ok = await toggleAutoDefense(nextState);
    if (ok) {
      setAutoDefenseEnabled(nextState);
    }
  };

  const isBackendConnected = health !== null && !healthError;

  const tabTitles: Record<SOCTab, { title: string; subtitle: string; icon: React.ReactNode }> = {
    overview: {
      title: 'Security Operations Overview',
      subtitle: 'Real-time telemetry, slice status matrix, and closed-loop defense',
      icon: <Shield className="w-4 h-4 text-blue-600" />,
    },
    connectivity: {
      title: 'Virtual Network Connectivity & Data Flow',
      subtitle: 'Real-time animated packet flows, ICMP ping testing & Wireshark-grade packet inspector',
      icon: <Activity className="w-4 h-4 text-cyan-600" />,
    },
    ovs: {
      title: 'Open vSwitch (OVS) Overlay Virtual Network',
      subtitle: 'Software-defined 5G slicing bridge with real-time OpenFlow 1.3 flow switching & defense',
      icon: <Network className="w-4 h-4 text-indigo-600" />,
    },
    slices: {
      title: '5G/6G Network Slice Telemetry',
      subtitle: 'eMBB, URLLC & mMTC physical/transport/core performance telemetry',
      icon: <Radio className="w-4 h-4 text-blue-600" />,
    },
    threats: {
      title: 'Threat Vector Monitoring & Attack Controls',
      subtitle: 'Live attack logs, feature delta assessments, and attack generator',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    },
    marl: {
      title: 'Multi-Agent Cross-Layer RL Security',
      subtitle: 'PHY, MAC, NET & APP coordinated joint security decisions',
      icon: <Cpu className="w-4 h-4 text-blue-600" />,
    },
    federated: {
      title: 'Privacy-Preserving Federated Learning',
      subtitle: '3-Edge collaborative FedAvg training without raw telemetry transfer',
      icon: <Layers className="w-4 h-4 text-cyan-600" />,
    },
    controls: {
      title: 'Adaptive Security Controller',
      subtitle: 'Dynamic Authentication, Encryption, IDS & Slice Isolation configuration',
      icon: <Sliders className="w-4 h-4 text-blue-600" />,
    },
    analytics: {
      title: 'Real-Time Telemetry Analytics',
      subtitle: 'Continuous 8-series performance & cyber threat telemetry charts',
      icon: <LineChart className="w-4 h-4 text-blue-600" />,
    },
    experiments: {
      title: 'Empirical Research Benchmark & Experiments',
      subtitle: 'Quantitative 9-metric comparison: Static vs Single-Agent RL vs ACLS MARL',
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
    },
  };

  const currentTabInfo = tabTitles[activeTab];

  return (
    <div className="min-h-screen h-screen bg-[#EAEAEA] dark:bg-[#14161D] p-2 sm:p-3 lg:p-4 overflow-hidden flex gap-3 font-sans text-[#111111] dark:text-[#F3F4F6]">
      {/* Floating Slim Navigation Rail */}
      <SOCSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWsConnected={isWsConnected}
        isBackendConnected={isBackendConnected}
        autoDefenseEnabled={autoDefenseEnabled}
        onToggleAutoDefense={handleToggleAutoDefense}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Control Bar adhering to AGENTS.md Section 5 */}
        <header className="h-14 mb-3 flex items-center justify-between shrink-0 z-10 gap-3">
          {/* Left Capsule: Active Tab & Fast Jump Pills */}
          <div className="bg-white dark:bg-[#1A1D26] rounded-2xl px-3.5 py-1.5 border border-[#EFEFEF] dark:border-[#2E3344] shadow-xs flex items-center space-x-2.5">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F5F5F7] dark:hover:bg-[#222632]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Current Active Tab Pill with Solid Dark Brand Background as per Section 4 & 5 */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-[#1A3C6F] text-white rounded-[10px] text-xs font-bold shadow-xs whitespace-nowrap">
              <span>{currentTabInfo.icon}</span>
              <span className="truncate max-w-[130px] sm:max-w-none">{currentTabInfo.title}</span>
            </div>

            {/* Fast-jump pill buttons */}
            <div className="hidden md:flex items-center space-x-1 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-[10px] transition-all font-bold ${
                  activeTab === 'overview'
                    ? 'bg-[#1A3C6F] text-white shadow-xs'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6] hover:bg-[#F5F5F7] dark:hover:bg-[#222632]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('connectivity')}
                className={`px-3 py-1 rounded-[10px] transition-all font-bold ${
                  activeTab === 'connectivity'
                    ? 'bg-[#1A3C6F] text-white shadow-xs'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6] hover:bg-[#F5F5F7] dark:hover:bg-[#222632]'
                }`}
              >
                Connectivity
              </button>
              <button
                onClick={() => setActiveTab('ovs')}
                className={`px-3 py-1 rounded-[10px] transition-all font-bold ${
                  activeTab === 'ovs'
                    ? 'bg-[#1A3C6F] text-white shadow-xs'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6] hover:bg-[#F5F5F7] dark:hover:bg-[#222632]'
                }`}
              >
                OVS Virtual Net
              </button>
              <button
                onClick={() => setActiveTab('threats')}
                className={`px-3 py-1 rounded-[10px] transition-all font-bold ${
                  activeTab === 'threats'
                    ? 'bg-[#1A3C6F] text-white shadow-xs'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6] hover:bg-[#F5F5F7] dark:hover:bg-[#222632]'
                }`}
              >
                Threats
              </button>
            </div>
          </div>

          {/* Right Capsule: Quick Metrics, Status Badges & Dark Mode Toggle */}
          <div className="bg-white dark:bg-[#1A1D26] rounded-2xl px-3.5 py-1.5 border border-[#EFEFEF] dark:border-[#2E3344] shadow-xs flex items-center space-x-2.5 text-xs">
            {/* Slice Chips */}
            <div className="hidden lg:flex items-center space-x-1">
              <span
                onClick={() => setActiveTab('slices')}
                title="eMBB Ultra-HD Video Slice"
                className="w-7 h-7 rounded-[10px] bg-[#1A3C6F] text-white font-bold text-[9px] flex items-center justify-center cursor-pointer hover:bg-[#179F99] transition-colors shadow-2xs"
              >
                MBB
              </span>
              <span
                onClick={() => setActiveTab('slices')}
                title="URLLC Low-Latency Autonomous Slice"
                className="w-7 h-7 rounded-[10px] bg-[#179F99] text-white font-bold text-[9px] flex items-center justify-center cursor-pointer hover:bg-[#148f8a] transition-colors shadow-2xs"
              >
                URL
              </span>
              <span
                onClick={() => setActiveTab('slices')}
                title="mMTC Smart IoT Sensor Slice"
                className="w-7 h-7 rounded-[10px] bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors shadow-2xs"
              >
                MTC
              </span>
            </div>

            {/* Quick Threat Status Badge (Solid Dark Background per Section 4/13) */}
            <StatusBadge variant={activeAttacks.length > 0 ? 'critical' : 'active'} dot>
              {activeAttacks.length} Threats
            </StatusBadge>

            {/* Latency Badge */}
            <div className="hidden sm:inline-flex">
              <StatusBadge variant="teal">
                {latencyMs}ms
              </StatusBadge>
            </div>

            {/* Live Stream Pulse Badge */}
            <StatusBadge variant="active" dot>
              <span className="hidden sm:inline">Live Stream</span>
            </StatusBadge>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 rounded-xl border border-[#EFEFEF] dark:border-[#2E3344] bg-[#F5F5F7] dark:bg-[#222632] text-[#111111] dark:text-[#F3F4F6] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Toggle theme mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#1A3C6F]" />}
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <SOCOverviewCard
                slices={slices}
                activeAttacks={activeAttacks}
                autoDefenseEnabled={autoDefenseEnabled}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />

              <IntegratedPipelineCard />

              <HealthStatus
                health={health}
                latencyMs={latencyMs}
                error={healthError}
                onRefresh={loadData}
                isLoading={isLoading}
              />

              <ArchitectureCard />
            </div>
          )}

          {/* TAB 2: NETWORK SLICES */}
          {activeTab === 'slices' && (
            <div className="space-y-6 animate-fadeIn">
              <SliceOverview slices={slices} error={slicesError} />
              <SimulationControls simState={simState} onStateUpdate={loadData} />
            </div>
          )}

          {/* TAB 2.5: NETWORK CONNECTIVITY & DATA FLOW */}
          {activeTab === 'connectivity' && (
            <div className="space-y-6 animate-fadeIn">
              <NetworkConnectivityView />
            </div>
          )}

          {/* TAB 2.6: OPEN VSWITCH VIRTUAL NETWORK */}
          {activeTab === 'ovs' && (
            <div className="space-y-6 animate-fadeIn">
              <OVSNetworkCard onRefreshParent={loadData} />
            </div>
          )}

          {/* TAB 3: THREAT MONITORING */}
          {activeTab === 'threats' && (
            <div className="space-y-6 animate-fadeIn">
              <AttackFeed onRefreshTrigger={loadData} />
              <AttackControls onAttackTriggered={loadData} />
            </div>
          )}

          {/* TAB 4: MARL SECURITY AGENTS */}
          {activeTab === 'marl' && (
            <div className="space-y-6 animate-fadeIn">
              <MARLCard />
              <RLAgentCard />
            </div>
          )}

          {/* TAB 5: FEDERATED LEARNING */}
          {activeTab === 'federated' && (
            <div className="space-y-6 animate-fadeIn">
              <FederatedLearningCard />
              <AnomalyDetectorCard />
            </div>
          )}

          {/* TAB 6: SECURITY CONTROLS */}
          {activeTab === 'controls' && (
            <div className="space-y-6 animate-fadeIn">
              <SecurityControllerCard />
            </div>
          )}

          {/* TAB 7: REAL-TIME ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <AnalyticsCharts slices={slices} activeAttacks={activeAttacks} />
            </div>
          )}

          {/* TAB 8: EXPERIMENTS & RESEARCH BENCHMARK */}
          {activeTab === 'experiments' && (
            <div className="space-y-6 animate-fadeIn">
              <ExperimentsView />
            </div>
          )}

          <footer className="border-t border-[#EFEFEF] dark:border-[#2E3344] py-4 text-center text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <p>5G/6G Security Operations Center (SOC) Framework &copy; {new Date().getFullYear()}</p>
            <p className="mt-0.5 text-[11px] text-[#6B7280]/70 dark:text-[#9CA3AF]/70">
              FastAPI Telemetry &bull; Next.js 14 Sidebar UI &bull; Coordinated MARL + FedAvg
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
