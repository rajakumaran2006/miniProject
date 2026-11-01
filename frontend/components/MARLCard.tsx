'use client';

import React, { useState, useEffect } from 'react';
import { ComparativeResults } from '@/types';
import { evaluateMARL, fetchMARLMetrics, trainMARLAgents } from '@/lib/api';
import { Layers, RefreshCw, BarChart2, ShieldCheck, Radio, Cpu, Network, Lock, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
    { name: 'Physical Layer Agent', icon: Radio, desc: 'SNR, Jamming, Beamforming & Noise Telemetry', color: 'text-[#1A3C6F] dark:text-[#179F99]' },
    { name: 'MAC Layer Agent', icon: Cpu, desc: 'Frame Error Rate, Slot Allocation & CQI Index', color: 'text-[#179F99]' },
    { name: 'Network Layer Agent', icon: Network, desc: 'SDN Flow Churn, Bandwidth & Cross-Slice Flows', color: 'text-[#1A3C6F] dark:text-[#179F99]' },
    { name: 'Application Layer Agent', icon: Lock, desc: 'Active Sessions, Auth Failures & API Client Security', color: 'text-[#179F99]' },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
                Multi-Agent Cross-Layer RL Architecture
              </h2>
              <StatusBadge variant="brand">
                4-Agent Coordinated MARL
              </StatusBadge>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Physical, MAC, Network, and Application layer agents sharing cross-layer coordination signals
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTrain}
            disabled={isTraining}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />}
          >
            {isTraining ? 'Training MARL...' : 'Train 4 Agents'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleEvaluate}
            disabled={isEvaluating}
            icon={<BarChart2 className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />}
          >
            {isEvaluating ? 'Evaluating...' : 'Run Benchmark'}
          </Button>
        </div>
      </div>

      {/* 4 Cross-Layer Security Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {agents.map((ag) => {
          const Icon = ag.icon;
          return (
            <div
              key={ag.name}
              className="p-4 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-2 hover:border-[#1A3C6F] dark:hover:border-[#179F99] transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${ag.color}`} />
                <h3 className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6]">{ag.name}</h3>
              </div>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] leading-tight">{ag.desc}</p>
              <div className="pt-2 border-t border-[#EFEFEF] dark:border-[#2E3344] flex items-center justify-between text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-mono">
                <span>Coordination:</span>
                <span className="text-[#1A3C6F] dark:text-[#179F99] font-bold">Active (4D)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3-Way Comparative Benchmarking Matrix (Clean Borderless Row-Card Architecture per Section 4) */}
      {results && (
        <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#179F99]" />
              <h3 className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
                3-Way Comparative Performance Evaluation ({results.eval_episodes} Episodes, Seed={results.experiment_seed})
              </h3>
            </div>
            <StatusBadge variant="teal">
              Seed Verified
            </StatusBadge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EFEFEF] dark:border-[#2E3344]">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#EFEFEF] dark:border-[#2E3344] bg-white dark:bg-[#1A1D26] text-[#6B7280] dark:text-[#9CA3AF]">
                  <th className="py-3 px-4 font-bold uppercase font-sans">Security Strategy</th>
                  <th className="py-3 px-4 font-bold uppercase font-sans">Detection Rate</th>
                  <th className="py-3 px-4 font-bold uppercase font-sans">Response Time</th>
                  <th className="py-3 px-4 font-bold uppercase font-sans">QoS Latency</th>
                  <th className="py-3 px-4 font-bold uppercase font-sans">CPU Load</th>
                  <th className="py-3 px-4 font-bold uppercase font-sans">Cum. Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF] dark:divide-[#2E3344] text-[#111111] dark:text-[#F3F4F6]">
                {/* 1. Static Security Baseline */}
                {results.strategies.static_baseline && (
                  <tr className="hover:bg-white/80 dark:hover:bg-[#1A1D26]/80 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      Static Security Baseline
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {results.strategies.static_baseline.detection_rate_pct}%
                    </td>
                    <td className="py-3 px-4">
                      {results.strategies.static_baseline.response_time_steps} steps
                    </td>
                    <td className="py-3 px-4">
                      {results.strategies.static_baseline.latency_ms} ms
                    </td>
                    <td className="py-3 px-4">
                      {results.strategies.static_baseline.resource_consumption_cpu_pct}%
                    </td>
                    <td className="py-3 px-4 text-[#6B7280] dark:text-[#9CA3AF]">
                      {results.strategies.static_baseline.cumulative_reward}
                    </td>
                  </tr>
                )}

                {/* 2. Single-Agent RL */}
                {results.strategies.single_agent_rl && (
                  <tr className="hover:bg-white/80 dark:hover:bg-[#1A1D26]/80 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold">
                      Single-Agent RL (DQN)
                    </td>
                    <td className="py-3 px-4 font-bold text-[#179F99]">
                      {results.strategies.single_agent_rl.detection_rate_pct}%
                    </td>
                    <td className="py-3 px-4">
                      {results.strategies.single_agent_rl.response_time_steps} steps
                    </td>
                    <td className="py-3 px-4">
                      {results.strategies.single_agent_rl.latency_ms} ms
                    </td>
                    <td className="py-3 px-4">
                      {results.strategies.single_agent_rl.resource_consumption_cpu_pct}%
                    </td>
                    <td className="py-3 px-4 text-[#179F99]">
                      {results.strategies.single_agent_rl.cumulative_reward}
                    </td>
                  </tr>
                )}

                {/* 3. Multi-Agent Coordinated MARL */}
                {results.strategies.multi_agent_rl && (
                  <tr className="bg-[#1A3C6F]/10 dark:bg-[#179F99]/15 font-semibold text-[#1A3C6F] dark:text-[#179F99]">
                    <td className="py-3 px-4 font-sans font-bold flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#179F99]" />
                      <span>Multi-Agent Cross-Layer RL</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#179F99]">
                      {results.strategies.multi_agent_rl.detection_rate_pct}%
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {results.strategies.multi_agent_rl.response_time_steps} steps
                    </td>
                    <td className="py-3 px-4">
                      {results.strategies.multi_agent_rl.latency_ms} ms
                    </td>
                    <td className="py-3 px-4">
                      {results.strategies.multi_agent_rl.resource_consumption_cpu_pct}%
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#179F99]">
                      {results.strategies.multi_agent_rl.cumulative_reward}
                    </td>
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
