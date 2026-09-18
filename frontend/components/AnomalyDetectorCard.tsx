'use client';

import React, { useState, useEffect } from 'react';
import { DetectionResult, ModelMetrics } from '@/types';
import { fetchModelMetrics, predictAnomaly, trainDetector } from '@/lib/api';
import { Cpu, RefreshCw, BarChart3, Sparkles, Binary } from 'lucide-react';

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
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-secondary-900">AI Anomaly Detection Engine</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                Scikit-Learn Isolation Forest
              </span>
            </div>
            <p className="text-xs text-secondary-500">Consumes 9-element telemetry vector & evaluates supervised classification performance</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Training Model...' : 'Train ML Model'}</span>
          </button>
        </div>
      </div>

      {/* Model Performance Metrics Dashboard */}
      {metrics && (
        <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-bold text-secondary-700 uppercase tracking-wider">
                Model Performance & Validation Metrics
              </h3>
            </div>
            <span className="text-[11px] font-mono text-secondary-500">
              Dataset Size: {metrics.num_samples.toLocaleString()} samples
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Accuracy</span>
              <span className="text-lg font-extrabold text-primary-600 font-mono">
                {(metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Precision</span>
              <span className="text-lg font-extrabold text-tertiary-700 font-mono">
                {(metrics.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Recall</span>
              <span className="text-lg font-extrabold text-primary-700 font-mono">
                {(metrics.recall * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">F1 Score</span>
              <span className="text-lg font-extrabold text-secondary-900 font-mono">
                {(metrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Confusion Matrix Visualization */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-secondary-700">
              <Binary className="w-4 h-4 text-primary-600" />
              <span className="font-semibold">Confusion Matrix [ [TN, FP], [FN, TP] ]:</span>
            </div>

            <div className="flex items-center space-x-2 font-mono">
              <span className="px-2.5 py-1 bg-white border border-secondary-200 rounded text-secondary-700">
                TN: <strong className="text-primary-700">{metrics.confusion_matrix[0]?.[0]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-white border border-secondary-200 rounded text-secondary-700">
                FP: <strong className="text-secondary-900">{metrics.confusion_matrix[0]?.[1]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-white border border-secondary-200 rounded text-secondary-700">
                FN: <strong className="text-secondary-900">{metrics.confusion_matrix[1]?.[0]}</strong>
              </span>
              <span className="px-2.5 py-1 bg-white border border-secondary-200 rounded text-secondary-700">
                TP: <strong className="text-primary-600">{metrics.confusion_matrix[1]?.[1]}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Detection Prediction Output Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-secondary-700 uppercase tracking-wider">
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
                    ? 'bg-secondary-100 border-secondary-400 shadow-sm'
                    : 'bg-secondary-50 border-secondary-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary-700">{res.affected_slice}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAnomaly
                        ? 'bg-secondary-900 text-white border-secondary-800'
                        : 'bg-primary-50 text-primary-700 border-primary-200'
                    }`}
                  >
                    {res.predicted_status}
                  </span>
                </div>

                {/* Risk Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary-500">Anomaly Risk Score:</span>
                    <span className={`font-mono font-bold ${isAnomaly ? 'text-secondary-900' : 'text-primary-600'}`}>
                      {(res.anomaly_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden border border-secondary-300">
                    <div
                      className={`h-full transition-all duration-500 ${
                        res.anomaly_score > 0.4
                          ? 'bg-secondary-800'
                          : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, res.anomaly_score * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-secondary-200 flex items-center justify-between text-xs text-secondary-500 font-mono">
                  <span>Confidence:</span>
                  <span className="font-semibold text-secondary-800">{(res.confidence_score * 100).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between text-xs text-secondary-500 font-mono">
                  <span>Category:</span>
                  <span className="font-semibold text-primary-700">{res.threat_category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
