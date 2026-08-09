from typing import Dict, List, Any
from fastapi import APIRouter, HTTPException

from app.services.orchestrator import orchestrator

router = APIRouter()


@router.post("/step", summary="Run Integrated Closed-Loop Pipeline Step")
def run_orchestrator_step():
    """
    Execute one complete closed-loop pipeline step across all 7 framework stages:
    Simulator -> Traffic -> Anomaly Detector -> Federated FL -> MARL Agents -> SecurityController -> Enforcement.
    """
    frame = orchestrator.step_integrated_pipeline()
    return frame


@router.post("/auto-defense/enable", summary="Enable Closed-Loop RL Auto-Defense Mode")
def enable_auto_defense():
    """Enable automated RL threat detection and security control enforcement."""
    status = orchestrator.set_auto_defense(True)
    return {"message": "Automated Closed-Loop RL Security Defense is ENABLED", "auto_defense_enabled": status}


@router.post("/auto-defense/disable", summary="Disable Closed-Loop RL Auto-Defense Mode")
def disable_auto_defense():
    """Disable automated RL threat detection and security control enforcement."""
    status = orchestrator.set_auto_defense(False)
    return {"message": "Automated Closed-Loop RL Security Defense is DISABLED", "auto_defense_enabled": status}


@router.get("/state", summary="Get Integrated Pipeline State Summary")
def get_orchestrator_state():
    """Retrieve complete integrated framework pipeline state summary."""
    latest_frame = orchestrator.step_history[0] if orchestrator.step_history else orchestrator.step_integrated_pipeline()
    return {
        "auto_defense_enabled": orchestrator.auto_defense_enabled,
        "history_frames_recorded": len(orchestrator.step_history),
        "latest_pipeline_frame": latest_frame,
    }
