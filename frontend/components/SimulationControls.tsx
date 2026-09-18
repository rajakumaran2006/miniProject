'use client';

import React, { useState } from 'react';
import { SimulationState, AttackType } from '@/types';
import { controlSimulation, stepSimulation, startAttack } from '@/lib/api';
import { Play, Pause, RotateCcw, FastForward, AlertTriangle, Gauge } from 'lucide-react';

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
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-200">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary-900">5G/6G Simulation Controller</h2>
            <p className="text-xs text-secondary-500">Control discrete simulation time-steps & inject synthetic traffic anomalies</p>
          </div>
        </div>

        {/* Global Control Buttons - Cleaned up and adhering to 3-color palette */}
        <div className="flex items-center flex-wrap gap-2">
          {isRunning ? (
            <button
              onClick={() => handleControl('stop')}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary-800 text-white hover:bg-secondary-900 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Auto-Step</span>
            </button>
          ) : (
            <button
              onClick={() => handleControl('start')}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Start Auto-Step</span>
            </button>
          )}

          <button
            onClick={() => handleStep(1)}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-secondary-50 text-secondary-800 border border-secondary-300 hover:bg-secondary-100 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <FastForward className="w-3.5 h-3.5 text-primary-600" />
            <span>Step +1</span>
          </button>

          <button
            onClick={() => handleControl('reset')}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-secondary-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* State Metric Indicators & Anomaly Injector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
            <span className="text-xs text-secondary-500 block mb-1 font-medium">Step Count</span>
            <span className="text-lg font-extrabold text-secondary-900 font-mono">{simState?.step_count ?? 0}</span>
          </div>

          <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
            <span className="text-xs text-secondary-500 block mb-1 font-medium">Total Bandwidth</span>
            <span className="text-lg font-extrabold text-primary-600 font-mono">
              {simState?.total_bandwidth_mbps ?? 0} <span className="text-xs font-normal text-secondary-500">Mbps</span>
            </span>
          </div>

          <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
            <span className="text-xs text-secondary-500 block mb-1 font-medium">Total Pkt Rate</span>
            <span className="text-lg font-extrabold text-tertiary-700 font-mono">
              {((simState?.total_packet_rate ?? 0) / 1000).toFixed(1)} <span className="text-xs font-normal text-secondary-500">k/s</span>
            </span>
          </div>

          <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
            <span className="text-xs text-secondary-500 block mb-1 font-medium">Avg Latency</span>
            <span className="text-lg font-extrabold text-secondary-900 font-mono">
              {simState?.avg_latency_ms ?? 0} <span className="text-xs font-normal text-secondary-500">ms</span>
            </span>
          </div>
        </div>

        {/* Anomaly Generator Card */}
        <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center space-x-2 text-secondary-800 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-primary-600" />
            <span>Synthetic Anomaly Injection</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-white border border-secondary-300 rounded-lg px-2 py-1.5 text-secondary-800 focus:outline-none focus:border-primary-500 font-medium"
            >
              <option value="slice-embb-01">eMBB Slice</option>
              <option value="slice-urllc-01">URLLC Slice</option>
              <option value="slice-mmtc-01">mMTC Slice</option>
            </select>

            <select
              value={selectedAnomaly}
              onChange={(e) => setSelectedAnomaly(e.target.value)}
              className="bg-white border border-secondary-300 rounded-lg px-2 py-1.5 text-secondary-800 focus:outline-none focus:border-primary-500 font-medium"
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
            className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessing ? 'Injecting...' : 'Inject Attack Pattern'}
          </button>
        </div>
      </div>
    </div>
  );
};
