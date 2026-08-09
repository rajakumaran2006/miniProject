'use client';

import React, { useState, useEffect } from 'react';
import { RLMetrics, RLSelectActionResponse } from '@/types';
import { fetchRLMetrics, selectRLAction, trainRLAgent } from '@/lib/api';
import { Cpu, RefreshCw, Zap, Shield, ShieldCheck, Activity, Award, CheckCircle, Flame } from 'lucide-react';

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
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-purple/10 rounded-xl text-network-purple border border-network-purple/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Adaptive Security RL Agent</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-network-purple/20 text-network-purple border border-network-purple/30">
                Gymnasium + PyTorch DQN
              </span>
            </div>
            <p className="text-xs text-gray-400">Learns optimal security actions balancing threat mitigation vs. latency & CPU resource penalties</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-network-purple to-network-blue hover:from-network-purple/90 hover:to-network-blue/90 text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Training DQN Policy...' : 'Train PyTorch DQN'}</span>
          </button>
        </div>
      </div>

      {/* RL Training Metrics Panel */}
      {metrics && (
        <div className="p-5 bg-network-dark/60 border border-network-border rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-network-border pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-network-cyan" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                DQN Training Performance Log ({metrics.num_episodes} Episodes)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              Epsilon Policy: <strong className="text-network-cyan">{metrics.final_epsilon}</strong> (Exploration min)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Cumulative Reward</span>
              <span
                className={`text-base font-extrabold font-mono ${
                  metrics.mean_cumulative_reward >= 0 ? 'text-network-emerald' : 'text-amber-400'
                }`}
              >
                {metrics.mean_cumulative_reward}
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Mitigation Rate</span>
              <span className="text-base font-extrabold text-network-cyan font-mono">
                {metrics.mean_attack_mitigation_rate_pct}%
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Avg Latency</span>
              <span className="text-base font-extrabold text-network-blue font-mono">
                {metrics.mean_average_latency_ms} ms
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Avg CPU Load</span>
              <span className="text-base font-extrabold text-network-purple font-mono">
                {metrics.mean_resource_usage_pct}%
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Pass-Through Atks</span>
              <span className="text-base font-extrabold text-network-rose font-mono">
                {metrics.total_successful_attacks}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Query Optimal Policy Action Section */}
      <div className="p-5 bg-network-dark/80 border border-network-border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-network-emerald" />
            <h3 className="text-sm font-bold text-white">Adaptive Security Policy Inference</h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-network-card border border-network-border rounded-lg px-3 py-1.5 text-gray-200 font-semibold focus:outline-none focus:border-network-cyan"
            >
              <option value="slice-embb-01">eMBB Video Slicing</option>
              <option value="slice-urllc-01">URLLC Transport Slice</option>
              <option value="slice-mmtc-01">mMTC IoT Mesh</option>
            </select>

            <button
              onClick={handleQueryAction}
              disabled={isQuerying}
              className="px-3 py-1.5 bg-network-emerald/20 text-network-emerald border border-network-emerald/40 hover:bg-network-emerald/30 font-bold rounded-lg transition-all disabled:opacity-50"
            >
              Query Policy Action
            </button>
          </div>
        </div>

        {actionRes && (
          <div className="p-4 bg-network-card border border-network-border rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block mb-1">Recommended Action</span>
              <span className="text-sm font-bold font-mono text-network-cyan capitalize">
                {actionRes.selected_action_name.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-gray-500 block">Action ID: {actionRes.selected_action_id}</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Expected Mitigation</span>
              <span className="text-sm font-bold font-mono text-network-emerald">
                {(actionRes.expected_mitigation * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-gray-500 block">Threat reduction factor</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Latency Overhead</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                +{actionRes.latency_penalty_ms} ms
              </span>
              <span className="text-[10px] text-gray-500 block">QoS latency penalty</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">CPU Overhead</span>
              <span className="text-sm font-bold font-mono text-network-purple">
                +{actionRes.cpu_penalty_pct}%
              </span>
              <span className="text-[10px] text-gray-500 block">Resource consumption penalty</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
