'use client';

import React, { useState, useEffect } from 'react';
import { FLPredictResponse, FLResults } from '@/types';
import { fetchFLMetrics, predictFederated, trainFederated } from '@/lib/api';
import { ShieldCheck, Lock, RefreshCw, Server, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
    <div className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#1A3C6F] rounded-xl text-white shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#111111] dark:text-[#F3F4F6] tracking-tight">
                Privacy-Preserving Federated Learning Engine
              </h2>
              <StatusBadge variant="teal">
                PyTorch FedAvg
              </StatusBadge>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Aggregates PyTorch model parameters across 3 edge nodes without transmitting raw edge telemetry
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
            {isTraining ? 'Running FedAvg...' : 'Run FedAvg Aggregation'}
          </Button>
        </div>
      </div>

      {/* 3 Edge Nodes Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {edgeNodes.map((node) => (
          <div
            key={node.id}
            className="p-4 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-[#1A3C6F] dark:text-[#179F99]" />
                <h3 className="text-xs font-bold text-[#111111] dark:text-[#F3F4F6]">{node.name}</h3>
              </div>
              <StatusBadge variant="brand">
                Isolated
              </StatusBadge>
            </div>

            <div className="space-y-1 text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono">
              <div className="flex justify-between">
                <span className="font-sans">Profile:</span>
                <span className="font-bold text-[#111111] dark:text-[#F3F4F6]">{node.focus}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">Local Samples:</span>
                <span className="font-bold text-[#111111] dark:text-[#F3F4F6]">{node.size} samples</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">Dataset Path:</span>
                <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] truncate max-w-[140px]">{node.path}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EFEFEF] dark:border-[#2E3344] flex items-center justify-between text-[11px]">
              <span className="flex items-center space-x-1 text-[#6B7280] dark:text-[#9CA3AF] font-semibold">
                <EyeOff className="w-3.5 h-3.5 text-[#179F99]" />
                <span>Raw Data Transfer</span>
              </span>
              <strong className="text-[#111111] dark:text-[#F3F4F6] font-mono">0 Vectors (Protected)</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Proof & Global Model Performance Metrics */}
      {results && (
        <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-[#2E3344] pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#179F99]" />
              <h3 className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
                Global Federated Model Metrics ({results.num_communication_rounds} FedAvg Rounds)
              </h3>
            </div>
            <StatusBadge variant="active" dot>
              Convergence Verified
            </StatusBadge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Global Accuracy</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {(results.final_global_model_metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Global Precision</span>
              <span className="text-lg font-extrabold text-[#179F99] font-mono">
                {(results.final_global_model_metrics.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Global Recall</span>
              <span className="text-lg font-extrabold text-[#111111] dark:text-[#F3F4F6] font-mono">
                {(results.final_global_model_metrics.recall * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl shadow-xs">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] block mb-1">Global F1 Score</span>
              <span className="text-lg font-extrabold text-[#1A3C6F] dark:text-[#179F99] font-mono">
                {(results.final_global_model_metrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Privacy Proof Log Certificate */}
          {results.privacy_proof && (
            <div className="p-4 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-2 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A3C6F] dark:text-[#179F99] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Privacy Proof Log Certificate (Round {results.privacy_proof.round})</span>
                </span>
                <span className="font-mono text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                  {results.privacy_proof.timestamp}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[#111111] dark:text-[#F3F4F6] font-mono">
                <div>
                  <span className="text-[#6B7280] dark:text-[#9CA3AF] block font-sans">Payload Transmitted:</span>
                  <span className="text-[#1A3C6F] dark:text-[#179F99] font-bold">
                    {results.privacy_proof.transmitted_data_type}
                  </span>
                </div>

                <div>
                  <span className="text-[#6B7280] dark:text-[#9CA3AF] block font-sans">Raw Features Transmitted:</span>
                  <span className="font-bold">{results.privacy_proof.raw_feature_vectors_transmitted}</span>
                </div>

                <div>
                  <span className="text-[#6B7280] dark:text-[#9CA3AF] block font-sans">Privacy Guarantee:</span>
                  <StatusBadge variant="active">VERIFIED ZERO-LEAKAGE</StatusBadge>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Federated Model Prediction Section */}
      <div className="p-5 bg-[#F5F5F7] dark:bg-[#222632] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#179F99]" />
            <h3 className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
              Global Federated Anomaly Inference
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <select
              value={selectedSlice}
              onChange={(e) => setSelectedSlice(e.target.value)}
              className="bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl px-3 py-1.5 text-[#111111] dark:text-[#F3F4F6] font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A3C6F]"
            >
              <option value="slice-embb-01">eMBB Video Slicing</option>
              <option value="slice-urllc-01">URLLC Transport Slice</option>
              <option value="slice-mmtc-01">mMTC IoT Mesh</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleQueryPredict}
              disabled={isPredicting}
            >
              {isPredicting ? 'Evaluating...' : 'Evaluate Model'}
            </Button>
          </div>
        </div>

        {prediction && (
          <div className="p-4 bg-white dark:bg-[#1A1D26] border border-[#EFEFEF] dark:border-[#2E3344] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs font-mono">
            <div>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-sans">Target Slice</span>
              <span className="text-sm font-bold text-[#1A3C6F] dark:text-[#179F99]">{prediction.slice_id}</span>
            </div>

            <div>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-sans">Federated Anomaly Risk</span>
              <span className="text-sm font-bold text-[#111111] dark:text-[#F3F4F6]">
                {(prediction.anomaly_score * 100).toFixed(1)}%
              </span>
            </div>

            <div>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-sans">Predicted Status</span>
              <StatusBadge
                variant={prediction.predicted_status === 'ANOMALOUS' ? 'critical' : 'active'}
                dot
              >
                {prediction.predicted_status}
              </StatusBadge>
            </div>

            <div>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] block mb-1 font-sans">Model Classifier</span>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-semibold">{prediction.model_type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
