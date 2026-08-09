'use client';

import React, { useState } from 'react';
import { NetworkSlice } from '@/types';
import { Radio, Wifi, Layers, ShieldAlert, Cpu, Activity, BarChart2 } from 'lucide-react';

interface SliceOverviewProps {
  slices: NetworkSlice[];
  error: string | null;
}

export const SliceOverview: React.FC<SliceOverviewProps> = ({ slices, error }) => {
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(
    slices.length > 0 ? slices[0].slice_id : null
  );

  const activeSlice = slices.find((s) => s.slice_id === selectedSliceId) || slices[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
      case 'NORMAL':
        return 'bg-network-emerald/10 text-network-emerald border-network-emerald/30';
      case 'DEGRADED':
      case 'ELEVATED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'UNDER_ATTACK':
      case 'CRITICAL':
        return 'bg-network-rose/10 text-network-rose border-network-rose/30';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-purple/10 rounded-xl text-network-purple border border-network-purple/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">5G/6G Network Slice Telemetry</h2>
            <p className="text-xs text-gray-400">Multi-Layer Slice Performance & Anomaly Monitoring (`/api/v1/slices`)</p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-network-rose">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slices.map((slice) => {
              const isSelected = slice.slice_id === activeSlice?.slice_id;
              return (
                <div
                  key={slice.slice_id}
                  onClick={() => setSelectedSliceId(slice.slice_id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-network-dark border-network-cyan shadow-lg shadow-network-cyan/10 ring-1 ring-network-cyan'
                      : 'bg-network-dark/40 border-network-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-network-cyan font-semibold">
                      {slice.slice_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(
                        slice.current_status
                      )}`}
                    >
                      {slice.current_status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{slice.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mb-3">{slice.slice_id}</p>

                  <div className="space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bandwidth:</span>
                      <span className="font-semibold">{slice.bandwidth} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Latency:</span>
                      <span className="font-semibold">{slice.latency} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pkt Rate:</span>
                      <span className="font-semibold">{slice.packet_rate} /s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Devices:</span>
                      <span className="font-semibold">{slice.connected_devices.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">CPU Usage:</span>
                      <span className="font-semibold">{slice.cpu_usage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Anomaly Score:</span>
                      <span
                        className={`font-semibold ${
                          slice.anomaly_score > 0.15 ? 'text-amber-400' : 'text-network-emerald'
                        }`}
                      >
                        {(slice.anomaly_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {activeSlice && (
            <div className="p-5 bg-network-dark/60 border border-network-border rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-network-border pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-network-cyan" />
                  <h3 className="text-sm font-bold text-white">
                    Cross-Layer Metrics Detail: <span className="text-network-cyan">{activeSlice.name}</span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  Reliability Target: {(activeSlice.target_reliability * 100).toFixed(3)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Physical/RAN */}
                <div className="p-3 bg-network-card rounded-lg border border-network-border">
                  <div className="flex items-center space-x-2 text-network-cyan text-xs font-bold mb-2">
                    <Radio className="w-4 h-4" />
                    <span>Physical / RAN Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300 font-mono">
                    <p>SNR: {activeSlice.metrics.physical_ran.snr_db} dB</p>
                    <p>Jamming: {activeSlice.metrics.physical_ran.jamming_indicator}</p>
                    <p>Beam Eff: {(activeSlice.metrics.physical_ran.beamforming_efficiency * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Transport Network */}
                <div className="p-3 bg-network-card rounded-lg border border-network-border">
                  <div className="flex items-center space-x-2 text-network-blue text-xs font-bold mb-2">
                    <Wifi className="w-4 h-4" />
                    <span>Transport Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300 font-mono">
                    <p>Bandwidth: {activeSlice.metrics.transport_network.bandwidth_gbps} Gbps</p>
                    <p>Pkt Loss: {(activeSlice.metrics.transport_network.packet_loss_rate * 100).toFixed(3)}%</p>
                    <p>SDN Churn: {activeSlice.metrics.transport_network.sdn_flow_entry_churn}/s</p>
                  </div>
                </div>

                {/* 3GPP Core */}
                <div className="p-3 bg-network-card rounded-lg border border-network-border">
                  <div className="flex items-center space-x-2 text-network-purple text-xs font-bold mb-2">
                    <Cpu className="w-4 h-4" />
                    <span>3GPP Core Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300 font-mono">
                    <p>NRF Reg: {activeSlice.metrics.core_3gpp.nrf_registration_rate}%</p>
                    <p>Auth Success: {(activeSlice.metrics.core_3gpp.auth_success_ratio * 100).toFixed(2)}%</p>
                    <p>MANO Latency: {activeSlice.metrics.core_3gpp.mano_api_latency_ms} ms</p>
                  </div>
                </div>

                {/* Application */}
                <div className="p-3 bg-network-card rounded-lg border border-network-border">
                  <div className="flex items-center space-x-2 text-network-emerald text-xs font-bold mb-2">
                    <BarChart2 className="w-4 h-4" />
                    <span>Application Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300 font-mono">
                    <p>Sessions: {activeSlice.metrics.application.active_sessions.toLocaleString()}</p>
                    <p>Unauth API: {activeSlice.metrics.application.unauthorized_api_attempts}</p>
                    <p>QoS Score: {(activeSlice.metrics.application.qos_compliance_score * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
