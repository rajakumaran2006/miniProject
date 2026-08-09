'use client';

import React, { useState, useEffect } from 'react';
import { DetectionResult, ModelMetrics } from '@/types';
import { fetchModelMetrics, predictAnomaly, trainDetector } from '@/lib/api';
import { Cpu, RefreshCw, BarChart3, AlertOctagon, CheckCircle2, ShieldAlert, Sparkles, Binary } from 'lucide-react';

export const AnomalyDetectorCard: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  const loadMetrics = async () => {
    const res = await fetchModelMetrics();
    if (res.data) setMetrics(res.data);
  };

  const handleRunPredict = async () => {
    setIsPredicting(true);
    const res = await predictAnomaly();
    setResults(res.data);
    setIsPredicting(false);
  };

  useEffect(() => {
    loadMetrics();
    handleRunPredict();
  }, []);

  const handleTrain = async () => {
    setIsTraining(true);
    const res = await trainDetector(350);
    if (res.data) {
      setMetrics(res.data);
      await handleRunPredict();
    }
    setIsTraining(false);
  };

  return (
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-cyan/10 rounded-xl text-network-cyan border border-network-cyan/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">AI Anomaly Detection Engine</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-network-cyan/20 text-network-cyan border border-network-cyan/30">
                Scikit-Learn Isolation Forest
              </span>
            </div>
            <p className="text-xs text-gray-400">Consumes 9-element telemetry vector & evaluates supervised classification performance</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-network-cyan to-network-blue hover:from-network-cyan/90 hover:to-network-blue/90 text-black text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Training Pipeline...' : 'Train ML Model'}</span>
          </button>

          <button
            onClick={handleRunPredict}
            disabled={isPredicting}
            className="flex items-center space-x-2 px-4 py-2 bg-network-dark text-gray-200 border border-network-border hover:bg-network-border rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-network-purple ${isPredicting ? 'animate-spin' : ''}`} />
            <span>Evaluate Telemetry</span>
          </button>
        </div>
      </div>

      {/* Model Performance Metrics Dashboard */}
      {metrics && (
        <div className="p-5 bg-network-dark/60 border border-network-border rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-network-border pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-network-purple" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Model Performance & Validation Metrics
              </h3>
            </div>
            <span className="text-[11px] font-mono text-gray-400">
              Dataset Size: {metrics.num_samples.toLocaleString()} samples
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Accuracy</span>
              <span className="text-lg font-extrabold text-network-emerald font-mono">
                {(metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Precision</span>
              <span className="text-lg font-extrabold text-network-cyan font-mono">
                {(metrics.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Recall</span>
              <span className="text-lg font-extrabold text-network-blue font-mono">
                {(metrics.recall * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">F1 Score</span>
              <span className="text-lg font-extrabold text-network-purple font-mono">
                {(metrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Confusion Matrix Visualization */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-gray-300">
              <Binary className="w-4 h-4 text-network-cyan" />
              <span className="font-semibold">Confusion Matrix [ [TN, FP], [FN, TP] ]:</span>
            </div>

            <div className="flex items-center space-x-2 font-mono">
              <span className="px-2.5 py-1 bg-network-dark border border-network-border rounded text-gray-300">
                TN: <strong className="text-network-emerald">{metrics.confusion_matrix[0]?.[0]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-network-dark border border-network-border rounded text-gray-300">
                FP: <strong className="text-amber-400">{metrics.confusion_matrix[0]?.[1]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-network-dark border border-network-border rounded text-gray-300">
                FN: <strong className="text-amber-400">{metrics.confusion_matrix[1]?.[0]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-network-dark border border-network-border rounded text-gray-300">
                TP: <strong className="text-network-cyan">{metrics.confusion_matrix[1]?.[1]}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Detection Prediction Output Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Real-Time Anomaly Prediction Results ({results.length} Slices Evaluated)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((res) => {
            const isAnomaly = res.predicted_status === 'ANOMALOUS';
            return (
              <div
                key={res.event_id + res.affected_slice}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isAnomaly
                    ? 'bg-network-dark/90 border-network-rose/60 shadow-lg shadow-network-rose/10'
                    : 'bg-network-dark/50 border-network-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-network-cyan">{res.affected_slice}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAnomaly
                        ? 'bg-network-rose/20 text-network-rose border-network-rose/40'
                        : 'bg-network-emerald/20 text-network-emerald border-network-emerald/40'
                    }`}
                  >
                    {res.predicted_status}
                  </span>
                </div>

                {/* Risk Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Anomaly Risk Score:</span>
                    <span className={`font-mono font-bold ${isAnomaly ? 'text-network-rose' : 'text-network-emerald'}`}>
                      {(res.anomaly_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-network-dark rounded-full overflow-hidden border border-network-border">
                    <div
                      className={`h-full transition-all duration-500 ${
                        res.anomaly_score > 0.6
                          ? 'bg-network-rose'
                          : res.anomaly_score > 0.3
                          ? 'bg-amber-400'
                          : 'bg-network-emerald'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, res.anomaly_score * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-network-border/60 flex items-center justify-between text-xs text-gray-400">
                  <span>Confidence Risk:</span>
                  <span className="font-semibold text-gray-200">{(res.confidence_score * 100).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Threat Classification:</span>
                  <span className="font-semibold text-amber-400">{res.threat_category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
