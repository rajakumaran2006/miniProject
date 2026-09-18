'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Network,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Skull,
  Lock,
  RefreshCw,
  RotateCcw,
  Activity,
  Server,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import {
  fetchOVSStatus,
  fetchOVSFlows,
  injectOVSAttack,
  mitigateOVSThreat,
  resetOVSNetwork,
} from '@/lib/api';
import { OVSBridgeStatus, OpenFlowRule } from '@/types';

interface OVSNetworkCardProps {
  onRefreshParent?: () => void;
}

export const OVSNetworkCard: React.FC<OVSNetworkCardProps> = ({ onRefreshParent }) => {
  const [status, setStatus] = useState<OVSBridgeStatus | null>(null);
  const [flows, setFlows] = useState<OpenFlowRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [attackType, setAttackType] = useState<string>('DOS');
  const [targetSlice, setTargetSlice] = useState<string>('slice-urllc-01');
  const [intensity, setIntensity] = useState<number>(0.85);
  const [packetRate, setPacketRate] = useState<number>(8000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadOVSData = useCallback(async () => {
    const [statusRes, flowsRes] = await Promise.all([fetchOVSStatus(), fetchOVSFlows()]);
    if (statusRes.data) setStatus(statusRes.data);
    if (flowsRes.data) setFlows(flowsRes.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOVSData();
    const interval = setInterval(loadOVSData, 3000);
    return () => clearInterval(interval);
  }, [loadOVSData]);

  const handleLaunchAttack = async () => {
    setIsSubmitting(true);
    setActionMessage(null);
    const res = await injectOVSAttack(attackType, targetSlice, intensity, packetRate);
    if (res.data) {
      setActionMessage(`Attack launched: ${attackType} -> ${targetSlice}`);
      await loadOVSData();
      if (onRefreshParent) onRefreshParent();
    }
    setIsSubmitting(false);
  };

  const handleMitigate = async (action: string) => {
    setIsSubmitting(true);
    setActionMessage(null);
    const res = await mitigateOVSThreat(action, '172.28.0.99', targetSlice);
    if (res.data) {
      setActionMessage(`OpenFlow rule enforced: ${res.data.rule_description}`);
      await loadOVSData();
      if (onRefreshParent) onRefreshParent();
    }
    setIsSubmitting(false);
  };

  const handleReset = async () => {
    setIsSubmitting(true);
    setActionMessage(null);
    await resetOVSNetwork();
    await loadOVSData();
    if (onRefreshParent) onRefreshParent();
    setIsSubmitting(false);
  };

  const isUnderAttack = status?.active_attack && !status?.mitigation_active;
  const isMitigated = status?.mitigation_active;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-200 shadow-sm">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Open vSwitch (OVS) Overlay Virtual Network
                </h1>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-sm ${
                    status?.backend_mode === 'DOCKER_OVS'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}
                >
                  {status?.backend_mode || 'NATIVE_EMULATOR'}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  OpenFlow 1.3
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Logical 5G Slicing Network Bridge (<code className="font-mono text-slate-700">{status?.bridge_name || 'br-slicing'}</code>) with dynamic OpenFlow flow-table enforcement
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={loadOVSData}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Flows</span>
            </button>
            <button
              onClick={handleReset}
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-medium text-blue-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* Network Topology Visualizer */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold tracking-tight text-slate-900">Virtual Network Topology & Node Telemetry</h2>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1.5 text-emerald-600 font-semibold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Bridge UP</span>
            </span>
          </div>
        </div>

        {/* Node Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {status?.ports.map((port) => {
            const isTarget = isUnderAttack && status.active_attack?.target_slice_id === port.slice_id;
            const isAttacker = port.port_name === 'veth-atk';

            return (
              <div
                key={port.port_name}
                className={`rounded-[22px] p-4.5 border transition-all ${
                  isTarget
                    ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400 shadow-md'
                    : isAttacker && isUnderAttack
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400'
                    : isMitigated && isTarget
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{port.port_name}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">
                    VLAN {port.vlan_tag}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mb-3">
                  <div className="font-semibold text-slate-800">{port.slice_id}</div>
                  <div className="font-mono text-[11px] text-slate-700">{port.ip_address}</div>
                  <div className="font-mono text-[10px] text-slate-400">{port.mac_address}</div>
                </div>

                <div className="border-t border-slate-200/60 pt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-600 text-center">
                  <div>
                    <div className="text-slate-400 font-medium">RX Pkts</div>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">
                      {port.rx_packets.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">TX Pkts</div>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">
                      {port.tx_packets.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Dropped</div>
                    <div
                      className={`font-mono font-bold mt-0.5 ${
                        port.rx_dropped > 0 ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {port.rx_dropped.toLocaleString()}
                    </div>
                  </div>
                </div>

                {isTarget && (
                  <div className="mt-2.5 text-[11px] font-bold text-rose-700 flex items-center space-x-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>TARGET UNDER ATTACK</span>
                  </div>
                )}
                {isMitigated && isTarget && (
                  <div className="mt-2.5 text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PROTECTED BY OPENFLOW</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attack Generation & Resolution Split Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Attack Generator */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 shadow-sm">
              <Skull className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">OVS Attack Generator</h3>
              <p className="text-xs text-slate-500">Inject real datagram flows into the Open vSwitch bridge</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Attack Threat Vector</label>
              <select
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="DOS">Denial-of-Service (UDP Packet Flood)</option>
                <option value="SPOOFING">Identity Spoofing (Forged SUCI / MAC Frames)</option>
                <option value="ISOLATION_BREACH">Cross-Slice Isolation Breach (VLAN Leaking)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Slice Endpoint</label>
              <select
                value={targetSlice}
                onChange={(e) => setTargetSlice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="slice-urllc-01">URLLC Slice (172.28.0.20 - Mission Critical)</option>
                <option value="slice-embb-01">eMBB Slice (172.28.0.10 - Video Telemetry)</option>
                <option value="slice-mmtc-01">mMTC Slice (172.28.0.30 - IoT Mesh)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Packet Rate: <span className="font-mono text-blue-600">{packetRate} pps</span>
                </label>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={1000}
                  value={packetRate}
                  onChange={(e) => setPacketRate(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Intensity: <span className="font-mono text-blue-600">{Math.round(intensity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.05}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleLaunchAttack}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold rounded-2xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Attack on OVS Network</span>
            </button>
          </div>
        </div>

        {/* Real OpenFlow Defense & Resolution Panel */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">OpenFlow Defense & Resolution</h3>
              <p className="text-xs text-slate-500">
                Push wire-speed OpenFlow 1.3 rules to mitigate threats in real time
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {isUnderAttack ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ACTIVE THREAT DETECTED ON OVS BRIDGE</span>
                </div>
                <div className="text-xs text-rose-700 mt-1">
                  Attacker (<code className="font-mono font-bold">172.28.0.99</code>) is flooding packets at <code className="font-mono font-bold">{status?.active_attack?.target_ip}</code>. Latency and packet drops are rising!
                </div>
              </div>
            ) : isMitigated ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>THREAT MITIGATED AT WIRE-SPEED</span>
                </div>
                <div className="text-xs text-emerald-700 mt-1 font-mono">
                  {status?.active_mitigation_rule || 'Active OpenFlow DROP rule enforcing microsegmentation.'}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600">
                Network is operating normally. Flow tables are processing standard slice forwarding rules.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={() => handleMitigate('DROP')}
                disabled={isSubmitting}
                className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all text-center"
              >
                Wire-Speed DROP
              </button>
              <button
                onClick={() => handleMitigate('RATE_LIMIT')}
                disabled={isSubmitting}
                className="py-3 px-3 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white text-xs font-bold rounded-2xl shadow-md shadow-amber-600/20 transition-all text-center"
              >
                QoS Meter Limit
              </button>
              <button
                onClick={() => handleMitigate('ISOLATE')}
                disabled={isSubmitting}
                className="py-3 px-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-bold rounded-2xl shadow-md shadow-slate-900/20 transition-all text-center"
              >
                Air-Gap Port
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OpenFlow 1.3 Flow Table Inspector */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold tracking-tight text-slate-900">
              Active OpenFlow 1.3 Flow Table (<code className="font-mono text-slate-700 font-normal">ovs-ofctl dump-flows</code>)
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {flows.length} flow rules active
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-3.5">Rule ID</th>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5">Match Condition</th>
                <th className="py-3 px-3.5">Enforced Action</th>
                <th className="py-3 px-3.5 text-right">Packets Hit</th>
                <th className="py-3 px-3.5 text-right">Bytes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flows.map((flow) => {
                const isDrop = flow.actions.toLowerCase().includes('drop');
                const isHighPriority = flow.priority >= 90;

                return (
                  <tr
                    key={flow.rule_id}
                    className={`hover:bg-slate-50/70 font-mono text-[11px] transition-colors ${
                      isDrop && isHighPriority ? 'bg-rose-50/60 text-rose-950 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3.5 text-slate-500">{flow.rule_id}</td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isHighPriority
                            ? 'bg-rose-100 text-rose-800'
                            : flow.priority > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {flow.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-800 max-w-xs truncate">{flow.match}</td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isDrop
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {flow.actions}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-700 font-semibold">
                      {flow.packet_count.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-600">
                      {(flow.byte_count / 1024).toFixed(1)} KB
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
