'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { stepOrchestratorPipeline, fetchOrchestratorState } from '@/lib/api';
import { Activity, ShieldCheck, Layers, Cpu, Radio, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
                Master Integrated Security Framework Engine
              </h2>
              <StatusBadge variant="brand">
                Closed-Loop
              </StatusBadge>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Unifies 5G/6G Simulator &bull; Traffic &bull; Anomaly Detection &bull; Federated FL &bull; MARL Agents &bull; SecurityController
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* WebSocket Live Connection Badge */}
          <StatusBadge variant={isWsConnected ? 'active' : 'neutral'} dot>
            {isWsConnected ? 'WS Stream Live' : 'Polling Sync'}
          </StatusBadge>

          {/* Clean Step Pipeline Action Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleStepPipeline}
            disabled={isStepping}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            {isStepping ? 'Stepping...' : 'Step Pipeline'}
          </Button>
        </div>
      </div>

      {/* 7-Stage Closed-Loop Integrated Pipeline Visual Diagram */}
      <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-3 flex-wrap gap-2">
          <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#179F99]" />
            <span>7-Stage Closed-Loop Security Pipeline Architecture</span>
          </span>

          <span className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
            Step Counter: <strong className="text-[#1A3C6F] dark:text-[#179F99] font-bold">{activeFrame?.step_count || 0}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-center text-xs">
          {/* Stage 1: 5G/6G Simulator */}
          <div className="p-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col items-center justify-center space-y-1 shadow-xs">
            <Radio className="w-4 h-4 text-[#1A3C6F] dark:text-[#179F99]" />
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] text-[11px]">1. 5G/6G Sim</span>
            <span className="text-[9px] text-[#6B7280] dark:text-[#9CA3AF]">eMBB/URLLC/mMTC</span>
          </div>

          {/* Stage 2: Traffic Gen */}
          <div className="p-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col items-center justify-center space-y-1 shadow-xs">
            <Activity className="w-4 h-4 text-[#179F99]" />
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] text-[11px]">2. Traffic Gen</span>
            <span className="text-[9px] text-[#6B7280] dark:text-[#9CA3AF]">Normal & Threats</span>
          </div>

          {/* Stage 3: Anomaly Detector */}
          <div className="p-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col items-center justify-center space-y-1 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-[#1A3C6F] dark:text-[#179F99]" />
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] text-[11px]">3. Anomaly Det</span>
            <span className="text-[9px] text-[#6B7280] dark:text-[#9CA3AF]">Isolation Forest</span>
          </div>

          {/* Stage 4: Federated FL */}
          <div className="p-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col items-center justify-center space-y-1 shadow-xs">
            <Layers className="w-4 h-4 text-[#179F99]" />
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] text-[11px]">4. FedAvg FL</span>
            <span className="text-[9px] text-[#6B7280] dark:text-[#9CA3AF]">3 Edge Nodes</span>
          </div>

          {/* Stage 5: MARL Policy */}
          <div className="p-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col items-center justify-center space-y-1 shadow-xs">
            <Cpu className="w-4 h-4 text-[#1A3C6F] dark:text-[#179F99]" />
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] text-[11px]">5. MARL Policy</span>
            <span className="text-[9px] text-[#6B7280] dark:text-[#9CA3AF]">4-Layer Joint Q</span>
          </div>

          {/* Stage 6: Security Controller */}
          <div className="p-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col items-center justify-center space-y-1 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#179F99]" />
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] text-[11px]">6. Sec Control</span>
            <span className="text-[9px] text-[#6B7280] dark:text-[#9CA3AF]">Auth/Enc/IDS/Iso</span>
          </div>

          {/* Stage 7: Enforcement */}
          <div className="p-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col items-center justify-center space-y-1 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] text-[11px]">7. Enforcement</span>
            <span className="text-[9px] text-[#6B7280] dark:text-[#9CA3AF]">Updated State</span>
          </div>
        </div>
      </div>

      {/* Live Pipeline Telemetry & MARL Decision Summary */}
      {activeFrame && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Active Threats & Anomaly Evaluation */}
          <div className="p-4 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-2">
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] block border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2 font-sans">
              Stage 3 & 4: Live Anomaly & Threat Assessment
            </span>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#6B7280] dark:text-[#9CA3AF] font-sans">Active Threat Vectors:</span>
              <span className="font-bold text-[#111111] dark:text-[#F3F4F6]">
                {activeAttacksCount > 0 ? `${activeAttacksCount} Active Attack(s)` : 'No Active Threats'}
              </span>
            </div>

            {Object.entries(activeFrame.slice_evaluations || {}).map(([sliceId, evalData]: [string, any]) => (
              <div key={sliceId} className="flex justify-between items-center py-0.5 text-[11px]">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">{sliceId}:</span>
                <span className="text-[#1A3C6F] dark:text-[#179F99] font-bold">
                  Risk: {evalData.isolation_forest_risk} | Fed: {evalData.federated_risk}
                </span>
              </div>
            ))}
          </div>

          {/* MARL Decisions & Applied Security Control */}
          <div className="p-4 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-2">
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6] block border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2 font-sans">
              Stage 5 & 6: MARL Inference & Security Enforcement
            </span>
            <div className="text-[11px] text-[#111111] dark:text-[#F3F4F6] space-y-1">
              <div>
                <span className="text-[#6B7280] dark:text-[#9CA3AF] font-sans">PHY Agent:</span>{' '}
                <span className="text-[#1A3C6F] dark:text-[#179F99] font-bold">{marlDecisions.physical || 'no_action'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#9CA3AF] font-sans">MAC Agent:</span>{' '}
                <span className="text-[#1A3C6F] dark:text-[#179F99] font-bold">{marlDecisions.mac || 'no_action'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#9CA3AF] font-sans">NET Agent:</span>{' '}
                <span className="text-[#179F99] font-bold">{marlDecisions.network || 'no_action'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#9CA3AF] font-sans">APP Agent:</span>{' '}
                <span className="text-[#179F99] font-bold">{marlDecisions.application || 'no_action'}</span>
              </div>

              {appliedControl?.action_taken && (
                <div className="mt-2 pt-2 border-t border-[#EFEFEF] dark:border-[#2E3344] text-[#1A3C6F] dark:text-[#179F99]">
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
