from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    slices,
    simulation,
    attacks,
    detection,
    rl,
    fl,
    controls,
    orchestrator,
    websocket,
    experiments,
    ovs,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health Check"])
api_router.include_router(slices.router, tags=["5G/6G Network Slicing Telemetry"])
api_router.include_router(ovs.router, prefix="/ovs", tags=["Open vSwitch Overlay Virtual Network (OVN)"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation Control"])
api_router.include_router(attacks.router, prefix="/attacks", tags=["Cybersecurity Threat Simulation"])
api_router.include_router(detection.router, prefix="/detection", tags=["AI Anomaly Detection"])
api_router.include_router(rl.router, prefix="/rl", tags=["Reinforcement Learning Security Agent"])
api_router.include_router(fl.router, prefix="/fl", tags=["Federated Learning Privacy-Preserving Anomaly Detection"])
api_router.include_router(controls.router, prefix="/controls", tags=["Adaptive Security Control & Audit Logger"])
api_router.include_router(orchestrator.router, prefix="/orchestrator", tags=["Integrated Closed-Loop Orchestrator"])
api_router.include_router(experiments.router, prefix="/experiments", tags=["3-Way Comparative Experiment Benchmark"])
api_router.include_router(websocket.router, tags=["Real-time Telemetry Streaming WebSocket"])
