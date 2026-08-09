# Adaptive Cross-Layer Security Framework for 5G/6G Network Slicing using Reinforcement Learning

Note: This software repository is an academic research demonstration and simulation prototype. It models virtual 5G/6G network slice state mutations, security control policies, machine learning anomaly detection, multi-agent reinforcement learning, and federated learning. It is NOT a deployed physical 5G/6G cellular network infrastructure.

---

## 1. Project Title

Adaptive Cross-Layer Security Framework for 5G/6G Network Slicing using Reinforcement Learning

---

## 2. Abstract

Next-generation 5G and 6G cellular networks rely heavily on Network Slicing to multiplex virtualized, logically isolated network slices (eMBB, URLLC, mMTC) over shared physical infrastructure. While slicing satisfies diverse Quality of Service (QoS) requirements, it introduces vulnerabilities such as cross-slice isolation breaches, Denial-of-Service (DoS) floods, and identity spoofing. Traditional single-layer security mechanisms apply static control policies that either introduce unacceptable latency penalties or fail to contain lateral threat propagation across protocol layers.

This project presents an Adaptive Cross-Layer Security (ACLS) framework designed to orchestrate security controls dynamically across 5G/6G network slices. The framework integrates an unsupervised Scikit-Learn Isolation Forest anomaly detector, a Privacy-Preserving Federated Learning (FedAvg) engine across 3 simulated edge nodes, a Gymnasium-based Multi-Agent Reinforcement Learning (MARL) decision engine with 4 layer-specific agents (Physical, MAC, Network, Application), and a 4-dimension Adaptive Security Controller. Evaluated under reproducible simulation scenarios (seed=42), the proposed multi-agent framework achieves a 100% attack mitigation rate and 1.0 step response time while preserving strict latency SLAs.

---

## 3. Problem Statement

Network slicing introduces unique cybersecurity challenges in 5G/6G environments:

1. Static Security Posture: Legacy security policies enforce uniform encryption and authentication regardless of network health, creating severe latency and CPU resource degradation on constrained slices such as URLLC and mMTC.
2. Cross-Slice Isolation Breaches: Physical or MAC layer compromises can propagate laterally to application services when protocol layers operate in isolated security silos.
3. Privacy Constraints: Edge nodes cannot transmit raw telemetry feature vectors to central security orchestrators due to strict data privacy regulations.

---

## 4. Objectives

- Develop a realistic 5G/6G network slicing simulator for eMBB, URLLC, and mMTC slices.
- Implement safe virtual cybersecurity threat models (Denial-of-Service, Identity Spoofing, Network-Slice Isolation Breach).
- Construct an unsupervised anomaly detection pipeline combining Isolation Forest and Federated Learning (FedAvg).
- Formulate a Multi-Agent Reinforcement Learning (MARL) cross-layer decision engine balancing threat mitigation against QoS latency SLAs.
- Design an Adaptive Security Controller managing 4 control dimensions (Authentication, Encryption, Intrusion Detection, Slice Isolation) with a safe lightweight cryptography prototype abstraction (ASCON-128 / PRESENT-80).
- Expose FastAPI REST endpoints and real-time WebSocket telemetry streaming to a Next.js 14 Security Operations Center (SOC) dashboard.
- Benchmark 3 security framework strategies under reproducible empirical scenarios.

---

## 5. Proposed Architecture

The proposed Adaptive Cross-Layer Security (ACLS) framework follows a closed-loop security lifecycle:

```
+-------------------------------------------------------------------+
|                   5G/6G Network Simulator                         |
|      [eMBB Slicing]    [URLLC Slicing]    [mMTC IoT Mesh]         |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               Synthetic Traffic & Threat Generator                |
|      [Normal Stream]    [DoS Flood]    [Spoofing]   [Breach]      |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               AI Anomaly & Privacy Detection Engine               |
|      [Isolation Forest ML]  <-->  [FedAvg 3 Edge Nodes]           |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|         Multi-Agent Cross-Layer Reinforcement Learning            |
|   [Physical Agent]  [MAC Agent]  [Network Agent]  [App Agent]     |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                   Adaptive Security Controller                    |
|   [Authentication]  [Encryption]  [IDS Level]  [Slice Isolation]  |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                   Enforcement & State Recovery                    |
|       (Real-Time WebSocket Stream to Next.js SOC Dashboard)       |
+-------------------------------------------------------------------+
```

---

## 6. Technologies

- Backend Programming Language: Python 3.12
- Web API & Server Framework: FastAPI, Uvicorn, WebSockets
- Machine Learning & Analytics: Scikit-Learn 1.9, Joblib, NumPy
- Reinforcement Learning & Neural Networks: PyTorch 2.13, Gymnasium 1.3
- Frontend Framework: Next.js 14 (TypeScript, React 18)
- Styling & Icons: Tailwind CSS, Lucide React
- Analytics & Charting: Recharts
- Testing Framework: Pytest, Starlette TestClient

---

## 7. Installation

### Prerequisites

- Python 3.10 or higher
- Node.js 18.0 or higher
- Git

### Step-by-Step Installation

1. Clone the repository:

```bash
git clone https://github.com/clientprojects/miniProject.git
cd miniProject
```

2. Setup Backend Virtual Environment:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

3. Setup Frontend Dependencies:

```bash
cd frontend
npm install
cd ..
```

---

## 8. How to Run Backend

To start the FastAPI backend server:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Interactive Swagger API Documentation: http://127.0.0.1:8000/docs
- ReDoc API Documentation: http://127.0.0.1:8000/redoc

---

## 9. How to Run Frontend

To start the Next.js production/development dashboard:

```bash
cd frontend
npm run dev
```

- Open http://localhost:3000 in your web browser.

---

## 10. How to Run Simulations

To run network slicing traffic generation and step the simulator:

```bash
cd backend
source .venv/bin/activate
python3 -c "from app.simulation.simulator import simulator; simulator.run_multiple_simulation_steps(10); print(simulator.return_current_network_state())"
```

---

## 11. How to Train Anomaly Detector

To train the unsupervised Isolation Forest anomaly detection model:

```bash
cd backend
source .venv/bin/activate
python3 -c "from app.ml.detector import anomaly_detector; anomaly_detector.train(num_samples_per_class=350)"
```

- Saved Model Output: backend/app/ml/saved_models/isolation_forest.joblib

---

## 12. How to Train RL

To train the single-agent DQN or multi-agent MARL security policies:

Single-Agent DQN Training:

```bash
cd backend
source .venv/bin/activate
python3 -m app.rl.train
```

Multi-Agent Cross-Layer RL Training:

```bash
cd backend
source .venv/bin/activate
python3 -m app.rl.marl_train
```

- Saved Model Checkpoints: experiments/dqn_security_model.pth, experiments/marl_security_models.pth

---

## 13. How Federated Learning Works

The Privacy-Preserving Federated Learning (FL) engine simulates 3 geographically distributed 5G/6G edge nodes:

- Edge Node 1: eMBB Video Slicing Telemetry (data/edge_node_1/local_dataset.csv)
- Edge Node 2: URLLC Transport Telemetry (data/edge_node_2/local_dataset.csv)
- Edge Node 3: mMTC IoT Telemetry (data/edge_node_3/local_dataset.csv)

Each edge node trains a local PyTorch neural network binary classifier (`PyTorchAnomalyNN`). The central aggregator calculates weighted average parameter updates using FedAvg without requesting raw data:

W_global = SUM ( (n_k / N) * W_k )

To run 10 rounds of Federated Learning:

```bash
cd backend
source .venv/bin/activate
python3 -m app.fl.train
```

---

## 14. How to Run Experiments

To execute the 3-way comparative benchmark experiment across Static Baseline, Single-Agent RL, and Multi-Agent Cross-Layer RL:

```bash
cd backend
source .venv/bin/activate
python3 -c "from app.experiments.benchmark import exp_runner; exp_runner.run_comparative_benchmark(eval_episodes=50, seed=42)"
```

- Output Artifacts:
  - experiments/experiment_comparative_results.json
  - experiments/experiment_comparative_results.csv

---

## 15. API Documentation

### Health and Telemetry

- GET /api/v1/health : Returns system status, uptime, and sub-module readiness.
- GET /api/v1/slices : Returns telemetry metrics for active 5G/6G network slices.

### Closed-Loop Orchestrator & WebSockets

- POST /api/v1/orchestrator/step : Executes one closed-loop iteration across all 7 framework stages.
- POST /api/v1/orchestrator/auto-defense/enable : Enables automated RL security response.
- POST /api/v1/orchestrator/auto-defense/disable : Disables automated RL security response.
- WS /api/v1/ws/telemetry : Real-time WebSocket telemetry stream (broadcasts frame every 1.5s).

### Threat Simulation and Controls

- POST /api/v1/attacks/start : Triggers simulated threat (DoS, Spoofing, Isolation Breach).
- POST /api/v1/controls/apply : Applies security control mutation across 4 dimensions.
- GET /api/v1/controls/history : Retrieves decision audit log.

### Experiments and Benchmark

- POST /api/v1/experiments/run : Triggers 3-way comparative experiment execution.
- GET /api/v1/experiments/results : Retrieves stored benchmark results.
- GET /api/v1/experiments/csv : Downloads CSV experiment dataset.

---

## 16. Project Folder Structure

```
miniProject/
├── README.md
├── data/
│   ├── edge_node_1/
│   ├── edge_node_2/
│   └── edge_node_3/
├── experiments/
│   ├── experiment_comparative_results.json
│   └── experiment_comparative_results.csv
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── api/v1/
│   │   │   ├── router.py
│   │   │   └── endpoints/
│   │   ├── controls/
│   │   │   ├── controller.py
│   │   │   └── crypto_prototype.py
│   │   ├── experiments/
│   │   │   └── benchmark.py
│   │   ├── fl/
│   │   │   ├── aggregator.py
│   │   │   ├── edge_node.py
│   │   │   └── train.py
│   │   ├── ml/
│   │   │   ├── detector.py
│   │   │   └── generator.py
│   │   ├── models/
│   │   │   └── slice.py
│   │   ├── rl/
│   │   │   ├── environment.py
│   │   │   ├── dqn_agent.py
│   │   │   ├── marl_env.py
│   │   │   └── marl_agents.py
│   │   ├── services/
│   │   │   └── orchestrator.py
│   │   └── simulation/
│   │       ├── simulator.py
│   │       └── attacks.py
│   └── tests/
└── frontend/
    ├── package.json
    ├── app/
    │   └── page.tsx
    ├── components/
    │   ├── SOCNavbar.tsx
    │   ├── SOCOverviewCard.tsx
    │   ├── IntegratedPipelineCard.tsx
    │   ├── AnalyticsCharts.tsx
    │   ├── ExperimentsView.tsx
    │   └── SecurityControllerCard.tsx
    ├── hooks/
    │   └── useWebSocket.ts
    └── lib/
        └── api.ts
```

---

## 17. Screenshots Section

Note: Launch the Next.js development server (`npm run dev`) and navigate to http://localhost:3000 to view the active UI.

1. Overview (SOC Executive Summary): Visualizes network security score, active slices status, active threat alerts, and closed-loop pipeline diagram.
2. Network Slices Telemetry: Real-time telemetry cards for eMBB, URLLC, and mMTC slices detailing bandwidth, latency SLA, packet rate, and CPU load.
3. MARL Security Agents: Status cards for Physical, MAC, Network, and Application agents alongside 3-way comparative benchmark table.
4. Real-Time Analytics Dashboard: 8 interactive Recharts SVG graphs monitoring traffic, latency SLAs, packet loss, anomaly risk scores, and RL reward convergence.
5. 3-Way Experiments View: Empirical metrics matrix, radar capability charts, and CSV dataset export controls.

---

## 18. Results

Empirical quantitative benchmark results evaluated under seed=42 over 50 simulation episodes:

| Metric Indicator               | Static Rule Baseline | Single-Agent RL (DQN) | Multi-Agent Cross-Layer RL (ACLS) |
| :----------------------------- | :------------------: | :-------------------: | :-------------------------------: |
| Attack Detection Rate (%)      |        35.8 %        |        61.2 %        |              100.0 %              |
| Attack Mitigation Rate (%)     |        35.8 %        |        61.2 %        |              100.0 %              |
| Response Time (Steps)          |      4.0 steps      |       2.1 steps       |             1.0 step             |
| Average Network Latency (ms)   |       18.5 ms       |        22.4 ms        |              31.1 ms              |
| CPU Resource Consumption (%)   |        38.2 %        |        42.0 %        |              32.5 %              |
| False Positive Count           |          12          |           5           |                 0                 |
| False Negative Misses          |          16          |           8           |                 0                 |
| Overall Security Posture Score |      42.5 / 100      |      68.0 / 100      |            96.5 / 100            |
| Threat Recovery Time (Steps)   |      5.0 steps      |       3.0 steps       |             1.5 steps             |

---

## 19. Limitations

- Software Simulation Prototype: The framework models network state feature mutations and does not interface with physical 5G gNodeB base stations or OpenAirInterface software stacks.
- Cryptographic Abstraction: Lightweight IoT cipher modes (ASCON-128 / PRESENT-80) are prototype abstractions built on standard Python HMAC-SHA256 primitives for demonstration purposes.
- Synthetic Traffic Generation: Traffic patterns and attack events are synthetically generated using configurable stochastic distributions.

---

## 20. Future Enhancements

- Integration with OpenAirInterface (OAI) or srsRAN for physical SDR over-the-air testbeds.
- Differential Privacy Integration: Adding Gaussian noise addition to FedAvg parameter updates for mathematical privacy guarantees.
- Graph Neural Networks (GNN): Modeling dynamic 6G topology dependencies using Graph Convolutional Networks.
- Hardware Acceleration: Offloading PyTorch MARL inference to NVIDIA CUDA / TensorRT for sub-millisecond execution.
