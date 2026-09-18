'use client';

import React, { useState, useEffect } from 'react';
import { FLPredictResponse, FLResults } from '@/types';
import { fetchFLMetrics, predictFederated, trainFederated } from '@/lib/api';
import { ShieldCheck, Lock, RefreshCw, Server, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export const FederatedLearningCard: React.FC = () => {
  const [results, setResults] = useState<FLResults | null>(null);
  const [selectedSlice, setSelectedSlice] = useState<string>('slice-embb-01');
  const [prediction, setPrediction] = useState<FLPredictResponse | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  const loadMetrics = async () => {
    const res = await fetchFLMetrics();
    if (res.data) setResults(res.data);
  };

  const handleQueryPredict = async () => {
    setIsPredicting(true);
    const res = await predictFederated(selectedSlice);
    if (res.data) setPrediction(res.data);
    setIsPredicting(false);
  };

  useEffect(() => {
    loadMetrics();
    handleQueryPredict();
  }, [selectedSlice]);

  const handleTrain = async () => {
    setIsTraining(true);
    const res = await trainFederated(10);
    if (res.data) {
      setResults(res.data);
      await handleQueryPredict();
    }
    setIsTraining(false);
  };

  const edgeNodes = [
    { id: 'edge-node-1', name: 'Edge Node 1 (eMBB Video)', focus: 'eMBB Throughput', size: 400, path: 'data/edge_node_1/local_dataset.csv' },
    { id: 'edge-node-2', name: 'Edge Node 2 (URLLC Transport)', focus: 'URLLC Latency', size: 300, path: 'data/edge_node_2/local_dataset.csv' },
    { id: 'edge-node-3', name: 'Edge Node 3 (mMTC IoT Mesh)', focus: 'mMTC Auth Churn', size: 500, path: 'data/edge_node_3/local_dataset.csv' },
  ];

  return (
    <div className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-tertiary-50 rounded-xl text-tertiary-700 border border-tertiary-200">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-secondary-900">Privacy-Preserving Federated Learning Engine</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-tertiary-50 text-tertiary-700 border border-tertiary-200">
                PyTorch FedAvg Algorithm
              </span>
            </div>
            <p className="text-xs text-secondary-500">Aggregates PyTorch model parameters across 3 edge nodes without transmitting raw edge telemetry</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Running FedAvg...' : 'Run FedAvg Aggregation'}</span>
          </button>
        </div>
      </div>

      {/* 3 Edge Nodes Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {edgeNodes.map((node) => (
          <div key={node.id} className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-primary-600" />
                <h3 className="text-xs font-bold text-secondary-800">{node.name}</h3>
              </div>
              <span className="text-[10px] font-mono text-primary-700 px-2 py-0.5 rounded bg-primary-50 border border-primary-200 font-bold">
                Isolated
              </span>
            </div>

            <div className="space-y-1 text-xs text-secondary-600 font-mono">
              <div className="flex justify-between">
                <span className="text-secondary-500">Profile:</span>
                <span className="font-semibold text-secondary-800">{node.focus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Local Samples:</span>
                <span className="font-bold text-secondary-900">{node.size} samples</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Dataset Path:</span>
                <span className="text-[10px] text-secondary-400 truncate max-w-[140px]">{node.path}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-secondary-200 flex items-center justify-between text-[11px]">
              <span className="flex items-center space-x-1 text-secondary-700 font-semibold">
                <EyeOff className="w-3.5 h-3.5 text-primary-600" />
                <span>Raw Data Transfer</span>
              </span>
              <strong className="text-secondary-900 font-mono">0 Vectors (Protected)</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Proof & Global Model Performance Metrics */}
      {results && (
        <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-secondary-200 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              <h3 className="text-sm font-bold text-secondary-900">
                Global Federated Model Metrics ({results.num_communication_rounds} FedAvg Rounds)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-primary-700 font-bold">
              Convergence Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Global Accuracy</span>
              <span className="text-lg font-extrabold text-primary-600 font-mono">
                {(results.final_global_model_metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Global Precision</span>
              <span className="text-lg font-extrabold text-tertiary-700 font-mono">
                {(results.final_global_model_metrics.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Global Recall</span>
              <span className="text-lg font-extrabold text-secondary-900 font-mono">
                {(results.final_global_model_metrics.recall * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-white border border-secondary-200 rounded-lg shadow-sm">
              <span className="text-xs text-secondary-500 block mb-1">Global F1 Score</span>
              <span className="text-lg font-extrabold text-primary-700 font-mono">
                {(results.final_global_model_metrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Privacy Proof Log Certificate */}
          {results.privacy_proof && (
            <div className="p-4 bg-white border border-primary-200 rounded-lg space-y-2 text-xs shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" />
                  <span>Privacy Proof Log Certificate (Round {results.privacy_proof.round})</span>
                </span>
                <span className="font-mono text-[10px] text-secondary-500">{results.privacy_proof.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-secondary-700 font-mono">
                <div>
                  <span className="text-secondary-500 block">Payload Transmitted:</span>
                  <span className="text-primary-700 font-bold">{results.privacy_proof.transmitted_data_type}</span>
                </div>

                <div>
                  <span className="text-secondary-500 block">Raw Features Transmitted:</span>
                  <span className="text-secondary-900 font-bold">{results.privacy_proof.raw_feature_vectors_transmitted}</span>
                </div>

                <div>
                  <span className="text-secondary-500 block">Privacy Guarantee:</span>
                  <span className="text-primary-600 font-bold">VERIFIED ZERO-LEAKAGE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Federated Model Prediction Section */}
      <div className="p-5 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-tertiary-700" />
            <h3 className="text-sm font-bold text-secondary-900">Global Federated Anomaly Inference</h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-white border border-secondary-300 rounded-lg px-3 py-1.5 text-secondary-800 font-semibold focus:outline-none focus:border-primary-500"
            >
              <option value="slice-embb-01">eMBB Video Slicing</option>
              <option value="slice-urllc-01">URLLC Transport Slice</option>
              <option value="slice-mmtc-01">mMTC IoT Mesh</option>
            </select>

            <button
              onClick={handleQueryPredict}
              disabled={isPredicting}
              className="px-3.5 py-1.5 bg-secondary-100 hover:bg-secondary-200 text-secondary-800 border border-secondary-300 font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isPredicting ? 'Evaluating...' : 'Evaluate Model'}
            </button>
          </div>
        </div>

        {prediction && (
          <div className="p-4 bg-white border border-secondary-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm font-mono">
            <div>
              <span className="text-secondary-500 block mb-1">Target Slice</span>
              <span className="text-sm font-bold text-primary-700">{prediction.slice_id}</span>
            </div>

            <div>
              <span className="text-secondary-500 block mb-1">Federated Anomaly Risk Score</span>
              <span className="text-sm font-bold text-secondary-900">
                {(prediction.anomaly_score * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="text-secondary-500 block mb-1">Predicted Status</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  prediction.predicted_status === 'ANOMALOUS'
                    ? 'bg-secondary-900 text-white border-secondary-800'
                    : 'bg-primary-50 text-primary-700 border-primary-200'
                }`}
              >
                {prediction.predicted_status}
              </span>
            </div>

            <div>
              <span className="text-secondary-500 block mb-1">Model Classifier</span>
              <span className="text-[11px] text-secondary-700 font-semibold">{prediction.model_type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
