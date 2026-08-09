'use client';

import React from 'react';
import { HealthCheckResponse } from '@/types';
import { Server, Zap, RefreshCw, CheckCircle2, XCircle, Clock, Globe } from 'lucide-react';

interface HealthStatusProps {
  health: HealthCheckResponse | null;
  latencyMs: number;
  error: string | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const HealthStatus: React.FC<HealthStatusProps> = ({
  health,
  latencyMs,
  error,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-network-cyan/5 rounded-full blur-3xl -z-10" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-blue/10 rounded-xl text-network-blue border border-network-blue/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Backend Connection Status</h2>
            <p className="text-xs text-gray-400">FastAPI Health Monitoring API (`/api/v1/health`)</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold bg-network-dark hover:bg-network-border text-gray-200 rounded-xl border border-network-border transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Ping API</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-network-rose/10 border border-network-rose/30 rounded-xl flex items-start space-x-3 text-network-rose">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Backend Connection Failed</h3>
            <p className="text-xs mt-1 opacity-90">{error}</p>
            <p className="text-xs mt-2 text-gray-400">
              Ensure FastAPI backend is running: <code className="bg-network-dark px-1.5 py-0.5 rounded text-gray-200">uvicorn app.main:app --port 8000</code>
            </p>
          </div>
        </div>
      ) : health ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-network-dark/50 border border-network-border rounded-xl">
              <span className="text-xs text-gray-400 block mb-1">Status</span>
              <div className="flex items-center space-x-1.5 text-network-emerald font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="capitalize">{health.status}</span>
              </div>
            </div>

            <div className="p-3 bg-network-dark/50 border border-network-border rounded-xl">
              <span className="text-xs text-gray-400 block mb-1">Latency</span>
              <div className="flex items-center space-x-1.5 text-network-cyan font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>{latencyMs} ms</span>
              </div>
            </div>

            <div className="p-3 bg-network-dark/50 border border-network-border rounded-xl">
              <span className="text-xs text-gray-400 block mb-1">Uptime</span>
              <div className="flex items-center space-x-1.5 text-network-purple font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>{health.uptime_seconds} s</span>
              </div>
            </div>

            <div className="p-3 bg-network-dark/50 border border-network-border rounded-xl">
              <span className="text-xs text-gray-400 block mb-1">Environment</span>
              <div className="flex items-center space-x-1.5 text-gray-200 font-semibold text-sm">
                <Globe className="w-4 h-4 text-network-blue" />
                <span className="capitalize">{health.environment}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Modular Component Readiness
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(health.modules).map(([moduleName, isReady]) => (
                <div
                  key={moduleName}
                  className="flex items-center justify-between p-3 bg-network-dark/30 border border-network-border rounded-xl text-xs"
                >
                  <span className="text-gray-300 capitalize font-mono">
                    {moduleName.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isReady
                        ? 'bg-network-emerald/20 text-network-emerald border border-network-emerald/30'
                        : 'bg-network-rose/20 text-network-rose'
                    }`}
                  >
                    {isReady ? 'READY' : 'OFFLINE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
