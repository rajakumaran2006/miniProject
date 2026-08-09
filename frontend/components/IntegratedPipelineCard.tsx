'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { stepOrchestratorPipeline, toggleAutoDefense, fetchOrchestratorState } from '@/lib/api';
import { Activity, ShieldCheck, Zap, RefreshCw, Layers, Cpu, Radio, CheckCircle, AlertTriangle, ArrowRight, Play } from 'lucide-react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/api/v1/ws/telemetry';

export const IntegratedPipelineCard: React.FC = () => {
  const { data: wsFrame, isConnected: isWsConnected } = useWebSocket(WS_URL);
  const [autoDefense, setAutoDefense] = useState<boolean>(true);
  const [isStepping, setIsStepping] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<any>(null);

  const loadState = async () => {
    const res = await fetchOrchestratorState();
    if (res) {
      setPipelineState(res);
      setAutoDefense(res.auto_defense_enabled);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const handleToggleAutoDefense = async () => {
    const nextState = !autoDefense;
    const ok = await toggleAutoDefense(nextState);
    if (ok) setAutoDefense(nextState);
  };

  const handleStepPipeline = async () => {
    setIsStepping(true);
    const frame = await stepOrchestratorPipeline();
    if (frame) setPipelineState((prev: any) => ({ ...prev, latest_pipeline_frame: frame }));
    setIsStepping(false);
  };

  const activeFrame = wsFrame || pipelineState?.latest_pipeline_frame;
  const activeAttacksCount = activeFrame?.active_attacks?.length || 0;
  const marlDecisions = activeFrame?.marl_decisions || {};
  const appliedControl = activeFrame?.applied_controls || {};

  return (
    <div className="bg-network-card border border-network-cyan/40 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-network-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-cyan/20 rounded-xl text-network-cyan border border-network-cyan/40 animate-pulse">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Master Integrated Security Framework Engine
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-network-emerald/20 text-network-emerald border border-network-emerald/30">
                End-to-End Closed-Loop Active
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Unifies 5G/6G Simulator &bull; Traffic &bull; Anomaly Detection &bull; Federated FL &bull; MARL Agents &bull; SecurityController
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* WebSocket Live Connection Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold ${
            isWsConnected
              ? 'bg-network-emerald/10 border-network-emerald/40 text-network-emerald'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'animate-ping' : ''}`} />
            <span>{isWsConnected ? 'WebSocket Stream 1.5s' : 'Polling Sync Mode'}</span>
          </div>

          {/* Closed-Loop Auto-Defense Toggle */}
          <button
            onClick={handleToggleAutoDefense}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
              autoDefense
                ? 'bg-network-cyan/20 border-network-cyan text-network-cyan shadow-lg shadow-network-cyan/10'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>RL Auto-Defense: {autoDefense ? 'ENABLED' : 'DISABLED'}</span>
          </button>

          {/* Step Pipeline Button */}
          <button
            onClick={handleStepPipeline}
            disabled={isStepping}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-network-cyan hover:bg-network-cyan/90 text-network-dark font-extrabold rounded-xl shadow-lg transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Step Pipeline</span>
          </button>
        </div>
      </div>

      {/* 7-Stage Closed-Loop Integrated Pipeline Visual Diagram */}
      <div className="p-5 bg-network-dark/80 border border-network-border rounded-xl space-y-4 relative z-10">
        <div className="flex items-center justify-between border-b border-network-border pb-3">
          <span className="text-xs font-extrabold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-network-cyan" />
            <span>7-Stage Closed-Loop Security Pipeline Architecture</span>
          </span>

          <span className="text-xs font-mono text-gray-400">
            Step Counter: <strong className="text-network-cyan">{activeFrame?.step_count || 0}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-center text-xs">
          {/* Stage 1: 5G/6G Simulator */}
          <div className="p-3 bg-network-card border border-network-border rounded-lg flex flex-col items-center justify-center space-y-1">
            <Radio className="w-4 h-4 text-network-cyan" />
            <span className="font-bold text-white text-[11px]">1. 5G/6G Simulator</span>
            <span className="text-[9px] text-gray-400">eMBB / URLLC / mMTC</span>
          </div>

          {/* Stage 2: Traffic Gen */}
          <div className="p-3 bg-network-card border border-network-border rounded-lg flex flex-col items-center justify-center space-y-1">
            <Activity className="w-4 h-4 text-network-blue" />
            <span className="font-bold text-white text-[11px]">2. Traffic Gen</span>
            <span className="text-[9px] text-gray-400">Normal & Threats</span>
          </div>

          {/* Stage 3: Anomaly Detector */}
          <div className="p-3 bg-network-card border border-network-border rounded-lg flex flex-col items-center justify-center space-y-1">
            <AlertTriangle className={`w-4 h-4 ${activeAttacksCount > 0 ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
            <span className="font-bold text-white text-[11px]">3. Anomaly Detector</span>
            <span className="text-[9px] text-gray-400">Isolation Forest ML</span>
          </div>

          {/* Stage 4: Federated FL */}
          <div className="p-3 bg-network-card border border-network-border rounded-lg flex flex-col items-center justify-center space-y-1">
            <Layers className="w-4 h-4 text-network-emerald" />
            <span className="font-bold text-white text-[11px]">4. Federated FL</span>
            <span className="text-[9px] text-gray-400">FedAvg 3 Edges</span>
          </div>

          {/* Stage 5: MARL Policy */}
          <div className="p-3 bg-network-card border border-network-border rounded-lg flex flex-col items-center justify-center space-y-1">
            <Cpu className="w-4 h-4 text-network-purple" />
            <span className="font-bold text-white text-[11px]">5. MARL Policy</span>
            <span className="text-[9px] text-gray-400">4-Layer Joint Q</span>
          </div>

          {/* Stage 6: Security Controller */}
          <div className="p-3 bg-network-card border border-network-border rounded-lg flex flex-col items-center justify-center space-y-1">
            <ShieldCheck className="w-4 h-4 text-network-cyan" />
            <span className="font-bold text-white text-[11px]">6. Security Controller</span>
            <span className="text-[9px] text-gray-400">Auth / Enc / IDS / Iso</span>
          </div>

          {/* Stage 7: Enforcement */}
          <div className="p-3 bg-network-card border border-network-border rounded-lg flex flex-col items-center justify-center space-y-1">
            <CheckCircle className="w-4 h-4 text-network-emerald" />
            <span className="font-bold text-white text-[11px]">7. State Recovery</span>
            <span className="text-[9px] text-gray-400">Updated State</span>
          </div>
        </div>
      </div>

      {/* Live Pipeline Telemetry & MARL Decision Summary */}
      {activeFrame && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono relative z-10">
          {/* Active Threats & Anomaly Evaluation */}
          <div className="p-4 bg-network-dark/60 border border-network-border rounded-xl space-y-2">
            <span className="font-bold text-gray-300 block border-b border-network-border pb-2">
              Stage 3 & 4: Live Anomaly & Threat Assessment
            </span>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400">Active Threat Vectors:</span>
              <span className={`font-bold ${activeAttacksCount > 0 ? 'text-rose-500' : 'text-network-emerald'}`}>
                {activeAttacksCount > 0 ? `${activeAttacksCount} Active Attack(s)` : 'No Active Threats'}
              </span>
            </div>

            {Object.entries(activeFrame.slice_evaluations || {}).map(([sliceId, evalData]: [string, any]) => (
              <div key={sliceId} className="flex justify-between items-center py-0.5 text-[11px]">
                <span className="text-gray-400">{sliceId}:</span>
                <span className="text-network-cyan">
                  Risk: {evalData.isolation_forest_risk} | Fed: {evalData.federated_risk}
                </span>
              </div>
            ))}
          </div>

          {/* MARL Decisions & Applied Security Control */}
          <div className="p-4 bg-network-dark/60 border border-network-border rounded-xl space-y-2">
            <span className="font-bold text-gray-300 block border-b border-network-border pb-2">
              Stage 5 & 6: MARL Inference & Security Enforcement
            </span>
            <div className="text-[11px] text-gray-300 space-y-1">
              <div><span className="text-gray-500">PHY Agent:</span> <span className="text-network-cyan font-bold">{marlDecisions.physical || 'no_action'}</span></div>
              <div><span className="text-gray-500">MAC Agent:</span> <span className="text-network-blue font-bold">{marlDecisions.mac || 'no_action'}</span></div>
              <div><span className="text-gray-500">NET Agent:</span> <span className="text-network-emerald font-bold">{marlDecisions.network || 'no_action'}</span></div>
              <div><span className="text-gray-500">APP Agent:</span> <span className="text-network-purple font-bold">{marlDecisions.application || 'no_action'}</span></div>

              {appliedControl?.action_taken && (
                <div className="mt-2 pt-2 border-t border-network-border text-network-cyan">
                  <span>Enforced Control: <strong>{appliedControl.action_taken}</strong> (+{appliedControl.latency_impact_ms}ms lat)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
