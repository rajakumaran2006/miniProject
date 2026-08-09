from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from app.models.slice import NetworkSlice, SliceType, SliceStatus, SecurityLevel, AttackEvent


class AnomalyEvent(BaseModel):
    anomaly_id: str
    slice_id: str
    anomaly_type: str
    severity: str
    step_injected: int
    duration_steps: int
    steps_remaining: int


class NetworkState(BaseModel):
    """Holds system-wide network slicing state, attack events, and historical summary."""
    step_count: int = 0
    is_running: bool = False
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    slices: Dict[str, NetworkSlice] = Field(default_factory=dict)
    
    total_bandwidth_mbps: float = 0.0
    total_packet_rate: float = 0.0
    avg_latency_ms: float = 0.0
    overall_security_posture: SecurityLevel = SecurityLevel.HIGH
    active_anomalies: List[AnomalyEvent] = Field(default_factory=list)
    active_attacks: List[AttackEvent] = Field(default_factory=list)

    def update_totals(self) -> None:
        """Recalculate aggregate network metrics from active slices."""
        if not self.slices:
            self.total_bandwidth_mbps = 0.0
            self.total_packet_rate = 0.0
            self.avg_latency_ms = 0.0
            return

        self.total_bandwidth_mbps = round(sum(s.bandwidth for s in self.slices.values()), 2)
        self.total_packet_rate = round(sum(s.packet_rate for s in self.slices.values()), 2)
        self.avg_latency_ms = round(sum(s.latency for s in self.slices.values()) / len(self.slices), 2)
        
        # Determine overall security posture
        worst_status = max(s.anomaly_score for s in self.slices.values())
        if worst_status > 0.8:
            self.overall_security_posture = SecurityLevel.CRITICAL
        elif worst_status > 0.5:
            self.overall_security_posture = SecurityLevel.LOW
        elif worst_status > 0.2:
            self.overall_security_posture = SecurityLevel.MEDIUM
        else:
            self.overall_security_posture = SecurityLevel.HIGH

        self.last_updated = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        """Convert state snapshot to dictionary format."""
        return {
            "step_count": self.step_count,
            "is_running": self.is_running,
            "last_updated": self.last_updated.isoformat(),
            "slices": {k: v.model_dump(mode="json") for k, v in self.slices.items()},
            "total_bandwidth_mbps": self.total_bandwidth_mbps,
            "total_packet_rate": self.total_packet_rate,
            "avg_latency_ms": self.avg_latency_ms,
            "overall_security_posture": self.overall_security_posture.value,
            "active_anomalies": [a.model_dump(mode="json") for a in self.active_anomalies],
            "active_attacks": [a.model_dump(mode="json") for a in self.active_attacks],
        }
