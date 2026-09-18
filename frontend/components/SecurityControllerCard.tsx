'use client';

import React, { useState, useEffect } from 'react';
import { CryptoTestResponse, SecurityControlStatus, SecurityDecisionEntry } from '@/types';
import { applySecurityControl, fetchControlHistory, fetchControlStatus, testCryptoEncryption } from '@/lib/api';
import { Sliders, Shield, Key, Lock, Eye, Layers, FileText } from 'lucide-react';

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
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-200">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-secondary-900">Adaptive Security Controller Engine</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                4-Dimension Enforcement & Audit Logger
              </span>
            </div>
            <p className="text-xs text-secondary-500">Translates Multi-Agent RL decisions into dynamic Authentication, Encryption, IDS, and Slice Isolation levels</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={selectedSlice}
            onChange={(e) => setSelectedSlice(e.target.value)}
            className="bg-white border border-secondary-300 rounded-xl px-3 py-2 text-secondary-800 font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value="slice-embb-01">eMBB Video Slicing</option>
            <option value="slice-urllc-01">URLLC Transport Slice</option>
            <option value="slice-mmtc-01">mMTC IoT Mesh</option>
          </select>
        </div>
      </div>

      {/* Active 4-Dimension Security Controls Panel */}
      {status && (
        <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-bold text-secondary-700 uppercase tracking-wider">
                Active 4-Dimension Security Configuration ({status.slice_id})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-primary-700 font-bold">
              Posture: {status.overall_security_level}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Dimension 1: Authentication */}
            <div className="p-3 bg-white border border-secondary-200 rounded-lg space-y-1 shadow-sm">
              <span className="text-[11px] text-secondary-500 font-semibold flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-primary-600" />
                <span>Authentication</span>
              </span>
              <span className="text-xs font-bold font-mono text-primary-700 block truncate">
                {status.controls.authentication}
              </span>
              <button
                onClick={() => handleApplyControl('enforce_mfa', 'Application_Layer_Agent')}
                disabled={isApplying}
                className="mt-2 w-full py-1.5 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 text-secondary-800 text-[10px] font-bold rounded shadow-sm transition-all"
              >
                Escalate Auth
              </button>
            </div>

            {/* Dimension 2: Encryption */}
            <div className="p-3 bg-white border border-secondary-200 rounded-lg space-y-1 shadow-sm">
              <span className="text-[11px] text-secondary-500 font-semibold flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-tertiary-700" />
                <span>Encryption Mode</span>
              </span>
              <span className="text-xs font-bold font-mono text-tertiary-700 block truncate">
                {status.controls.encryption}
              </span>
              <button
                onClick={() => handleApplyControl('enable_stronger_encryption', 'Physical_Layer_Agent')}
                disabled={isApplying}
                className="mt-2 w-full py-1.5 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 text-secondary-800 text-[10px] font-bold rounded shadow-sm transition-all"
              >
                Upgrade Encryption
              </button>
            </div>

            {/* Dimension 3: Intrusion Detection */}
            <div className="p-3 bg-white border border-secondary-200 rounded-lg space-y-1 shadow-sm">
              <span className="text-[11px] text-secondary-500 font-semibold flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-primary-600" />
                <span>Intrusion Detection</span>
              </span>
              <span className="text-xs font-bold font-mono text-secondary-900 block truncate">
                {status.controls.intrusion_detection}
              </span>
              <button
                onClick={() => handleApplyControl('increase_monitoring', 'MAC_Layer_Agent')}
                disabled={isApplying}
                className="mt-2 w-full py-1.5 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 text-secondary-800 text-[10px] font-bold rounded shadow-sm transition-all"
              >
                Increase Monitoring
              </button>
            </div>

            {/* Dimension 4: Slice Isolation */}
            <div className="p-3 bg-white border border-secondary-200 rounded-lg space-y-1 shadow-sm">
              <span className="text-[11px] text-secondary-500 font-semibold flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-secondary-600" />
                <span>Slice Isolation</span>
              </span>
              <span className="text-xs font-bold font-mono text-secondary-900 block truncate">
                {status.controls.slice_isolation}
              </span>
              <button
                onClick={() => handleApplyControl('isolate_slice', 'Network_Layer_Agent')}
                disabled={isApplying}
                className="mt-2 w-full py-1.5 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 text-secondary-800 text-[10px] font-bold rounded shadow-sm transition-all"
              >
                Isolate Slice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightweight Cryptography Prototype Benchmark Section */}
      <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-bold text-secondary-900">Lightweight Cryptography Benchmark</h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedCipher}
              onChange={(e) => setSelectedCipher(e.target.value)}
              className="bg-white border border-secondary-300 rounded-lg px-3 py-1.5 text-secondary-800 font-semibold focus:outline-none focus:border-primary-500"
            >
              <option value="LIGHTWEIGHT_PRESENT_ASCON">ASCON-128 / PRESENT-80 (IoT Cipher)</option>
              <option value="AES_128_GCM">AES-128-GCM Standard 5G Cipher</option>
              <option value="AES_256_GCM_PQC">AES-256-GCM + Post-Quantum Hybrid</option>
              <option value="NONE">Unencrypted Raw Stream</option>
            </select>

            <button
              onClick={handleTestCrypto}
              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm transition-all"
            >
              Test Cipher
            </button>
          </div>
        </div>

        {cryptoRes && (
          <div className="p-4 bg-white border border-secondary-200 rounded-lg space-y-3 text-xs font-mono shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-secondary-100 pb-2">
              <span className="font-bold text-primary-700">{cryptoRes.cipher_name}</span>
              <span className="text-[10px] text-secondary-500 italic">{cryptoRes.disclaimer}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-secondary-700">
              <div>
                <span className="text-secondary-500 block">Encrypted Ciphertext:</span>
                <span className="text-secondary-900 truncate block max-w-[200px]">{cryptoRes.ciphertext}</span>
              </div>
              <div>
                <span className="text-secondary-500 block">HMAC MAC Tag:</span>
                <span className="text-primary-600 font-bold">{cryptoRes.mac_tag || 'N/A'}</span>
              </div>
              <div>
                <span className="text-secondary-500 block">CPU Overhead:</span>
                <span className="text-tertiary-700 font-bold">{cryptoRes.cpu_cycles_per_byte} cycles/byte</span>
              </div>
              <div>
                <span className="text-secondary-500 block">Latency Penalty:</span>
                <span className="text-secondary-900 font-bold">+{cryptoRes.latency_overhead_ms} ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Decision Log History Table */}
      <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-primary-600" />
            <h3 className="text-xs font-bold text-secondary-700 uppercase tracking-wider">
              Security Decision Audit Log ({history.length} Entries)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-secondary-100 border-b border-secondary-200 text-secondary-600">
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
            <tbody className="divide-y divide-secondary-200 text-secondary-700">
              {history.map((item) => (
                <tr key={item.entry_id} className="hover:bg-white">
                  <td className="py-2 px-2 text-primary-700 font-bold">{item.entry_id}</td>
                  <td className="py-2 px-2 text-secondary-900">{item.slice_id}</td>
                  <td className="py-2 px-2 text-secondary-700">{item.rl_agent}</td>
                  <td className="py-2 px-2 font-bold text-primary-600">{item.action_taken}</td>
                  <td className="py-2 px-2">
                    <span className="text-secondary-500">{item.previous_security_level}</span> &rarr;{' '}
                    <strong className="text-primary-700">{item.new_security_level}</strong>
                  </td>
                  <td className="py-2 px-2 text-secondary-600 max-w-xs truncate">{item.reason}</td>
                  <td className="py-2 px-2 text-tertiary-700 font-bold">+{item.latency_impact_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
