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
} from 'lucide-react';

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
    <div className="min-h-screen h-screen bg-[#edf1f7] p-2 sm:p-3 lg:p-4 overflow-hidden flex gap-3 font-sans text-slate-900">
      {/* Floating Slim Navigation Rail (matching reference) */}
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
        {/* Top Floating Pill Header Bar (matching reference) */}
        <header className="h-14 mb-3 flex items-center justify-between shrink-0 z-10 gap-3">
          {/* Left Pill Capsule: Breadcrumbs / Fast-jump Navigation Pills */}
          <div className="bg-white rounded-full px-3.5 py-1.5 border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex items-center space-x-2.5">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-full text-slate-500 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Current Active Tab Pill */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-sm">
              <span>{currentTabInfo.icon}</span>
              <span className="truncate max-w-[130px] sm:max-w-none">{currentTabInfo.title}</span>
            </div>

            {/* Fast-jump pill buttons */}
            <div className="hidden md:flex items-center space-x-1 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-full transition-all font-medium ${
                  activeTab === 'overview'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('connectivity')}
                className={`px-3 py-1 rounded-full transition-all font-medium ${
                  activeTab === 'connectivity'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Connectivity
              </button>
              <button
                onClick={() => setActiveTab('ovs')}
                className={`px-3 py-1 rounded-full transition-all font-medium ${
                  activeTab === 'ovs'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                OVS Virtual Net
              </button>
              <button
                onClick={() => setActiveTab('threats')}
                className={`px-3 py-1 rounded-full transition-all font-medium ${
                  activeTab === 'threats'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Threats
              </button>
            </div>
          </div>

          {/* Right Pill Capsule: Slice Chips / Avatars + Quick Metrics */}
          <div className="bg-white rounded-full px-3.5 py-1.5 border border-slate-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex items-center space-x-2.5 text-xs">
            {/* Slice Avatars (matching reference employee avatar stack) */}
            <div className="hidden lg:flex items-center -space-x-1.5">
              <span
                onClick={() => setActiveTab('slices')}
                title="eMBB Ultra-HD Video Slice"
                className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white cursor-pointer hover:scale-110 transition-transform shadow-sm"
              >
                MBB
              </span>
              <span
                onClick={() => setActiveTab('slices')}
                title="URLLC Low-Latency Autonomous Slice"
                className="w-7 h-7 rounded-full bg-cyan-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white cursor-pointer hover:scale-110 transition-transform shadow-sm"
              >
                URL
              </span>
              <span
                onClick={() => setActiveTab('slices')}
                title="mMTC Smart IoT Sensor Slice"
                className="w-7 h-7 rounded-full bg-purple-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white cursor-pointer hover:scale-110 transition-transform shadow-sm"
              >
                MTC
              </span>
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                3S
              </span>
            </div>

            {/* Quick Threat Pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 font-mono text-[11px]">
              <span className="text-slate-500">Threats:</span>
              <span className={`font-bold ${activeAttacks.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {activeAttacks.length}
              </span>
            </div>

            {/* Latency Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 font-mono text-[11px]">
              <span className="text-slate-500">Latency:</span>
              <span className="font-bold text-blue-600">{latencyMs}ms</span>
            </div>

            {/* Live Stream Pulse Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Live Stream</span>
            </div>
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

          <footer className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-500">
            <p>5G/6G Security Operations Center (SOC) Framework &copy; {new Date().getFullYear()}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              FastAPI Telemetry &bull; Next.js 14 Sidebar UI &bull; Coordinated MARL + FedAvg
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
