'use client';

import React, { useState, useEffect } from 'react';
import { AttackEvent } from '@/types';
import { fetchActiveAttacks, fetchAttackHistory, stopAttack } from '@/lib/api';
import { AlertCircle, Shield, StopCircle, Clock, Tag } from 'lucide-react';

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

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-secondary-900 text-white border-secondary-800';
      case 'HIGH':
        return 'bg-secondary-200 text-secondary-900 border-secondary-300';
      case 'MEDIUM':
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      default:
        return 'bg-primary-50 text-primary-700 border-primary-200';
    }
  };

  const eventsToDisplay = view === 'active' ? activeAttacks : history;

  return (
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-secondary-100 rounded-xl text-secondary-800 border border-secondary-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary-900">Cybersecurity Threat Monitor Feed</h2>
            <p className="text-xs text-secondary-500">Live active events & audit history (`/api/v1/attacks/*`)</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-secondary-100 p-1 rounded-xl border border-secondary-200 text-xs">
          <button
            onClick={() => setView('active')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              view === 'active'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Active ({activeAttacks.length})
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              view === 'history'
                ? 'bg-secondary-800 text-white shadow-sm'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Audit History ({history.length})
          </button>
        </div>
      </div>

      {eventsToDisplay.length === 0 ? (
        <div className="p-8 text-center bg-secondary-50 border border-secondary-200 rounded-xl space-y-2">
          <Shield className="w-8 h-8 text-primary-600 mx-auto opacity-70" />
          <p className="text-sm font-semibold text-secondary-700">No {view === 'active' ? 'Active Attacks' : 'History Logs'}</p>
          <p className="text-xs text-secondary-500">
            {view === 'active'
              ? 'All 5G/6G network slices operating under normal baseline parameters.'
              : 'Launch a threat simulation above to generate audit logs.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {eventsToDisplay.map((evt) => (
            <div
              key={evt.event_id}
              className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl space-y-3 transition-all hover:border-secondary-300 hover:bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-secondary-900 bg-white px-2 py-0.5 rounded border border-secondary-200">
                    {evt.event_id}
                  </span>
                  <span className="text-sm font-bold text-primary-700">{evt.attack_type}</span>
                  <span className="text-xs font-mono text-secondary-500">({evt.slice_id})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityStyle(evt.severity)}`}>
                    {evt.severity}
                  </span>

                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-200 text-secondary-800 border border-secondary-300">
                    <Tag className="w-3 h-3 text-secondary-600" />
                    <span>Label: {evt.ground_truth_label}</span>
                  </span>

                  {view === 'active' && (
                    <button
                      onClick={() => handleStop(evt.event_id)}
                      className="flex items-center space-x-1 px-3 py-1 text-[11px] font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-all"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>Mitigate</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Affected Features Breakdown */}
              <div className="p-3 bg-white border border-secondary-200 rounded-lg text-xs space-y-1.5 font-mono shadow-sm">
                <span className="text-[11px] font-semibold text-secondary-500 uppercase tracking-wider block mb-1">
                  Affected Network Features Delta:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-secondary-700">
                  {Object.entries(evt.affected_features).map(([featKey, featVal]) => (
                    <div key={featKey} className="flex items-center justify-between border-b border-secondary-100 pb-1">
                      <span className="text-secondary-500 capitalize">{featKey.replace(/_/g, ' ')}:</span>
                      <span className="text-secondary-900 font-semibold truncate max-w-[200px]">
                        {typeof featVal === 'object' && featVal !== null && 'simulated' in featVal
                          ? `${featVal.baseline} ➔ ${featVal.simulated}`
                          : String(featVal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-secondary-500 pt-1">
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
