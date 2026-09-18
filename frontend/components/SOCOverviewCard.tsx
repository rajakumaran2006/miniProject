'use client';

import React from 'react';
import { NetworkSlice, AttackEvent } from '@/types';
import {
  ShieldCheck,
  AlertTriangle,
  Radio,
  Cpu,
  Activity,
  ArrowRight,
  Filter,
  CheckCircle2,
  Lock,
  Zap,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

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
  const underAttackSlices = slices.filter(
    (s) => s.current_status === 'UNDER_ATTACK' || s.current_status === 'CRITICAL'
  ).length;
  const avgAnomaly = slices.reduce((acc, s) => acc + (s.anomaly_score || 0), 0) / totalSlices;
  const avgLatency = slices.reduce((acc, s) => acc + s.latency, 0) / totalSlices;

  let securityScore = 98;
  securityScore -= activeAttacks.length * 15;
  securityScore -= underAttackSlices * 10;
  securityScore -= Math.round(avgAnomaly * 20);
  if (avgLatency > 20) securityScore -= 5;
  securityScore = Math.max(12, Math.min(100, securityScore));

  return (
    <div className="space-y-6">
      {/* 4 Core Executive Metric Cards (matching reference card flow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: 5G/6G Security Score */}
        <div className="bg-white border border-slate-200/80 rounded-[26px] p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Overall Security Posture
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-blue-600">
                {securityScore}
                <span className="text-lg text-slate-400 font-normal"> / 100</span>
              </span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  securityScore >= 85
                    ? 'bg-emerald-500'
                    : securityScore >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-700">
                {securityScore >= 85
                  ? 'Optimal SLA Health'
                  : securityScore >= 60
                  ? 'Degraded Threat State'
                  : 'Critical Threat Alert'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-blue-200/80 bg-blue-50 text-blue-600 shadow-sm">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 2: Active Slices Telemetry */}
        <div
          onClick={() => onNavigateTab('slices')}
          className="bg-white border border-slate-200/80 hover:border-cyan-400 rounded-[26px] p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex items-center justify-between cursor-pointer transition-all hover:shadow-md group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Network Slice Fleet
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {slices.length || 3} Slices
              </span>
            </div>
            <span className="text-xs text-cyan-700 mt-2 block font-semibold flex items-center space-x-1">
              <span>eMBB &bull; URLLC &bull; mMTC</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          <div className="p-3.5 bg-cyan-50 border border-cyan-200/80 text-cyan-600 rounded-2xl shadow-sm">
            <Radio className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 3: Active Cyber Threat Alerts */}
        <div
          onClick={() => onNavigateTab('threats')}
          className="bg-white border border-slate-200/80 hover:border-amber-400 rounded-[26px] p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex items-center justify-between cursor-pointer transition-all hover:shadow-md group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              Threat Monitor
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {activeAttacks.length}
                <span className="text-sm text-slate-400 font-normal"> Active</span>
              </span>
            </div>
            <span className="text-xs text-slate-600 mt-2 block font-semibold flex items-center space-x-1">
              <span>
                {activeAttacks.length > 0
                  ? `${activeAttacks[0].attack_type}`
                  : 'Zero Inundation Threats'}
              </span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border shadow-sm ${
              activeAttacks.length > 0
                ? 'border-rose-200 bg-rose-50 text-rose-600 animate-pulse'
                : 'border-slate-200 bg-slate-100 text-slate-600'
            }`}
          >
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 4: Closed-Loop MARL Security Status */}
        <div
          onClick={() => onNavigateTab('marl')}
          className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-[26px] p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] flex items-center justify-between cursor-pointer transition-all hover:shadow-md group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
              MARL Cross-Layer
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-indigo-700 font-mono">4 Agents</span>
            </div>
            <span className="text-xs text-indigo-600 mt-2 block font-semibold flex items-center space-x-1">
              <span>PHY &bull; MAC &bull; NET &bull; APP</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          <div className="p-3.5 bg-indigo-50 border border-indigo-200/80 text-indigo-600 rounded-2xl shadow-sm">
            <Cpu className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Main Feature Card: Network Slices Status Matrix (matching the large calendar card in reference) */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
        {/* Card Header with Pill Action Buttons (matching reference image) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              5G/6G Network Slice Fleet & Isolation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live Quality of Service (QoS) SLAs, throughput bandwidth, and real-time security posture
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => onNavigateTab('connectivity')}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              <span>Live Connectivity</span>
            </button>
            <button
              onClick={() => onNavigateTab('slices')}
              className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <span>View all Slices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Slice Fleet Cards (using soft pill tags like Vacation / Sick Leave in reference) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slices.map((slice) => {
            const isAttacked =
              slice.current_status === 'UNDER_ATTACK' || slice.current_status === 'CRITICAL';

            return (
              <div
                key={slice.slice_id}
                onClick={() => onNavigateTab('slices')}
                className={`rounded-[24px] p-5 border transition-all cursor-pointer relative overflow-hidden group ${
                  isAttacked
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/40'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:shadow-md'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                      {slice.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{slice.slice_id}</span>
                  </div>

                  {/* Status Pill Chip (matching reference image) */}
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center space-x-1 ${
                      isAttacked
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>{slice.current_status}</span>
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200/60 my-2 text-center font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400 font-sans uppercase">Bandwidth</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {Math.round(slice.bandwidth)} Mbps
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-sans uppercase">Latency</div>
                    <div
                      className={`text-xs font-bold mt-0.5 ${
                        slice.latency > slice.max_latency_ms ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {slice.latency.toFixed(2)} ms
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-sans uppercase">Drop Loss</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {(slice.packet_loss * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Bottom Pill Badge */}
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">SLA Target: {slice.max_latency_ms}ms</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      slice.security_level === 'HIGH'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {slice.security_level} SEC
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Split Layout: Future Events / Defense Feed & Autonomous Controller (matching reference bottom 3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Active Threats & Security Events (matching Tech Innovations Summit card in reference) */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Live Cyber Threat Events</h3>
            <button
              onClick={() => onNavigateTab('threats')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Yellow Featured Event Card (matching reference yellow Tech Innovations card) */}
          <div className="bg-amber-400 text-slate-950 rounded-[22px] p-4.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wide">
                Virtual Network Protection
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-bold">
                Live Active
              </span>
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">Open vSwitch Wire-Speed Filter</div>
              <p className="text-xs text-slate-800/80 mt-0.5">
                Microsegmentation isolating URLLC from unauthenticated traffic
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-amber-500/50 text-slate-950 font-bold text-[11px]">
                OpenFlow 1.3
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/50 text-slate-950 font-bold text-[11px]">
                Wire Defense
              </span>
            </div>
          </div>

          {/* Secondary Event Row (matching Software Dev Meetup row in reference) */}
          <div className="p-4 rounded-[20px] bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Cross-Layer Anomaly Detection</span>
              <span className="text-[10px] font-semibold text-slate-500">Isolation Forest</span>
            </div>
            <p className="text-xs text-slate-500">Unsupervised multivariate inspection on edge telemetry</p>
            <div className="flex items-center space-x-2 pt-1 font-mono text-[10px] text-slate-600">
              <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                Precision: 98.4%
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200">
                F1-Score: 0.96
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: MARL Multi-Agent Team (matching Onboarding section in reference) */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Coordinated MARL Agents</h3>
            <button
              onClick={() => onNavigateTab('marl')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'PHY Agent', role: 'Beamforming / Jamming', progress: '10/10 active' },
              { name: 'MAC Agent', role: 'Auth Token Defense', progress: '10/10 active' },
              { name: 'NET Agent', role: 'SDN Flow Slicing', progress: '10/10 active' },
              { name: 'APP Agent', role: 'Zero-Trust Tokens', progress: '10/10 active' },
            ].map((agent, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200/80 rounded-[20px] p-3.5 text-center space-y-1.5"
              >
                <div className="w-9 h-9 mx-auto rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  {agent.name.slice(0, 3)}
                </div>
                <div className="text-xs font-bold text-slate-800">{agent.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{agent.role}</div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                  {agent.progress}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Adaptive Security Posture & Quick Controller (matching Welcome card in reference) */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4">
          <div className="text-center space-y-2">
            {/* Animated Sphere Avatar (matching blue sphere in reference) */}
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 shadow-xl shadow-cyan-500/20 flex items-center justify-center text-white">
              <ShieldCheck className="w-8 h-8 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 pt-1">
              Autonomous Adaptive SOC
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Closed-loop security controller adjusting Authentication, Encryption, and Microsegmentation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onNavigateTab('controls')}
              className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 font-semibold hover:bg-slate-100 text-center transition-colors"
            >
              Security Controls
            </button>
            <button
              onClick={() => onNavigateTab('experiments')}
              className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 font-semibold hover:bg-slate-100 text-center transition-colors"
            >
              Research Benchmark
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <span>RL Auto-Defense Mode:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                autoDefenseEnabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {autoDefenseEnabled ? 'ENABLED' : 'MANUAL'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
