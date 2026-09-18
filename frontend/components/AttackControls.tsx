'use client';

import React, { useState } from 'react';
import { AttackSeverity, AttackType } from '@/types';
import { startAttack } from '@/lib/api';
import { ShieldAlert, Zap, Skull, Lock, AlertTriangle } from 'lucide-react';

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
        return <Zap className="w-5 h-5 text-primary-600" />;
      case 'Spoofing':
        return <Skull className="w-5 h-5 text-secondary-700" />;
      case 'Network-Slice Isolation Breach':
        return <Lock className="w-5 h-5 text-tertiary-600" />;
    }
  };

  return (
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-5 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-secondary-100 rounded-xl text-secondary-800 border border-secondary-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary-900">Threat Vector Attack Generator</h2>
            <p className="text-xs text-secondary-500">Simulate 5G/6G threat models (DoS, Spoofing, Isolation Breach)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Slice Target */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-secondary-700 block">Target Slice</label>
          <select
            value={sliceId}
            onChange={(e) => setSliceId(e.target.value)}
            className="w-full bg-white border border-secondary-300 rounded-xl px-3 py-2 text-xs font-semibold text-secondary-800 focus:outline-none focus:border-primary-500"
          >
            <option value="slice-embb-01">eMBB Video Slicing</option>
            <option value="slice-urllc-01">URLLC Transport Slice</option>
            <option value="slice-mmtc-01">mMTC IoT Mesh</option>
          </select>
        </div>

        {/* Threat Model */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-secondary-700 block">Threat Model</label>
          <select
            value={attackType}
            onChange={(e) => setAttackType(e.target.value as AttackType)}
            className="w-full bg-white border border-secondary-300 rounded-xl px-3 py-2 text-xs font-semibold text-secondary-800 focus:outline-none focus:border-primary-500"
          >
            <option value="Denial-of-Service">Denial-of-Service (DoS)</option>
            <option value="Spoofing">Identity Spoofing</option>
            <option value="Network-Slice Isolation Breach">Slice Isolation Breach</option>
          </select>
        </div>

        {/* Severity */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-secondary-700 block">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as AttackSeverity)}
            className="w-full bg-white border border-secondary-300 rounded-xl px-3 py-2 text-xs font-semibold text-secondary-800 focus:outline-none focus:border-primary-500"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-secondary-700 block">Duration (Steps)</label>
          <select
            value={durationSteps}
            onChange={(e) => setDurationSteps(Number(e.target.value))}
            className="w-full bg-white border border-secondary-300 rounded-xl px-3 py-2 text-xs font-semibold text-secondary-800 focus:outline-none focus:border-primary-500"
          >
            <option value={3}>3 Steps</option>
            <option value={5}>5 Steps</option>
            <option value={10}>10 Steps</option>
          </select>
        </div>
      </div>

      <div className="pt-3 flex items-center justify-between border-t border-secondary-200">
        <div className="flex items-center space-x-2 text-xs text-secondary-500">
          {getAttackIcon(attackType)}
          <span>
            Simulating Feature Impacts: <strong className="text-secondary-800">{attackType}</strong>
          </span>
        </div>

        <button
          onClick={handleLaunch}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{isSubmitting ? 'Launching...' : 'Launch Simulated Threat'}</span>
        </button>
      </div>
    </div>
  );
};
