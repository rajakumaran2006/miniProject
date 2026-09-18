from typing import Dict, List, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.vnet.models import (
    OVSBridgeStatus,
    OpenFlowRule,
    OVSAttackRequest,
    OVSMitigationRequest,
)
from app.vnet.ovs_manager import ovs_manager
from app.vnet.ovs_telemetry import sync_ovs_to_slices
from app.vnet.packet_sniffer import packet_sniffer, CapturedPacket, PingResult

router = APIRouter()


class PingRequest(BaseModel):
    source_ip: str = Field(default="172.28.0.10", description="Source Node IP")
    target_ip: str = Field(default="172.28.0.20", description="Target Node IP")
    count: int = Field(default=4, ge=1, le=10)


@router.get("/status", response_model=OVSBridgeStatus, summary="Get Open vSwitch Bridge & Port Status")
def get_ovs_status():
    """Retrieve current operational status of the OVS virtual switch and ports."""
    sync_ovs_to_slices()
    return ovs_manager.get_status()


@router.get("/flows", response_model=List[OpenFlowRule], summary="Dump OpenFlow 1.3 Flow Table")
def get_ovs_flows():
    """Dump active OpenFlow 1.3 flow table rules with live packet and byte hit counters."""
    return ovs_manager.get_flows()


@router.post("/attack", summary="Inject Attack Packet Flow into OVS Network")
def inject_ovs_attack(req: OVSAttackRequest):
    """
    Launch real network attack from attacker-node against a target 5G slice in OVS:
    - DOS: High-rate packet flood saturating target virtual port
    - SPOOFING: Injects packets with forged IP/SUCI credentials
    - ISOLATION_BREACH: Attempts unauthorized cross-slice packet forwarding
    """
    res = ovs_manager.inject_attack(req)
    sync_ovs_to_slices()
    return res


@router.post("/mitigate", summary="Enforce OpenFlow Mitigation Rule on OVS Bridge")
def mitigate_ovs_threat(req: OVSMitigationRequest):
    """
    Push OpenFlow 1.3 defense rule to resolve active attack:
    - DROP: Wire-speed discard of all attacker IP datagrams
    - RATE_LIMIT: OpenFlow QoS meter clamping attacker bandwidth
    - ISOLATE: Microsegmentation / Air-gapping attacker virtual port
    """
    res = ovs_manager.apply_mitigation(req)
    sync_ovs_to_slices()
    return res


@router.post("/reset", summary="Reset OVS Flow Table to Baseline")
def reset_ovs_network():
    """Clear active attacks and restore standard OpenFlow 1.3 baseline rules."""
    res = ovs_manager.reset_network()
    sync_ovs_to_slices()
    return res


@router.get("/connectivity", summary="Get Full Network Connectivity & Latency RTT Matrix")
def get_network_connectivity():
    """Fetch complete node-to-node latency matrix, link status, and wire interface telemetry."""
    sync_ovs_to_slices()
    return packet_sniffer.get_connectivity_matrix()


@router.post("/ping", response_model=PingResult, summary="Execute Interactive Live Ping Test")
def execute_ping_test(req: PingRequest):
    """
    Run an interactive ICMP ping test between two virtual network nodes.
    Returns sequence numbers, RTT latency, and flags if blocked by an OpenFlow rule.
    """
    return packet_sniffer.run_ping_test(req.source_ip, req.target_ip, req.count)


@router.get("/packet-stream", response_model=List[CapturedPacket], summary="Stream Live Captured Packets")
def stream_captured_packets(limit: int = 35):
    """Stream real-time packets traversing the Open vSwitch bridge with VLAN and flow disposition."""
    return packet_sniffer.get_latest_packets(limit)
