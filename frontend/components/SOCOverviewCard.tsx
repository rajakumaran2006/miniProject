'use client';

import React from 'react';
import { NetworkSlice, AttackEvent } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OverviewStatsCard } from '@/components/ui/OverviewStatsCard';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  AlertTriangle,
  Radio,
  Cpu,
  Activity,
  ArrowRight,
  ChevronRight,
  Lock,
  Layers,
  Zap,
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

  const scoreVariant =
    securityScore >= 85 ? 'active' : securityScore >= 60 ? 'warning' : 'critical';

  return (
    <div className="space-y-6">
      {/* 4-Card Overview Stats Architecture Standard (Section 10 of AGENTS.md) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {/* Metric 1: Overall Security Posture */}
        <OverviewStatsCard
          title="Overall Security Posture"
          subtitle={`${securityScore} / 100 • ${
            securityScore >= 85
              ? 'Optimal SLA Health'
              : securityScore >= 60
              ? 'Degraded Threat State'
              : 'Critical Threat Alert'
          }`}
          actionLabel="Inspect"
          onActionClick={() => onNavigateTab('controls')}
          statusBadge={
            <StatusBadge variant={scoreVariant} dot>
              {securityScore} / 100
            </StatusBadge>
          }
          graphicSvg={
            <svg
              className="w-12 h-14 stroke-current fill-none stroke-[1.4]"
              viewBox="0 0 48 56"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 4L8 12V26C8 38 15 47 24 52C33 47 40 38 40 26V12L24 4Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 26L22 31L31 20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        {/* Metric 2: Network Slice Fleet */}
        <OverviewStatsCard
          title="Network Slice Fleet"
          subtitle={`${slices.length || 3} Slices • eMBB, URLLC & mMTC`}
          actionLabel="View Slices"
          onActionClick={() => onNavigateTab('slices')}
          statusBadge={<StatusBadge variant="brand">3 Slices</StatusBadge>}
          graphicSvg={
            <svg
              className="w-12 h-14 stroke-current fill-none stroke-[1.4]"
              viewBox="0 0 48 56"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="28" r="6" />
              <path d="M14 20C18 16 30 16 34 20" strokeLinecap="round" />
              <path d="M8 14C16 8 32 8 40 14" strokeLinecap="round" />
              <path d="M14 36C18 40 30 40 34 36" strokeLinecap="round" />
              <path d="M8 42C16 48 32 48 40 42" strokeLinecap="round" />
            </svg>
          }
        />

        {/* Metric 3: Active Threat Monitor */}
        <OverviewStatsCard
          title="Threat Monitor"
          subtitle={`${activeAttacks.length} Active • ${
            activeAttacks.length > 0
              ? activeAttacks[0].attack_type
              : 'Zero Active Inundations'
          }`}
          actionLabel="Threat Feed"
          onActionClick={() => onNavigateTab('threats')}
          statusBadge={
            <StatusBadge variant={activeAttacks.length > 0 ? 'critical' : 'active'} dot>
              {activeAttacks.length > 0 ? `${activeAttacks.length} Threats` : 'Secure'}
            </StatusBadge>
          }
          graphicSvg={
            <svg
              className="w-12 h-14 stroke-current fill-none stroke-[1.4]"
              viewBox="0 0 48 56"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 8L6 44H42L24 8Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="24" y1="22" x2="24" y2="32" strokeLinecap="round" />
              <circle cx="24" cy="38" r="1.8" fill="currentColor" />
            </svg>
          }
        />

        {/* Metric 4: Coordinated MARL Security */}
        <OverviewStatsCard
          title="MARL Cross-Layer"
          subtitle="4 Joint Agents • PHY, MAC, NET & APP"
          actionLabel="MARL Detail"
          onActionClick={() => onNavigateTab('marl')}
          statusBadge={<StatusBadge variant="teal">4 Agents</StatusBadge>}
          graphicSvg={
            <svg
              className="w-12 h-14 stroke-current fill-none stroke-[1.4]"
              viewBox="0 0 48 56"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="12" y="14" width="24" height="24" rx="4" />
              <circle cx="24" cy="26" r="4" />
              <line x1="18" y1="14" x2="18" y2="8" strokeLinecap="round" />
              <line x1="30" y1="14" x2="30" y2="8" strokeLinecap="round" />
              <line x1="18" y1="38" x2="18" y2="44" strokeLinecap="round" />
              <line x1="30" y1="38" x2="30" y2="44" strokeLinecap="round" />
              <line x1="12" y1="20" x2="6" y2="20" strokeLinecap="round" />
              <line x1="12" y1="32" x2="6" y2="32" strokeLinecap="round" />
              <line x1="36" y1="20" x2="42" y2="20" strokeLinecap="round" />
              <line x1="36" y1="32" x2="42" y2="32" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      {/* Main Feature Card: Network Slices Status Matrix */}
      <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Card Header with Pill Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
              5G/6G Network Slice Fleet & Isolation
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
              Live Quality of Service (QoS) SLAs, throughput bandwidth, and real-time security posture
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <Button
              variant="secondary"
              size="sm"
              icon={<Activity className="w-3.5 h-3.5 text-[#179F99]" />}
              onClick={() => onNavigateTab('connectivity')}
            >
              Live Connectivity
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ChevronRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              onClick={() => onNavigateTab('slices')}
            >
              View all Slices
            </Button>
          </div>
        </div>

        {/* Slice Fleet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slices.map((slice) => {
            const isAttacked =
              slice.current_status === 'UNDER_ATTACK' || slice.current_status === 'CRITICAL';

            return (
              <div
                key={slice.slice_id}
                onClick={() => onNavigateTab('slices')}
                className={`rounded-xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
                  isAttacked
                    ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 ring-1 ring-rose-400'
                    : 'bg-[#F5F5F7] dark:bg-[#222632] border-[#EFEFEF] dark:border-[#2E3344] hover:border-[#1A3C6F] dark:hover:border-[#179F99] hover:shadow-md'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6] block group-hover:text-[#1A3C6F] dark:group-hover:text-[#179F99] transition-colors">
                      {slice.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                      {slice.slice_id}
                    </span>
                  </div>

                  {/* Status Pill Chip (Solid Dark Backgrounds + White Text as per Section 4/13) */}
                  <StatusBadge
                    variant={isAttacked ? 'critical' : 'active'}
                    dot
                  >
                    {slice.current_status}
                  </StatusBadge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#EFEFEF] dark:border-[#2E3344] my-2 text-center font-mono">
                  <div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-sans uppercase">
                      Bandwidth
                    </div>
                    <div className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] mt-0.5">
                      {Math.round(slice.bandwidth)} Mbps
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-sans uppercase">
                      Latency
                    </div>
                    <div
                      className={`text-xs font-bold mt-0.5 ${
                        slice.latency > slice.max_latency_ms
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-[#111111] dark:text-[#F3F4F6]'
                      }`}
                    >
                      {slice.latency.toFixed(2)} ms
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-sans uppercase">
                      Drop Loss
                    </div>
                    <div className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] mt-0.5">
                      {(slice.packet_loss * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Bottom Pill Badge */}
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                    SLA: {slice.max_latency_ms}ms
                  </span>
                  <StatusBadge variant="brand">
                    {slice.security_level} SEC
                  </StatusBadge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Split Layout: Threat Protection, MARL Agents & Autonomous Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Active Threats & Virtual Network Protection */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111111] dark:text-[#F3F4F6]">
              Live Cyber Threat Events
            </h3>
            <button
              onClick={() => onNavigateTab('threats')}
              className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6] inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Featured Protection Card with Brand Accent */}
          <div className="bg-[#1A3C6F] text-white rounded-xl p-4.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wide text-white/90">
                Virtual Network Protection
              </span>
              <StatusBadge variant="teal">
                Active
              </StatusBadge>
            </div>
            <div>
              <div className="font-bold text-sm leading-snug">Open vSwitch Wire-Speed Filter</div>
              <p className="text-xs text-white/80 mt-0.5">
                Microsegmentation isolating URLLC from unauthenticated traffic
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <span className="px-2.5 py-1 rounded-[10px] bg-white/15 text-white font-bold text-[11px]">
                OpenFlow 1.3
              </span>
              <span className="px-2.5 py-1 rounded-[10px] bg-white/15 text-white font-bold text-[11px]">
                Wire Defense
              </span>
            </div>
          </div>

          {/* Secondary Event Row */}
          <div className="p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6]">
                Cross-Layer Anomaly Detection
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                Isolation Forest
              </span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Unsupervised multivariate inspection on edge telemetry
            </p>
            <div className="flex items-center space-x-2 pt-1 font-mono text-[10px] text-[#111111] dark:text-[#F3F4F6]">
              <span className="px-2 py-0.5 rounded-[10px] bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] font-bold">
                Precision: 98.4%
              </span>
              <span className="px-2 py-0.5 rounded-[10px] bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] font-bold">
                F1-Score: 0.96
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Coordinated MARL Multi-Agent Team */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111111] dark:text-[#F3F4F6]">
              Coordinated MARL Agents
            </h3>
            <button
              onClick={() => onNavigateTab('marl')}
              className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6] inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'PHY Agent', role: 'Beamforming Defense', progress: '10/10 active' },
              { name: 'MAC Agent', role: 'Auth Token Defense', progress: '10/10 active' },
              { name: 'NET Agent', role: 'SDN Flow Slicing', progress: '10/10 active' },
              { name: 'APP Agent', role: 'Zero-Trust Tokens', progress: '10/10 active' },
            ].map((agent, i) => (
              <div
                key={i}
                className="bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl p-3.5 text-center space-y-1.5"
              >
                <div className="w-9 h-9 mx-auto rounded-[10px] bg-[#1A3C6F] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {agent.name.slice(0, 3)}
                </div>
                <div className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6]">
                  {agent.name}
                </div>
                <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                  {agent.role}
                </div>
                <div className="text-[10px] font-bold px-2 py-0.5 rounded-[10px] bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] text-[#111111] dark:text-[#F3F4F6]">
                  {agent.progress}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Adaptive Security Posture & Quick Controller */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#1A3C6F] via-[#179F99] to-[#153260] shadow-lg flex items-center justify-center text-white">
              <ShieldCheck className="w-7 h-7 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-[#111111] dark:text-[#F3F4F6] pt-1">
              Autonomous Adaptive SOC
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] max-w-xs mx-auto">
              Closed-loop security controller adjusting Authentication, Encryption, and Microsegmentation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab('controls')}
            >
              Security Controls
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateTab('experiments')}
            >
              Benchmark
            </Button>
          </div>

          <div className="pt-2 border-t border-[#EFEFEF] dark:border-[#2E3344] flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>RL Auto-Defense:</span>
            <StatusBadge variant={autoDefenseEnabled ? 'active' : 'neutral'} dot>
              {autoDefenseEnabled ? 'ENABLED' : 'MANUAL'}
            </StatusBadge>
          </div>
        </div>
      </div>
    </div>
  );
};
