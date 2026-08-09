'use client';

import React, { useState } from 'react';
import { SimulationState, AttackType } from '@/types';
import { controlSimulation, stepSimulation, startAttack } from '@/lib/api';
import { Play, Pause, RotateCcw, FastForward, AlertTriangle, Cpu, Activity, Gauge } from 'lucide-react';

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
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-cyan/10 rounded-xl text-network-cyan border border-network-cyan/20">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">5G/6G Simulation Controller</h2>
            <p className="text-xs text-gray-400">Control discrete simulation time-steps & inject synthetic traffic anomalies</p>
          </div>
        </div>

        {/* Global Control Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {isRunning ? (
            <button
              onClick={() => handleControl('stop')}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Auto-Step</span>
            </button>
          ) : (
            <button
              onClick={() => handleControl('start')}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-network-emerald/20 text-network-emerald border border-network-emerald/40 hover:bg-network-emerald/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Start Auto-Step</span>
            </button>
          )}

          <button
            onClick={() => handleStep(1)}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-network-blue/20 text-network-blue border border-network-blue/40 hover:bg-network-blue/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Step +1</span>
          </button>

          <button
            onClick={() => handleStep(5)}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-network-purple/20 text-network-purple border border-network-purple/40 hover:bg-network-purple/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Step +5</span>
          </button>

          <button
            onClick={() => handleControl('reset')}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-network-dark text-gray-300 border border-network-border hover:bg-network-border rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* State Metric Indicators & Anomaly Injector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-network-dark/60 border border-network-border rounded-xl">
            <span className="text-xs text-gray-400 block mb-1">Step Count</span>
            <span className="text-lg font-extrabold text-white font-mono">{simState?.step_count ?? 0}</span>
          </div>

          <div className="p-3 bg-network-dark/60 border border-network-border rounded-xl">
            <span className="text-xs text-gray-400 block mb-1">Total Bandwidth</span>
            <span className="text-lg font-extrabold text-network-cyan font-mono">
              {simState?.total_bandwidth_mbps ?? 0} <span className="text-xs font-normal text-gray-400">Mbps</span>
            </span>
          </div>

          <div className="p-3 bg-network-dark/60 border border-network-border rounded-xl">
            <span className="text-xs text-gray-400 block mb-1">Total Pkt Rate</span>
            <span className="text-lg font-extrabold text-network-purple font-mono">
              {((simState?.total_packet_rate ?? 0) / 1000).toFixed(1)} <span className="text-xs font-normal text-gray-400">k/s</span>
            </span>
          </div>

          <div className="p-3 bg-network-dark/60 border border-network-border rounded-xl">
            <span className="text-xs text-gray-400 block mb-1">Avg Latency</span>
            <span className="text-lg font-extrabold text-network-emerald font-mono">
              {simState?.avg_latency_ms ?? 0} <span className="text-xs font-normal text-gray-400">ms</span>
            </span>
          </div>
        </div>

        {/* Anomaly Generator Card */}
        <div className="p-4 bg-network-dark/80 border border-network-border rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Synthetic Anomaly Injection</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-network-card border border-network-border rounded-lg px-2 py-1 text-gray-200 focus:outline-none focus:border-network-cyan"
            >
              <option value="slice-embb-01">eMBB Slice</option>
              <option value="slice-urllc-01">URLLC Slice</option>
              <option value="slice-mmtc-01">mMTC Slice</option>
            </select>

            <select
              value={selectedAnomaly}
              onChange={(e) => setSelectedAnomaly(e.target.value)}
              className="bg-network-card border border-network-border rounded-lg px-2 py-1 text-gray-200 focus:outline-none focus:border-network-cyan"
            >
              <option value="DDOS_SURGE">DDoS Surge</option>
              <option value="RAN_JAMMING">RAN Jamming</option>
              <option value="BOTNET_FLOOD">Botnet Flood</option>
              <option value="SLICE_HOPPING">Slice Hopping</option>
            </select>
          </div>

          <button
            onClick={handleInjectAnomaly}
            disabled={isProcessing}
            className="w-full py-1.5 bg-network-rose/20 text-network-rose border border-network-rose/40 hover:bg-network-rose/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            Inject Attack Pattern
          </button>
        </div>
      </div>
    </div>
  );
};
