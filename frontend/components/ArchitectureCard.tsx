'use client';

import React from 'react';
import { Cpu, Shield, Network, GitBranch } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const ArchitectureCard: React.FC = () => {
  const modules = [
    {
      title: 'Cross-Layer Telemetry',
      icon: Network,
      iconBg: 'bg-[#1A3C6F] text-white',
      description: 'Collects metrics across RAN, Transport (SDN), 3GPP Core (SBA), and Application layers.',
      status: 'Active Engine',
      variant: 'brand' as const,
    },
    {
      title: 'Reinforcement Learning Agent',
      icon: Cpu,
      iconBg: 'bg-[#179F99] text-white',
      description: 'Gymnasium environment interface for Deep Q-Networks (DQN) & Proximal Policy Optimization (PPO).',
      status: 'Engine Ready',
      variant: 'teal' as const,
    },
    {
      title: 'Federated Learning Interface',
      icon: GitBranch,
      iconBg: 'bg-[#1A3C6F] text-white',
      description: 'Privacy-preserving collaborative model updates across multi-domain edge nodes via FedAvg.',
      status: 'Engine Ready',
      variant: 'active' as const,
    },
    {
      title: 'Attack Simulator Engine',
      icon: Shield,
      iconBg: 'bg-[#179F99] text-white',
      description: 'Synthetic DoS, Jamming, and Slice Isolation Breach attack generators with ground truth labels.',
      status: 'Engine Ready',
      variant: 'teal' as const,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
          Cross-Layer Security Architecture
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          Modular design blueprint enabling AI/ML extension modules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((mod, idx) => {
          const IconComponent = mod.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col justify-between hover:border-[#1A3C6F] dark:hover:border-[#179F99] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl shadow-xs ${mod.iconBg}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[10px] bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] text-[#6B7280] dark:text-[#9CA3AF]">
                    Stage 0{idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6] mb-1.5">{mod.title}</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed mb-4">{mod.description}</p>
              </div>

              <div className="pt-3 border-t border-[#EFEFEF] dark:border-[#2E3344] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#6B7280] dark:text-[#9CA3AF] font-sans">Status</span>
                <StatusBadge variant={mod.variant}>
                  {mod.status}
                </StatusBadge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
