'use client';

import React from 'react';
import { HealthCheckResponse } from '@/types';
import { Server, Zap, RefreshCw, CheckCircle2, XCircle, Clock, Globe } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

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
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
              Backend Connection Status
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              FastAPI Health Monitoring API (`/api/v1/health`)
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Status
        </Button>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900 rounded-xl flex items-start space-x-3 text-rose-900 dark:text-rose-200">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div>
            <h3 className="font-bold text-sm">Backend Connection Inactive</h3>
            <p className="text-xs mt-1 text-rose-700 dark:text-rose-300">{error}</p>
            <p className="text-xs mt-2 text-[#6B7280] dark:text-[#9CA3AF] font-mono">
              Ensure FastAPI backend is running:{' '}
              <code className="bg-white dark:bg-[#1A1D26] px-1.5 py-0.5 rounded border border-[#EFEFEF] dark:border-[#2E3344] text-[#111111] dark:text-[#F3F4F6]">
                uvicorn app.main:app --port 8000
              </code>
            </p>
          </div>
        </div>
      ) : health ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Status</span>
              <div className="flex items-center space-x-1.5 font-bold text-sm text-[#111111] dark:text-[#F3F4F6]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="capitalize">{health.status}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Latency</span>
              <div className="flex items-center space-x-1.5 font-bold text-sm font-mono text-[#179F99]">
                <Zap className="w-4 h-4" />
                <span>{latencyMs} ms</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Uptime</span>
              <div className="flex items-center space-x-1.5 font-bold text-sm font-mono text-[#111111] dark:text-[#F3F4F6]">
                <Clock className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                <span>{health.uptime_seconds} s</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Environment</span>
              <div className="flex items-center space-x-1.5 font-bold text-sm text-[#111111] dark:text-[#F3F4F6]">
                <Globe className="w-4 h-4 text-[#1A3C6F] dark:text-[#179F99]" />
                <span className="capitalize">{health.environment}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-3">
              Modular Component Readiness
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(health.modules).map(([moduleName, isReady]) => (
                <div
                  key={moduleName}
                  className="flex items-center justify-between p-3.5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl text-xs"
                >
                  <span className="text-[#111111] dark:text-[#F3F4F6] font-semibold capitalize font-mono">
                    {moduleName.replace(/_/g, ' ')}
                  </span>
                  <StatusBadge variant={isReady ? 'active' : 'offline'}>
                    {isReady ? 'READY' : 'OFFLINE'}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
