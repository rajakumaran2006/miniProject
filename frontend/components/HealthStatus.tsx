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
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-200">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary-900">Backend Connection Status</h2>
            <p className="text-xs text-secondary-500">FastAPI Health Monitoring API (`/api/v1/health`)</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold bg-white hover:bg-secondary-50 text-secondary-700 rounded-xl border border-secondary-300 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-secondary-100 border border-secondary-300 rounded-xl flex items-start space-x-3 text-secondary-800">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-secondary-600" />
          <div>
            <h3 className="font-semibold text-sm">Backend Connection Inactive</h3>
            <p className="text-xs mt-1 text-secondary-600">{error}</p>
            <p className="text-xs mt-2 text-secondary-500 font-mono">
              Ensure FastAPI backend is running: <code className="bg-white px-1.5 py-0.5 rounded border border-secondary-300 text-secondary-800">uvicorn app.main:app --port 8000</code>
            </p>
          </div>
        </div>
      ) : health ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
              <span className="text-xs text-secondary-500 block mb-1">Status</span>
              <div className="flex items-center space-x-1.5 text-primary-600 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="capitalize">{health.status}</span>
              </div>
            </div>

            <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
              <span className="text-xs text-secondary-500 block mb-1">Latency</span>
              <div className="flex items-center space-x-1.5 text-tertiary-700 font-semibold text-sm font-mono">
                <Zap className="w-4 h-4" />
                <span>{latencyMs} ms</span>
              </div>
            </div>

            <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
              <span className="text-xs text-secondary-500 block mb-1">Uptime</span>
              <div className="flex items-center space-x-1.5 text-secondary-800 font-semibold text-sm font-mono">
                <Clock className="w-4 h-4 text-secondary-500" />
                <span>{health.uptime_seconds} s</span>
              </div>
            </div>

            <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
              <span className="text-xs text-secondary-500 block mb-1">Environment</span>
              <div className="flex items-center space-x-1.5 text-secondary-800 font-semibold text-sm">
                <Globe className="w-4 h-4 text-primary-600" />
                <span className="capitalize">{health.environment}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">
              Modular Component Readiness
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(health.modules).map(([moduleName, isReady]) => (
                <div
                  key={moduleName}
                  className="flex items-center justify-between p-3 bg-secondary-50 border border-secondary-200 rounded-xl text-xs"
                >
                  <span className="text-secondary-700 capitalize font-mono">
                    {moduleName.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                      isReady
                        ? 'bg-primary-50 text-primary-700 border-primary-200'
                        : 'bg-secondary-200 text-secondary-700 border-secondary-300'
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
