import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.controls.crypto_prototype import LightweightCryptoPrototype
from app.controls.controller import SecurityController, AuthenticationLevel, EncryptionLevel, IntrusionDetectionLevel, SliceIsolationLevel
from app.simulation.simulator import simulator

client = TestClient(app)


def test_lightweight_crypto_prototype():
    res = LightweightCryptoPrototype.encrypt_payload("TelemetryPayload123", "LIGHTWEIGHT_PRESENT_ASCON")
    assert res["cipher_mode"] == "LIGHTWEIGHT_PRESENT_ASCON"
    assert "ENC[" in res["ciphertext"]
    assert len(res["nonce"]) == 16
    assert len(res["mac_tag"]) == 16
    assert res["cpu_cycles_per_byte"] == 3.2

    bench = LightweightCryptoPrototype.get_benchmark_comparison()
    assert "LIGHTWEIGHT_PRESENT_ASCON" in bench["supported_modes"]
    assert "AES_256_GCM_PQC" in bench["supported_modes"]


def test_security_controller_decision_processing():
    controller = SecurityController()
    s_obj = simulator.state.slices["slice-embb-01"]
    prev_lat = s_obj.latency

    log_entry = controller.process_rl_decision(
        slice_obj=s_obj,
        rl_agent_name="Application_Layer_Agent",
        action_name="enforce_mfa",
        threat_vector="Spoofing",
    )

    assert log_entry["slice_id"] == "slice-embb-01"
    assert log_entry["rl_agent"] == "Application_Layer_Agent"
    assert log_entry["action_taken"] == "enforce_mfa"
    assert s_obj.latency >= prev_lat
    assert len(controller.logger.decision_history) == 1


def test_controls_api_endpoints():
    # 1. Apply Control API
    resp = client.post(
        f"{settings.API_V1_STR}/controls/apply",
        json={
            "slice_id": "slice-urllc-01",
            "rl_agent_name": "Network_Layer_Agent",
            "action_name": "isolate_slice",
            "threat_vector": "Network-Slice Isolation Breach",
        },
    )
    assert resp.status_code == 200
    assert "audit_log_entry" in resp.json()

    # 2. History API
    resp = client.get(f"{settings.API_V1_STR}/controls/history")
    assert resp.status_code == 200
    assert resp.json()["total_records"] >= 1

    # 3. Status API
    resp = client.get(f"{settings.API_V1_STR}/controls/status/slice-urllc-01")
    assert resp.status_code == 200
    assert "controls" in resp.json()
    assert "authentication" in resp.json()["controls"]

    # 4. Encrypt Test API
    resp = client.post(
        f"{settings.API_V1_STR}/controls/encrypt-test",
        json={"plaintext": "5G_IoT_Sensor_Data", "cipher_mode": "LIGHTWEIGHT_PRESENT_ASCON"},
    )
    assert resp.status_code == 200
    assert "ciphertext" in resp.json()

    # 5. Crypto Benchmark API
    resp = client.get(f"{settings.API_V1_STR}/controls/crypto-benchmark")
    assert resp.status_code == 200
    assert "supported_modes" in resp.json()
