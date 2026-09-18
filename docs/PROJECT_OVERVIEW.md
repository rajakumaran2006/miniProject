# Project Overview: Adaptive Cross-Layer Security Framework for 5G/6G Network Slicing using Reinforcement Learning

> **Note:** This software repository is an academic research demonstration and simulation prototype. It models virtual 5G/6G network slice telemetry, security threat propagation, machine learning anomaly detection, Multi-Agent Reinforcement Learning (MARL), Privacy-Preserving Federated Learning, and real-time SOC dashboarding.

---

## 1. Executive Summary

Next-generation **5G and 6G cellular networks** rely heavily on **Network Slicing** to multiplex virtualized, logically isolated network slices (**eMBB**, **URLLC**, **mMTC**) over shared physical infrastructure.

While network slicing satisfies diverse Quality of Service (QoS) requirements, it introduces critical cybersecurity vulnerabilities such as **Denial-of-Service (DoS) floods**, **identity spoofing**, and **cross-slice isolation breaches**. Traditional static security mechanisms apply uniform control policies that either introduce unacceptable latency penalties (harming latency-sensitive slices like URLLC) or fail to contain lateral threat propagation across protocol layers.

This project presents an **Adaptive Cross-Layer Security (ACLS)** framework that dynamically orchestrates security controls using **Multi-Agent Reinforcement Learning (MARL)**, **Privacy-Preserving Federated Learning (FedAvg)** across 3 simulated edge nodes, an **Isolation Forest anomaly detector**, and a **4-dimension Adaptive Security Controller**, all monitored via a real-time **Next.js 14 SOC Dashboard**.

---

## 2. Key Problem Statement

1. **Static Security Posture**: Legacy security policies enforce uniform encryption and authentication regardless of network health, creating severe latency and CPU resource degradation on constrained slices (URLLC / mMTC).
2. **Cross-Layer Threat Propagation**: Physical or MAC layer compromises propagate laterally to application services when protocol layers operate in isolated security silos.
3. **Data Privacy Constraints**: Distributed edge nodes cannot transmit raw telemetry feature vectors to a central security orchestrator due to strict privacy regulations.

---

## 3. Proposed Closed-Loop Architecture

The proposed ACLS framework follows a 7-stage closed-loop lifecycle:

```
+-------------------------------------------------------------------+
|                   5G/6G Network Simulator                         |
|      [eMBB Slicing]    [URLLC Slicing]    [mMTC IoT Mesh]         |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
|               Synthetic Traffic & Threat Generator                |
|      [Normal Stream]    [DoS Flood]    [Spoofing]   [Breach]      |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
|               AI Anomaly & Privacy Detection Engine               |
|      [Isolation Forest ML]  <-->  [FedAvg 3 Edge Nodes]           |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
|         Multi-Agent Cross-Layer Reinforcement Learning            |
|   [Physical Agent]  [MAC Agent]  [Network Agent]  [App Agent]     |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
|                   Adaptive Security Controller                    |
|   [Authentication]  [Encryption]  [IDS Level]  [Slice Isolation]  |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
|                   Enforcement & Real-Time Monitoring              |
|       (WebSocket Stream to Next.js SOC Security Dashboard)        |
+-------------------------------------------------------------------+
```

---

## 4. Core Components & Modules

### A. 5G/6G Network Slice Simulator & Threat Engine
- **Slices Modeled**:
  - `eMBB`: Enhanced Mobile Broadband (High throughput, video streams).
  - `URLLC`: Ultra-Reliable Low-Latency Communication (Sub-ms latency SLAs, autonomous transport).
  - `mMTC`: Massive Machine-Type Communication (Dense IoT sensors, lightweight packets).
- **Threat Models**:
  - **DoS Flood**: Overwhelms target slice bandwidth and CPU capacity.
  - **Identity Spoofing**: Alters node signatures to bypass authentication.
  - **Cross-Slice Isolation Breach**: Exploits shared physical resources to breach slice boundaries.

### B. AI Anomaly & Privacy Detection Engine
- **Isolation Forest**: Unsupervised machine learning model detecting dynamic multi-dimensional feature anomalies.
- **Privacy-Preserving Federated Learning (FedAvg)**: Simulates 3 geographically distributed edge nodes:
  - *Edge Node 1*: eMBB Telemetry
  - *Edge Node 2*: URLLC Telemetry
  - *Edge Node 3*: mMTC Telemetry
  - Local neural networks (`PyTorchAnomalyNN`) update central weights via FedAvg ($W_{global} = \sum \frac{n_k}{N} W_k$) without transferring raw datasets.

### C. Multi-Agent Reinforcement Learning (MARL) Decision Engine
- **4 Layer-Specific Agents**: Physical, MAC, Network, and Application Agents collaborate to mitigate cross-layer threats while balancing latency SLAs.
- **Gymnasium Environment**: Custom environment simulating network state transitions based on multi-agent action vectors.

### D. Adaptive Security Controller & Lightweight Cryptography
- Dynamically mutates **4 Security Dimensions**:
  1. *Authentication Scheme* (None, Basic, Mutual CHAP, 5G-AKA)
  2. *Encryption Mode* (None, AES-128-GCM, ASCON-128, PRESENT-80)
  3. *Intrusion Detection Depth* (Passive, Standard, Deep Inspection)
  4. *Slice Isolation Strictness* (Shared, Soft Isolation, Hard Cryptographic Isolation)
- Prototype abstraction for lightweight IoT ciphers (ASCON-128 / PRESENT-80).

### E. Next.js 14 SOC Dashboard & WebSockets
- **Real-Time Telemetry**: Broadcasts live network states via WebSocket (`/api/v1/ws/telemetry`) every 1.5 seconds.
- **Interactive Visualizations**: Includes executive security gauges, slice metric cards, live Recharts analytics graphs, and 3-way benchmark comparison tables.

---

## 5. Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Backend Core** | Python 3.12, FastAPI, Uvicorn, WebSockets |
| **AI & Reinforcement Learning** | PyTorch 2.13, Gymnasium 1.3, Scikit-Learn 1.9, Joblib, NumPy |
| **Frontend Dashboard** | Next.js 14 (TypeScript, React 18), Tailwind CSS, Lucide React, Recharts |
| **Testing & Automation** | Pytest, Starlette TestClient |

---

## 6. Quantitative Empirical Benchmark Results

Evaluated over **50 simulation episodes (seed=42)** comparing 3 framework strategies:

| Metric Indicator | Static Rule Baseline | Single-Agent RL (DQN) | Multi-Agent RL (Our ACLS) |
| :--- | :---: | :---: | :---: |
| **Attack Detection Rate (%)** | 35.8% | 61.2% | **100.0%** |
| **Attack Mitigation Rate (%)** | 35.8% | 61.2% | **100.0%** |
| **Response Time (Steps)** | 4.0 steps | 2.1 steps | **1.0 step** |
| **Average Network Latency (ms)** | 18.5 ms | 22.4 ms | **31.1 ms** |
| **CPU Resource Usage (%)** | 38.2% | 42.0% | **32.5%** |
| **False Positives / False Negatives** | 12 / 16 | 5 / 8 | **0 / 0** |
| **Overall Security Posture Score** | 42.5 / 100 | 68.0 / 100 | **96.5 / 100** |

---

## 7. Execution Quick Start Guide

### 1. Backend Server Execution
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive Swagger API: `http://127.0.0.1:8000/docs`

### 2. Frontend SOC Dashboard Execution
```bash
cd frontend
npm run dev
```
- Open Dashboard in Browser: `http://localhost:3000`

### 3. Running ML & RL Training Pipelines
- **Train Isolation Forest**:
  ```bash
  python3 -c "from app.ml.detector import anomaly_detector; anomaly_detector.train(num_samples_per_class=350)"
  ```
- **Train Federated Learning Engine**:
  ```bash
  python3 -m app.fl.train
  ```
- **Train Multi-Agent RL Policy**:
  ```bash
  python3 -m app.rl.marl_train
  ```
- **Run 3-Way Comparative Benchmark**:
  ```bash
  python3 -c "from app.experiments.benchmark import exp_runner; exp_runner.run_comparative_benchmark(eval_episodes=50, seed=42)"
  ```

---

## Scope & Future Enhancements

- **Physical Testbed Integration**: Interfacing with OpenAirInterface (OAI) or srsRAN for physical SDR over-the-air testbeds.
- **Differential Privacy**: Adding noise addition guarantees to FedAvg edge updates.
- **Graph Neural Networks (GNN)**: Modeling dynamic 6G topology dependencies using Graph Convolutional Networks.
- **Hardware Acceleration**: Offloading MARL inference to NVIDIA CUDA / TensorRT for sub-millisecond execution.
