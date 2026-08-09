'use client';

import React, { useState, useEffect } from 'react';
import { ComparativeResults } from '@/types';
import { evaluateMARL, fetchMARLMetrics, trainMARLAgents } from '@/lib/api';
import { Layers, RefreshCw, BarChart2, ShieldCheck, Zap, Radio, Cpu, Network, Lock, Award } from 'lucide-react';

export const MARLCard: React.FC = () => {
  const [results, setResults] = useState<ComparativeResults | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const loadResults = async () => {
    const res = await fetchMARLMetrics();
    if (res.data) setResults(res.data);
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleTrain = async () => {
    setIsTraining(true);
    const res = await trainMARLAgents(100);
    if (res.success) {
      await handleEvaluate();
    }
    setIsTraining(false);
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    const res = await evaluateMARL(50, 42);
    if (res.data) setResults(res.data);
    setIsEvaluating(false);
  };

  const agents = [
    { name: 'Physical Layer Agent', icon: Radio, desc: 'SNR, Jamming, Beamforming & Noise Telemetry', color: 'text-network-cyan' },
    { name: 'MAC Layer Agent', icon: Cpu, desc: 'Frame Error Rate, Slot Allocation & CQI Index', color: 'text-network-emerald' },
    { name: 'Network Layer Agent', icon: Network, desc: 'SDN Flow Churn, Bandwidth & Cross-Slice Flows', color: 'text-network-blue' },
    { name: 'Application Layer Agent', icon: Lock, desc: 'Active Sessions, Auth Failures & API Client Security', color: 'text-network-purple' },
  ];

  return (
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-emerald/10 rounded-xl text-network-emerald border border-network-emerald/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Multi-Agent Cross-Layer RL Architecture</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-network-emerald/20 text-network-emerald border border-network-emerald/30">
                4-Agent Coordinated MARL
              </span>
            </div>
            <p className="text-xs text-gray-400">Physical, MAC, Network, and Application layer agents sharing cross-layer coordination signals</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-network-dark border border-network-border hover:bg-network-border text-gray-200 text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Training MARL...' : 'Train 4 Agents'}</span>
          </button>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-network-emerald to-network-cyan text-black text-xs font-bold rounded-xl shadow-lg hover:from-network-emerald/90 hover:to-network-cyan/90 transition-all disabled:opacity-50"
          >
            <BarChart2 className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>Run 3-Way Comparative Benchmark</span>
          </button>
        </div>
      </div>

      {/* 4 Cross-Layer Security Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {agents.map((ag) => {
          const Icon = ag.icon;
          return (
            <div key={ag.name} className="p-4 bg-network-dark/60 border border-network-border rounded-xl space-y-2">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${ag.color}`} />
                <h3 className="text-xs font-bold text-gray-200">{ag.name}</h3>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight">{ag.desc}</p>
              <div className="pt-2 border-t border-network-border/60 flex items-center justify-between text-[10px] text-gray-400">
                <span>Coordination Signal:</span>
                <span className="font-mono text-network-emerald font-bold">Active (4D Vector)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3-Way Comparative Benchmarking Matrix */}
      {results && (
        <div className="p-5 bg-network-dark/80 border border-network-border rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-network-border pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-network-cyan" />
              <h3 className="text-sm font-bold text-white">
                3-Way Comparative Performance Evaluation ({results.eval_episodes} Episodes, Seed={results.experiment_seed})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-network-emerald">Reproducible Seed Verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-network-border text-gray-400">
                  <th className="pb-2 font-bold uppercase">Security Strategy</th>
                  <th className="pb-2 font-bold uppercase">Detection Rate</th>
                  <th className="pb-2 font-bold uppercase">Response Time</th>
                  <th className="pb-2 font-bold uppercase">QoS Latency</th>
                  <th className="pb-2 font-bold uppercase">CPU Load</th>
                  <th className="pb-2 font-bold uppercase">Cum. Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-network-border/50 text-gray-200">
                {/* 1. Static Security Baseline */}
                {results.strategies.static_baseline && (
                  <tr>
                    <td className="py-3 font-sans font-semibold text-gray-300">Static Security Baseline</td>
                    <td className="py-3 font-bold text-amber-400">{results.strategies.static_baseline.detection_rate_pct}%</td>
                    <td className="py-3">{results.strategies.static_baseline.response_time_steps} steps</td>
                    <td className="py-3">{results.strategies.static_baseline.latency_ms} ms</td>
                    <td className="py-3">{results.strategies.static_baseline.resource_consumption_cpu_pct}%</td>
                    <td className="py-3 text-amber-400">{results.strategies.static_baseline.cumulative_reward}</td>
                  </tr>
                )}

                {/* 2. Single-Agent RL */}
                {results.strategies.single_agent_rl && (
                  <tr>
                    <td className="py-3 font-sans font-semibold text-network-blue">Single-Agent RL (DQN)</td>
                    <td className="py-3 font-bold text-network-cyan">{results.strategies.single_agent_rl.detection_rate_pct}%</td>
                    <td className="py-3">{results.strategies.single_agent_rl.response_time_steps} steps</td>
                    <td className="py-3">{results.strategies.single_agent_rl.latency_ms} ms</td>
                    <td className="py-3">{results.strategies.single_agent_rl.resource_consumption_cpu_pct}%</td>
                    <td className="py-3 text-network-cyan">{results.strategies.single_agent_rl.cumulative_reward}</td>
                  </tr>
                )}

                {/* 3. Multi-Agent Coordinated MARL */}
                {results.strategies.multi_agent_rl && (
                  <tr className="bg-network-emerald/5">
                    <td className="py-3 font-sans font-bold text-network-emerald flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-network-emerald" />
                      <span>Multi-Agent Cross-Layer RL</span>
                    </td>
                    <td className="py-3 font-extrabold text-network-emerald">{results.strategies.multi_agent_rl.detection_rate_pct}%</td>
                    <td className="py-3 font-bold text-network-emerald">{results.strategies.multi_agent_rl.response_time_steps} steps</td>
                    <td className="py-3 text-network-emerald">{results.strategies.multi_agent_rl.latency_ms} ms</td>
                    <td className="py-3 text-network-emerald">{results.strategies.multi_agent_rl.resource_consumption_cpu_pct}%</td>
                    <td className="py-3 font-extrabold text-network-emerald">{results.strategies.multi_agent_rl.cumulative_reward}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
