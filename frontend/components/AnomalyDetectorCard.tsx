'use client';

import React, { useState, useEffect } from 'react';
import { DetectionResult, ModelMetrics } from '@/types';
import { fetchModelMetrics, predictAnomaly, trainDetector } from '@/lib/api';
import { Cpu, RefreshCw, BarChart3, Binary } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
                AI Anomaly Detection Engine
              </h2>
              <StatusBadge variant="brand">
                Scikit-Learn Isolation Forest
              </StatusBadge>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Consumes 9-element telemetry vector & evaluates supervised classification performance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleTrain}
            disabled={isTraining}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />}
          >
            {isTraining ? 'Training Model...' : 'Train ML Model'}
          </Button>
        </div>
      </div>

      {/* Model Performance Metrics Dashboard */}
      {metrics && (
        <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#179F99]" />
              <h3 className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6] uppercase tracking-wider">
                Model Performance & Validation Metrics
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
              Dataset Size: {metrics.num_samples.toLocaleString()} samples
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Accuracy</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {(metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Precision</span>
              <span className="text-lg font-extrabold text-[#179F99] font-mono">
                {(metrics.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Recall</span>
              <span className="text-lg font-extrabold text-[#1A3C6F] dark:text-[#179F99] font-mono">
                {(metrics.recall * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">F1 Score</span>
              <span className="text-lg font-extrabold text-[#111111] dark:text-[#F3F4F6] font-mono">
                {(metrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Confusion Matrix Visualization */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-[#111111] dark:text-[#F3F4F6]">
              <Binary className="w-4 h-4 text-[#179F99]" />
              <span className="font-bold">Confusion Matrix [ [TN, FP], [FN, TP] ]:</span>
            </div>

            <div className="flex items-center space-x-2 font-mono flex-wrap gap-y-1">
              <span className="px-2.5 py-1 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                TN: <strong className="text-[#1A3C6F] dark:text-[#179F99]">{metrics.confusion_matrix[0]?.[0]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                FP: <strong className="text-[#111111] dark:text-[#F3F4F6]">{metrics.confusion_matrix[0]?.[1]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                FN: <strong className="text-[#111111] dark:text-[#F3F4F6]">{metrics.confusion_matrix[1]?.[0]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                TP: <strong className="text-emerald-600 dark:text-emerald-400">{metrics.confusion_matrix[1]?.[1]}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Detection Prediction Output Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
          Real-Time Anomaly Prediction Results ({results.length} Slices Evaluated)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((res) => {
            const isAnomaly = res.predicted_status === 'ANOMALOUS';
            return (
              <div
                key={res.event_id + res.affected_slice}
                className={`p-5 rounded-xl border space-y-3 transition-all ${
                  isAnomaly
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-400 ring-1 ring-rose-500 shadow-xs'
                    : 'bg-[#F5F5F7] dark:bg-[#222632] border-[#EFEFEF] dark:border-[#2E3344]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1A3C6F] dark:text-[#179F99]">
                    {res.affected_slice}
                  </span>
                  <StatusBadge
                    variant={isAnomaly ? 'critical' : 'active'}
                    dot
                  >
                    {res.predicted_status}
                  </StatusBadge>
                </div>

                {/* Risk Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Anomaly Risk Score:</span>
                    <span className={`font-mono font-bold ${isAnomaly ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {(res.anomaly_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#EFEFEF] dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        res.anomaly_score > 0.4
                          ? 'bg-rose-600'
                          : 'bg-[#179F99]'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, res.anomaly_score * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EFEFEF] dark:border-[#2E3344] flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono">
                  <span className="font-sans">Confidence:</span>
                  <span className="font-bold text-[#111111] dark:text-[#F3F4F6]">
                    {(res.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono">
                  <span className="font-sans">Category:</span>
                  <span className="font-bold text-[#1A3C6F] dark:text-[#179F99]">{res.threat_category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
