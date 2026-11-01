'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Network,
  Activity,
  Terminal,
  Send,
  ShieldCheck,
  Server,
  Radio,
  Play,
  Pause,
  RefreshCw,
  Layers,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import {
  fetchOVSConnectivity,
  runOVSPing,
  fetchOVSPacketStream,
} from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const NetworkConnectivityView: React.FC = () => {
  const [connectivity, setConnectivity] = useState<any | null>(null);
  const [packets, setPackets] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [sourceIp, setSourceIp] = useState<string>('172.28.0.10');
  const [targetIp, setTargetIp] = useState<string>('172.28.0.20');
  const [pingRunning, setPingRunning] = useState<boolean>(false);
  const [pingOutput, setPingOutput] = useState<string[]>([
    'Ready for live ping test. Select source and target nodes and click "Execute Live Ping".',
  ]);
  const [filterProto, setFilterProto] = useState<string>('ALL');

  const loadData = useCallback(async () => {
    const connRes = await fetchOVSConnectivity();
    if (connRes.data) setConnectivity(connRes.data);

    if (isStreaming) {
      const pktRes = await fetchOVSPacketStream(35);
      if (pktRes.data && pktRes.data.length > 0) {
        setPackets(pktRes.data);
      }
    }
  }, [isStreaming]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleExecutePing = async () => {
    setPingRunning(true);
    setPingOutput([`Initiating ICMP Echo to ${targetIp} from ${sourceIp}...`]);

    const res = await runOVSPing(sourceIp, targetIp, 4);
    if (res.data) {
      setPingOutput(res.data.output_lines);
    } else {
      setPingOutput([`Error: ${res.error || 'Host unreachable'}`]);
    }
    setPingRunning(false);
  };

  const isUnderAttack = connectivity?.active_attack && !connectivity?.is_mitigated;
  const isMitigated = connectivity?.is_mitigated;

  const filteredPackets = packets.filter((p) => {
    if (filterProto === 'ALL') return true;
    return p.protocol === filterProto;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-[#1A3C6F] text-white rounded-xl shadow-xs">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <h1 className="text-xl font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
                  Virtual Network Connectivity & Data Flow
                </h1>
                <StatusBadge variant="active" dot>
                  LIVE WIRE CONNECTED
                </StatusBadge>
                <StatusBadge variant="brand">
                  Bridge: br-slicing
                </StatusBadge>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                Real-time visual node connectivity, animated packet transmissions, live ICMP ping latency, and raw packet stream
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Button
              variant={isStreaming ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setIsStreaming(!isStreaming)}
              icon={isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isStreaming ? 'Pause Stream' : 'Resume Stream'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadData}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Visual Network Topology Canvas with Animated Data Flows */}
      <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs overflow-hidden relative">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#1A3C6F] dark:text-[#179F99]" />
            <h2 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
              Live Animated Data Flow Canvas
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1">
            <StatusBadge variant="brand">
              eMBB (UDP)
            </StatusBadge>
            <StatusBadge variant="teal">
              URLLC (TCP)
            </StatusBadge>
            <StatusBadge variant="neutral">
              mMTC (UDP)
            </StatusBadge>
            {isUnderAttack && (
              <StatusBadge variant="critical" dot>
                ATTACK FLOOD
              </StatusBadge>
            )}
          </div>
        </div>

        {/* Visual Canvas Diagram */}
        <div className="relative bg-slate-950 rounded-2xl p-6 sm:p-8 text-white min-h-[360px] flex flex-col justify-between overflow-hidden shadow-inner border border-slate-800">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Layer: Slice Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {/* eMBB Node */}
            <div className="bg-slate-900/90 border border-blue-500/40 rounded-xl p-4 shadow-lg backdrop-blur text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
                <span className="font-bold text-sm text-blue-300">eMBB Slice Client</span>
              </div>
              <div className="font-mono text-xs text-slate-300">172.28.0.10</div>
              <div className="text-[10px] text-blue-400/80 mt-1">VLAN 10 &bull; veth-embb</div>
              <div className="mt-2 text-[10px] bg-blue-950/60 text-blue-300 py-0.5 px-2.5 rounded-[10px] border border-blue-800 font-mono inline-block">
                4K UHD Stream: ~240 Mbps
              </div>
            </div>

            {/* URLLC Node */}
            <div
              className={`rounded-xl p-4 shadow-lg backdrop-blur text-center border transition-all ${
                isUnderAttack
                  ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/50'
                  : 'bg-slate-900/90 border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isUnderAttack ? 'bg-rose-500 animate-ping' : 'bg-cyan-400 animate-pulse'
                  }`}
                />
                <span
                  className={`font-bold text-sm ${
                    isUnderAttack ? 'text-rose-300 font-extrabold' : 'text-cyan-300'
                  }`}
                >
                  URLLC Transport Slice
                </span>
              </div>
              <div className="font-mono text-xs text-slate-300">172.28.0.20</div>
              <div className="text-[10px] text-cyan-400/80 mt-1">VLAN 20 &bull; veth-urllc</div>
              <div
                className={`mt-2 text-[10px] py-0.5 px-2.5 rounded-[10px] border font-mono inline-block ${
                  isUnderAttack
                    ? 'bg-rose-900 text-rose-200 border-rose-700 font-bold animate-pulse'
                    : 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                }`}
              >
                {isUnderAttack ? 'SLA BREACH: Packet Inundation' : 'Sub-millisecond RTT: 0.24ms'}
              </div>
            </div>

            {/* mMTC Node */}
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-4 shadow-lg backdrop-blur text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span className="font-bold text-sm text-purple-300">mMTC IoT Mesh</span>
              </div>
              <div className="font-mono text-xs text-slate-300">172.28.0.30</div>
              <div className="text-[10px] text-purple-400/80 mt-1">VLAN 30 &bull; veth-mmtc</div>
              <div className="mt-2 text-[10px] bg-purple-950/60 text-purple-300 py-0.5 px-2.5 rounded-[10px] border border-purple-800 font-mono inline-block">
                25,000 Sensors &bull; 8.5K pps
              </div>
            </div>
          </div>

          {/* Central Open vSwitch Bridge Node */}
          <div className="my-8 flex items-center justify-center relative z-10">
            <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl px-8 py-5 shadow-2xl text-center max-w-md w-full backdrop-blur relative">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Server className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-base text-emerald-300">
                  Open vSwitch Bridge (`br-slicing`)
                </span>
              </div>
              <div className="font-mono text-xs text-slate-400">Gateway: 172.28.0.2 &bull; OpenFlow 1.3</div>

              {/* Status Banner inside switch */}
              {isMitigated ? (
                <div className="mt-2.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700 py-1.5 px-3 rounded-xl flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>OpenFlow Rule: Dropping 172.28.0.99 Datagrams at Wire-Speed</span>
                </div>
              ) : isUnderAttack ? (
                <div className="mt-2.5 text-[11px] font-bold text-rose-300 bg-rose-950/80 border border-rose-700 py-1.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Unfiltered Threat Packet Stream Traversal Active!</span>
                </div>
              ) : (
                <div className="mt-2.5 text-[11px] text-slate-300 bg-slate-900/60 border border-slate-700 py-1 px-3 rounded-xl">
                  Normal Forwarding Table &bull; Hardware SR-IOV Ready
                </div>
              )}
            </div>
          </div>

          {/* Bottom Layer: Attacker Node and 5G Core Egress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Attacker Node */}
            <div
              className={`rounded-xl p-4 shadow-lg backdrop-blur text-center border transition-all ${
                isUnderAttack
                  ? 'bg-rose-950/90 border-rose-500 ring-2 ring-rose-500/80'
                  : isMitigated
                  ? 'bg-slate-900/80 border-amber-500/50'
                  : 'bg-slate-900/80 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Flame
                  className={`w-4 h-4 ${isUnderAttack ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`}
                />
                <span
                  className={`font-bold text-sm ${isUnderAttack ? 'text-rose-300 font-extrabold' : 'text-slate-300'}`}
                >
                  Attacker Node
                </span>
              </div>
              <div className="font-mono text-xs text-slate-400">172.28.0.99 &bull; veth-atk (VLAN 99)</div>
              {isMitigated ? (
                <div className="mt-2 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800 py-0.5 px-2.5 rounded-[10px] inline-block">
                  PORT BLOCKED: Packets Dropped by OpenFlow Filter
                </div>
              ) : isUnderAttack ? (
                <div className="mt-2 text-[10px] font-bold text-rose-200 bg-rose-900 py-0.5 px-2.5 rounded-[10px] inline-block animate-pulse">
                  TRANSMITTING: Real UDP/IP Packet Floods
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-slate-400 bg-slate-900/50 py-0.5 px-2.5 rounded-[10px] inline-block">
                  IDLE / STANDBY
                </div>
              )}
            </div>

            {/* 5G Core User Plane (UPF) */}
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-4 shadow-lg backdrop-blur text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-emerald-300">5G Core User Plane (UPF)</span>
              </div>
              <div className="font-mono text-xs text-slate-400">172.28.0.1 &bull; Internet Data Egress</div>
              <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 py-0.5 px-2.5 rounded-[10px] font-mono inline-block">
                Egress SLA Compliance: 99.999%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Ping Tool & Latency RTT Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Ping CLI Console */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#1A3C6F] text-white rounded-xl shadow-xs">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
                Live ICMP Ping Tester
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Execute real socket ping packets across the virtual network
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block mb-1">
                Source Node
              </label>
              <select
                value={sourceIp}
                onChange={(e) => setSourceIp(e.target.value)}
                className="w-full bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
              >
                <option value="172.28.0.10">eMBB (172.28.0.10)</option>
                <option value="172.28.0.20">URLLC (172.28.0.20)</option>
                <option value="172.28.0.30">mMTC (172.28.0.30)</option>
                <option value="172.28.0.99">Attacker Node (172.28.0.99)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] block mb-1">
                Target Node
              </label>
              <select
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                className="w-full bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
              >
                <option value="172.28.0.20">URLLC (172.28.0.20)</option>
                <option value="172.28.0.10">eMBB (172.28.0.10)</option>
                <option value="172.28.0.30">mMTC (172.28.0.30)</option>
                <option value="172.28.0.2">OVS Switch (172.28.0.2)</option>
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleExecutePing}
            loading={pingRunning}
            icon={<Send className="w-3.5 h-3.5" />}
            className="w-full"
          >
            {pingRunning ? 'Transmitting Ping...' : 'Execute Live Ping Test'}
          </Button>

          {/* Terminal Box */}
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] text-emerald-400 space-y-1 min-h-[140px] max-h-[180px] overflow-y-auto border border-slate-800 custom-scrollbar">
            {pingOutput.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('Prohibited') || line.includes('100.0%')
                    ? 'text-rose-400 font-bold'
                    : line.includes('statistics')
                    ? 'text-[#179F99] font-bold mt-1'
                    : ''
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Node-to-Node Latency RTT Matrix (Borderless Row-Card Architecture per Section 4) */}
        <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#179F99] text-white rounded-xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
                Node-to-Node Latency Matrix
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Live round-trip time (RTT) measured across virtual switch ports
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EFEFEF] dark:border-[#2E3344]">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F5F7] dark:bg-[#222632] text-[#6B7280] dark:text-[#9CA3AF] font-bold border-b border-[#EFEFEF] dark:border-[#2E3344]">
                  <th className="py-2.5 px-3 text-left">From \ To</th>
                  <th className="py-2.5 px-3">Switch (172.28.0.2)</th>
                  <th className="py-2.5 px-3">eMBB (172.28.0.10)</th>
                  <th className="py-2.5 px-3">URLLC (172.28.0.20)</th>
                  <th className="py-2.5 px-3">mMTC (172.28.0.30)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF] dark:divide-[#2E3344] font-mono text-[11px]">
                <tr className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#222632]/80">
                  <td className="py-2.5 px-3 font-bold text-left text-[#111111] dark:text-[#F3F4F6]">eMBB</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">0.55 ms</td>
                  <td className="py-2.5 px-3 text-[#6B7280] dark:text-[#9CA3AF]">-</td>
                  <td className="py-2.5 px-3 text-[#1A3C6F] dark:text-[#179F99] font-bold">0.85 ms</td>
                  <td className="py-2.5 px-3 text-[#111111] dark:text-[#F3F4F6]">1.42 ms</td>
                </tr>
                <tr className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#222632]/80">
                  <td className="py-2.5 px-3 font-bold text-left text-[#111111] dark:text-[#F3F4F6]">URLLC</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">0.24 ms</td>
                  <td className="py-2.5 px-3 text-[#1A3C6F] dark:text-[#179F99] font-bold">0.85 ms</td>
                  <td className="py-2.5 px-3 text-[#6B7280] dark:text-[#9CA3AF]">-</td>
                  <td className="py-2.5 px-3 text-[#111111] dark:text-[#F3F4F6]">1.25 ms</td>
                </tr>
                <tr className="hover:bg-[#F5F5F7]/80 dark:hover:bg-[#222632]/80">
                  <td className="py-2.5 px-3 font-bold text-left text-[#111111] dark:text-[#F3F4F6]">mMTC</td>
                  <td className="py-2.5 px-3 text-[#111111] dark:text-[#F3F4F6]">1.15 ms</td>
                  <td className="py-2.5 px-3 text-[#111111] dark:text-[#F3F4F6]">1.42 ms</td>
                  <td className="py-2.5 px-3 text-[#111111] dark:text-[#F3F4F6]">1.25 ms</td>
                  <td className="py-2.5 px-3 text-[#6B7280] dark:text-[#9CA3AF]">-</td>
                </tr>
                <tr className={isMitigated ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'hover:bg-[#F5F5F7]/80 dark:hover:bg-[#222632]/80'}>
                  <td className="py-2.5 px-3 font-bold text-left text-rose-600 dark:text-rose-400">Attacker</td>
                  <td className="py-2.5 px-3">
                    {isMitigated ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">BLOCKED</span>
                    ) : (
                      <span className="text-[#111111] dark:text-[#F3F4F6]">0.45 ms</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#6B7280] dark:text-[#9CA3AF]">-</td>
                  <td className="py-2.5 px-3">
                    {isMitigated ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">DROPPED</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">0.65 ms</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#6B7280] dark:text-[#9CA3AF]">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] bg-[#F5F5F7] dark:bg-[#222632] rounded-xl p-3.5 border border-[#EFEFEF] dark:border-[#2E3344]">
            <span className="font-bold text-[#111111] dark:text-[#F3F4F6]">OpenFlow SLA Enforcement:</span> When an OpenFlow rule is pushed from the security controller, latency for blocked flows is zeroed out and all subsequent datagrams trigger an ICMP destination host prohibited notice.
          </div>
        </div>
      </div>

      {/* Wireshark-Style Live Packet Flow Inspector */}
      <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#1A3C6F] dark:text-[#179F99]" />
            <h3 className="text-base font-bold tracking-tight text-[#111111] dark:text-[#F3F4F6]">
              Wireshark-Style Live Packet Flow Inspector
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-bold">Filter Protocol:</span>
            <div className="flex items-center space-x-1 bg-[#F5F5F7] dark:bg-[#222632] p-1 rounded-xl border border-[#EFEFEF] dark:border-[#2E3344] text-xs">
              {['ALL', 'UDP', 'TCP'].map((proto) => (
                <button
                  key={proto}
                  onClick={() => setFilterProto(proto)}
                  className={`px-3 py-1 rounded-[10px] font-bold transition-all cursor-pointer ${
                    filterProto === proto
                      ? 'bg-[#1A3C6F] text-white shadow-xs'
                      : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6]'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Packet Stream Table */}
        <div className="overflow-x-auto rounded-xl border border-[#EFEFEF] dark:border-[#2E3344]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EFEFEF] dark:border-[#2E3344] bg-[#F5F5F7] dark:bg-[#222632] text-[#6B7280] dark:text-[#9CA3AF] font-bold font-mono text-[11px]">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Packet ID</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">VLAN</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Disposition</th>
                <th className="py-2.5 px-3">PDU Information</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF] dark:divide-[#2E3344] font-mono text-[11px]">
              {filteredPackets.map((pkt) => {
                const isDropped = pkt.status === 'DROPPED_BY_OPENFLOW';
                const isAttack = pkt.src_ip === '172.28.0.99';

                return (
                  <tr
                    key={pkt.packet_id}
                    className={`hover:bg-[#F5F5F7]/80 dark:hover:bg-[#222632]/80 transition-colors ${
                      isDropped
                        ? 'bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 font-semibold'
                        : isAttack
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                        : 'text-[#111111] dark:text-[#F3F4F6]'
                    }`}
                  >
                    <td className="py-2 px-3 text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap">{pkt.timestamp}</td>
                    <td className="py-2 px-3 text-[#6B7280] dark:text-[#9CA3AF]">{pkt.packet_id}</td>
                    <td className="py-2 px-3 font-semibold text-[#111111] dark:text-[#F3F4F6]">
                      {pkt.src_ip}:{pkt.src_port}
                    </td>
                    <td className="py-2 px-3 text-[#111111] dark:text-[#F3F4F6]">
                      {pkt.dst_ip}:{pkt.dst_port}
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge variant="brand">
                        {pkt.vlan_tag}
                      </StatusBadge>
                    </td>
                    <td className="py-2 px-3 font-bold">{pkt.protocol}</td>
                    <td className="py-2 px-3 text-[#6B7280] dark:text-[#9CA3AF]">{pkt.length_bytes} B</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <StatusBadge variant={isDropped ? 'critical' : 'active'}>
                        {pkt.status}
                      </StatusBadge>
                    </td>
                    <td className="py-2 px-3 text-[#6B7280] dark:text-[#9CA3AF] truncate max-w-xs">{pkt.info}</td>
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
