'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SOCNavbar, SOCTab } from '@/components/SOCNavbar';
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

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/api/v1/ws/telemetry';

export default function SOCDashboardPage() {
  const [activeTab, setActiveTab] = useState<SOCTab>('overview');

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
    const interval = setInterval(loadData, 3000); // Poll every 3 seconds for fallback telemetry
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
  }, [wsFrame]);

  const handleToggleAutoDefense = async () => {
    const nextState = !autoDefenseEnabled;
    const ok = await toggleAutoDefense(nextState);
    if (ok) setAutoDefenseEnabled(nextState);
  };

  const isBackendConnected = !!health && !healthError;

  return (
    <div className="min-h-screen bg-network-dark flex flex-col font-sans">
      {/* 5G/6G SOC Navigation Bar */}
      <SOCNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWsConnected={isWsConnected}
        isBackendConnected={isBackendConnected}
        autoDefenseEnabled={autoDefenseEnabled}
        onToggleAutoDefense={handleToggleAutoDefense}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: OVERVIEW (SOC EXECUTIVE SUMMARY) */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
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
          <div className="space-y-8 animate-fadeIn">
            <SliceOverview slices={slices} error={slicesError} />
            <SimulationControls simState={simState} onStateUpdate={loadData} />
          </div>
        )}

        {/* TAB 3: THREAT MONITORING */}
        {activeTab === 'threats' && (
          <div className="space-y-8 animate-fadeIn">
            <AttackFeed onRefreshTrigger={loadData} />
            <AttackControls onAttackTriggered={loadData} />
          </div>
        )}

        {/* TAB 4: MARL SECURITY AGENTS */}
        {activeTab === 'marl' && (
          <div className="space-y-8 animate-fadeIn">
            <MARLCard />
            <RLAgentCard />
          </div>
        )}

        {/* TAB 5: FEDERATED LEARNING */}
        {activeTab === 'federated' && (
          <div className="space-y-8 animate-fadeIn">
            <FederatedLearningCard />
            <AnomalyDetectorCard />
          </div>
        )}

        {/* TAB 6: SECURITY CONTROLS */}
        {activeTab === 'controls' && (
          <div className="space-y-8 animate-fadeIn">
            <SecurityControllerCard />
          </div>
        )}

        {/* TAB 7: REAL-TIME ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fadeIn">
            <AnalyticsCharts slices={slices} activeAttacks={activeAttacks} />
          </div>
        )}

        {/* TAB 8: EXPERIMENTS & RESEARCH BENCHMARK */}
        {activeTab === 'experiments' && (
          <div className="space-y-8 animate-fadeIn">
            <ExperimentsView />
          </div>
        )}

        {/* TAB 8: ATTACK SIMULATOR & NETWORK CONTROLS */}
        {activeTab === 'simulator' && (
          <div className="space-y-8 animate-fadeIn">
            <AttackControls onAttackTriggered={loadData} />
            <SimulationControls simState={simState} onStateUpdate={loadData} />
          </div>
        )}
      </main>

      <footer className="border-t border-network-border bg-network-card/40 py-6 text-center text-xs text-gray-500">
        <p>5G/6G Security Operations Center (SOC) Framework &copy; {new Date().getFullYear()}</p>
        <p className="mt-1 text-[11px]">FastAPI Backend &bull; Next.js 14 Dashboard &bull; Recharts Analytics &bull; Master Orchestrator</p>
      </footer>
    </div>
  );
}
