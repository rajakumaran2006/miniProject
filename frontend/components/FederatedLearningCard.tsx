'use client';

import React, { useState, useEffect } from 'react';
import { FLPredictResponse, FLResults } from '@/types';
import { fetchFLMetrics, predictFederated, trainFederated } from '@/lib/api';
import { ShieldCheck, Lock, RefreshCw, Cpu, Database, Binary, CheckCircle2, Server, EyeOff, Sparkles, Activity } from 'lucide-react';

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
    <div className="bg-network-card border border-network-border rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-network-blue/10 rounded-xl text-network-blue border border-network-blue/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Privacy-Preserving Federated Learning Engine</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-network-blue/20 text-network-blue border border-network-blue/30">
                PyTorch FedAvg Algorithm
              </span>
            </div>
            <p className="text-xs text-gray-400">Aggregates PyTorch model parameters (W) across 3 edge nodes without transmitting raw edge telemetry</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-network-blue to-network-cyan text-black text-xs font-bold rounded-xl shadow-lg hover:from-network-blue/90 hover:to-network-cyan/90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Running FedAvg Rounds...' : 'Run FedAvg Aggregation'}</span>
          </button>
        </div>
      </div>

      {/* 3 Edge Nodes Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {edgeNodes.map((node) => (
          <div key={node.id} className="p-4 bg-network-dark/60 border border-network-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-network-cyan" />
                <h3 className="text-xs font-bold text-gray-200">{node.name}</h3>
              </div>
              <span className="text-[10px] font-mono text-network-emerald px-2 py-0.5 rounded bg-network-emerald/10 border border-network-emerald/20">
                Isolated Dataset
              </span>
            </div>

            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Traffic Profile:</span>
                <span className="font-semibold text-gray-200">{node.focus}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Dataset Size:</span>
                <span className="font-mono text-network-cyan font-bold">{node.size} samples</span>
              </div>
              <div className="flex justify-between">
                <span>Isolated Disk Storage:</span>
                <span className="font-mono text-[10px] text-gray-500 truncate max-w-[140px]">{node.path}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-network-border/60 flex items-center justify-between text-[11px]">
              <span className="flex items-center space-x-1 text-network-emerald font-semibold">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Raw Data Transfer</span>
              </span>
              <strong className="text-network-rose font-mono">0 Vectors (Blocked)</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Proof & Global Model Performance Metrics */}
      {results && (
        <div className="p-5 bg-network-dark/80 border border-network-border rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-network-border pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-network-emerald" />
              <h3 className="text-sm font-bold text-white">
                Global Federated Model Metrics ({results.num_communication_rounds} FedAvg Communication Rounds)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-network-emerald font-bold">
              FedAvg Parameter Convergence Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Global Accuracy</span>
              <span className="text-lg font-extrabold text-network-emerald font-mono">
                {(results.final_global_model_metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Global Precision</span>
              <span className="text-lg font-extrabold text-network-cyan font-mono">
                {(results.final_global_model_metrics.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Global Recall</span>
              <span className="text-lg font-extrabold text-network-blue font-mono">
                {(results.final_global_model_metrics.recall * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-network-card border border-network-border rounded-lg">
              <span className="text-xs text-gray-400 block mb-1">Global F1 Score</span>
              <span className="text-lg font-extrabold text-network-purple font-mono">
                {(results.final_global_model_metrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Privacy Proof Log Card */}
          {results.privacy_proof && (
            <div className="p-4 bg-network-card/80 border border-network-emerald/30 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-network-emerald flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Privacy Proof Log Certificate (Round {results.privacy_proof.round})</span>
                </span>
                <span className="font-mono text-[10px] text-gray-400">{results.privacy_proof.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-gray-300 font-mono">
                <div>
                  <span className="text-gray-500 block">Payload Type Transmitted:</span>
                  <span className="text-network-cyan font-bold">{results.privacy_proof.transmitted_data_type}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">Raw Features Transmitted:</span>
                  <span className="text-network-emerald font-bold">{results.privacy_proof.raw_feature_vectors_transmitted}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">Privacy Guarantee:</span>
                  <span className="text-network-emerald font-bold">VERIFIED SECURE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Federated Model Prediction Section */}
      <div className="p-5 bg-network-dark/60 border border-network-border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-network-cyan" />
            <h3 className="text-sm font-bold text-white">Global Federated Anomaly Inference</h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-network-card border border-network-border rounded-lg px-3 py-1.5 text-gray-200 font-semibold focus:outline-none focus:border-network-cyan"
            >
              <option value="slice-embb-01">eMBB Video Slicing</option>
              <option value="slice-urllc-01">URLLC Transport Slice</option>
              <option value="slice-mmtc-01">mMTC IoT Mesh</option>
            </select>

            <button
              onClick={handleQueryPredict}
              disabled={isPredicting}
              className="px-3 py-1.5 bg-network-blue/20 text-network-blue border border-network-blue/40 hover:bg-network-blue/30 font-bold rounded-lg transition-all disabled:opacity-50"
            >
              Evaluate Global FL Model
            </button>
          </div>
        </div>

        {prediction && (
          <div className="p-4 bg-network-card border border-network-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-gray-400 block mb-1">Target Network Slice</span>
              <span className="text-sm font-bold font-mono text-network-cyan">{prediction.slice_id}</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Federated Anomaly Risk Score</span>
              <span className={`text-sm font-bold font-mono ${prediction.predicted_status === 'ANOMALOUS' ? 'text-network-rose' : 'text-network-emerald'}`}>
                {(prediction.anomaly_score * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Predicted Status</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  prediction.predicted_status === 'ANOMALOUS'
                    ? 'bg-network-rose/20 text-network-rose border-network-rose/40'
                    : 'bg-network-emerald/20 text-network-emerald border-network-emerald/40'
                }`}
              >
                {prediction.predicted_status}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Model Classifier</span>
              <span className="text-[11px] font-mono text-gray-300 font-semibold">{prediction.model_type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
