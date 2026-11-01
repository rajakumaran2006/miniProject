'use client';

import React, { useState, useEffect } from 'react';
import { AttackEvent } from '@/types';
import { fetchActiveAttacks, fetchAttackHistory, stopAttack } from '@/lib/api';
import { AlertCircle, Shield, StopCircle, Clock, Tag } from 'lucide-react';
import { StatusBadge, StatusVariant } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

interface AttackFeedProps {
  onRefreshTrigger: () => void;
}

export const AttackFeed: React.FC<AttackFeedProps> = ({ onRefreshTrigger }) => {
  const [activeAttacks, setActiveAttacks] = useState<AttackEvent[]>([]);
  const [history, setHistory] = useState<AttackEvent[]>([]);
  const [view, setView] = useState<'active' | 'history'>('active');

  const loadAttacks = async () => {
    const activeRes = await fetchActiveAttacks();
    setActiveAttacks(activeRes.data);

    const histRes = await fetchAttackHistory();
    setHistory(histRes.data);
  };

  useEffect(() => {
    loadAttacks();
    const interval = setInterval(loadAttacks, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStop = async (eventId: string) => {
    await stopAttack(eventId);
    loadAttacks();
    onRefreshTrigger();
  };

  const getSeverityVariant = (sev: string): StatusVariant => {
    switch (sev) {
      case 'CRITICAL':
      case 'HIGH':
        return 'critical';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'teal';
    }
  };

  const eventsToDisplay = view === 'active' ? activeAttacks : history;

  return (
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
              Cybersecurity Threat Monitor Feed
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Live active events & audit history (`/api/v1/attacks/*`)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#F5F5F7] dark:bg-[#222632] p-1 rounded-xl border border-[#EFEFEF] dark:border-[#2E3344] text-xs">
          <button
            onClick={() => setView('active')}
            className={`px-3.5 py-1.5 rounded-[10px] font-bold whitespace-nowrap inline-flex flex-row items-center gap-1.5 transition-all cursor-pointer ${
              view === 'active'
                ? 'bg-[#1A3C6F] text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6]'
            }`}
          >
            Active ({activeAttacks.length})
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-3.5 py-1.5 rounded-[10px] font-bold whitespace-nowrap inline-flex flex-row items-center gap-1.5 transition-all cursor-pointer ${
              view === 'history'
                ? 'bg-[#1A3C6F] text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F3F4F6]'
            }`}
          >
            Audit History ({history.length})
          </button>
        </div>
      </div>

      {eventsToDisplay.length === 0 ? (
        <div className="p-8 text-center bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-2">
          <Shield className="w-8 h-8 text-[#179F99] mx-auto opacity-80" />
          <p className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
            No {view === 'active' ? 'Active Attacks' : 'History Logs'}
          </p>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            {view === 'active'
              ? 'All 5G/6G network slices operating under normal baseline parameters.'
              : 'Launch a threat simulation above to generate audit logs.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {eventsToDisplay.map((evt) => (
            <div
              key={evt.event_id}
              className="p-4 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-3 transition-all hover:border-[#1A3C6F] dark:hover:border-[#179F99]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#111111] dark:text-[#F3F4F6] bg-white dark:bg-[#1A1D26] px-2 py-0.5 rounded-[10px] border border-[#EFEFEF] dark:border-[#2E3344]">
                    {evt.event_id}
                  </span>
                  <span className="text-sm font-bold text-[#1A3C6F] dark:text-[#179F99]">
                    {evt.attack_type}
                  </span>
                  <span className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                    ({evt.slice_id})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <StatusBadge variant={getSeverityVariant(evt.severity)}>
                    {evt.severity}
                  </StatusBadge>

                  <StatusBadge variant="neutral" icon={<Tag className="w-3 h-3" />}>
                    Label: {evt.ground_truth_label}
                  </StatusBadge>

                  {view === 'active' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleStop(evt.event_id)}
                      icon={<StopCircle className="w-3.5 h-3.5" />}
                    >
                      Mitigate
                    </Button>
                  )}
                </div>
              </div>

              {/* Affected Features Breakdown */}
              <div className="p-3 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl text-xs space-y-1.5 font-mono shadow-xs">
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider block mb-1">
                  Affected Network Features Delta:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#111111] dark:text-[#F3F4F6]">
                  {Object.entries(evt.affected_features).map(([featKey, featVal]) => (
                    <div
                      key={featKey}
                      className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-1"
                    >
                      <span className="text-[#6B7280] dark:text-[#9CA3AF] capitalize font-sans">
                        {featKey.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-bold truncate max-w-[200px]">
                        {typeof featVal === 'object' && featVal !== null && 'simulated' in featVal
                          ? `${featVal.baseline} ➔ ${featVal.simulated}`
                          : String(featVal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9CA3AF] pt-1">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Logged: {new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className="font-mono">
                  Duration Remaining: {evt.steps_remaining} / {evt.duration_steps} steps
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
