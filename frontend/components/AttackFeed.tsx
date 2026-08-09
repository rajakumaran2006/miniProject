'use client';

import React, { useState, useEffect } from 'react';
import { AttackEvent } from '@/types';
import { fetchActiveAttacks, fetchAttackHistory, stopAttack } from '@/lib/api';
import { AlertCircle, Shield, StopCircle, Clock, CheckCircle, Tag } from 'lucide-react';

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
        return 'bg-network-rose/20 text-network-rose border-network-rose/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-network-purple/20 text-network-purple border-network-purple/40';
      default:
        return 'bg-network-cyan/20 text-network-cyan border-network-cyan/40';
    }
  };

  const eventsToDisplay = view === 'active' ? activeAttacks : history;

  return (
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Cybersecurity Threat Monitor Feed</h2>
            <p className="text-xs text-gray-400">Live active events & audit history (`/api/v1/attacks/*`)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-network-dark p-1 rounded-xl border border-network-border text-xs">
          <button
            onClick={() => setView('active')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              view === 'active' ? 'bg-network-rose text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Active ({activeAttacks.length})
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              view === 'history' ? 'bg-network-purple text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Audit History ({history.length})
          </button>
        </div>
      </div>

      {eventsToDisplay.length === 0 ? (
        <div className="p-8 text-center bg-network-dark/40 border border-network-border/60 rounded-xl space-y-2">
          <Shield className="w-8 h-8 text-network-emerald mx-auto opacity-70" />
          <p className="text-sm font-semibold text-gray-300">No {view === 'active' ? 'Active Attacks' : 'History Logs'}</p>
          <p className="text-xs text-gray-500">
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
              className="p-4 bg-network-dark/80 border border-network-border rounded-xl space-y-3 transition-all hover:border-gray-600"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-white bg-network-card px-2 py-0.5 rounded border border-network-border">
                    {evt.event_id}
                  </span>
                  <span className="text-sm font-bold text-network-cyan">{evt.attack_type}</span>
                  <span className="text-xs font-mono text-gray-400">({evt.slice_id})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityStyle(evt.severity)}`}>
                    {evt.severity}
                  </span>

                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-network-purple/20 text-network-purple border border-network-purple/30">
                    <Tag className="w-3 h-3" />
                    <span>Ground Truth: {evt.ground_truth_label} (Attack)</span>
                  </span>

                  {view === 'active' && (
                    <button
                      onClick={() => handleStop(evt.event_id)}
                      className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold bg-network-rose/20 hover:bg-network-rose/30 text-network-rose border border-network-rose/40 rounded-lg transition-all"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>Mitigate</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Affected Features Breakdown */}
              <div className="p-3 bg-network-card/80 border border-network-border/60 rounded-lg text-xs space-y-1.5 font-mono">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Affected Network Features Delta:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                  {Object.entries(evt.affected_features).map(([featKey, featVal]) => (
                    <div key={featKey} className="flex items-center justify-between border-b border-network-border/40 pb-1">
                      <span className="text-gray-400 capitalize">{featKey.replace(/_/g, ' ')}:</span>
                      <span className="text-amber-400 font-semibold truncate max-w-[200px]">
                        {typeof featVal === 'object' && featVal !== null && 'simulated' in featVal
                          ? `${featVal.baseline} ➔ ${featVal.simulated}`
                          : String(featVal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Logged: {new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <span>
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
