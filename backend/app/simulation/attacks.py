import uuid
import random
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

from app.models.slice import (
    NetworkSlice,
    AttackType,
    AttackSeverity,
    AttackEvent,
    SliceStatus,
    SecurityLevel,
)
from app.simulation.base import BaseAttackSimulator

logger = logging.getLogger("5g_6g_security.attacks")


class AttackSimulator(BaseAttackSimulator):
    """
    Virtual Cybersecurity Attack Simulation Module for 5G/6G Network Slicing.
    Simulates Denial-of-Service (DoS), Spoofing, and Network-Slice Isolation Breach threat vectors.
    """

    def __init__(self):
        self._active_attacks: Dict[str, AttackEvent] = {}
        self._attack_history: List[AttackEvent] = []

    def inject_attack(self, target_slice_id: str, attack_type: str, intensity: float) -> Dict[str, Any]:
        """BaseAttackSimulator abstract interface implementation."""
        atk_enum = AttackType.DOS
        if "spoof" in attack_type.lower():
            atk_enum = AttackType.SPOOFING
        elif "isolation" in attack_type.lower() or "breach" in attack_type.lower():
            atk_enum = AttackType.ISOLATION_BREACH

        severity = AttackSeverity.HIGH if intensity > 0.7 else AttackSeverity.MEDIUM
        event = self.start_attack(target_slice_id, atk_enum, severity, duration_steps=5)
        return event.model_dump(mode="json")

    def start_attack(
        self,
        slice_id: str,
        attack_type: AttackType,
        severity: AttackSeverity = AttackSeverity.HIGH,
        duration_steps: int = 5,
    ) -> AttackEvent:
        """Initialize and launch a simulated attack on a target slice."""
        event_id = f"atk-{uuid.uuid4().hex[:8]}"
        event = AttackEvent(
            event_id=event_id,
            timestamp=datetime.now(timezone.utc),
            slice_id=slice_id,
            attack_type=attack_type,
            severity=severity,
            affected_features={},
            ground_truth_label=1,
            duration_steps=duration_steps,
            steps_remaining=duration_steps,
            is_active=True,
        )
        self._active_attacks[event_id] = event
        self._attack_history.append(event)
        logger.warning(
            f"Started attack '{attack_type.value}' [{severity.value}] on slice '{slice_id}' (ID: {event_id})"
        )
        return event

    def stop_attack(self, target_id: str) -> bool:
        """Stop active attack by event_id or slice_id."""
        stopped = False
        # Search by event_id
        if target_id in self._active_attacks:
            evt = self._active_attacks.pop(target_id)
            evt.is_active = False
            evt.steps_remaining = 0
            stopped = True
            logger.info(f"Stopped attack event '{target_id}'")

        # Search by slice_id
        keys_to_remove = [k for k, v in self._active_attacks.items() if v.slice_id == target_id]
        for k in keys_to_remove:
            evt = self._active_attacks.pop(k)
            evt.is_active = False
            evt.steps_remaining = 0
            stopped = True
            logger.info(f"Stopped attack on slice '{target_id}' (ID: {k})")

        return stopped

    def get_active_attacks(self) -> List[AttackEvent]:
        """Return list of currently active attack events."""
        return list(self._active_attacks.values())

    def get_attack_history(self) -> List[AttackEvent]:
        """Return historical log of all simulated attack events."""
        return self._attack_history

    def apply_attack_effects(self, slice_obj: NetworkSlice, event: AttackEvent) -> Dict[str, Any]:
        """
        Apply simulated threat modifications to slice network features & layer metrics.
        Returns a dictionary summarizing the affected features and delta magnitude.
        """
        severity_mult = 1.0
        if event.severity == AttackSeverity.LOW:
            severity_mult = 0.5
        elif event.severity == AttackSeverity.HIGH:
            severity_mult = 1.5
        elif event.severity == AttackSeverity.CRITICAL:
            severity_mult = 2.2

        affected: Dict[str, Any] = {}

        if event.attack_type == AttackType.DOS:
            # 1. Denial-of-Service (DoS) Simulation
            # Modifies: packet rate, bandwidth usage, latency, packet loss, connection count
            orig_pkt_rate = slice_obj.packet_rate
            orig_bw = slice_obj.bandwidth
            orig_lat = slice_obj.latency
            orig_loss = slice_obj.packet_loss
            orig_dev = slice_obj.connected_devices

            slice_obj.packet_rate = round(orig_pkt_rate * (3.5 * severity_mult), 2)
            slice_obj.bandwidth = round(orig_bw * (2.8 * severity_mult), 2)
            slice_obj.latency = round(orig_lat + (45.0 * severity_mult), 2)
            slice_obj.packet_loss = min(0.45, round(orig_loss + (0.12 * severity_mult), 4))
            slice_obj.connected_devices = int(orig_dev * (1.8 * severity_mult))
            slice_obj.cpu_usage = min(99.9, round(slice_obj.cpu_usage + (40.0 * severity_mult), 2))
            slice_obj.anomaly_score = min(0.99, round(0.75 * severity_mult, 4))
            slice_obj.current_status = SliceStatus.UNDER_ATTACK
            slice_obj.security_level = SecurityLevel.CRITICAL

            affected = {
                "packet_rate": {"baseline": orig_pkt_rate, "simulated": slice_obj.packet_rate},
                "bandwidth_mbps": {"baseline": orig_bw, "simulated": slice_obj.bandwidth},
                "latency_ms": {"baseline": orig_lat, "simulated": slice_obj.latency},
                "packet_loss_ratio": {"baseline": orig_loss, "simulated": slice_obj.packet_loss},
                "connected_devices": {"baseline": orig_dev, "simulated": slice_obj.connected_devices},
            }

        elif event.attack_type == AttackType.SPOOFING:
            # 2. Spoofing Threat Simulation
            # Modifies: device identity, auth failures, source identity changes, suspicious connections
            orig_auth_succ = slice_obj.metrics.core_3gpp.get("auth_success_ratio", 0.999)
            orig_auth_fail = slice_obj.metrics.core_3gpp.get("auth_failures", 0.0)
            orig_spoofed = slice_obj.metrics.core_3gpp.get("spoofed_device_count", 0.0)
            orig_susp_conn = slice_obj.metrics.application.get("suspicious_connections", 0.0)

            new_auth_succ = max(0.35, round(orig_auth_succ - (0.45 * severity_mult), 4))
            new_auth_fail = round(orig_auth_fail + (125.0 * severity_mult), 1)
            new_spoofed = round(orig_spoofed + (450.0 * severity_mult), 1)
            new_susp_conn = round(orig_susp_conn + (85.0 * severity_mult), 1)

            slice_obj.metrics.core_3gpp["auth_success_ratio"] = new_auth_succ
            slice_obj.metrics.core_3gpp["auth_failures"] = new_auth_fail
            slice_obj.metrics.core_3gpp["spoofed_device_count"] = new_spoofed
            slice_obj.metrics.application["suspicious_connections"] = new_susp_conn

            slice_obj.anomaly_score = min(0.95, round(0.68 * severity_mult, 4))
            slice_obj.current_status = SliceStatus.DEGRADED if severity_mult < 1.0 else SliceStatus.UNDER_ATTACK
            slice_obj.security_level = SecurityLevel.LOW if severity_mult < 1.0 else SecurityLevel.CRITICAL

            affected = {
                "device_identity_spoofed_count": {"baseline": orig_spoofed, "simulated": new_spoofed},
                "auth_success_ratio": {"baseline": orig_auth_succ, "simulated": new_auth_succ},
                "authentication_failures": {"baseline": orig_auth_fail, "simulated": new_auth_fail},
                "suspicious_connections": {"baseline": orig_susp_conn, "simulated": new_susp_conn},
                "source_identity_changes": f"Spoofed {int(new_spoofed)} MAC/SUCI source identities",
            }

        elif event.attack_type == AttackType.ISOLATION_BREACH:
            # 3. Network-Slice Isolation Breach Simulation
            # Modifies: unauthorized cross-slice communication, abnormal resource usage, suspicious access between slices
            orig_cross_flows = slice_obj.metrics.transport_network.get("unauthorized_cross_slice_flows", 0.0)
            orig_leak_bw = slice_obj.metrics.transport_network.get("inter_slice_resource_leak_mbps", 0.0)
            orig_unauth_api = slice_obj.metrics.application.get("unauthorized_api_attempts", 0.0)

            new_cross_flows = round(orig_cross_flows + (65.0 * severity_mult), 1)
            new_leak_bw = round(orig_leak_bw + (280.0 * severity_mult), 2)
            new_unauth_api = round(orig_unauth_api + (35.0 * severity_mult), 1)

            slice_obj.metrics.transport_network["unauthorized_cross_slice_flows"] = new_cross_flows
            slice_obj.metrics.transport_network["inter_slice_resource_leak_mbps"] = new_leak_bw
            slice_obj.metrics.application["unauthorized_api_attempts"] = new_unauth_api

            slice_obj.cpu_usage = min(98.0, round(slice_obj.cpu_usage + (25.0 * severity_mult), 2))
            slice_obj.anomaly_score = min(0.98, round(0.72 * severity_mult, 4))
            slice_obj.current_status = SliceStatus.UNDER_ATTACK
            slice_obj.security_level = SecurityLevel.CRITICAL

            affected = {
                "unauthorized_cross_slice_communication_flows": {"baseline": orig_cross_flows, "simulated": new_cross_flows},
                "abnormal_inter_slice_resource_leak_mbps": {"baseline": orig_leak_bw, "simulated": new_leak_bw},
                "suspicious_cross_slice_api_access": {"baseline": orig_unauth_api, "simulated": new_unauth_api},
                "abnormal_cpu_resource_leak": f"+{round(25.0 * severity_mult, 1)}% unallocated CPU consumption",
            }

        event.affected_features = affected
        return affected


# Global singleton instance for attack simulator
attack_simulator = AttackSimulator()
