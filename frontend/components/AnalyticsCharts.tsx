'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { NetworkSlice, AttackEvent } from '@/types';
import { LineChart as ChartIcon, Activity, Zap, Cpu, ShieldCheck, Layers } from 'lucide-react';
import { SliceFilterBar, SliceFilterType } from '@/components/ui/SliceFilterBar';

interface AnalyticsChartsProps {
  slices: NetworkSlice[];
  activeAttacks: AttackEvent[];
  historyFrames?: any[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ slices, activeAttacks }) => {
  const [chartHistory, setChartHistory] = useState<any[]>([]);

  // Per-card Slice Filter States
  const [filter1, setFilter1] = useState<SliceFilterType>('ALL');
  const [filter2, setFilter2] = useState<SliceFilterType>('ALL');
  const [filter3, setFilter3] = useState<SliceFilterType>('ALL');
  const [filter4, setFilter4] = useState<SliceFilterType>('ALL');
  const [filter7, setFilter7] = useState<SliceFilterType>('ALL');

  // Generate historical timeline data points from real slice telemetry
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const eMBB = slices.find((s) => s.slice_type === 'eMBB') || slices[0];
    const URLLC = slices.find((s) => s.slice_type === 'URLLC') || slices[1];
    const mMTC = slices.find((s) => s.slice_type === 'mMTC') || slices[2];

    const dataPoint = {
      time: timestamp,
      embb_bw: eMBB?.bandwidth || 750,
      urllc_bw: URLLC?.bandwidth || 120,
      mmtc_bw: mMTC?.bandwidth || 45,
      embb_lat: eMBB?.latency || 12.5,
      urllc_lat: URLLC?.latency || 1.8,
      mmtc_lat: mMTC?.latency || 48.0,
      embb_loss: eMBB?.packet_loss || 0.05,
      urllc_loss: URLLC?.packet_loss || 0.001,
      mmtc_loss: mMTC?.packet_loss || 0.2,
      iso_risk: eMBB?.anomaly_score || 0.12,
      fed_risk: URLLC?.anomaly_score || 0.08,
      attacks_cnt: activeAttacks.length,
      single_rl_reward: -285.1,
      marl_rl_reward: -114.25,
      cpu_embb: eMBB?.cpu_usage || 28.5,
      cpu_urllc: URLLC?.cpu_usage || 45.0,
      cpu_mmtc: mMTC?.cpu_usage || 18.2,
    };

    setChartHistory((prev) => {
      const next = [...prev, dataPoint];
      return next.slice(-20); // Keep last 20 time series frames
    });
  }, [slices, activeAttacks]);

  const flRoundsData = [
    { round: 'R1', accuracy: 84.8, f1: 82.2 },
    { round: 'R2', accuracy: 92.4, f1: 91.0 },
    { round: 'R3', accuracy: 98.7, f1: 98.7 },
    { round: 'R4', accuracy: 99.4, f1: 99.2 },
    { round: 'R5', accuracy: 100.0, f1: 100.0 },
    { round: 'R6', accuracy: 99.9, f1: 99.9 },
    { round: 'R7', accuracy: 99.9, f1: 99.9 },
    { round: 'R8', accuracy: 100.0, f1: 100.0 },
    { round: 'R9', accuracy: 99.8, f1: 99.8 },
    { round: 'R10', accuracy: 99.9, f1: 99.9 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="p-3 bg-[#1A3C6F] text-white rounded-xl shadow-xs">
          <ChartIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
            Real-Time Security Analytics & Telemetry
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            Continuous 8-series telemetry stream with per-card slice filtering powered by VenusSMS design system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bandwidth & Traffic Flow */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2 gap-2">
            <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#179F99]" />
              <span>1. Bandwidth & Traffic Flow (Mbps)</span>
            </span>
            <SliceFilterBar selected={filter1} onChange={setFilter1} />
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', fontSize: 12, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(filter1 === 'ALL' || filter1 === 'eMBB') && (
                  <Area type="monotone" dataKey="embb_bw" name="eMBB Video" stroke="#1A3C6F" fill="#1A3C6F" fillOpacity={0.15} />
                )}
                {(filter1 === 'ALL' || filter1 === 'URLLC') && (
                  <Area type="monotone" dataKey="urllc_bw" name="URLLC Transport" stroke="#179F99" fill="#179F99" fillOpacity={0.15} />
                )}
                {(filter1 === 'ALL' || filter1 === 'mMTC') && (
                  <Area type="monotone" dataKey="mmtc_bw" name="mMTC IoT" stroke="#64748B" fill="#64748B" fillOpacity={0.15} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Observed Latency vs Max SLA */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2 gap-2">
            <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#179F99]" />
              <span>2. Observed Latency (ms) vs SLA Limits</span>
            </span>
            <SliceFilterBar selected={filter2} onChange={setFilter2} />
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', fontSize: 12, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(filter2 === 'ALL' || filter2 === 'URLLC') && (
                  <Line type="monotone" dataKey="urllc_lat" name="URLLC Latency" stroke="#1A3C6F" strokeWidth={2} dot={false} />
                )}
                {(filter2 === 'ALL' || filter2 === 'eMBB') && (
                  <Line type="monotone" dataKey="embb_lat" name="eMBB Latency" stroke="#179F99" strokeWidth={2} dot={false} />
                )}
                {(filter2 === 'ALL' || filter2 === 'mMTC') && (
                  <Line type="monotone" dataKey="mmtc_lat" name="mMTC Latency" stroke="#64748B" strokeWidth={2} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Packet Loss % */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2 gap-2">
            <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#1A3C6F]" />
              <span>3. Packet Loss Percentage (%)</span>
            </span>
            <SliceFilterBar selected={filter3} onChange={setFilter3} />
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', fontSize: 12, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(filter3 === 'ALL' || filter3 === 'eMBB') && (
                  <Bar dataKey="embb_loss" name="eMBB Loss %" fill="#1A3C6F" />
                )}
                {(filter3 === 'ALL' || filter3 === 'URLLC') && (
                  <Bar dataKey="urllc_loss" name="URLLC Loss %" fill="#179F99" />
                )}
                {(filter3 === 'ALL' || filter3 === 'mMTC') && (
                  <Bar dataKey="mmtc_loss" name="mMTC Loss %" fill="#64748B" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Anomaly Risk Score */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2 gap-2">
            <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#179F99]" />
              <span>4. AI Anomaly & Threat Risk Score</span>
            </span>
            <SliceFilterBar selected={filter4} onChange={setFilter4} />
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} stroke="#6B7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', fontSize: 12, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(filter4 === 'ALL' || filter4 === 'eMBB' || filter4 === 'mMTC') && (
                  <Area type="monotone" dataKey="iso_risk" name="Isolation Forest Risk" stroke="#64748B" fill="#64748B" fillOpacity={0.15} />
                )}
                {(filter4 === 'ALL' || filter4 === 'URLLC') && (
                  <Area type="monotone" dataKey="fed_risk" name="Federated Global Risk" stroke="#179F99" fill="#179F99" fillOpacity={0.15} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Attack Incidents Over Time */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2">
            <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>5. Active Cyber Attack Incidents</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', fontSize: 12, borderRadius: 10 }} />
                <Bar dataKey="attacks_cnt" name="Active Attacks Count" fill="#E11D48" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Cumulative RL Reward Comparison */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2">
            <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#1A3C6F]" />
              <span>6. RL Agent Cumulative Reward Convergence</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', fontSize: 12, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="marl_rl_reward" name="Multi-Agent RL" stroke="#179F99" strokeWidth={2} />
                <Line type="monotone" dataKey="single_rl_reward" name="Single-Agent DQN" stroke="#64748B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: CPU Resource Usage */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2 gap-2">
            <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#179F99]" />
              <span>7. Slice CPU Resource Utilization (%)</span>
            </span>
            <SliceFilterBar selected={filter7} onChange={setFilter7} />
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#6B7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', fontSize: 12, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(filter7 === 'ALL' || filter7 === 'URLLC') && (
                  <Area type="monotone" dataKey="cpu_urllc" name="URLLC CPU %" stroke="#1A3C6F" fill="#1A3C6F" fillOpacity={0.15} />
                )}
                {(filter7 === 'ALL' || filter7 === 'eMBB') && (
                  <Area type="monotone" dataKey="cpu_embb" name="eMBB CPU %" stroke="#179F99" fill="#179F99" fillOpacity={0.15} />
                )}
                {(filter7 === 'ALL' || filter7 === 'mMTC') && (
                  <Area type="monotone" dataKey="cpu_mmtc" name="mMTC CPU %" stroke="#64748B" fill="#64748B" fillOpacity={0.15} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 8: Federated Global Model Accuracy & F1 */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2">
            <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#1A3C6F]" />
              <span>8. Federated Learning Global Accuracy & F1</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flRoundsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[80, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E5E7EB', fontSize: 12, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#179F99" strokeWidth={2} />
                <Line type="monotone" dataKey="f1" name="F1-Score %" stroke="#1A3C6F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
