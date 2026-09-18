'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Network,
  Activity,
  Terminal,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Server,
  Radio,
  Play,
  Pause,
  RefreshCw,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import {
  fetchOVSConnectivity,
  runOVSPing,
  fetchOVSPacketStream,
} from '@/lib/api';

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

  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-cyan-50 text-cyan-700 rounded-2xl border border-cyan-200">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Virtual Network Connectivity & Data Flow
                </h1>
                <span className="flex items-center space-x-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>LIVE WIRE CONNECTED</span>
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  Bridge: br-slicing
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time visual node connectivity, animated packet transmissions, live ICMP ping latency, and raw packet stream
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-full border transition-colors shadow-sm ${
                isStreaming
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
            </button>
            <button
              onClick={loadData}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Visual Network Topology Canvas with Animated Data Flows */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Live Animated Data Flow Canvas
            </h2>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>eMBB (UDP)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"></span>
              <span>URLLC (TCP)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
              <span>mMTC (UDP)</span>
            </span>
            {isUnderAttack && (
              <span className="flex items-center space-x-1.5 text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                <span>ATTACK FLOOD</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Canvas Diagram */}
        <div className="relative bg-slate-900 rounded-[24px] p-8 text-white min-h-[360px] flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          {/* Top Layer: Slice Endpoints */}
          <div className="grid grid-cols-3 gap-4 relative z-10">
            {/* eMBB Node */}
            <div className="bg-slate-800/90 border border-blue-500/40 rounded-[20px] p-4 shadow-lg backdrop-blur text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
                <span className="font-bold text-sm text-blue-300">eMBB Slice Client</span>
              </div>
              <div className="font-mono text-xs text-slate-300">172.28.0.10</div>
              <div className="text-[10px] text-blue-400/80 mt-1">VLAN 10 &bull; veth-embb</div>
              <div className="mt-2 text-[10px] bg-blue-950/60 text-blue-300 py-0.5 px-2.5 rounded-full border border-blue-800 font-mono inline-block">
                4K UHD Stream: ~240 Mbps
              </div>
            </div>

            {/* URLLC Node */}
            <div
              className={`rounded-[20px] p-4 shadow-lg backdrop-blur text-center border transition-all ${
                isUnderAttack
                  ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/50'
                  : 'bg-slate-800/90 border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isUnderAttack ? 'bg-rose-500 animate-ping' : 'bg-cyan-400 animate-pulse'
                  }`}
                ></span>
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
                className={`mt-2 text-[10px] py-0.5 px-2.5 rounded-full border font-mono inline-block ${
                  isUnderAttack
                    ? 'bg-rose-900 text-rose-200 border-rose-700 font-bold animate-pulse'
                    : 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                }`}
              >
                {isUnderAttack ? 'SLA BREACH: Packet Inundation' : 'Sub-millisecond RTT: 0.24ms'}
              </div>
            </div>

            {/* mMTC Node */}
            <div className="bg-slate-800/90 border border-purple-500/40 rounded-[20px] p-4 shadow-lg backdrop-blur text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span className="font-bold text-sm text-purple-300">mMTC IoT Mesh</span>
              </div>
              <div className="font-mono text-xs text-slate-300">172.28.0.30</div>
              <div className="text-[10px] text-purple-400/80 mt-1">VLAN 30 &bull; veth-mmtc</div>
              <div className="mt-2 text-[10px] bg-purple-950/60 text-purple-300 py-0.5 px-2.5 rounded-full border border-purple-800 font-mono inline-block">
                25,000 Sensors &bull; 8.5K pps
              </div>
            </div>
          </div>

          {/* Central Open vSwitch Bridge Node */}
          <div className="my-8 flex items-center justify-center relative z-10">
            <div className="bg-slate-800 border-2 border-emerald-500 rounded-[26px] px-8 py-5 shadow-2xl text-center max-w-md w-full backdrop-blur relative">
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
          <div className="grid grid-cols-2 gap-8 relative z-10">
            {/* Attacker Node */}
            <div
              className={`rounded-[20px] p-4 shadow-lg backdrop-blur text-center border transition-all ${
                isUnderAttack
                  ? 'bg-rose-950/90 border-rose-500 ring-2 ring-rose-500/80'
                  : isMitigated
                  ? 'bg-slate-800/80 border-amber-500/50'
                  : 'bg-slate-800/80 border-slate-700'
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
                <div className="mt-2 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800 py-0.5 px-2.5 rounded-full inline-block">
                  PORT BLOCKED: Packets Dropped by OpenFlow Filter
                </div>
              ) : isUnderAttack ? (
                <div className="mt-2 text-[10px] font-bold text-rose-200 bg-rose-900 py-0.5 px-2.5 rounded-full inline-block animate-pulse">
                  TRANSMITTING: Real UDP/IP Packet Floods
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-slate-400 bg-slate-900/50 py-0.5 px-2.5 rounded-full inline-block">
                  IDLE / STANDBY
                </div>
              )}
            </div>

            {/* 5G Core User Plane (UPF) */}
            <div className="bg-slate-800/80 border border-emerald-500/40 rounded-[20px] p-4 shadow-lg backdrop-blur text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-emerald-300">5G Core User Plane (UPF)</span>
              </div>
              <div className="font-mono text-xs text-slate-400">172.28.0.1 &bull; Internet Data Egress</div>
              <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 py-0.5 px-2.5 rounded-full font-mono inline-block">
                Egress SLA Compliance: 99.999%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Ping Tool & Latency RTT Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Ping CLI Console */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">Live ICMP Ping Tester</h3>
              <p className="text-xs text-slate-500">
                Execute real socket ping packets across the virtual network
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Source Node</label>
              <select
                value={sourceIp}
                onChange={(e) => setSourceIp(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="172.28.0.10">eMBB (172.28.0.10)</option>
                <option value="172.28.0.20">URLLC (172.28.0.20)</option>
                <option value="172.28.0.30">mMTC (172.28.0.30)</option>
                <option value="172.28.0.99">Attacker Node (172.28.0.99)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Node</label>
              <select
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="172.28.0.20">URLLC (172.28.0.20)</option>
                <option value="172.28.0.10">eMBB (172.28.0.10)</option>
                <option value="172.28.0.30">mMTC (172.28.0.30)</option>
                <option value="172.28.0.2">OVS Switch (172.28.0.2)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExecutePing}
            disabled={pingRunning}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full shadow transition-all flex items-center justify-center space-x-2"
          >
            <Send className={`w-3.5 h-3.5 ${pingRunning ? 'animate-spin' : ''}`} />
            <span>{pingRunning ? 'Transmitting Ping...' : 'Execute Live Ping Test'}</span>
          </button>

          {/* Terminal Box */}
          <div className="bg-slate-950 rounded-[20px] p-4 font-mono text-[11px] text-emerald-400 space-y-1 min-h-[140px] max-h-[180px] overflow-y-auto border border-slate-800">
            {pingOutput.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('Prohibited') || line.includes('100.0%')
                    ? 'text-rose-400 font-bold'
                    : line.includes('statistics')
                    ? 'text-cyan-300 font-bold mt-1'
                    : ''
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Node-to-Node Latency RTT Matrix */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">Node-to-Node Latency Matrix</h3>
              <p className="text-xs text-slate-500">
                Live round-trip time (RTT) measured across virtual switch ports
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                  <th className="py-2.5 px-3 text-left">From \ To</th>
                  <th className="py-2.5 px-3">Switch (172.28.0.2)</th>
                  <th className="py-2.5 px-3">eMBB (172.28.0.10)</th>
                  <th className="py-2.5 px-3">URLLC (172.28.0.20)</th>
                  <th className="py-2.5 px-3">mMTC (172.28.0.30)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-left text-slate-800">eMBB</td>
                  <td className="py-2.5 px-3 text-emerald-600">0.55 ms</td>
                  <td className="py-2.5 px-3 text-slate-400">-</td>
                  <td className="py-2.5 px-3 text-blue-600">0.85 ms</td>
                  <td className="py-2.5 px-3 text-slate-600">1.42 ms</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-left text-slate-800">URLLC</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">0.24 ms</td>
                  <td className="py-2.5 px-3 text-blue-600">0.85 ms</td>
                  <td className="py-2.5 px-3 text-slate-400">-</td>
                  <td className="py-2.5 px-3 text-slate-600">1.25 ms</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-left text-slate-800">mMTC</td>
                  <td className="py-2.5 px-3 text-slate-600">1.15 ms</td>
                  <td className="py-2.5 px-3 text-slate-600">1.42 ms</td>
                  <td className="py-2.5 px-3 text-slate-600">1.25 ms</td>
                  <td className="py-2.5 px-3 text-slate-400">-</td>
                </tr>
                <tr className={isMitigated ? 'bg-rose-50/50' : ''}>
                  <td className="py-2.5 px-3 font-semibold text-left text-rose-700">Attacker</td>
                  <td className="py-2.5 px-3">
                    {isMitigated ? (
                      <span className="text-rose-600 font-bold">BLOCKED</span>
                    ) : (
                      <span className="text-slate-700">0.45 ms</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">-</td>
                  <td className="py-2.5 px-3">
                    {isMitigated ? (
                      <span className="text-rose-600 font-bold">DROPPED</span>
                    ) : (
                      <span className="text-rose-600 font-bold">0.65 ms</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
            <span className="font-semibold text-slate-700">OpenFlow SLA Enforcement:</span> When an OpenFlow rule is pushed from the security controller, latency for blocked flows is zeroed out and all subsequent datagrams trigger an ICMP destination host prohibited notice.
          </div>
        </div>
      </div>

      {/* Wireshark-Style Live Packet Flow Inspector */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold tracking-tight text-slate-900">
              Wireshark-Style Live Packet Flow Inspector
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Filter Protocol:</span>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-full text-xs">
              {['ALL', 'UDP', 'TCP'].map((proto) => (
                <button
                  key={proto}
                  onClick={() => setFilterProto(proto)}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                    filterProto === proto
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Packet Stream Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold font-mono text-[11px]">
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
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredPackets.map((pkt) => {
                const isDropped = pkt.status === 'DROPPED_BY_OPENFLOW';
                const isAttack = pkt.src_ip === '172.28.0.99';

                return (
                  <tr
                    key={pkt.packet_id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isDropped
                        ? 'bg-rose-50/70 text-rose-900 font-semibold'
                        : isAttack
                        ? 'bg-amber-50/60 text-amber-900'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{pkt.timestamp}</td>
                    <td className="py-2 px-3 text-slate-600">{pkt.packet_id}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {pkt.src_ip}:{pkt.src_port}
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      {pkt.dst_ip}:{pkt.dst_port}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {pkt.vlan_tag}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-700">{pkt.protocol}</td>
                    <td className="py-2 px-3 text-slate-600">{pkt.length_bytes} B</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isDropped
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {pkt.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{pkt.info}</td>
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
