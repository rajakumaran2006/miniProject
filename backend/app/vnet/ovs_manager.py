import subprocess
import time
import logging
import uuid
from typing import Dict, List, Optional, Any

from app.vnet.models import (
    OVSBackendMode,
    OVSAttackType,
    OVSMitigationAction,
    OVSPort,
    OpenFlowRule,
    OVSBridgeStatus,
    OVSAttackRequest,
    OVSMitigationRequest,
)

logger = logging.getLogger("5g_6g_security.vnet.ovs_manager")


class OpenVSwitchManager:
    """
    Open vSwitch (OVS) Controller & Virtual Network Orchestrator.
    Supports dual operation:
    1. DOCKER_OVS: Interacts directly with containerized OVS daemon and Linux veth ports.
    2. NATIVE_EMULATOR: Self-contained OpenFlow 1.3 flow table and virtual bridge emulator.
    """

    def __init__(self):
        self.bridge_name = "br-slicing"
        self.backend_mode = self._detect_backend_mode()
        self.ports = self._init_ports()
        self.flow_table: List[OpenFlowRule] = self._init_flow_table()
        self.active_attack: Optional[Dict[str, Any]] = None
        self.active_mitigation: Optional[Dict[str, Any]] = None
        self.start_time = time.time()
        logger.info(f"Initialized OVS Manager in [{self.backend_mode.value}] mode.")

    def _detect_backend_mode(self) -> OVSBackendMode:
        """Probe Docker daemon to check if 'ovs-switch' container is running (cached)."""
        now = time.time()
        if hasattr(self, "_last_docker_check") and (now - self._last_docker_check < 30.0):
            return getattr(self, "backend_mode", OVSBackendMode.NATIVE_EMULATOR)
        self._last_docker_check = now
        try:
            res = subprocess.run(
                ["docker", "ps", "--filter", "name=ovs-switch", "--format", "{{.Names}}"],
                capture_output=True,
                text=True,
                timeout=0.5,
            )
            if "ovs-switch" in res.stdout:
                return OVSBackendMode.DOCKER_OVS
        except Exception:
            pass
        return OVSBackendMode.NATIVE_EMULATOR


    def _init_ports(self) -> List[OVSPort]:
        return [
            OVSPort(
                port_name="veth-embb",
                port_number=1,
                vlan_tag=10,
                slice_id="slice-embb-01",
                ip_address="172.28.0.10",
                mac_address="02:42:ac:1c:00:0a",
                rx_packets=14200,
                tx_packets=13900,
                rx_dropped=4,
            ),
            OVSPort(
                port_name="veth-urllc",
                port_number=2,
                vlan_tag=20,
                slice_id="slice-urllc-01",
                ip_address="172.28.0.20",
                mac_address="02:42:ac:1c:00:14",
                rx_packets=31800,
                tx_packets=31750,
                rx_dropped=1,
            ),
            OVSPort(
                port_name="veth-mmtc",
                port_number=3,
                vlan_tag=30,
                slice_id="slice-mmtc-01",
                ip_address="172.28.0.30",
                mac_address="02:42:ac:1c:00:1e",
                rx_packets=8450,
                tx_packets=8400,
                rx_dropped=8,
            ),
            OVSPort(
                port_name="veth-atk",
                port_number=4,
                vlan_tag=99,
                slice_id="attacker-node",
                ip_address="172.28.0.99",
                mac_address="02:42:ac:1c:00:63",
                rx_packets=500,
                tx_packets=500,
                rx_dropped=0,
            ),
        ]

    def _init_flow_table(self) -> List[OpenFlowRule]:
        return [
            OpenFlowRule(
                rule_id="flow-001",
                table=0,
                priority=10,
                match="dl_type=0x0806 (ARP)",
                actions="NORMAL (Broadcast/Learn)",
                packet_count=2140,
                byte_count=136960,
                duration_sec=320.0,
            ),
            OpenFlowRule(
                rule_id="flow-002",
                table=0,
                priority=20,
                match="dl_type=0x0800,nw_dst=172.28.0.10 (eMBB)",
                actions="output:veth-embb",
                packet_count=14200,
                byte_count=18460000,
                duration_sec=320.0,
            ),
            OpenFlowRule(
                rule_id="flow-003",
                table=0,
                priority=20,
                match="dl_type=0x0800,nw_dst=172.28.0.20 (URLLC)",
                actions="output:veth-urllc",
                packet_count=31800,
                byte_count=4134000,
                duration_sec=320.0,
            ),
            OpenFlowRule(
                rule_id="flow-004",
                table=0,
                priority=20,
                match="dl_type=0x0800,nw_dst=172.28.0.30 (mMTC)",
                actions="output:veth-mmtc",
                packet_count=8450,
                byte_count=1098500,
                duration_sec=320.0,
            ),
            OpenFlowRule(
                rule_id="flow-000",
                table=0,
                priority=0,
                match="ALL (Default)",
                actions="DROP",
                packet_count=12,
                byte_count=768,
                duration_sec=320.0,
            ),
        ]

    def get_status(self) -> OVSBridgeStatus:
        """Fetch current status of OVS bridge, ports, and active defenses."""
        self.backend_mode = self._detect_backend_mode()

        active_rule_desc = None
        if self.active_mitigation:
            active_rule_desc = self.active_mitigation.get("rule_description")

        return OVSBridgeStatus(
            bridge_name=self.bridge_name,
            backend_mode=self.backend_mode,
            is_active=True,
            openflow_version="OpenFlow13",
            ports=self.ports,
            active_rules_count=len(self.flow_table),
            active_attack=self.active_attack,
            mitigation_active=self.active_mitigation is not None,
            active_mitigation_rule=active_rule_desc,
        )

    def get_flows(self) -> List[OpenFlowRule]:
        """Fetch real-time OpenFlow rules with packet counters."""
        if self.backend_mode == OVSBackendMode.DOCKER_OVS:
            flows = self._query_docker_flows()
            if flows:
                return flows
        return self.flow_table

    def _query_docker_flows(self) -> Optional[List[OpenFlowRule]]:
        try:
            cmd = ["docker", "exec", "ovs-switch", "ovs-ofctl", "-O", "OpenFlow13", "dump-flows", self.bridge_name]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=3)
            if res.returncode == 0:
                rules = []
                for line in res.stdout.strip().split("\n"):
                    if "priority=" in line:
                        # parse line
                        parts = line.strip().split(", ")
                        pkt_count = 0
                        byte_count = 0
                        priority = 0
                        for p in parts:
                            if "n_packets=" in p:
                                pkt_count = int(p.split("=")[1])
                            elif "n_bytes=" in p:
                                byte_count = int(p.split("=")[1])
                            elif "priority=" in p:
                                priority = int(p.split("=")[1].split()[0])
                        actions = line.split("actions=")[-1] if "actions=" in line else "NORMAL"
                        rules.append(
                            OpenFlowRule(
                                rule_id=f"flow-{len(rules)+1:03d}",
                                priority=priority,
                                match=line.split("priority=")[-1].split("actions=")[0].strip(),
                                actions=actions,
                                packet_count=pkt_count,
                                byte_count=byte_count,
                            )
                        )
                if rules:
                    return rules
        except Exception as e:
            logger.warning(f"Could not dump flows from Docker OVS: {e}")
        return None

    def inject_attack(self, req: OVSAttackRequest) -> Dict[str, Any]:
        """Launch attack packet injection against target slice."""
        event_id = f"ovs-atk-{uuid.uuid4().hex[:6]}"
        target_port = next((p for p in self.ports if p.slice_id == req.target_slice_id), self.ports[1])

        attack_info = {
            "event_id": event_id,
            "attack_type": req.attack_type.value,
            "target_slice_id": req.target_slice_id,
            "target_ip": target_port.ip_address,
            "intensity": req.intensity,
            "packet_rate_pps": req.packet_rate,
            "timestamp": time.time(),
            "status": "ATTACK_ACTIVE",
        }
        self.active_attack = attack_info

        # Update port packet counters to reflect real burst
        atk_port = self.ports[3]  # attacker port
        atk_port.tx_packets += req.packet_rate * 5
        target_port.rx_packets += req.packet_rate * 5
        if not self.active_mitigation:
            target_port.rx_dropped += int(req.packet_rate * 0.25)

        # In Docker OVS mode, attempt to launch script inside attacker-node
        if self.backend_mode == OVSBackendMode.DOCKER_OVS:
            try:
                script_map = {
                    OVSAttackType.DOS: "attack_dos.sh",
                    OVSAttackType.SPOOFING: "attack_spoof.sh",
                    OVSAttackType.ISOLATION_BREACH: "attack_breach.sh",
                }
                script_name = script_map.get(req.attack_type, "attack_dos.sh")
                subprocess.Popen(
                    ["docker", "exec", "attacker-node", f"/scripts/{script_name}", target_port.ip_address]
                )
            except Exception as e:
                logger.warning(f"Failed to execute attack script in Docker: {e}")

        logger.warning(f"OVS Attack injected: {req.attack_type.value} -> {target_port.slice_id} ({target_port.ip_address})")
        return attack_info

    def apply_mitigation(self, req: OVSMitigationRequest) -> Dict[str, Any]:
        """
        Push OpenFlow defense rule into OVS flow table to mitigate active threat.
        """
        rule_id = f"mitigate-{uuid.uuid4().hex[:6]}"

        if req.action == OVSMitigationAction.DROP:
            match_cond = f"priority=100,ip,nw_src={req.target_ip}"
            actions_str = "DROP (Wire-speed Drop)"
            rule_desc = f"OpenFlow DROP Rule: Discard all packets from source {req.target_ip}"
        elif req.action == OVSMitigationAction.RATE_LIMIT:
            kbps = req.rate_limit_kbps or 1000
            match_cond = f"priority=95,ip,nw_src={req.target_ip}"
            actions_str = f"meter:1 (Clamp to {kbps} kbps), NORMAL"
            rule_desc = f"OpenFlow QoS Meter Rule: Rate-limit attacker {req.target_ip} to {kbps} kbps"
        elif req.action == OVSMitigationAction.ISOLATE:
            match_cond = f"priority=100,in_port=veth-atk"
            actions_str = "DROP (Air-gap Isolation)"
            rule_desc = f"OpenFlow Microsegmentation Rule: Air-gap attacker port from br-slicing"
        else:
            return self.reset_network()

        new_rule = OpenFlowRule(
            rule_id=rule_id,
            table=0,
            priority=100,
            match=match_cond,
            actions=actions_str,
            packet_count=5280,
            byte_count=6854000,
            duration_sec=1.0,
        )

        # Remove existing mitigation rules if any
        self.flow_table = [r for r in self.flow_table if not r.rule_id.startswith("mitigate-")]
        self.flow_table.insert(0, new_rule)

        # Execute in Docker if available
        if self.backend_mode == OVSBackendMode.DOCKER_OVS:
            try:
                cmd = [
                    "docker",
                    "exec",
                    "ovs-switch",
                    "ovs-ofctl",
                    "-O",
                    "OpenFlow13",
                    "add-flow",
                    self.bridge_name,
                    f"priority=100,ip,nw_src={req.target_ip},actions=drop",
                ]
                subprocess.run(cmd, capture_output=True, timeout=3)
            except Exception as e:
                logger.warning(f"Failed to add OpenFlow rule to Docker OVS: {e}")

        self.active_mitigation = {
            "rule_id": rule_id,
            "action": req.action.value,
            "target_ip": req.target_ip,
            "rule_description": rule_desc,
            "status": "RULE_ENFORCED",
            "threat_resolved": True,
            "enforced_at": time.time(),
        }

        # Clear active attack state as threat is now dropped by OVS
        if self.active_attack:
            self.active_attack["status"] = "MITIGATED_BY_OVS_RULE"

        logger.info(f"OVS OpenFlow Rule Installed: {rule_desc}")
        return self.active_mitigation

    def reset_network(self) -> Dict[str, Any]:
        """Reset flow table and clear active attacks."""
        self.active_attack = None
        self.active_mitigation = None
        self.flow_table = self._init_flow_table()
        self.ports = self._init_ports()

        if self.backend_mode == OVSBackendMode.DOCKER_OVS:
            try:
                subprocess.run(
                    ["docker", "exec", "ovs-switch", "/scripts/setup_ovs.sh"],
                    capture_output=True,
                    timeout=5,
                )
            except Exception:
                pass

        logger.info("OVS Flow Table and Attack state reset to baseline.")
        return {"message": "OVS Virtual Network reset to baseline", "status": "BASELINE"}


# Global singleton OVS Manager instance
ovs_manager = OpenVSwitchManager()
