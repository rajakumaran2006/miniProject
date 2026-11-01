'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Network,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  RotateCcw,
  Server,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  fetchOVSStatus,
  fetchOVSFlows,
  injectOVSAttack,
  mitigateOVSThreat,
  resetOVSNetwork,
} from '@/lib/api';
import { OVSBridgeStatus, OpenFlowRule } from '@/types';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
      <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-[#1A3C6F] text-white rounded-xl shadow-xs">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h1 className="text-xl font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
                  Open vSwitch (OVS) Overlay Virtual Network
                </h1>
                <StatusBadge
                  variant={status?.backend_mode === 'DOCKER_OVS' ? 'active' : 'teal'}
                  dot
                >
                  {status?.backend_mode || 'NATIVE_EMULATOR'}
                </StatusBadge>
                <StatusBadge variant="brand">
                  OpenFlow 1.3
                </StatusBadge>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                Logical 5G Slicing Network Bridge (
                <code className="font-mono text-[#111111] dark:text-[#F3F4F6]">
                  {status?.bridge_name || 'br-slicing'}
                </code>
                ) with dynamic OpenFlow flow-table enforcement
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadOVSData}
              disabled={isLoading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh Flows
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={isSubmitting}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Baseline
            </Button>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* Network Topology Visualizer */}
      <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-[#1A3C6F] dark:text-[#179F99]" />
            <h2 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
              Virtual Network Topology & Node Telemetry
            </h2>
          </div>
          <StatusBadge variant="active" dot>
            Bridge UP
          </StatusBadge>
        </div>

        {/* Node Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {status?.ports.map((port) => {
            const isTarget = isUnderAttack && status.active_attack?.target_slice_id === port.slice_id;
            const isAttacker = port.port_name === 'veth-atk';

            return (
              <div
                key={port.port_name}
                className={`rounded-xl p-4.5 border transition-all ${
                  isTarget
                    ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-400 ring-1 ring-rose-500 shadow-md'
                    : isAttacker && isUnderAttack
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-400 ring-1 ring-amber-500'
                    : isMitigated && isTarget
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-400'
                    : 'bg-[#F5F5F7] dark:bg-[#222632] border-[#EFEFEF] dark:border-[#2E3344] hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6]">
                    {port.port_name}
                  </span>
                  <StatusBadge variant="brand">
                    VLAN {port.vlan_tag}
                  </StatusBadge>
                </div>

                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] space-y-1 mb-3">
                  <div className="font-semibold text-[#111111] dark:text-[#F3F4F6]">
                    {port.slice_id}
                  </div>
                  <div className="font-mono text-[11px] text-[#111111] dark:text-[#F3F4F6]">
                    {port.ip_address}
                  </div>
                  <div className="font-mono text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                    {port.mac_address}
                  </div>
                </div>

                <div className="border-t border-[#EFEFEF] dark:border-[#2E3344] pt-2 grid grid-cols-3 gap-1 text-[10px] text-[#6B7280] dark:text-[#9CA3AF] text-center">
                  <div>
                    <div className="font-medium">RX Pkts</div>
                    <div className="font-mono font-bold text-[#111111] dark:text-[#F3F4F6] mt-0.5">
                      {port.rx_packets.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">TX Pkts</div>
                    <div className="font-mono font-bold text-[#111111] dark:text-[#F3F4F6] mt-0.5">
                      {port.tx_packets.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Dropped</div>
                    <div
                      className={`font-mono font-bold mt-0.5 ${
                        port.rx_dropped > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#111111] dark:text-[#F3F4F6]'
                      }`}
                    >
                      {port.rx_dropped.toLocaleString()}
                    </div>
                  </div>
                </div>

                {isTarget && (
                  <div className="mt-2.5">
                    <StatusBadge variant="critical" dot>
                      TARGET UNDER ATTACK
                    </StatusBadge>
                  </div>
                )}
                {isMitigated && isTarget && (
                  <div className="mt-2.5">
                    <StatusBadge variant="active" dot>
                      PROTECTED BY OPENFLOW
                    </StatusBadge>
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
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
                OVS Attack Generator
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Inject real datagram flows into the Open vSwitch bridge
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block mb-1">
                Attack Threat Vector
              </label>
              <select
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                className="w-full bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F] transition-all"
              >
                <option value="DOS">Denial-of-Service (UDP Packet Flood)</option>
                <option value="SPOOFING">Identity Spoofing (Forged SUCI / MAC Frames)</option>
                <option value="ISOLATION_BREACH">Cross-Slice Isolation Breach (VLAN Leaking)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block mb-1">
                Target Slice Endpoint
              </label>
              <select
                value={targetSlice}
                onChange={(e) => setTargetSlice(e.target.value)}
                className="w-full bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F] transition-all"
              >
                <option value="slice-urllc-01">URLLC Slice (172.28.0.20 - Mission Critical)</option>
                <option value="slice-embb-01">eMBB Slice (172.28.0.10 - Video Telemetry)</option>
                <option value="slice-mmtc-01">mMTC Slice (172.28.0.30 - IoT Mesh)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F5F5F7] dark:bg-[#222632] p-3 rounded-xl border border-[#EFEFEF] dark:border-[#2E3344]">
                <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block mb-1">
                  Packet Rate: <span className="font-mono text-[#179F99]">{packetRate} pps</span>
                </label>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={1000}
                  value={packetRate}
                  onChange={(e) => setPacketRate(Number(e.target.value))}
                  className="w-full accent-[#1A3C6F] cursor-pointer"
                />
              </div>
              <div className="bg-[#F5F5F7] dark:bg-[#222632] p-3 rounded-xl border border-[#EFEFEF] dark:border-[#2E3344]">
                <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block mb-1">
                  Intensity: <span className="font-mono text-[#179F99]">{Math.round(intensity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.05}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-[#1A3C6F] cursor-pointer"
                />
              </div>
            </div>

            <Button
              variant="danger"
              className="w-full"
              size="lg"
              onClick={handleLaunchAttack}
              disabled={isSubmitting}
              icon={<Zap className="w-4 h-4" />}
            >
              Launch Attack on OVS Network
            </Button>
          </div>
        </div>

        {/* Real OpenFlow Defense & Resolution Panel */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#1A3C6F] text-white rounded-xl shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
                OpenFlow Defense & Resolution
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Push wire-speed OpenFlow 1.3 rules to mitigate threats in real time
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {isUnderAttack ? (
              <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900 rounded-xl">
                <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-200 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>ACTIVE THREAT DETECTED ON OVS BRIDGE</span>
                </div>
                <div className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                  Attacker (<code className="font-mono font-bold">172.28.0.99</code>) is flooding packets at <code className="font-mono font-bold">{status?.active_attack?.target_ip}</code>. Latency and packet drops are rising!
                </div>
              </div>
            ) : isMitigated ? (
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>THREAT MITIGATED AT WIRE-SPEED</span>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 font-mono">
                  {status?.active_mitigation_rule || 'Active OpenFlow DROP rule enforcing microsegmentation.'}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Network is operating normally. Flow tables are processing standard slice forwarding rules.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <Button
                variant="danger"
                size="md"
                onClick={() => handleMitigate('DROP')}
                disabled={isSubmitting}
                className="w-full"
              >
                Wire-Speed DROP
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleMitigate('RATE_LIMIT')}
                disabled={isSubmitting}
                className="w-full"
              >
                QoS Meter Limit
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleMitigate('ISOLATE')}
                disabled={isSubmitting}
                className="w-full"
              >
                Air-Gap Port
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* OpenFlow 1.3 Flow Table Inspector (Clean Borderless Row-Card Architecture per Section 4) */}
      <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#1A3C6F] dark:text-[#179F99]" />
            <h3 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
              Active OpenFlow 1.3 Flow Table (
              <code className="font-mono text-[#6B7280] dark:text-[#9CA3AF] font-normal">
                ovs-ofctl dump-flows
              </code>
              )
            </h3>
          </div>
          <StatusBadge variant="teal">
            {flows.length} flow rules active
          </StatusBadge>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#EFEFEF] dark:border-[#2E3344]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EFEFEF] dark:border-[#2E3344] bg-[#F5F5F7] dark:bg-[#222632] text-[#6B7280] dark:text-[#9CA3AF] font-bold">
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Match Condition</th>
                <th className="py-3 px-4">Enforced Action</th>
                <th className="py-3 px-4 text-right">Packets Hit</th>
                <th className="py-3 px-4 text-right">Bytes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF] dark:divide-[#2E3344]">
              {flows.map((flow) => {
                const isDrop = flow.actions.toLowerCase().includes('drop');
                const isHighPriority = flow.priority >= 90;

                return (
                  <tr
                    key={flow.rule_id}
                    className={`hover:bg-[#F5F5F7]/80 dark:hover:bg-[#222632]/80 font-mono text-[11px] transition-colors ${
                      isDrop && isHighPriority ? 'bg-rose-50/40 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 font-semibold' : 'text-[#111111] dark:text-[#F3F4F6]'
                    }`}
                  >
                    <td className="py-3 px-4 text-[#6B7280] dark:text-[#9CA3AF]">{flow.rule_id}</td>
                    <td className="py-3 px-4">
                      <StatusBadge variant={isHighPriority ? 'critical' : flow.priority > 0 ? 'brand' : 'neutral'}>
                        {flow.priority}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">{flow.match}</td>
                    <td className="py-3 px-4">
                      <StatusBadge variant={isDrop ? 'critical' : 'active'}>
                        {flow.actions}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {flow.packet_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B7280] dark:text-[#9CA3AF]">
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
