from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.controls.controller import SecurityController
from app.controls.crypto_prototype import LightweightCryptoPrototype
from app.simulation.simulator import simulator

router = APIRouter()

# Global SecurityController singleton
security_controller = SecurityController()


class ApplyControlRequest(BaseModel):
    slice_id: str = Field(..., json_schema_extra={"example": "slice-urllc-01"}, description="Target slice ID")
    rl_agent_name: str = Field(default="Application_Layer_Agent", description="RL Agent triggering control")
    action_name: str = Field(default="enforce_mfa", description="Security action name")
    threat_vector: Optional[str] = Field(default="Spoofing", description="Active threat vector")


class EncryptPayloadRequest(BaseModel):
    plaintext: str = Field(default="5G_Slice_Telemetry_Payload_Data_12345", description="Plaintext data")
    cipher_mode: str = Field(default="LIGHTWEIGHT_PRESENT_ASCON", description="Cipher mode")


@router.post("/apply", summary="Apply Adaptive Security Control Decision")
def apply_security_control(req: ApplyControlRequest):
    """
    Apply RL decision or security control adjustment to slice.
    Mutates 4-dimension security levels and logs audit decision entry.
    """
    slice_obj = simulator.state.slices.get(req.slice_id)
    if not slice_obj:
        raise HTTPException(status_code=404, detail=f"Slice '{req.slice_id}' not found")

    log_entry = security_controller.process_rl_decision(
        slice_obj=slice_obj,
        rl_agent_name=req.rl_agent_name,
        action_name=req.action_name,
        threat_vector=req.threat_vector,
    )
    return {
        "message": f"Successfully applied action '{req.action_name}' to slice '{req.slice_id}'",
        "audit_log_entry": log_entry,
        "slice_security_level": slice_obj.security_level.value,
        "slice_latency_ms": slice_obj.latency,
        "slice_cpu_usage_pct": slice_obj.cpu_usage,
    }


@router.get("/history", summary="Get Security Decision Audit History")
def get_control_audit_history():
    """Retrieve complete decision audit log of all security level mutations."""
    return {
        "total_records": len(security_controller.logger.decision_history),
        "audit_logs": security_controller.logger.decision_history,
    }


@router.get("/status/{slice_id}", summary="Get Active Security Controls for Slice")
def get_slice_control_status(slice_id: str):
    """Fetch active 4-dimension security control levels (Authentication, Encryption, IDS, Isolation)."""
    slice_obj = simulator.state.slices.get(slice_id)
    if not slice_obj:
        raise HTTPException(status_code=404, detail=f"Slice '{slice_id}' not found")

    controls = security_controller.get_slice_controls(slice_id)
    return {
        "slice_id": slice_id,
        "slice_type": slice_obj.slice_type.value,
        "overall_security_level": slice_obj.security_level.value,
        "controls": controls,
        "current_latency_ms": slice_obj.latency,
        "current_cpu_usage_pct": slice_obj.cpu_usage,
    }


@router.post("/encrypt-test", summary="Test Lightweight Cryptography Encryption")
def test_lightweight_encryption(req: EncryptPayloadRequest):
    """Demonstrate lightweight cipher encryption (ASCON/PRESENT) on resource-constrained payload."""
    res = LightweightCryptoPrototype.encrypt_payload(req.plaintext, req.cipher_mode)
    return res


@router.get("/crypto-benchmark", summary="Get Cryptographic Cipher Benchmarks")
def get_crypto_benchmarks():
    """Retrieve comparative benchmarks of lightweight IoT ciphers vs standard AES ciphers."""
    return LightweightCryptoPrototype.get_benchmark_comparison()
