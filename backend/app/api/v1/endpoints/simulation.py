from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.simulation.config import SimulationConfig
from app.simulation.state import NetworkState, AnomalyEvent
from app.simulation.simulator import simulator

router = APIRouter()


class StepRequest(BaseModel):
    steps: int = Field(default=1, ge=1, le=1000, description="Number of simulation steps to run")


class AnomalyRequest(BaseModel):
    slice_id: str = Field(..., json_schema_extra={"example": "slice-urllc-01"}, description="Target slice ID")
    anomaly_type: str = Field(default="DDOS_SURGE", json_schema_extra={"example": "DDOS_SURGE"}, description="Type of attack/anomaly")
    duration_steps: int = Field(default=5, ge=1, le=50, description="Duration in simulation steps")


@router.post("/start", summary="Start Simulation Runner")
def start_simulation():
    """
    Start the background simulation execution runner.
    """
    started = simulator.start_simulation()
    return {
        "message": "Simulation started" if started else "Simulation already running",
        "is_running": simulator.state.is_running,
    }


@router.post("/stop", summary="Stop Simulation Runner")
def stop_simulation():
    """
    Pause/stop the background simulation execution runner.
    """
    stopped = simulator.stop_simulation()
    return {
        "message": "Simulation stopped" if stopped else "Simulation already stopped",
        "is_running": simulator.state.is_running,
    }


@router.post("/reset", summary="Reset Simulation Environment")
def reset_simulation():
    """
    Reset simulation state, step counters, active anomalies, and network slices to baseline values.
    """
    state = simulator.reset_simulation()
    return {
        "message": "Simulation environment reset successfully",
        "state": state.to_dict(),
    }


@router.post("/step", summary="Run Discrete Simulation Steps")
def run_simulation_step(req: StepRequest = StepRequest()):
    """
    Advance simulation state by N discrete time-steps manually.
    """
    state = simulator.run_multiple_simulation_steps(req.steps)
    return {
        "message": f"Executed {req.steps} simulation step(s)",
        "current_step": state.step_count,
        "state": state.to_dict(),
    }


@router.get("/state", summary="Get Current Network Simulation State")
def get_simulation_state():
    """
    Retrieve full network state snapshot including all 3 slices (eMBB, URLLC, mMTC) and active anomalies.
    """
    return simulator.return_current_network_state().to_dict()


@router.get("/config", response_model=SimulationConfig, summary="Get Simulation Configuration")
def get_simulation_config():
    """
    Retrieve configurable simulation parameters.
    """
    return simulator.config


@router.put("/config", response_model=SimulationConfig, summary="Update Simulation Configuration")
def update_simulation_config(new_config: SimulationConfig):
    """
    Update simulation parameters (noise factor, traffic multiplier, step interval, anomaly probability).
    """
    simulator.config = new_config
    return simulator.config


@router.post("/inject-anomaly", summary="Inject Synthetic Attack/Anomaly")
def inject_anomaly(req: AnomalyRequest):
    """
    Inject a synthetic multi-layer anomaly into a target slice (e.g. DDOS_SURGE, RAN_JAMMING, BOTNET_FLOOD, SLICE_HOPPING).
    """
    try:
        event = simulator.inject_anomaly(
            slice_id=req.slice_id,
            anomaly_type=req.anomaly_type,
            duration_steps=req.duration_steps,
        )
        return {
            "message": f"Injected anomaly '{req.anomaly_type}' into slice '{req.slice_id}'",
            "event": event.model_dump(mode="json"),
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
