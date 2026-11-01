'use client';

import React, { useState, useEffect } from 'react';
import { RLMetrics, RLSelectActionResponse } from '@/types';
import { fetchRLMetrics, selectRLAction, trainRLAgent } from '@/lib/api';
import { Cpu, RefreshCw, ShieldCheck, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const RLAgentCard: React.FC = () => {
  const [metrics, setMetrics] = useState<RLMetrics | null>(null);
  const [selectedSlice, setSelectedSlice] = useState<string>('slice-urllc-01');
  const [actionRes, setActionRes] = useState<RLSelectActionResponse | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  const loadMetrics = async () => {
    const res = await fetchRLMetrics();
    if (res.data) setMetrics(res.data);
  };

  const handleQueryAction = async () => {
    setIsQuerying(true);
    const res = await selectRLAction(selectedSlice);
    if (res.data) setActionRes(res.data);
    setIsQuerying(false);
  };

  useEffect(() => {
    loadMetrics();
    handleQueryAction();
  }, [selectedSlice]);

  const handleTrain = async () => {
    setIsTraining(true);
    const res = await trainRLAgent(100);
    if (res.data) {
      setMetrics(res.data);
      await handleQueryAction();
    }
    setIsTraining(false);
  };

  return (
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
                Adaptive Security RL Agent
              </h2>
              <StatusBadge variant="brand">
                Gymnasium + PyTorch DQN
              </StatusBadge>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Learns optimal security actions balancing threat mitigation vs. latency & CPU resource penalties
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleTrain}
            disabled={isTraining}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />}
          >
            {isTraining ? 'Training DQN...' : 'Train PyTorch DQN'}
          </Button>
        </div>
      </div>

      {/* RL Training Metrics Panel */}
      {metrics && (
        <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#179F99]" />
              <h3 className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider">
                DQN Training Performance Log ({metrics.num_episodes} Episodes)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
              Epsilon Policy: <strong className="text-[#1A3C6F] dark:text-[#179F99]">{metrics.final_epsilon}</strong> (Exploration min)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Cumulative Reward</span>
              <span className="text-base font-extrabold font-mono text-[#1A3C6F] dark:text-[#179F99]">
                {metrics.mean_cumulative_reward}
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Mitigation Rate</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {metrics.mean_attack_mitigation_rate_pct}%
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Avg Latency</span>
              <span className="text-base font-extrabold text-[#111111] dark:text-[#F3F4F6] font-mono">
                {metrics.mean_average_latency_ms} ms
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Avg CPU Load</span>
              <span className="text-base font-extrabold text-[#179F99] font-mono">
                {metrics.mean_resource_usage_pct}%
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Pass-Through Atks</span>
              <span className="text-base font-extrabold text-[#111111] dark:text-[#F3F4F6] font-mono">
                {metrics.total_successful_attacks}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Query Optimal Policy Action Section */}
      <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#179F99]" />
            <h3 className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
              Adaptive Security Policy Inference
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-1.5 text-[#111111] dark:text-[#F3F4F6] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
            >
              <option value="slice-embb-01">eMBB Video Slicing</option>
              <option value="slice-urllc-01">URLLC Transport Slice</option>
              <option value="slice-mmtc-01">mMTC IoT Mesh</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleQueryAction}
              disabled={isQuerying}
            >
              {isQuerying ? 'Querying...' : 'Query Action'}
            </Button>
          </div>
        </div>

        {actionRes && (
          <div className="p-4 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 text-xs shadow-xs font-mono">
            <div>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-sans">Recommended Action</span>
              <span className="text-sm font-bold text-[#1A3C6F] dark:text-[#179F99] capitalize">
                {actionRes.selected_action_name.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block">
                ID: {actionRes.selected_action_id}
              </span>
            </div>

            <div>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-sans">Expected Mitigation</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {(actionRes.expected_mitigation * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block font-sans">
                Threat reduction factor
              </span>
            </div>

            <div>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-sans">Latency Overhead</span>
              <span className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
                +{actionRes.latency_penalty_ms} ms
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block font-sans">
                QoS latency impact
              </span>
            </div>

            <div>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-sans">CPU Overhead</span>
              <span className="text-sm font-bold text-[#179F99]">
                +{actionRes.cpu_penalty_pct}%
              </span>
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] block font-sans">
                Resource consumption
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
