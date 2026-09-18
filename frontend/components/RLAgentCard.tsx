'use client';

import React, { useState, useEffect } from 'react';
import { RLMetrics, RLSelectActionResponse } from '@/types';
import { fetchRLMetrics, selectRLAction, trainRLAgent } from '@/lib/api';
import { Cpu, RefreshCw, ShieldCheck, Award } from 'lucide-react';

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
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-secondary-900">Adaptive Security RL Agent</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                Gymnasium + PyTorch DQN
              </span>
            </div>
            <p className="text-xs text-secondary-500">Learns optimal security actions balancing threat mitigation vs. latency & CPU resource penalties</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Training DQN...' : 'Train PyTorch DQN'}</span>
          </button>
        </div>
      </div>

      {/* RL Training Metrics Panel */}
      {metrics && (
        <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-bold text-secondary-700 uppercase tracking-wider">
                DQN Training Performance Log ({metrics.num_episodes} Episodes)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-secondary-500">
              Epsilon Policy: <strong className="text-primary-700">{metrics.final_epsilon}</strong> (Exploration min)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Cumulative Reward</span>
              <span className="text-base font-extrabold font-mono text-primary-700">
                {metrics.mean_cumulative_reward}
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Mitigation Rate</span>
              <span className="text-base font-extrabold text-primary-600 font-mono">
                {metrics.mean_attack_mitigation_rate_pct}%
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Avg Latency</span>
              <span className="text-base font-extrabold text-secondary-900 font-mono">
                {metrics.mean_average_latency_ms} ms
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Avg CPU Load</span>
              <span className="text-base font-extrabold text-tertiary-700 font-mono">
                {metrics.mean_resource_usage_pct}%
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Pass-Through Atks</span>
              <span className="text-base font-extrabold text-secondary-800 font-mono">
                {metrics.total_successful_attacks}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Query Optimal Policy Action Section */}
      <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-bold text-secondary-900">Adaptive Security Policy Inference</h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-white border border-secondary-300 rounded-lg px-3 py-1.5 text-secondary-800 font-semibold focus:outline-none focus:border-primary-500"
            >
              <option value="slice-embb-01">eMBB Video Slicing</option>
              <option value="slice-urllc-01">URLLC Transport Slice</option>
              <option value="slice-mmtc-01">mMTC IoT Mesh</option>
            </select>

            <button
              onClick={handleQueryAction}
              disabled={isQuerying}
              className="px-3.5 py-1.5 bg-secondary-100 hover:bg-secondary-200 text-secondary-800 border border-secondary-300 font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isQuerying ? 'Querying...' : 'Query Action'}
            </button>
          </div>
        </div>

        {actionRes && (
          <div className="p-4 bg-white border border-secondary-200 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 text-xs shadow-sm font-mono">
            <div>
              <span className="text-secondary-500 block mb-1">Recommended Action</span>
              <span className="text-sm font-bold text-primary-700 capitalize">
                {actionRes.selected_action_name.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-secondary-400 block">ID: {actionRes.selected_action_id}</span>
            </div>

            <div>
              <span className="text-secondary-500 block mb-1">Expected Mitigation</span>
              <span className="text-sm font-bold text-primary-600">
                {(actionRes.expected_mitigation * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-secondary-400 block">Threat reduction factor</span>
            </div>

            <div>
              <span className="text-secondary-500 block mb-1">Latency Overhead</span>
              <span className="text-sm font-bold text-secondary-900">
                +{actionRes.latency_penalty_ms} ms
              </span>
              <span className="text-[10px] text-secondary-400 block">QoS latency impact</span>
            </div>

            <div>
              <span className="text-secondary-500 block mb-1">CPU Overhead</span>
              <span className="text-sm font-bold text-tertiary-700">
                +{actionRes.cpu_penalty_pct}%
              </span>
              <span className="text-[10px] text-secondary-400 block">Resource consumption</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
