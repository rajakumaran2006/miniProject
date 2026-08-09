'use client';

import React from 'react';
import { Cpu, Shield, Network, GitBranch, ArrowRight } from 'lucide-react';

export const ArchitectureCard: React.FC = () => {
  const modules = [
    {
      title: 'Cross-Layer Telemetry',
      icon: Network,
      color: 'text-network-cyan bg-network-cyan/10 border-network-cyan/20',
      description: 'Collects metrics across RAN, Transport (SDN), 3GPP Core (SBA), and Application layers.',
      status: 'Base Engine Active',
    },
    {
      title: 'Reinforcement Learning Agent',
      icon: Cpu,
      color: 'text-network-blue bg-network-blue/10 border-network-blue/20',
      description: 'Abstract `BaseRLAgent` interface for Deep Q-Networks (DQN) & Proximal Policy Optimization (PPO).',
      status: 'Interface Ready (Future Phase)',
    },
    {
      title: 'Federated Learning Interface',
      icon: GitBranch,
      color: 'text-network-purple bg-network-purple/10 border-network-purple/20',
      description: 'Abstract `BaseFederatedAgent` interface for privacy-preserving collaborative model updates across multi-domain networks.',
      status: 'Interface Ready (Future Phase)',
    },
    {
      title: 'Attack Simulator Engine',
      icon: Shield,
      color: 'text-network-rose bg-network-rose/10 border-network-rose/20',
      description: 'Abstract `BaseAttackSimulator` interface for synthetic DDoS, Jamming, and Slice Hopping attack generators.',
      status: 'Interface Ready (Future Phase)',
    },
  ];

  return (
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Cross-Layer Security Architecture</h2>
        <p className="text-xs text-gray-400">Modular design blueprint enabling future AI/ML extension modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((mod, idx) => {
          const IconComponent = mod.icon;
          return (
            <div
              key={idx}
              className="p-4 bg-network-dark/50 border border-network-border rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg border ${mod.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-network-border text-gray-300">
                    Step 0{idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{mod.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{mod.description}</p>
              </div>

              <div className="pt-3 border-t border-network-border/60 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Status</span>
                <span className="font-semibold text-network-cyan">{mod.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
