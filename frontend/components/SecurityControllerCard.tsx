'use client';

import React, { useState, useEffect } from 'react';
import { CryptoTestResponse, SecurityControlStatus, SecurityDecisionEntry } from '@/types';
import { applySecurityControl, fetchControlHistory, fetchControlStatus, testCryptoEncryption } from '@/lib/api';
import { Sliders, Shield, Key, Lock, Eye, Layers, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const SecurityControllerCard: React.FC = () => {
  const [selectedSlice, setSelectedSlice] = useState<string>('slice-urllc-01');
  const [status, setStatus] = useState<SecurityControlStatus | null>(null);
  const [history, setHistory] = useState<SecurityDecisionEntry[]>([]);
  const [cryptoRes, setCryptoRes] = useState<CryptoTestResponse | null>(null);
  const [selectedCipher, setSelectedCipher] = useState<string>('LIGHTWEIGHT_PRESENT_ASCON');
  const [isApplying, setIsApplying] = useState(false);

  const loadControlData = async () => {
    const statusRes = await fetchControlStatus(selectedSlice);
    if (statusRes.data) setStatus(statusRes.data);

    const historyRes = await fetchControlHistory();
    if (historyRes.data) setHistory(historyRes.data);
  };

  const handleTestCrypto = async () => {
    const res = await testCryptoEncryption('5G_Resource_Constrained_mMTC_Sensor_Telemetry_Payload_99', selectedCipher);
    if (res.data) setCryptoRes(res.data);
  };

  useEffect(() => {
    loadControlData();
    handleTestCrypto();
  }, [selectedSlice, selectedCipher]);

  const handleApplyControl = async (actionName: string, agentName: string) => {
    setIsApplying(true);
    await applySecurityControl(selectedSlice, agentName, actionName, 'Manual_RL_Orchestration_Trigger');
    await loadControlData();
    setIsApplying(false);
  };

  return (
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
                Adaptive Security Controller Engine
              </h2>
              <StatusBadge variant="brand">
                4-Dimension Enforcement
              </StatusBadge>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Translates Multi-Agent RL decisions into dynamic Authentication, Encryption, IDS, and Slice Isolation levels
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={selectedSlice}
            onChange={(e) => setSelectedSlice(e.target.value)}
            className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-2 text-[#111111] dark:text-[#F3F4F6] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
          >
            <option value="slice-embb-01">eMBB Video Slicing</option>
            <option value="slice-urllc-01">URLLC Transport Slice</option>
            <option value="slice-mmtc-01">mMTC IoT Mesh</option>
          </select>
        </div>
      </div>

      {/* Active 4-Dimension Security Controls Panel */}
      {status && (
        <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-[#179F99]" />
              <h3 className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider">
                Active 4-Dimension Security Configuration ({status.slice_id})
              </h3>
            </div>
            <StatusBadge variant="teal">
              Posture: {status.overall_security_level}
            </StatusBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Dimension 1: Authentication */}
            <div className="p-4 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-1.5 shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-bold flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-[#1A3C6F] dark:text-[#179F99]" />
                <span>Authentication</span>
              </span>
              <span className="text-xs font-bold font-mono text-[#1A3C6F] dark:text-[#179F99] block truncate">
                {status.controls.authentication}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={() => handleApplyControl('enforce_mfa', 'Application_Layer_Agent')}
                disabled={isApplying}
              >
                Escalate Auth
              </Button>
            </div>

            {/* Dimension 2: Encryption */}
            <div className="p-4 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-1.5 shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-bold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-[#179F99]" />
                <span>Encryption Mode</span>
              </span>
              <span className="text-xs font-bold font-mono text-[#179F99] block truncate">
                {status.controls.encryption}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={() => handleApplyControl('enable_stronger_encryption', 'Physical_Layer_Agent')}
                disabled={isApplying}
              >
                Upgrade Encryption
              </Button>
            </div>

            {/* Dimension 3: Intrusion Detection */}
            <div className="p-4 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-1.5 shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-bold flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-[#1A3C6F] dark:text-[#179F99]" />
                <span>Intrusion Detection</span>
              </span>
              <span className="text-xs font-bold font-mono text-[#111111] dark:text-[#F3F4F6] block truncate">
                {status.controls.intrusion_detection}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={() => handleApplyControl('increase_monitoring', 'MAC_Layer_Agent')}
                disabled={isApplying}
              >
                Increase Monitoring
              </Button>
            </div>

            {/* Dimension 4: Slice Isolation */}
            <div className="p-4 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-1.5 shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-bold flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-[#179F99]" />
                <span>Slice Isolation</span>
              </span>
              <span className="text-xs font-bold font-mono text-[#111111] dark:text-[#F3F4F6] block truncate">
                {status.controls.slice_isolation}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={() => handleApplyControl('isolate_slice', 'Network_Layer_Agent')}
                disabled={isApplying}
              >
                Isolate Slice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightweight Cryptography Prototype Benchmark Section */}
      <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#179F99]" />
            <h3 className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
              Lightweight Cryptography Benchmark
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedCipher}
              onChange={(e) => setSelectedCipher(e.target.value)}
              className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-1.5 text-[#111111] dark:text-[#F3F4F6] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
            >
              <option value="LIGHTWEIGHT_PRESENT_ASCON">ASCON-128 / PRESENT-80 (IoT Cipher)</option>
              <option value="AES_128_GCM">AES-128-GCM Standard 5G Cipher</option>
              <option value="AES_256_GCM_PQC">AES-256-GCM + Post-Quantum Hybrid</option>
              <option value="NONE">Unencrypted Raw Stream</option>
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={handleTestCrypto}
            >
              Test Cipher
            </Button>
          </div>
        </div>

        {cryptoRes && (
          <div className="p-4 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-3 text-xs font-mono shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#EFEFEF] dark:border-[#2E3344] pb-2">
              <span className="font-bold text-[#1A3C6F] dark:text-[#179F99] font-sans">{cryptoRes.cipher_name}</span>
              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] italic">{cryptoRes.disclaimer}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[#111111] dark:text-[#F3F4F6]">
              <div>
                <span className="text-[#6B7280] dark:text-[#9CA3AF] block font-sans">Encrypted Ciphertext:</span>
                <span className="truncate block max-w-[200px]">{cryptoRes.ciphertext}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#9CA3AF] block font-sans">HMAC MAC Tag:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cryptoRes.mac_tag || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#9CA3AF] block font-sans">CPU Overhead:</span>
                <span className="text-[#179F99] font-bold">{cryptoRes.cpu_cycles_per_byte} cycles/byte</span>
              </div>
              <div>
                <span className="text-[#6B7280] dark:text-[#9CA3AF] block font-sans">Latency Penalty:</span>
                <span className="font-bold">+{cryptoRes.latency_overhead_ms} ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Decision Log History Table (Clean Borderless Row-Card Architecture per Section 4) */}
      <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#179F99]" />
            <h3 className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider font-sans">
              Security Decision Audit Log ({history.length} Entries)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-xl border border-[#EFEFEF] dark:border-[#2E3344] custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-white dark:bg-[#1A1D26] border-b border-[#EFEFEF] dark:border-[#2E3344] text-[#6B7280] dark:text-[#9CA3AF] font-sans font-bold">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Slice</th>
                <th className="py-2.5 px-3">RL Agent</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Level Change</th>
                <th className="py-2.5 px-3">Reason Explanation</th>
                <th className="py-2.5 px-3">Latency Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF] dark:divide-[#2E3344] text-[#111111] dark:text-[#F3F4F6]">
              {history.map((item) => (
                <tr key={item.entry_id} className="hover:bg-white/80 dark:hover:bg-[#1A1D26]/80 transition-colors">
                  <td className="py-2.5 px-3 text-[#1A3C6F] dark:text-[#179F99] font-bold">{item.entry_id}</td>
                  <td className="py-2.5 px-3 font-semibold">{item.slice_id}</td>
                  <td className="py-2.5 px-3 text-[#6B7280] dark:text-[#9CA3AF]">{item.rl_agent}</td>
                  <td className="py-2.5 px-3 font-bold text-[#179F99]">{item.action_taken}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">{item.previous_security_level}</span> &rarr;{' '}
                    <strong className="text-[#1A3C6F] dark:text-[#179F99]">{item.new_security_level}</strong>
                  </td>
                  <td className="py-2.5 px-3 text-[#6B7280] dark:text-[#9CA3AF] max-w-xs truncate">{item.reason}</td>
                  <td className="py-2.5 px-3 text-[#179F99] font-bold">+{item.latency_impact_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
