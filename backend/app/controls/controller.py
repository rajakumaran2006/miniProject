import logging
from enum import Enum
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from app.models.slice import NetworkSlice, SliceType, SecurityLevel, SliceStatus
from app.controls.crypto_prototype import LightweightCryptoPrototype, CIPHER_MODES

logger = logging.getLogger("5g_6g_security.controls.controller")


class AuthenticationLevel(str, Enum):
    BASIC_MAC = "BASIC_MAC"
    MUTUAL_TLS_3GPP = "MUTUAL_TLS_3GPP"
    EPHEMERAL_5G_AKA = "EPHEMERAL_5G_AKA"
    ZERO_TRUST_CONTINUOUS = "ZERO_TRUST_CONTINUOUS"


class EncryptionLevel(str, Enum):
    NONE = "NONE"
    LIGHTWEIGHT_PRESENT_ASCON = "LIGHTWEIGHT_PRESENT_ASCON"
    AES_128_GCM = "AES_128_GCM"
    AES_256_GCM_PQC = "AES_256_GCM_PQC"


class IntrusionDetectionLevel(str, Enum):
    PASSIVE_LOGGING = "PASSIVE_LOGGING"
    HEURISTIC_IDS = "HEURISTIC_IDS"
    ISOLATION_FOREST_ML = "ISOLATION_FOREST_ML"
    DEEP_PACKET_CROSS_LAYER_IDS = "DEEP_PACKET_CROSS_LAYER_IDS"


class SliceIsolationLevel(str, Enum):
    SHARED_VNFS = "SHARED_VNFS"
    VLAN_LOGICAL_ISOLATION = "VLAN_LOGICAL_ISOLATION"
    HARDWARE_SR_IOV_ISOLATION = "HARDWARE_SR_IOV_ISOLATION"
    AIR_GAPPED_SLICE_PRUNING = "AIR_GAPPED_SLICE_PRUNING"


# Overhead maps per dimension
AUTH_OVERHEADS = {
    AuthenticationLevel.BASIC_MAC: {"lat_ms": 0.0, "cpu_pct": 0.0},
    AuthenticationLevel.MUTUAL_TLS_3GPP: {"lat_ms": 2.0, "cpu_pct": 4.0},
    AuthenticationLevel.EPHEMERAL_5G_AKA: {"lat_ms": 4.0, "cpu_pct": 8.0},
    AuthenticationLevel.ZERO_TRUST_CONTINUOUS: {"lat_ms": 7.0, "cpu_pct": 14.0},
}

ENCRYPTION_OVERHEADS = {
    EncryptionLevel.NONE: {"lat_ms": 0.0, "cpu_pct": 0.0},
    EncryptionLevel.LIGHTWEIGHT_PRESENT_ASCON: {"lat_ms": 0.8, "cpu_pct": 3.0},
    EncryptionLevel.AES_128_GCM: {"lat_ms": 3.5, "cpu_pct": 9.0},
    EncryptionLevel.AES_256_GCM_PQC: {"lat_ms": 12.0, "cpu_pct": 22.0},
}

IDS_OVERHEADS = {
    IntrusionDetectionLevel.PASSIVE_LOGGING: {"lat_ms": 0.0, "cpu_pct": 0.0},
    IntrusionDetectionLevel.HEURISTIC_IDS: {"lat_ms": 1.0, "cpu_pct": 3.0},
    IntrusionDetectionLevel.ISOLATION_FOREST_ML: {"lat_ms": 2.5, "cpu_pct": 6.0},
    IntrusionDetectionLevel.DEEP_PACKET_CROSS_LAYER_IDS: {"lat_ms": 6.0, "cpu_pct": 15.0},
}

ISOLATION_OVERHEADS = {
    SliceIsolationLevel.SHARED_VNFS: {"lat_ms": 0.0, "cpu_pct": 0.0},
    SliceIsolationLevel.VLAN_LOGICAL_ISOLATION: {"lat_ms": 1.5, "cpu_pct": 2.0},
    SliceIsolationLevel.HARDWARE_SR_IOV_ISOLATION: {"lat_ms": 3.0, "cpu_pct": 8.0},
    SliceIsolationLevel.AIR_GAPPED_SLICE_PRUNING: {"lat_ms": 20.0, "cpu_pct": 25.0},
}


class AuditDecisionLogger:
    """Maintains detailed audit logs of all security control decisions."""

    def __init__(self, max_history: int = 200):
        self.max_history = max_history
        self.decision_history: List[Dict[str, Any]] = []

    def record_decision(
        self,
        slice_id: str,
        threat_vector: Optional[str],
        rl_agent: str,
        action_taken: str,
        previous_security_level: str,
        new_security_level: str,
        reason: str,
        latency_impact_ms: float,
        resource_impact_pct: float,
        controls_snapshot: Dict[str, str],
    ) -> Dict[str, Any]:
        entry = {
            "entry_id": f"sec-log-{len(self.decision_history) + 1:04d}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "slice_id": slice_id,
            "threat_vector": threat_vector or "NO_ACTIVE_THREAT",
            "rl_agent": rl_agent,
            "action_taken": action_taken,
            "previous_security_level": previous_security_level,
            "new_security_level": new_security_level,
            "reason": reason,
            "latency_impact_ms": round(latency_impact_ms, 2),
            "resource_impact_pct": round(resource_impact_pct, 2),
            "controls_snapshot": controls_snapshot,
        }
        self.decision_history.insert(0, entry)
        if len(self.decision_history) > self.max_history:
            self.decision_history.pop()

        logger.info(
            f"Audit Log Recorded [{slice_id}] | Action: {action_taken} by {rl_agent} | "
            f"Level: {previous_security_level} -> {new_security_level} | Latency Impact: +{latency_impact_ms}ms"
        )
        return entry


class SecurityController:
    """
    5G/6G Adaptive Security Controller.
    Receives RL decisions, computes optimal 4-dimension control levels, mutates slice state, and logs audit records.
    """

    def __init__(self):
        self.logger = AuditDecisionLogger()
        self.slice_controls: Dict[str, Dict[str, str]] = {}

    def get_slice_controls(self, slice_id: str) -> Dict[str, str]:
        """Fetch current 4-dimension control levels for a slice."""
        if slice_id not in self.slice_controls:
            self.slice_controls[slice_id] = {
                "authentication": AuthenticationLevel.MUTUAL_TLS_3GPP.value,
                "encryption": EncryptionLevel.LIGHTWEIGHT_PRESENT_ASCON.value,
                "intrusion_detection": IntrusionDetectionLevel.ISOLATION_FOREST_ML.value,
                "slice_isolation": SliceIsolationLevel.VLAN_LOGICAL_ISOLATION.value,
            }
        return self.slice_controls[slice_id]

    def process_rl_decision(
        self,
        slice_obj: NetworkSlice,
        rl_agent_name: str,
        action_name: str,
        threat_vector: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process RL decision and dynamically adjust slice security controls across 4 dimensions.
        """
        curr_controls = self.get_slice_controls(slice_obj.slice_id)
        prev_sec_level = slice_obj.security_level.value

        new_auth = AuthenticationLevel(curr_controls["authentication"])
        new_enc = EncryptionLevel(curr_controls["encryption"])
        new_ids = IntrusionDetectionLevel(curr_controls["intrusion_detection"])
        new_iso = SliceIsolationLevel(curr_controls["slice_isolation"])

        reason_list = []

        # 1. Evaluate RL Agent Action Intent
        if action_name in ["strengthen_authentication", "enforce_mfa"]:
            new_auth = AuthenticationLevel.EPHEMERAL_5G_AKA if slice_obj.anomaly_score < 0.6 else AuthenticationLevel.ZERO_TRUST_CONTINUOUS
            reason_list.append("Escalated authentication protocol to counter unauthorized credentials")

        elif action_name in ["enable_stronger_encryption", "rotate_auth_tokens"]:
            if slice_obj.slice_type == SliceType.MMTC:
                new_enc = EncryptionLevel.LIGHTWEIGHT_PRESENT_ASCON
                reason_list.append("Applied lightweight ASCON/PRESENT cipher optimized for IoT resource constraints")
            elif slice_obj.slice_type == SliceType.URLLC:
                new_enc = EncryptionLevel.AES_256_GCM_PQC
                reason_list.append("Deployed AES-256-GCM + Post-Quantum hybrid for mission-critical URLLC protection")
            else:
                new_enc = EncryptionLevel.AES_128_GCM
                reason_list.append("Upgraded to AES-128-GCM standard 5G slice payload encryption")

        elif action_name in ["increase_monitoring", "block_suspicious_device", "block_api_client"]:
            new_ids = IntrusionDetectionLevel.DEEP_PACKET_CROSS_LAYER_IDS
            reason_list.append("Activated deep packet cross-layer intrusion inspection")

        elif action_name in ["isolate_slice", "throttle_slice_bandwidth"]:
            new_iso = SliceIsolationLevel.HARDWARE_SR_IOV_ISOLATION if slice_obj.anomaly_score < 0.8 else SliceIsolationLevel.AIR_GAPPED_SLICE_PRUNING
            reason_list.append("Enforced strict hardware/air-gapped slice isolation to stop cross-slice breach")

        elif action_name == "no_action":
            # De-escalate security controls if anomaly score drops below 0.20 to save latency & CPU
            if slice_obj.anomaly_score < 0.20:
                new_auth = AuthenticationLevel.MUTUAL_TLS_3GPP
                new_enc = EncryptionLevel.LIGHTWEIGHT_PRESENT_ASCON if slice_obj.slice_type == SliceType.MMTC else EncryptionLevel.NONE
                new_iso = SliceIsolationLevel.VLAN_LOGICAL_ISOLATION
                reason_list.append("Relaxed security controls during healthy operations to optimize QoS latency")
            else:
                reason_list.append("Maintained baseline security posture")

        # Update controls state
        self.slice_controls[slice_obj.slice_id] = {
            "authentication": new_auth.value,
            "encryption": new_enc.value,
            "intrusion_detection": new_ids.value,
            "slice_isolation": new_iso.value,
        }

        # Calculate overhead impact
        lat_overhead = (
            AUTH_OVERHEADS[new_auth]["lat_ms"]
            + ENCRYPTION_OVERHEADS[new_enc]["lat_ms"]
            + IDS_OVERHEADS[new_ids]["lat_ms"]
            + ISOLATION_OVERHEADS[new_iso]["lat_ms"]
        )

        cpu_overhead = (
            AUTH_OVERHEADS[new_auth]["cpu_pct"]
            + ENCRYPTION_OVERHEADS[new_enc]["cpu_pct"]
            + IDS_OVERHEADS[new_ids]["cpu_pct"]
            + ISOLATION_OVERHEADS[new_iso]["cpu_pct"]
        )

        # Apply state mutations to NetworkSlice
        slice_obj.latency = round(slice_obj.latency + lat_overhead, 2)
        slice_obj.cpu_usage = min(99.9, round(slice_obj.cpu_usage + cpu_overhead, 2))

        # Compute new SecurityLevel enum
        if new_iso == SliceIsolationLevel.AIR_GAPPED_SLICE_PRUNING or new_auth == AuthenticationLevel.ZERO_TRUST_CONTINUOUS:
            new_sec_enum = SecurityLevel.HIGH
        elif new_enc != EncryptionLevel.NONE:
            new_sec_enum = SecurityLevel.MEDIUM
        else:
            new_sec_enum = SecurityLevel.LOW

        slice_obj.security_level = new_sec_enum

        # Record audit log
        log_entry = self.logger.record_decision(
            slice_id=slice_obj.slice_id,
            threat_vector=threat_vector,
            rl_agent=rl_agent_name,
            action_taken=action_name,
            previous_security_level=prev_sec_level,
            new_security_level=new_sec_enum.value,
            reason=" | ".join(reason_list),
            latency_impact_ms=lat_overhead,
            resource_impact_pct=cpu_overhead,
            controls_snapshot=self.slice_controls[slice_obj.slice_id],
        )

        return log_entry


# Global SecurityController Singleton Instance
security_controller = SecurityController()
