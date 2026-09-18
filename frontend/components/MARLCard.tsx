'use client';

import React, { useState, useEffect } from 'react';
import { ComparativeResults } from '@/types';
import { evaluateMARL, fetchMARLMetrics, trainMARLAgents } from '@/lib/api';
import { Layers, RefreshCw, BarChart2, ShieldCheck, Radio, Cpu, Network, Lock, Award } from 'lucide-react';

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
    { name: 'Physical Layer Agent', icon: Radio, desc: 'SNR, Jamming, Beamforming & Noise Telemetry', color: 'text-primary-600' },
    { name: 'MAC Layer Agent', icon: Cpu, desc: 'Frame Error Rate, Slot Allocation & CQI Index', color: 'text-tertiary-700' },
    { name: 'Network Layer Agent', icon: Network, desc: 'SDN Flow Churn, Bandwidth & Cross-Slice Flows', color: 'text-primary-700' },
    { name: 'Application Layer Agent', icon: Lock, desc: 'Active Sessions, Auth Failures & API Client Security', color: 'text-secondary-700' },
  ];

  return (
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-secondary-900">Multi-Agent Cross-Layer RL Architecture</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                4-Agent Coordinated MARL
              </span>
            </div>
            <p className="text-xs text-secondary-500">Physical, MAC, Network, and Application layer agents sharing cross-layer coordination signals</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-700 text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Training MARL...' : 'Train 4 Agents'}</span>
          </button>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <BarChart2 className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? 'Evaluating...' : 'Run Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* 4 Cross-Layer Security Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {agents.map((ag) => {
          const Icon = ag.icon;
          return (
            <div key={ag.name} className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl space-y-2">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${ag.color}`} />
                <h3 className="text-xs font-bold text-secondary-800">{ag.name}</h3>
              </div>
              <p className="text-[11px] text-secondary-500 leading-tight">{ag.desc}</p>
              <div className="pt-2 border-t border-secondary-200 flex items-center justify-between text-[10px] text-secondary-500 font-mono">
                <span>Signal Vector:</span>
                <span className="text-primary-700 font-bold">Active (4D)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3-Way Comparative Benchmarking Matrix */}
      {results && (
        <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary-600" />
              <h3 className="text-sm font-bold text-secondary-900">
                3-Way Comparative Performance Evaluation ({results.eval_episodes} Episodes, Seed={results.experiment_seed})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-primary-700 font-medium">Reproducible Seed Verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-secondary-200 text-secondary-500">
                  <th className="pb-2 font-bold uppercase">Security Strategy</th>
                  <th className="pb-2 font-bold uppercase">Detection Rate</th>
                  <th className="pb-2 font-bold uppercase">Response Time</th>
                  <th className="pb-2 font-bold uppercase">QoS Latency</th>
                  <th className="pb-2 font-bold uppercase">CPU Load</th>
                  <th className="pb-2 font-bold uppercase">Cum. Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200 text-secondary-800">
                {/* 1. Static Security Baseline */}
                {results.strategies.static_baseline && (
                  <tr>
                    <td className="py-3 font-sans font-semibold text-secondary-700">Static Security Baseline</td>
                    <td className="py-3 font-bold text-secondary-800">{results.strategies.static_baseline.detection_rate_pct}%</td>
                    <td className="py-3">{results.strategies.static_baseline.response_time_steps} steps</td>
                    <td className="py-3">{results.strategies.static_baseline.latency_ms} ms</td>
                    <td className="py-3">{results.strategies.static_baseline.resource_consumption_cpu_pct}%</td>
                    <td className="py-3 text-secondary-600">{results.strategies.static_baseline.cumulative_reward}</td>
                  </tr>
                )}

                {/* 2. Single-Agent RL */}
                {results.strategies.single_agent_rl && (
                  <tr>
                    <td className="py-3 font-sans font-semibold text-secondary-900">Single-Agent RL (DQN)</td>
                    <td className="py-3 font-bold text-tertiary-700">{results.strategies.single_agent_rl.detection_rate_pct}%</td>
                    <td className="py-3">{results.strategies.single_agent_rl.response_time_steps} steps</td>
                    <td className="py-3">{results.strategies.single_agent_rl.latency_ms} ms</td>
                    <td className="py-3">{results.strategies.single_agent_rl.resource_consumption_cpu_pct}%</td>
                    <td className="py-3 text-tertiary-700">{results.strategies.single_agent_rl.cumulative_reward}</td>
                  </tr>
                )}

                {/* 3. Multi-Agent Coordinated MARL */}
                {results.strategies.multi_agent_rl && (
                  <tr className="bg-primary-50/50 font-semibold text-primary-900">
                    <td className="py-3 font-sans font-bold flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary-600" />
                      <span>Multi-Agent Cross-Layer RL</span>
                    </td>
                    <td className="py-3 font-extrabold text-primary-700">{results.strategies.multi_agent_rl.detection_rate_pct}%</td>
                    <td className="py-3 font-bold">{results.strategies.multi_agent_rl.response_time_steps} steps</td>
                    <td className="py-3">{results.strategies.multi_agent_rl.latency_ms} ms</td>
                    <td className="py-3">{results.strategies.multi_agent_rl.resource_consumption_cpu_pct}%</td>
                    <td className="py-3 font-extrabold text-primary-700">{results.strategies.multi_agent_rl.cumulative_reward}</td>
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
