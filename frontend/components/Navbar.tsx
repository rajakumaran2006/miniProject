'use client';

import React from 'react';
import { ShieldCheck, Cpu, Activity, Database } from 'lucide-react';

interface NavbarProps {
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isConnected }) => {
  return (
    <header className="border-b border-network-border bg-network-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-network-cyan to-network-blue rounded-xl text-white shadow-lg shadow-network-cyan/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              5G/6G Cross-Layer Security
            </h1>
            <p className="text-xs text-gray-400">
              Adaptive Reinforcement Learning Research Prototype
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-network-dark/60 border border-network-border text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-network-emerald animate-pulse' : 'bg-network-rose'
              }`}
            />
            <span className="text-gray-300 font-medium">
              {isConnected ? 'Backend Online' : 'Backend Disconnected'}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-3 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Cpu className="w-4 h-4 text-network-cyan" />
              <span>FastAPI v0.1.0</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-network-purple" />
              <span>RL Agent Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
