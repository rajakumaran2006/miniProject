'use client';

import React from 'react';
import { ShieldCheck, Cpu, Activity } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface NavbarProps {
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isConnected }) => {
  return (
    <header className="border-b border-[#EFEFEF] dark:border-[#2E3344] bg-white/95 dark:bg-[#1A1D26]/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#111111] dark:text-[#F3F4F6] tracking-wide">
              5G/6G Cross-Layer Security
            </h1>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Adaptive Reinforcement Learning Research Prototype
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <StatusBadge variant={isConnected ? 'active' : 'critical'} dot>
            {isConnected ? 'Backend Online' : 'Backend Disconnected'}
          </StatusBadge>

          <div className="hidden md:flex items-center space-x-3 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <div className="flex items-center space-x-1">
              <Cpu className="w-4 h-4 text-[#179F99]" />
              <span>FastAPI v0.1.0</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-[#1A3C6F] dark:text-[#179F99]" />
              <span>RL Agent Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
