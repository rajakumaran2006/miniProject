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

interface AnalyticsChartsProps {
  slices: NetworkSlice[];
  activeAttacks: AttackEvent[];
  historyFrames?: any[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ slices, activeAttacks, historyFrames }) => {
  const [chartHistory, setChartHistory] = useState<any[]>([]);

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

  // Static federated rounds data for Chart 8
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
      <div className="flex items-center space-x-3 bg-network-card border border-network-border rounded-2xl p-5 shadow-xl">
        <div className="p-3 bg-network-cyan/10 rounded-xl text-network-cyan border border-network-cyan/20">
          <ChartIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Real-Time Security Analytics & Telemetry Charts</h2>
          <p className="text-xs text-gray-400">Continuous 8-Series Telemetry & Analytics Dashboard powered by Recharts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bandwidth & Traffic Flow */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-network-border pb-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-network-cyan" />
              <span>1. Bandwidth & Traffic Flow (Mbps)</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="embb_bw" name="eMBB Video (Mbps)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                <Area type="monotone" dataKey="urllc_bw" name="URLLC Transport (Mbps)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="mmtc_bw" name="mMTC IoT (Mbps)" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Observed Latency vs Max SLA */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-network-border pb-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-network-emerald" />
              <span>2. Observed Latency (ms) vs SLA Limits</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="urllc_lat" name="URLLC Latency (ms)" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="embb_lat" name="eMBB Latency (ms)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mmtc_lat" name="mMTC Latency (ms)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Packet Loss % */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-network-border pb-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>3. Packet Loss Percentage (%)</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="embb_loss" name="eMBB Loss %" fill="#06b6d4" />
                <Bar dataKey="urllc_loss" name="URLLC Loss %" fill="#10b981" />
                <Bar dataKey="mmtc_loss" name="mMTC Loss %" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Anomaly Risk Score */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-network-border pb-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>4. AI Anomaly & Threat Risk Score</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="iso_risk" name="Isolation Forest Risk" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                <Area type="monotone" dataKey="fed_risk" name="Federated Global Risk" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Attack Incidents Over Time */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-network-border pb-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>5. Active Cyber Attack Incidents</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 12 }} />
                <Bar dataKey="attacks_cnt" name="Active Attacks Count" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Cumulative RL Reward Comparison */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-network-border pb-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-network-purple" />
              <span>6. RL Agent Cumulative Reward Convergence</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="marl_rl_reward" name="Multi-Agent RL (-114.25)" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="single_rl_reward" name="Single-Agent DQN (-285.1)" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: CPU Resource Usage */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-network-border pb-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-network-blue" />
              <span>7. Slice CPU Resource Utilization (%)</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="cpu_urllc" name="URLLC CPU Load %" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="cpu_embb" name="eMBB CPU Load %" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                <Area type="monotone" dataKey="cpu_mmtc" name="mMTC CPU Load %" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 8: Federated Global Model Accuracy & F1 */}
        <div className="bg-network-card border border-network-border rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-network-border pb-2">
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-network-emerald" />
              <span>8. Federated Learning Global Accuracy & F1</span>
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flRoundsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[80, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="accuracy" name="Global Accuracy %" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="f1" name="Global F1-Score %" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
