from typing import Dict, Any
from pydantic import BaseModel, Field


class SliceBaselineConfig(BaseModel):
    """Baseline operational parameters for a network slice type."""
    target_bandwidth_mbps: float
    target_latency_ms: float
    target_packet_rate: float
    target_devices: int
    target_packet_loss: float = 0.001
    target_cpu_usage: float = 25.0


class SimulationConfig(BaseModel):
    """Configurable global simulation parameters."""
    step_interval_seconds: float = Field(default=1.0, ge=0.1, le=60.0)
    noise_factor: float = Field(default=0.05, ge=0.0, le=0.5)
    abnormal_traffic_probability: float = Field(default=0.08, ge=0.0, le=1.0)
    traffic_multiplier: float = Field(default=1.0, ge=0.1, le=10.0)
    auto_recovery_steps: int = Field(default=5, ge=1, le=50)

    # Slice specific baseline profiles
    embb_profile: SliceBaselineConfig = Field(
        default_factory=lambda: SliceBaselineConfig(
            target_bandwidth_mbps=850.0,
            target_latency_ms=18.5,
            target_packet_rate=12000.0,
            target_devices=3500,
            target_packet_loss=0.0005,
            target_cpu_usage=32.0,
        )
    )
    urllc_profile: SliceBaselineConfig = Field(
        default_factory=lambda: SliceBaselineConfig(
            target_bandwidth_mbps=200.0,
            target_latency_ms=0.85,
            target_packet_rate=25000.0,
            target_devices=900,
            target_packet_loss=0.00001,
            target_cpu_usage=18.0,
        )
    )
    mmtc_profile: SliceBaselineConfig = Field(
        default_factory=lambda: SliceBaselineConfig(
            target_bandwidth_mbps=45.0,
            target_latency_ms=85.0,
            target_packet_rate=85000.0,
            target_devices=50000,
            target_packet_loss=0.003,
            target_cpu_usage=45.0,
        )
    )
