'use client';

import React, { useState } from 'react';
import { AttackSeverity, AttackType } from '@/types';
import { startAttack } from '@/lib/api';
import { ShieldAlert, Zap, Skull, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AttackControlsProps {
  onAttackTriggered: () => void;
}

export const AttackControls: React.FC<AttackControlsProps> = ({ onAttackTriggered }) => {
  const [sliceId, setSliceId] = useState<string>('slice-urllc-01');
  const [attackType, setAttackType] = useState<AttackType>('Denial-of-Service');
  const [severity, setSeverity] = useState<AttackSeverity>('HIGH');
  const [durationSteps, setDurationSteps] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleLaunch = async () => {
    setIsSubmitting(true);
    await startAttack(sliceId, attackType, severity, durationSteps);
    onAttackTriggered();
    setIsSubmitting(false);
  };

  const getAttackIcon = (type: AttackType) => {
    switch (type) {
      case 'Denial-of-Service':
        return <Zap className="w-5 h-5 text-[#179F99]" />;
      case 'Spoofing':
        return <Skull className="w-5 h-5 text-[#1A3C6F] dark:text-[#179F99]" />;
      case 'Network-Slice Isolation Breach':
        return <Lock className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-5 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
              Threat Vector Attack Generator
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Simulate 5G/6G threat models (DoS, Spoofing, Isolation Breach)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Slice Target */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block">
            Target Slice
          </label>
          <select
            value={sliceId}
            onChange={(e) => setSliceId(e.target.value)}
            className="w-full bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
          >
            <option value="slice-embb-01">eMBB Video Slicing</option>
            <option value="slice-urllc-01">URLLC Transport Slice</option>
            <option value="slice-mmtc-01">mMTC IoT Mesh</option>
          </select>
        </div>

        {/* Threat Model */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block">
            Threat Model
          </label>
          <select
            value={attackType}
            onChange={(e) => setAttackType(e.target.value as AttackType)}
            className="w-full bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
          >
            <option value="Denial-of-Service">Denial-of-Service (DoS)</option>
            <option value="Spoofing">Identity Spoofing</option>
            <option value="Network-Slice Isolation Breach">Slice Isolation Breach</option>
          </select>
        </div>

        {/* Severity */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as AttackSeverity)}
            className="w-full bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block">
            Duration (Steps)
          </label>
          <select
            value={durationSteps}
            onChange={(e) => setDurationSteps(Number(e.target.value))}
            className="w-full bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
          >
            <option value={3}>3 Steps</option>
            <option value={5}>5 Steps</option>
            <option value={10}>10 Steps</option>
          </select>
        </div>
      </div>

      <div className="pt-3 flex items-center justify-between border-t border-[#EFEFEF] dark:border-[#2E3344] flex-wrap gap-3">
        <div className="flex items-center space-x-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          {getAttackIcon(attackType)}
          <span>
            Simulating Target: <strong className="text-[#111111] dark:text-[#F3F4F6]">{attackType}</strong>
          </span>
        </div>

        <Button
          variant="primary"
          onClick={handleLaunch}
          loading={isSubmitting}
          icon={<AlertTriangle className="w-4 h-4" />}
        >
          Launch Simulated Threat
        </Button>
      </div>
    </div>
  );
};
