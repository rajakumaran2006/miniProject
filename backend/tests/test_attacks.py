import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.models.slice import SliceType, SliceStatus, AttackType, AttackSeverity
from app.simulation.attacks import attack_simulator
from app.simulation.simulator import simulator

client = TestClient(app)


def test_dos_attack_simulation():
    simulator.reset_simulation()
    
    event = attack_simulator.start_attack(
        slice_id="slice-embb-01",
        attack_type=AttackType.DOS,
        severity=AttackSeverity.HIGH,
        duration_steps=3
    )

    assert event.ground_truth_label == 1
    assert event.attack_type == AttackType.DOS

    simulator.run_multiple_simulation_steps(1)
    slice_obj = simulator.state.slices["slice-embb-01"]

    # Verify DoS feature impacts
    assert slice_obj.packet_rate > 30000.0  # Spike in packet rate
    assert slice_obj.bandwidth > 2000.0     # Spike in bandwidth
    assert slice_obj.latency > 50.0         # Spike in latency
    assert slice_obj.packet_loss > 0.05     # High packet loss
    assert slice_obj.current_status == SliceStatus.UNDER_ATTACK


def test_spoofing_attack_simulation():
    simulator.reset_simulation()

    event = attack_simulator.start_attack(
        slice_id="slice-urllc-01",
        attack_type=AttackType.SPOOFING,
        severity=AttackSeverity.HIGH,
        duration_steps=3
    )

    assert event.ground_truth_label == 1
    assert event.attack_type == AttackType.SPOOFING

    simulator.run_multiple_simulation_steps(1)
    slice_obj = simulator.state.slices["slice-urllc-01"]

    # Verify Spoofing feature impacts
    metrics = slice_obj.metrics
    assert metrics.core_3gpp["auth_success_ratio"] < 0.65
    assert metrics.core_3gpp["auth_failures"] > 50.0
    assert metrics.core_3gpp["spoofed_device_count"] > 100.0
    assert metrics.application["suspicious_connections"] > 20.0


def test_isolation_breach_attack_simulation():
    simulator.reset_simulation()

    event = attack_simulator.start_attack(
        slice_id="slice-mmtc-01",
        attack_type=AttackType.ISOLATION_BREACH,
        severity=AttackSeverity.CRITICAL,
        duration_steps=3
    )

    assert event.ground_truth_label == 1
    assert event.attack_type == AttackType.ISOLATION_BREACH

    simulator.run_multiple_simulation_steps(1)
    slice_obj = simulator.state.slices["slice-mmtc-01"]

    # Verify Isolation Breach feature impacts
    metrics = slice_obj.metrics
    assert metrics.transport_network["unauthorized_cross_slice_flows"] > 50.0
    assert metrics.transport_network["inter_slice_resource_leak_mbps"] > 200.0
    assert metrics.application["unauthorized_api_attempts"] > 20.0


def test_attack_api_endpoints():
    simulator.reset_simulation()

    # 1. Start Attack API
    resp = client.post(
        f"{settings.API_V1_STR}/attacks/start",
        json={
            "slice_id": "slice-urllc-01",
            "attack_type": "Denial-of-Service",
            "severity": "HIGH",
            "duration_steps": 4
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "event" in data
    event_id = data["event"]["event_id"]
    assert data["event"]["ground_truth_label"] == 1

    # 2. Get Active Attacks API
    resp = client.get(f"{settings.API_V1_STR}/attacks/active")
    assert resp.status_code == 200
    active = resp.json()
    assert len(active) >= 1
    assert active[0]["event_id"] == event_id

    # 3. Get History API
    resp = client.get(f"{settings.API_V1_STR}/attacks/history")
    assert resp.status_code == 200
    history = resp.json()
    assert len(history) >= 1

    # 4. Stop Attack API
    resp = client.post(f"{settings.API_V1_STR}/attacks/stop", json={"target_id": event_id})
    assert resp.status_code == 200

    resp = client.get(f"{settings.API_V1_STR}/attacks/active")
    assert resp.status_code == 200
    active_after = resp.json()
    assert len(active_after) == 0
