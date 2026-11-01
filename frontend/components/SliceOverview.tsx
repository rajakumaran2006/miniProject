'use client';

import React, { useState } from 'react';
import { NetworkSlice } from '@/types';
import { Layers, Radio, Wifi, Cpu, Activity, BarChart2 } from 'lucide-react';
import { StatusBadge, StatusVariant } from '@/components/ui/StatusBadge';

interface SliceOverviewProps {
  slices: NetworkSlice[];
  error: string | null;
}

export const SliceOverview: React.FC<SliceOverviewProps> = ({ slices, error }) => {
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(
    slices.length > 0 ? slices[0].slice_id : null
  );

  const activeSlice = slices.find((s) => s.slice_id === selectedSliceId) || slices[0];

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case 'HEALTHY':
      case 'NORMAL':
        return 'active';
      case 'DEGRADED':
      case 'ELEVATED':
        return 'warning';
      case 'UNDER_ATTACK':
      case 'CRITICAL':
        return 'critical';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
              5G/6G Network Slice Telemetry
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Multi-Layer Slice Performance & Anomaly Monitoring (`/api/v1/slices`)
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-mono">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slices.map((slice) => {
              const isSelected = slice.slice_id === activeSlice?.slice_id;
              const isAttacked =
                slice.current_status === 'UNDER_ATTACK' || slice.current_status === 'CRITICAL';

              return (
                <div
                  key={slice.slice_id}
                  onClick={() => setSelectedSliceId(slice.slice_id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-[#222632] border-[#1A3C6F] dark:border-[#179F99] shadow-md ring-2 ring-[#1A3C6F]/30 dark:ring-[#179F99]/30'
                      : 'bg-[#F5F5F7] dark:bg-[#222632] border-[#EFEFEF] dark:border-[#2E3344] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge variant="teal">
                      {slice.slice_type}
                    </StatusBadge>
                    <StatusBadge variant={getStatusVariant(slice.current_status)} dot>
                      {slice.current_status}
                    </StatusBadge>
                  </div>

                  <h3 className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6] mb-1 line-clamp-1">
                    {slice.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono mb-3">
                    {slice.slice_id}
                  </p>

                  <div className="space-y-1.5 text-xs text-[#111111] dark:text-[#F3F4F6] font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]">Bandwidth:</span>
                      <span className="font-bold">{slice.bandwidth} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]">Latency:</span>
                      <span
                        className={`font-bold ${
                          slice.latency > slice.max_latency_ms
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-[#179F99]'
                        }`}
                      >
                        {slice.latency.toFixed(2)} ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]">Pkt Rate:</span>
                      <span className="font-bold">{slice.packet_rate} /s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]">Devices:</span>
                      <span className="font-bold">{slice.connected_devices.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]">CPU Usage:</span>
                      <span className="font-bold text-[#179F99]">{slice.cpu_usage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280] dark:text-[#9CA3AF]">Anomaly Score:</span>
                      <span
                        className={`font-bold ${
                          slice.anomaly_score > 0.15
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-[#179F99]'
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
            <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-3 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#179F99]" />
                  <h3 className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
                    Cross-Layer Metrics Detail: <span className="text-[#1A3C6F] dark:text-[#179F99]">{activeSlice.name}</span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                  Reliability Target: {(activeSlice.target_reliability * 100).toFixed(3)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Physical/RAN */}
                <div className="p-4 bg-white dark:bg-[#1A1D26] rounded-xl border border-[#EFEFEF] dark:border-[#2E3344] shadow-xs">
                  <div className="flex items-center space-x-2 text-[#1A3C6F] dark:text-[#179F99] text-xs font-bold mb-2">
                    <Radio className="w-4 h-4" />
                    <span>Physical / RAN Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#111111] dark:text-[#F3F4F6] font-mono">
                    <p>SNR: {activeSlice.metrics.physical_ran.snr_db} dB</p>
                    <p>Jamming: {activeSlice.metrics.physical_ran.jamming_indicator}</p>
                    <p>Beam Eff: {(activeSlice.metrics.physical_ran.beamforming_efficiency * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Transport Network */}
                <div className="p-4 bg-white dark:bg-[#1A1D26] rounded-xl border border-[#EFEFEF] dark:border-[#2E3344] shadow-xs">
                  <div className="flex items-center space-x-2 text-[#179F99] text-xs font-bold mb-2">
                    <Wifi className="w-4 h-4" />
                    <span>Transport Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#111111] dark:text-[#F3F4F6] font-mono">
                    <p>Bandwidth: {activeSlice.metrics.transport_network.bandwidth_gbps} Gbps</p>
                    <p>Pkt Loss: {(activeSlice.metrics.transport_network.packet_loss_rate * 100).toFixed(3)}%</p>
                    <p>SDN Churn: {activeSlice.metrics.transport_network.sdn_flow_entry_churn}/s</p>
                  </div>
                </div>

                {/* 3GPP Core */}
                <div className="p-4 bg-white dark:bg-[#1A1D26] rounded-xl border border-[#EFEFEF] dark:border-[#2E3344] shadow-xs">
                  <div className="flex items-center space-x-2 text-[#1A3C6F] dark:text-[#179F99] text-xs font-bold mb-2">
                    <Cpu className="w-4 h-4" />
                    <span>3GPP Core Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#111111] dark:text-[#F3F4F6] font-mono">
                    <p>NRF Reg: {activeSlice.metrics.core_3gpp.nrf_registration_rate}%</p>
                    <p>Auth Success: {(activeSlice.metrics.core_3gpp.auth_success_ratio * 100).toFixed(2)}%</p>
                    <p>MANO Latency: {activeSlice.metrics.core_3gpp.mano_api_latency_ms} ms</p>
                  </div>
                </div>

                {/* Application */}
                <div className="p-4 bg-white dark:bg-[#1A1D26] rounded-xl border border-[#EFEFEF] dark:border-[#2E3344] shadow-xs">
                  <div className="flex items-center space-x-2 text-[#179F99] text-xs font-bold mb-2">
                    <BarChart2 className="w-4 h-4" />
                    <span>Application Layer</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#111111] dark:text-[#F3F4F6] font-mono">
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
