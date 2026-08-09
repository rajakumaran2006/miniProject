'use client';

import React, { useState, useEffect } from 'react';
import { CryptoTestResponse, SecurityControlStatus, SecurityDecisionEntry } from '@/types';
import { applySecurityControl, fetchControlHistory, fetchControlStatus, testCryptoEncryption } from '@/lib/api';
import { Sliders, Shield, Key, Lock, Eye, Layers, FileText, CheckCircle2, Cpu, Zap, Activity } from 'lucide-react';

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
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-cyan/10 rounded-xl text-network-cyan border border-network-cyan/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Adaptive Security Controller Engine</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-network-cyan/20 text-network-cyan border border-network-cyan/30">
                4-Dimension Enforcement & Audit Logger
              </span>
            </div>
            <p className="text-xs text-gray-400">Translates Multi-Agent RL decisions into dynamic Authentication, Encryption, IDS, and Slice Isolation levels</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={selectedSlice}
            onChange={(e) => setSelectedSlice(e.target.value)}
            className="bg-network-dark border border-network-border rounded-xl px-3 py-2 text-gray-200 font-semibold focus:outline-none focus:border-network-cyan"
          >
            <option value="slice-embb-01">eMBB Video Slicing</option>
            <option value="slice-urllc-01">URLLC Transport Slice</option>
            <option value="slice-mmtc-01">mMTC IoT Mesh</option>
          </select>
        </div>
      </div>

      {/* Active 4-Dimension Security Controls Panel */}
      {status && (
        <div className="p-5 bg-network-dark/60 border border-network-border rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-network-border pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-network-cyan" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Active 4-Dimension Security Configuration ({status.slice_id})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-network-emerald font-bold">
              Overall Security Posture: {status.overall_security_level}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Dimension 1: Authentication */}
            <div className="p-3 bg-network-card border border-network-border rounded-lg space-y-1">
              <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-network-cyan" />
                <span>Authentication</span>
              </span>
              <span className="text-xs font-bold font-mono text-network-cyan block">
                {status.controls.authentication}
              </span>
              <button
                onClick={() => handleApplyControl('enforce_mfa', 'Application_Layer_Agent')}
                disabled={isApplying}
                className="mt-2 w-full py-1 bg-network-cyan/10 hover:bg-network-cyan/20 border border-network-cyan/30 text-network-cyan text-[10px] font-bold rounded transition-all"
              >
                Escalate Auth
              </button>
            </div>

            {/* Dimension 2: Encryption */}
            <div className="p-3 bg-network-card border border-network-border rounded-lg space-y-1">
              <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-network-emerald" />
                <span>Encryption Mode</span>
              </span>
              <span className="text-xs font-bold font-mono text-network-emerald block truncate">
                {status.controls.encryption}
              </span>
              <button
                onClick={() => handleApplyControl('enable_stronger_encryption', 'Physical_Layer_Agent')}
                disabled={isApplying}
                className="mt-2 w-full py-1 bg-network-emerald/10 hover:bg-network-emerald/20 border border-network-emerald/30 text-network-emerald text-[10px] font-bold rounded transition-all"
              >
                Upgrade Encryption
              </button>
            </div>

            {/* Dimension 3: Intrusion Detection */}
            <div className="p-3 bg-network-card border border-network-border rounded-lg space-y-1">
              <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-network-blue" />
                <span>Intrusion Detection</span>
              </span>
              <span className="text-xs font-bold font-mono text-network-blue block">
                {status.controls.intrusion_detection}
              </span>
              <button
                onClick={() => handleApplyControl('increase_monitoring', 'MAC_Layer_Agent')}
                disabled={isApplying}
                className="mt-2 w-full py-1 bg-network-blue/10 hover:bg-network-blue/20 border border-network-blue/30 text-network-blue text-[10px] font-bold rounded transition-all"
              >
                Increase Monitoring
              </button>
            </div>

            {/* Dimension 4: Slice Isolation */}
            <div className="p-3 bg-network-card border border-network-border rounded-lg space-y-1">
              <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-network-purple" />
                <span>Slice Isolation</span>
              </span>
              <span className="text-xs font-bold font-mono text-network-purple block">
                {status.controls.slice_isolation}
              </span>
              <button
                onClick={() => handleApplyControl('isolate_slice', 'Network_Layer_Agent')}
                disabled={isApplying}
                className="mt-2 w-full py-1 bg-network-purple/10 hover:bg-network-purple/20 border border-network-purple/30 text-network-purple text-[10px] font-bold rounded transition-all"
              >
                Isolate Slice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightweight Cryptography Prototype Benchmark Section */}
      <div className="p-5 bg-network-dark/80 border border-network-border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-network-emerald" />
            <h3 className="text-sm font-bold text-white">Lightweight Cryptography Prototype Benchmark</h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedCipher}
              onChange={(e) => setSelectedCipher(e.target.value)}
              className="bg-network-card border border-network-border rounded-lg px-3 py-1.5 text-gray-200 font-semibold focus:outline-none focus:border-network-cyan"
            >
              <option value="LIGHTWEIGHT_PRESENT_ASCON">ASCON-128 / PRESENT-80 (IoT Cipher)</option>
              <option value="AES_128_GCM">AES-128-GCM Standard 5G Cipher</option>
              <option value="AES_256_GCM_PQC">AES-256-GCM + Post-Quantum Hybrid</option>
              <option value="NONE">Unencrypted Raw Stream</option>
            </select>

            <button
              onClick={handleTestCrypto}
              className="px-3 py-1.5 bg-network-emerald/20 text-network-emerald border border-network-emerald/40 hover:bg-network-emerald/30 font-bold rounded-lg transition-all"
            >
              Test Cipher
            </button>
          </div>
        </div>

        {cryptoRes && (
          <div className="p-4 bg-network-card border border-network-border rounded-lg space-y-3 text-xs font-mono">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-network-border pb-2">
              <span className="font-bold text-network-cyan">{cryptoRes.cipher_name}</span>
              <span className="text-[10px] text-gray-400 italic">{cryptoRes.disclaimer}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-gray-300">
              <div>
                <span className="text-gray-500 block">Encrypted Ciphertext:</span>
                <span className="text-network-emerald truncate block max-w-[200px]">{cryptoRes.ciphertext}</span>
              </div>
              <div>
                <span className="text-gray-500 block">HMAC MAC Tag:</span>
                <span className="text-amber-400 font-bold">{cryptoRes.mac_tag || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">CPU Overhead:</span>
                <span className="text-network-purple font-bold">{cryptoRes.cpu_cycles_per_byte} cycles/byte</span>
              </div>
              <div>
                <span className="text-gray-500 block">Latency Penalty:</span>
                <span className="text-network-cyan font-bold">+{cryptoRes.latency_overhead_ms} ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Decision Log History Table */}
      <div className="p-5 bg-network-dark/60 border border-network-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-network-cyan" />
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              Security Decision Audit Log ({history.length} Decision Entries)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-network-dark border-b border-network-border text-gray-400">
              <tr>
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Slice</th>
                <th className="py-2 px-2">RL Agent</th>
                <th className="py-2 px-2">Action</th>
                <th className="py-2 px-2">Level Change</th>
                <th className="py-2 px-2">Reason Explanation</th>
                <th className="py-2 px-2">Latency Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-network-border/40 text-gray-300">
              {history.map((item) => (
                <tr key={item.entry_id} className="hover:bg-network-card/60">
                  <td className="py-2 px-2 text-network-cyan font-bold">{item.entry_id}</td>
                  <td className="py-2 px-2 text-gray-200">{item.slice_id}</td>
                  <td className="py-2 px-2 text-network-purple">{item.rl_agent}</td>
                  <td className="py-2 px-2 font-bold text-network-emerald">{item.action_taken}</td>
                  <td className="py-2 px-2">
                    <span className="text-gray-400">{item.previous_security_level}</span> &rarr;{' '}
                    <strong className="text-network-cyan">{item.new_security_level}</strong>
                  </td>
                  <td className="py-2 px-2 text-gray-300 max-w-xs truncate">{item.reason}</td>
                  <td className="py-2 px-2 text-amber-400 font-bold">+{item.latency_impact_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
