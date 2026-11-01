'use client';

import React, { useState } from 'react';
import { SimulationState, AttackType } from '@/types';
import { controlSimulation, stepSimulation, startAttack } from '@/lib/api';
import { Play, Pause, RotateCcw, FastForward, AlertTriangle, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SimulationControlsProps {
  simState: SimulationState | null;
  onStateUpdate: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ simState, onStateUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState<string>('slice-urllc-01');
  const [selectedAnomaly, setSelectedAnomaly] = useState<string>('DDOS_SURGE');

  const handleControl = async (action: 'start' | 'stop' | 'reset') => {
    setIsProcessing(true);
    await controlSimulation(action);
    onStateUpdate();
    setIsProcessing(false);
  };

  const handleStep = async (steps: number) => {
    setIsProcessing(true);
    await stepSimulation(steps);
    onStateUpdate();
    setIsProcessing(false);
  };

  const handleInjectAnomaly = async () => {
    setIsProcessing(true);
    let atkType: AttackType = 'Denial-of-Service';
    if (selectedAnomaly === 'SPOOFING') atkType = 'Spoofing';
    else if (selectedAnomaly === 'ISOLATION_BREACH') atkType = 'Network-Slice Isolation Breach';

    await startAttack(selectedSlice, atkType, 'HIGH', 4);
    onStateUpdate();
    setIsProcessing(false);
  };

  const isRunning = simState?.is_running ?? false;

  return (
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
              5G/6G Simulation Controller
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Control discrete simulation time-steps & inject synthetic traffic anomalies
            </p>
          </div>
        </div>

        {/* Global Control Buttons - Single row horizontal layout as per Section 5 */}
        <div className="flex items-center flex-wrap gap-2">
          {isRunning ? (
            <Button
              variant="secondary"
              onClick={() => handleControl('stop')}
              disabled={isProcessing}
              icon={<Pause className="w-4 h-4" />}
            >
              Pause Auto-Step
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => handleControl('start')}
              disabled={isProcessing}
              icon={<Play className="w-4 h-4" />}
            >
              Start Auto-Step
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => handleStep(1)}
            disabled={isProcessing}
            icon={<FastForward className="w-3.5 h-3.5 text-[#179F99]" />}
          >
            Step +1
          </Button>

          {/* Reset button adhering to Section 14 destructive styling */}
          <button
            onClick={() => handleControl('reset')}
            disabled={isProcessing}
            title="Reset Simulation State"
            className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:border-red-500 dark:hover:text-white border border-gray-400 dark:border-gray-500 transition-all duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* State Metric Indicators & Anomaly Injector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-medium">
              Step Count
            </span>
            <span className="text-lg font-extrabold text-[#111111] dark:text-[#F3F4F6] font-mono">
              {simState?.step_count ?? 0}
            </span>
          </div>

          <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-medium">
              Total Bandwidth
            </span>
            <span className="text-lg font-extrabold text-[#1A3C6F] dark:text-[#179F99] font-mono">
              {simState?.total_bandwidth_mbps ?? 0}{' '}
              <span className="text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF]">Mbps</span>
            </span>
          </div>

          <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-medium">
              Total Pkt Rate
            </span>
            <span className="text-lg font-extrabold text-[#179F99] font-mono">
              {((simState?.total_packet_rate ?? 0) / 1000).toFixed(1)}{' '}
              <span className="text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF]">k/s</span>
            </span>
          </div>

          <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-medium">
              Avg Latency
            </span>
            <span className="text-lg font-extrabold text-[#111111] dark:text-[#F3F4F6] font-mono">
              {simState?.avg_latency_ms ?? 0}{' '}
              <span className="text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF]">ms</span>
            </span>
          </div>
        </div>

        {/* Anomaly Generator Card */}
        <div className="p-4 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center space-x-2 text-[#111111] dark:text-[#F3F4F6] text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#179F99]" />
            <span>Synthetic Anomaly Injection</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-2 py-1.5 text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F] font-medium"
            >
              <option value="slice-embb-01">eMBB Slice</option>
              <option value="slice-urllc-01">URLLC Slice</option>
              <option value="slice-mmtc-01">mMTC Slice</option>
            </select>

            <select
              value={selectedAnomaly}
              onChange={(e) => setSelectedAnomaly(e.target.value)}
              className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-2 py-1.5 text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F] font-medium"
            >
              <option value="DDOS_SURGE">DDoS Surge</option>
              <option value="RAN_JAMMING">RAN Jamming</option>
              <option value="BOTNET_FLOOD">Botnet Flood</option>
              <option value="SLICE_HOPPING">Slice Hopping</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleInjectAnomaly}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Injecting...' : 'Inject Attack Pattern'}
          </Button>
        </div>
      </div>
    </div>
  );
};
