'use client';

import React from 'react';
import { NetworkSlice, AttackEvent } from '@/types';
import { ShieldCheck, AlertTriangle, Radio, Cpu, Layers, Activity, Zap, CheckCircle2 } from 'lucide-react';

interface SOCOverviewCardProps {
  slices: NetworkSlice[];
  activeAttacks: AttackEvent[];
  autoDefenseEnabled: boolean;
  onNavigateTab: (tab: any) => void;
}

export const SOCOverviewCard: React.FC<SOCOverviewCardProps> = ({
  slices,
  activeAttacks,
  autoDefenseEnabled,
  onNavigateTab,
}) => {
  // Compute dynamic security score (0-100)
  const totalSlices = slices.length || 3;
  const underAttackSlices = slices.filter((s) => s.current_status === 'UNDER_ATTACK' || s.current_status === 'CRITICAL').length;
  const avgAnomaly = slices.reduce((acc, s) => acc + (s.anomaly_score || 0), 0) / totalSlices;
  const avgLatency = slices.reduce((acc, s) => acc + s.latency, 0) / totalSlices;

  let securityScore = 98;
  securityScore -= activeAttacks.length * 15;
  securityScore -= underAttackSlices * 10;
  securityScore -= Math.round(avgAnomaly * 20);
  if (avgLatency > 20) securityScore -= 5;
  securityScore = Math.max(12, Math.min(100, securityScore));

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-network-emerald border-network-emerald/40 bg-network-emerald/10';
    if (score >= 60) return 'text-amber-400 border-amber-400/40 bg-amber-400/10';
    return 'text-rose-500 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: 5G/6G Security Score */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Overall Security Score</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className={`text-3xl font-extrabold font-mono ${getScoreColor(securityScore).split(' ')[0]}`}>
                {securityScore} / 100
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              {securityScore >= 85 ? 'Optimal 5G Security Posture' : securityScore >= 60 ? 'Degraded Threat Level' : 'Critical Threat Severity'}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${getScoreColor(securityScore)}`}>
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        {/* Metric 2: Active Slices Telemetry */}
        <div
          onClick={() => onNavigateTab('slices')}
          className="bg-network-card border border-network-border hover:border-network-cyan/40 rounded-2xl p-5 shadow-xl flex items-center justify-between cursor-pointer transition-all"
        >
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Active Slices Telemetry</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-white font-mono">{slices.length || 3} Slices</span>
            </div>
            <span className="text-[10px] text-network-cyan mt-1 block">eMBB &bull; URLLC &bull; mMTC IoT</span>
          </div>

          <div className="p-3.5 bg-network-cyan/10 border border-network-cyan/30 text-network-cyan rounded-2xl">
            <Radio className="w-7 h-7" />
          </div>
        </div>

        {/* Metric 3: Active Cyber Threat Alerts */}
        <div
          onClick={() => onNavigateTab('threats')}
          className="bg-network-card border border-network-border hover:border-rose-500/40 rounded-2xl p-5 shadow-xl flex items-center justify-between cursor-pointer transition-all"
        >
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Current Cyber Threats</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className={`text-3xl font-extrabold font-mono ${activeAttacks.length > 0 ? 'text-rose-500 animate-pulse' : 'text-network-emerald'}`}>
                {activeAttacks.length} Threats
              </span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              {activeAttacks.length > 0 ? `${activeAttacks[0].attack_type} Active` : 'Zero Active Threat Vectors'}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${activeAttacks.length > 0 ? 'bg-rose-500/10 border-rose-500/40 text-rose-500' : 'bg-network-emerald/10 border-network-emerald/30 text-network-emerald'}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>

        {/* Metric 4: Closed-Loop MARL Security Status */}
        <div
          onClick={() => onNavigateTab('marl')}
          className="bg-network-card border border-network-border hover:border-network-purple/40 rounded-2xl p-5 shadow-xl flex items-center justify-between cursor-pointer transition-all"
        >
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">MARL Agents Status</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-network-purple font-mono">4 Agents</span>
            </div>
            <span className="text-[10px] text-network-purple mt-1 block">PHY &bull; MAC &bull; NET &bull; APP</span>
          </div>

          <div className="p-3.5 bg-network-purple/10 border border-network-purple/30 text-network-purple rounded-2xl">
            <Cpu className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Slices Quick Status Grid */}
      <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-network-border pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-network-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Network Slices Health Overview</h3>
          </div>
          <button
            onClick={() => onNavigateTab('slices')}
            className="text-xs font-bold text-network-cyan hover:underline"
          >
            View Full Slice Telemetry &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slices.map((slice) => {
            const isAttacked = slice.current_status === 'UNDER_ATTACK' || slice.current_status === 'CRITICAL';
            return (
              <div
                key={slice.slice_id}
                className={`p-4 bg-network-dark/60 border rounded-xl space-y-3 transition-all ${
                  isAttacked ? 'border-rose-500/50 bg-rose-950/10' : 'border-network-border hover:border-network-cyan/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-white">{slice.name}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-network-cyan/20 text-network-cyan">
                      {slice.slice_type}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isAttacked ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-network-emerald/20 text-network-emerald border-network-emerald/30'
                  }`}>
                    {slice.current_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-300">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Latency SLA:</span>
                    <span className="font-bold text-network-cyan">{slice.latency} ms / max {slice.max_latency_ms} ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Packet Loss:</span>
                    <span className="font-bold text-amber-400">{slice.packet_loss} %</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">CPU Load:</span>
                    <span className="font-bold text-network-purple">{slice.cpu_usage} %</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Anomaly Risk:</span>
                    <span className="font-bold text-rose-400">{slice.anomaly_score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
