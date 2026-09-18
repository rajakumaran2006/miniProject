import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.vnet.ovs_manager import ovs_manager
from app.vnet.models import OVSAttackType, OVSMitigationAction

client = TestClient(app)


def test_ovs_status():
    response = client.get("/api/v1/ovs/status")
    assert response.status_code == 200
    data = response.json()
    assert data["bridge_name"] == "br-slicing"
    assert "backend_mode" in data
    assert len(data["ports"]) == 4
    assert data["openflow_version"] == "OpenFlow13"


def test_ovs_flows():
    response = client.get("/api/v1/ovs/flows")
    assert response.status_code == 200
    flows = response.json()
    assert len(flows) >= 4
    assert any("ARP" in f["match"] or "0x0806" in f["match"] for f in flows)


def test_ovs_attack_and_mitigation():
    # 1. Inject Attack
    attack_payload = {
        "attack_type": "DOS",
        "target_slice_id": "slice-urllc-01",
        "intensity": 0.85,
        "packet_rate": 8000,
    }
    atk_res = client.post("/api/v1/ovs/attack", json=attack_payload)
    assert atk_res.status_code == 200
    atk_data = atk_res.json()
    assert atk_data["status"] == "ATTACK_ACTIVE"
    assert atk_data["attack_type"] == "DOS"

    # Verify status reflects active attack
    status_res = client.get("/api/v1/ovs/status")
    status_data = status_res.json()
    assert status_data["active_attack"] is not None
    assert status_data["active_attack"]["target_slice_id"] == "slice-urllc-01"

    # 2. Mitigate with OpenFlow DROP rule
    mitigate_payload = {
        "action": "DROP",
        "target_ip": "172.28.0.99",
        "slice_id": "slice-urllc-01",
    }
    mit_res = client.post("/api/v1/ovs/mitigate", json=mitigate_payload)
    assert mit_res.status_code == 200
    mit_data = mit_res.json()
    assert mit_data["status"] == "RULE_ENFORCED"
    assert mit_data["threat_resolved"] is True

    # Verify rule is in flow table
    flows_res = client.get("/api/v1/ovs/flows")
    flows = flows_res.json()
    assert any("priority=100" in f["match"] or "DROP" in f["actions"] for f in flows)

    # 3. Reset to baseline
    reset_res = client.post("/api/v1/ovs/reset")
    assert reset_res.status_code == 200
    reset_data = reset_res.json()
    assert reset_data["status"] == "BASELINE"


def test_ovs_connectivity_and_ping():
    # 1. Test connectivity matrix
    conn_res = client.get("/api/v1/ovs/connectivity")
    assert conn_res.status_code == 200
    conn_data = conn_res.json()
    assert len(conn_data["nodes"]) == 5
    assert len(conn_data["wire_interfaces"]) == 4
    assert "latency_matrix_ms" in conn_data

    # 2. Test successful ping
    ping_res = client.post(
        "/api/v1/ovs/ping",
        json={"source_ip": "172.28.0.10", "target_ip": "172.28.0.20", "count": 3},
    )
    assert ping_res.status_code == 200
    ping_data = ping_res.json()
    assert ping_data["packets_transmitted"] == 3
    assert ping_data["packets_received"] == 3
    assert ping_data["packet_loss_pct"] == 0.0
    assert ping_data["is_blocked_by_openflow"] is False

    # 3. Test packet stream
    stream_res = client.get("/api/v1/ovs/packet-stream?limit=15")
    assert stream_res.status_code == 200
    packets = stream_res.json()
    assert len(packets) >= 5
    assert "src_ip" in packets[0]
    assert "dst_ip" in packets[0]
    assert "vlan_tag" in packets[0]
