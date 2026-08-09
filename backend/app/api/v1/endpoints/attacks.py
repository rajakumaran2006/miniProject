from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.models.slice import AttackType, AttackSeverity, AttackEvent
from app.simulation.attacks import attack_simulator

router = APIRouter()


class StartAttackRequest(BaseModel):
    slice_id: str = Field(..., json_schema_extra={"example": "slice-urllc-01"}, description="Target 5G/6G slice ID")
    attack_type: AttackType = Field(default=AttackType.DOS, description="Cybersecurity threat model to simulate")
    severity: AttackSeverity = Field(default=AttackSeverity.HIGH, description="Severity intensity")
    duration_steps: int = Field(default=5, ge=1, le=50, description="Duration in simulation steps")


class StopAttackRequest(BaseModel):
    target_id: str = Field(..., json_schema_extra={"example": "atk-1a2b3c4d"}, description="Event ID or target slice ID to stop")


@router.post("/start", summary="Start Simulated Cybersecurity Attack")
def start_attack_simulation(req: StartAttackRequest):
    """
    Launch a simulated cybersecurity attack event (DoS, Spoofing, or Isolation Breach).
    Mutates virtual network slice features safely for research evaluation.
    """
    try:
        event = attack_simulator.start_attack(
            slice_id=req.slice_id,
            attack_type=req.attack_type,
            severity=req.severity,
            duration_steps=req.duration_steps,
        )
        return {
            "message": f"Successfully launched {req.attack_type.value} attack on slice '{req.slice_id}'",
            "event": event.model_dump(mode="json"),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/stop", summary="Stop Active Cybersecurity Attack")
def stop_attack_simulation(req: StopAttackRequest):
    """
    Stop active attack event by event_id or target slice_id.
    """
    stopped = attack_simulator.stop_attack(req.target_id)
    if not stopped:
        raise HTTPException(status_code=404, detail=f"No active attack found matching target ID '{req.target_id}'")
    return {
        "message": f"Successfully stopped attack matching target ID '{req.target_id}'",
        "target_id": req.target_id,
    }


@router.get("/active", response_model=List[AttackEvent], summary="List Active Attack Events")
def get_active_attacks():
    """
    Retrieve list of currently active simulated attack events.
    """
    return attack_simulator.get_active_attacks()


@router.get("/history", response_model=List[AttackEvent], summary="Retrieve Historical Attack Logs")
def get_attack_history():
    """
    Retrieve full historical audit log of all simulated cybersecurity attack events.
    """
    return attack_simulator.get_attack_history()
