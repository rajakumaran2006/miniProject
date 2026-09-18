'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { stepOrchestratorPipeline, fetchOrchestratorState } from '@/lib/api';
import { Activity, ShieldCheck, Layers, Cpu, Radio, CheckCircle, AlertTriangle, Play } from 'lucide-react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/api/v1/ws/telemetry';

export const IntegratedPipelineCard: React.FC = () => {
  const { data: wsFrame, isConnected: isWsConnected } = useWebSocket(WS_URL);
  const [isStepping, setIsStepping] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<any>(null);

  const loadState = async () => {
    const res = await fetchOrchestratorState();
    if (res) {
      setPipelineState(res);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

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
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-200">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">
                Master Integrated Security Framework Engine
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                End-to-End Closed-Loop
              </span>
            </div>
            <p className="text-xs text-secondary-500">
              Unifies 5G/6G Simulator &bull; Traffic &bull; Anomaly Detection &bull; Federated FL &bull; MARL Agents &bull; SecurityController
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* WebSocket Live Connection Badge */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold ${
              isWsConnected
                ? 'bg-tertiary-50 border-tertiary-200 text-tertiary-800'
                : 'bg-secondary-100 border-secondary-200 text-secondary-600'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isWsConnected ? 'animate-pulse text-tertiary-600' : ''}`} />
            <span>{isWsConnected ? 'WS Stream Live' : 'Polling Sync'}</span>
          </div>

          {/* Clean Step Pipeline Action Button (Removed duplicate auto-defense button) */}
          <button
            onClick={handleStepPipeline}
            disabled={isStepping}
            className="flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isStepping ? 'Stepping...' : 'Step Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* 7-Stage Closed-Loop Integrated Pipeline Visual Diagram */}
      <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
          <span className="text-xs font-bold text-secondary-700 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-primary-600" />
            <span>7-Stage Closed-Loop Security Pipeline Architecture</span>
          </span>

          <span className="text-xs font-mono text-secondary-500">
            Step Counter: <strong className="text-primary-600 font-bold">{activeFrame?.step_count || 0}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-center text-xs">
          {/* Stage 1: 5G/6G Simulator */}
          <div className="p-3 bg-white border border-secondary-200 rounded-lg flex flex-col items-center justify-center space-y-1 shadow-sm">
            <Radio className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-secondary-900 text-[11px]">1. 5G/6G Sim</span>
            <span className="text-[9px] text-secondary-500">eMBB/URLLC/mMTC</span>
          </div>

          {/* Stage 2: Traffic Gen */}
          <div className="p-3 bg-white border border-secondary-200 rounded-lg flex flex-col items-center justify-center space-y-1 shadow-sm">
            <Activity className="w-4 h-4 text-tertiary-600" />
            <span className="font-bold text-secondary-900 text-[11px]">2. Traffic Gen</span>
            <span className="text-[9px] text-secondary-500">Normal & Threats</span>
          </div>

          {/* Stage 3: Anomaly Detector */}
          <div className="p-3 bg-white border border-secondary-200 rounded-lg flex flex-col items-center justify-center space-y-1 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-secondary-700" />
            <span className="font-bold text-secondary-900 text-[11px]">3. Anomaly Det</span>
            <span className="text-[9px] text-secondary-500">Isolation Forest</span>
          </div>

          {/* Stage 4: Federated FL */}
          <div className="p-3 bg-white border border-secondary-200 rounded-lg flex flex-col items-center justify-center space-y-1 shadow-sm">
            <Layers className="w-4 h-4 text-tertiary-600" />
            <span className="font-bold text-secondary-900 text-[11px]">4. FedAvg FL</span>
            <span className="text-[9px] text-secondary-500">3 Edge Nodes</span>
          </div>

          {/* Stage 5: MARL Policy */}
          <div className="p-3 bg-white border border-secondary-200 rounded-lg flex flex-col items-center justify-center space-y-1 shadow-sm">
            <Cpu className="w-4 h-4 text-primary-600" />
            <span className="font-bold text-secondary-900 text-[11px]">5. MARL Policy</span>
            <span className="text-[9px] text-secondary-500">4-Layer Joint Q</span>
          </div>

          {/* Stage 6: Security Controller */}
          <div className="p-3 bg-white border border-secondary-200 rounded-lg flex flex-col items-center justify-center space-y-1 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary-700" />
            <span className="font-bold text-secondary-900 text-[11px]">6. Sec Control</span>
            <span className="text-[9px] text-secondary-500">Auth/Enc/IDS/Iso</span>
          </div>

          {/* Stage 7: Enforcement */}
          <div className="p-3 bg-white border border-secondary-200 rounded-lg flex flex-col items-center justify-center space-y-1 shadow-sm">
            <CheckCircle className="w-4 h-4 text-tertiary-700" />
            <span className="font-bold text-secondary-900 text-[11px]">7. Enforcement</span>
            <span className="text-[9px] text-secondary-500">Updated State</span>
          </div>
        </div>
      </div>

      {/* Live Pipeline Telemetry & MARL Decision Summary */}
      {activeFrame && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Active Threats & Anomaly Evaluation */}
          <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl space-y-2">
            <span className="font-bold text-secondary-800 block border-b border-secondary-200 pb-2">
              Stage 3 & 4: Live Anomaly & Threat Assessment
            </span>
            <div className="flex justify-between items-center py-1">
              <span className="text-secondary-500">Active Threat Vectors:</span>
              <span className="font-bold text-secondary-900">
                {activeAttacksCount > 0 ? `${activeAttacksCount} Active Attack(s)` : 'No Active Threats'}
              </span>
            </div>

            {Object.entries(activeFrame.slice_evaluations || {}).map(([sliceId, evalData]: [string, any]) => (
              <div key={sliceId} className="flex justify-between items-center py-0.5 text-[11px]">
                <span className="text-secondary-500">{sliceId}:</span>
                <span className="text-primary-700 font-semibold">
                  Risk: {evalData.isolation_forest_risk} | Fed: {evalData.federated_risk}
                </span>
              </div>
            ))}
          </div>

          {/* MARL Decisions & Applied Security Control */}
          <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl space-y-2">
            <span className="font-bold text-secondary-800 block border-b border-secondary-200 pb-2">
              Stage 5 & 6: MARL Inference & Security Enforcement
            </span>
            <div className="text-[11px] text-secondary-700 space-y-1">
              <div>
                <span className="text-secondary-500">PHY Agent:</span>{' '}
                <span className="text-primary-600 font-bold">{marlDecisions.physical || 'no_action'}</span>
              </div>
              <div>
                <span className="text-secondary-500">MAC Agent:</span>{' '}
                <span className="text-primary-600 font-bold">{marlDecisions.mac || 'no_action'}</span>
              </div>
              <div>
                <span className="text-secondary-500">NET Agent:</span>{' '}
                <span className="text-tertiary-700 font-bold">{marlDecisions.network || 'no_action'}</span>
              </div>
              <div>
                <span className="text-secondary-500">APP Agent:</span>{' '}
                <span className="text-tertiary-700 font-bold">{marlDecisions.application || 'no_action'}</span>
              </div>

              {appliedControl?.action_taken && (
                <div className="mt-2 pt-2 border-t border-secondary-200 text-primary-700">
                  <span>
                    Enforced Control: <strong>{appliedControl.action_taken}</strong> (+
                    {appliedControl.latency_impact_ms}ms lat)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
