from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class SliceType(str, Enum):
    EMBB = "eMBB"      # Enhanced Mobile Broadband
    URLLC = "URLLC"    # Ultra-Reliable Low-Latency Communication
    MMTC = "mMTC"      # Massive Machine-Type Communications


class SliceStatus(str, Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    UNDER_ATTACK = "UNDER_ATTACK"
    CRITICAL = "CRITICAL"


class SecurityLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    CRITICAL = "CRITICAL"


class AttackType(str, Enum):
    DOS = "Denial-of-Service"
    SPOOFING = "Spoofing"
    ISOLATION_BREACH = "Network-Slice Isolation Breach"


class AttackSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AttackEvent(BaseModel):
    event_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    slice_id: str
    attack_type: AttackType
    severity: AttackSeverity
    affected_features: Dict[str, Any] = Field(default_factory=dict)
    ground_truth_label: int = Field(default=1, description="1 for anomalous/attack, 0 for normal baseline")
    duration_steps: int = 5
    steps_remaining: int = 5
    is_active: bool = True


class LayerMetrics(BaseModel):
    physical_ran: Dict[str, float] = Field(
        default_factory=lambda: {
            "snr_db": 24.5,
            "jamming_indicator": 0.02,
            "beamforming_efficiency": 0.96
        },
        description="Physical and Radio Access Network layer telemetry"
    )
    transport_network: Dict[str, float] = Field(
        default_factory=lambda: {
            "bandwidth_gbps": 10.0,
            "packet_loss_rate": 0.001,
            "sdn_flow_entry_churn": 12.4,
            "unauthorized_cross_slice_flows": 0.0,
            "inter_slice_resource_leak_mbps": 0.0
        },
        description="Transport network and SDN flow metrics"
    )
    core_3gpp: Dict[str, float] = Field(
        default_factory=lambda: {
            "nrf_registration_rate": 99.8,
            "auth_success_ratio": 0.999,
            "mano_api_latency_ms": 4.2,
            "spoofed_device_count": 0.0,
            "auth_failures": 0.0
        },
        description="3GPP Core Network Function metrics"
    )
    application: Dict[str, float] = Field(
        default_factory=lambda: {
            "active_sessions": 1250.0,
            "unauthorized_api_attempts": 0.0,
            "qos_compliance_score": 0.98,
            "suspicious_connections": 0.0
        },
        description="Application layer telemetry"
    )


class NetworkSlice(BaseModel):
    slice_id: str
    name: str
    slice_type: SliceType
    bandwidth: float = Field(..., description="Current bandwidth consumption in Mbps")
    latency: float = Field(..., description="Current round-trip latency in ms")
    packet_rate: float = Field(..., description="Current packet throughput in packets/sec")
    packet_loss: float = Field(..., description="Current packet loss ratio (0.0 to 1.0)")
    connected_devices: int = Field(..., description="Active connected UE/IoT devices count")
    cpu_usage: float = Field(..., description="Current CPU/Resource utilization percentage")
    security_level: SecurityLevel = Field(default=SecurityLevel.HIGH, description="Current slice security posture")
    current_status: SliceStatus = Field(default=SliceStatus.HEALTHY, description="Current slice operational health state")
    
    anomaly_score: float = Field(default=0.05, ge=0.0, le=1.0)
    allocated_bandwidth_mbps: float
    max_latency_ms: float
    target_reliability: float
    is_active: bool = True
    metrics: LayerMetrics = Field(default_factory=LayerMetrics)
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class HealthCheckResponse(BaseModel):
    status: str = "healthy"
    project_name: str
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    uptime_seconds: float
    modules: Dict[str, bool] = Field(
        default_factory=lambda: {
            "api_server": True,
            "telemetry_engine": True,
            "network_simulator": True,
            "attack_simulator": True,
            "rl_agent_interface": True,
            "federated_learning_interface": True,
        }
    )
