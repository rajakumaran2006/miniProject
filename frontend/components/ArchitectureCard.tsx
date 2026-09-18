'use client';

import React from 'react';
import { Cpu, Shield, Network, GitBranch } from 'lucide-react';

export const ArchitectureCard: React.FC = () => {
  const modules = [
    {
      title: 'Cross-Layer Telemetry',
      icon: Network,
      color: 'text-primary-600 bg-primary-50 border-primary-200',
      description: 'Collects metrics across RAN, Transport (SDN), 3GPP Core (SBA), and Application layers.',
      status: 'Base Engine Active',
    },
    {
      title: 'Reinforcement Learning Agent',
      icon: Cpu,
      color: 'text-primary-700 bg-primary-50 border-primary-200',
      description: 'Gymnasium environment interface for Deep Q-Networks (DQN) & Proximal Policy Optimization (PPO).',
      status: 'Engine Ready',
    },
    {
      title: 'Federated Learning Interface',
      icon: GitBranch,
      color: 'text-tertiary-700 bg-tertiary-50 border-tertiary-200',
      description: 'Privacy-preserving collaborative model updates across multi-domain edge nodes via FedAvg.',
      status: 'Engine Ready',
    },
    {
      title: 'Attack Simulator Engine',
      icon: Shield,
      color: 'text-secondary-700 bg-secondary-100 border-secondary-200',
      description: 'Synthetic DoS, Jamming, and Slice Isolation Breach attack generators with ground truth labels.',
      status: 'Engine Ready',
    },
  ];

  return (
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-bold text-secondary-900">Cross-Layer Security Architecture</h2>
        <p className="text-xs text-secondary-500">Modular design blueprint enabling AI/ML extension modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((mod, idx) => {
          const IconComponent = mod.icon;
          return (
            <div
              key={idx}
              className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${mod.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-secondary-200 text-secondary-600">
                    Stage 0{idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-secondary-900 mb-1.5">{mod.title}</h3>
                <p className="text-xs text-secondary-500 leading-relaxed mb-4">{mod.description}</p>
              </div>

              <div className="pt-3 border-t border-secondary-200 flex items-center justify-between text-[11px] font-mono">
                <span className="text-secondary-500">Status</span>
                <span className="font-semibold text-primary-700">{mod.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
