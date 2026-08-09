import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.simulation.simulator import simulator
from app.simulation.attacks import attack_simulator, AttackType, AttackSeverity
from app.services.orchestrator import orchestrator

client = TestClient(app)


def test_full_end_to_end_closed_loop_lifecycle():
    """
    Test complete end-to-end framework lifecycle:
    Normal Traffic -> Attack Injection -> Anomaly Detection -> MARL Decision -> Security Control Response -> Recovery.
    """
    # 1. Stage 1: Reset simulation & verify normal traffic state
    simulator.reset_simulation()
    frame_norm = orchestrator.step_integrated_pipeline(auto_defend=False)

    assert frame_norm["step_count"] >= 1
    assert len(frame_norm["slices_telemetry"]) == 3
    assert len(frame_norm["active_attacks"]) == 0

    # Verify normal anomaly scores
    urllc_eval = frame_norm["slice_evaluations"]["slice-urllc-01"]
    assert urllc_eval["isolation_forest_risk"] < 0.50

    # 2. Stage 2: Inject Denial-of-Service (DoS) Attack on URLLC slice
    atk_event = attack_simulator.start_attack(
        slice_id="slice-urllc-01",
        attack_type=AttackType.DOS,
        severity=AttackSeverity.CRITICAL,
        duration_steps=5,
    )
    assert atk_event.is_active is True

    # 3. Stage 3: Step integrated pipeline with Auto-Defense enabled
    frame_attack = orchestrator.step_integrated_pipeline(auto_defend=True)

    # 4. Stage 4: Verify Anomaly Detection flagged threat
    assert len(frame_attack["active_attacks"]) >= 1
    urllc_atk_eval = frame_attack["slice_evaluations"]["slice-urllc-01"]
    assert urllc_atk_eval["has_active_attack"] is True

    # 5. Stage 5: Verify MARL Layer Agents inferred coordinated actions
    assert "marl_decisions" in frame_attack
    assert "physical" in frame_attack["marl_decisions"]
    assert "application" in frame_attack["marl_decisions"]

    # 6. Stage 6: Verify SecurityController enforced controls and logged audit entry
    assert "applied_controls" in frame_attack
    applied = frame_attack["applied_controls"]
    assert applied["slice_id"] == "slice-urllc-01"
    assert applied["action_taken"] in [
        "enforce_mfa",
        "enable_stronger_encryption",
        "isolate_slice",
        "increase_monitoring",
        "block_suspicious_device",
        "network_rate_limit",
        "throttle_slice_bandwidth",
    ]

    # 7. Stage 7: Network Recovery - Stop attack & step orchestrator to confirm recovery
    attack_simulator.stop_attack(atk_event.event_id)
    for _ in range(3):
        frame_rec = orchestrator.step_integrated_pipeline(auto_defend=True)

    assert len(simulator.state.active_attacks) == 0


def test_orchestrator_api_endpoints():
    # 1. Step API
    resp = client.post(f"{settings.API_V1_STR}/orchestrator/step")
    assert resp.status_code == 200
    assert "slice_evaluations" in resp.json()

    # 2. State API
    resp = client.get(f"{settings.API_V1_STR}/orchestrator/state")
    assert resp.status_code == 200
    assert resp.json()["auto_defense_enabled"] is True

    # 3. Disable Auto-Defense API
    resp = client.post(f"{settings.API_V1_STR}/orchestrator/auto-defense/disable")
    assert resp.status_code == 200
    assert resp.json()["auto_defense_enabled"] is False

    # 4. Enable Auto-Defense API
    resp = client.post(f"{settings.API_V1_STR}/orchestrator/auto-defense/enable")
    assert resp.status_code == 200
    assert resp.json()["auto_defense_enabled"] is True
