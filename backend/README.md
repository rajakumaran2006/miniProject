# 5G/6G Security Framework Backend Service and Closed-Loop Orchestrator

FastAPI-powered backend service, network slicing simulation engine, Scikit-Learn anomaly detector, Multi-Agent Cross-Layer RL Framework, Privacy-Preserving Federated Learning Engine, Adaptive Security Controller, and WebSocket Telemetry Streaming for 5G/6G security research.

Note: This software service is an academic research simulation prototype.

## Setup and Execution

### 1. Create Virtual Environment and Install Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Run Automated Pytest Suite (40 Tests Passed)
```bash
pytest
```

### 3. Run Standalone Pipelines
```bash
python3 -m app.fl.train
python3 -m app.rl.marl_train
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Master Integrated Security Orchestrator (app/services/orchestrator.py)

The IntegratedSecurityOrchestrator unifies all 7 framework stages:
1. 5G/6G Network Simulator Step
2. Traffic Generation (Normal and Threats)
3. Scikit-Learn Isolation Forest Anomaly Detection
4. Privacy-Preserving Federated Model Evaluation
5. Multi-Agent Cross-Layer RL (PHY, MAC, NET, APP) Inference
6. Adaptive Security Controller Enforcement (Auth, Encryption, IDS, Isolation)
7. Network State Update and Recovery (Broadcasted via WebSocket)

## API Endpoints Reference

### Integrated Closed-Loop Orchestrator
- POST /api/v1/orchestrator/step : Run closed-loop pipeline step.
- POST /api/v1/orchestrator/auto-defense/enable : Enable automated RL defense.
- POST /api/v1/orchestrator/auto-defense/disable : Disable automated RL defense.
- GET /api/v1/orchestrator/state : Fetch complete integrated pipeline state.

### Real-Time WebSocket Telemetry Streaming
- WS /api/v1/ws/telemetry : Streams live network telemetry every 1.5s.
