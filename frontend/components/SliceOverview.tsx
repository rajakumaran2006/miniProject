'use client';

import React, { useState } from 'react';
import { NetworkSlice } from '@/types';
import { Radio, Wifi, Layers, Cpu, Activity, BarChart2 } from 'lucide-react';

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
        return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'DEGRADED':
      case 'ELEVATED':
        return 'bg-secondary-100 text-secondary-800 border-secondary-300';
      case 'UNDER_ATTACK':
      case 'CRITICAL':
        return 'bg-secondary-900 text-white border-secondary-800';
      default:
        return 'bg-secondary-100 text-secondary-600 border-secondary-200';
    }
  };

  return (
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary-900">5G/6G Network Slice Telemetry</h2>
            <p className="text-xs text-secondary-500">Multi-Layer Slice Performance & Anomaly Monitoring (`/api/v1/slices`)</p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-secondary-600 font-mono">{error}</p>
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
                      ? 'bg-primary-50/30 border-primary-600 shadow-sm ring-1 ring-primary-600'
                      : 'bg-secondary-50 border-secondary-200 hover:border-primary-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-tertiary-700 font-semibold px-2 py-0.5 rounded bg-tertiary-50 border border-tertiary-200">
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

                  <h3 className="text-sm font-bold text-secondary-900 mb-1 line-clamp-1">{slice.name}</h3>
                  <p className="text-xs text-secondary-400 font-mono mb-3">{slice.slice_id}</p>

                  <div className="space-y-1.5 text-xs text-secondary-700 font-mono">
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Bandwidth:</span>
                      <span className="font-semibold text-secondary-900">{slice.bandwidth} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Latency:</span>
                      <span className="font-semibold text-primary-600">{slice.latency} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Pkt Rate:</span>
                      <span className="font-semibold text-secondary-900">{slice.packet_rate} /s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Devices:</span>
                      <span className="font-semibold text-secondary-900">{slice.connected_devices.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">CPU Usage:</span>
                      <span className="font-semibold text-tertiary-700">{slice.cpu_usage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Anomaly Score:</span>
                      <span
                        className={`font-semibold ${
                          slice.anomaly_score > 0.15 ? 'text-secondary-900 font-bold' : 'text-primary-600'
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
            <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary-600" />
                  <h3 className="text-sm font-bold text-secondary-900">
                    Cross-Layer Metrics Detail: <span className="text-primary-600">{activeSlice.name}</span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-secondary-500">
                  Reliability Target: {(activeSlice.target_reliability * 100).toFixed(3)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Physical/RAN */}
                <div className="p-3 bg-white rounded-lg border border-secondary-200 shadow-sm">
                  <div className="flex items-center space-x-2 text-primary-600 text-xs font-bold mb-2">
                    <Radio className="w-4 h-4" />
                    <span>Physical / RAN Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-secondary-700 font-mono">
                    <p>SNR: {activeSlice.metrics.physical_ran.snr_db} dB</p>
                    <p>Jamming: {activeSlice.metrics.physical_ran.jamming_indicator}</p>
                    <p>Beam Eff: {(activeSlice.metrics.physical_ran.beamforming_efficiency * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Transport Network */}
                <div className="p-3 bg-white rounded-lg border border-secondary-200 shadow-sm">
                  <div className="flex items-center space-x-2 text-tertiary-700 text-xs font-bold mb-2">
                    <Wifi className="w-4 h-4" />
                    <span>Transport Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-secondary-700 font-mono">
                    <p>Bandwidth: {activeSlice.metrics.transport_network.bandwidth_gbps} Gbps</p>
                    <p>Pkt Loss: {(activeSlice.metrics.transport_network.packet_loss_rate * 100).toFixed(3)}%</p>
                    <p>SDN Churn: {activeSlice.metrics.transport_network.sdn_flow_entry_churn}/s</p>
                  </div>
                </div>

                {/* 3GPP Core */}
                <div className="p-3 bg-white rounded-lg border border-secondary-200 shadow-sm">
                  <div className="flex items-center space-x-2 text-secondary-800 text-xs font-bold mb-2">
                    <Cpu className="w-4 h-4 text-primary-600" />
                    <span>3GPP Core Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-secondary-700 font-mono">
                    <p>NRF Reg: {activeSlice.metrics.core_3gpp.nrf_registration_rate}%</p>
                    <p>Auth Success: {(activeSlice.metrics.core_3gpp.auth_success_ratio * 100).toFixed(2)}%</p>
                    <p>MANO Latency: {activeSlice.metrics.core_3gpp.mano_api_latency_ms} ms</p>
                  </div>
                </div>

                {/* Application */}
                <div className="p-3 bg-white rounded-lg border border-secondary-200 shadow-sm">
                  <div className="flex items-center space-x-2 text-primary-600 text-xs font-bold mb-2">
                    <BarChart2 className="w-4 h-4" />
                    <span>Application Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-secondary-700 font-mono">
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
