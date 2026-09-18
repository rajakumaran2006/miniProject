from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class OVSBackendMode(str, Enum):
    DOCKER_OVS = "DOCKER_OVS"
    NATIVE_EMULATOR = "NATIVE_EMULATOR"


class OVSAttackType(str, Enum):
    DOS = "DOS"
    SPOOFING = "SPOOFING"
    ISOLATION_BREACH = "ISOLATION_BREACH"


class OVSMitigationAction(str, Enum):
    DROP = "DROP"
    RATE_LIMIT = "RATE_LIMIT"
    ISOLATE = "ISOLATE"
    RESET = "RESET"


class OVSPort(BaseModel):
    port_name: str
    port_number: int
    vlan_tag: int
    slice_id: str
    ip_address: str
    mac_address: str
    status: str = "UP"
    rx_packets: int = 0
    tx_packets: int = 0
    rx_dropped: int = 0


class OpenFlowRule(BaseModel):
    rule_id: str
    table: int = 0
    priority: int
    match: str
    actions: str
    packet_count: int = 0
    byte_count: int = 0
    duration_sec: float = 0.0


class OVSBridgeStatus(BaseModel):
    bridge_name: str = "br-slicing"
    backend_mode: OVSBackendMode
    is_active: bool = True
    openflow_version: str = "OpenFlow13"
    ports: List[OVSPort] = []
    active_rules_count: int = 0
    active_attack: Optional[Dict[str, Any]] = None
    mitigation_active: bool = False
    active_mitigation_rule: Optional[str] = None


class OVSAttackRequest(BaseModel):
    attack_type: OVSAttackType = OVSAttackType.DOS
    target_slice_id: str = "slice-urllc-01"
    intensity: float = Field(default=0.8, ge=0.1, le=1.0)
    packet_rate: int = Field(default=5000, ge=100, le=50000)


class OVSMitigationRequest(BaseModel):
    action: OVSMitigationAction = OVSMitigationAction.DROP
    target_ip: str = "172.28.0.99"
    slice_id: str = "slice-urllc-01"
    rate_limit_kbps: Optional[int] = 1000
