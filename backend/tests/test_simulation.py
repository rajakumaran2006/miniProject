import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.models.slice import SliceType, SliceStatus, SecurityLevel
from app.simulation.config import SimulationConfig
from app.simulation.traffic import TrafficGenerator
from app.simulation.state import NetworkState
from app.simulation.simulator import NetworkSimulator, simulator

client = TestClient(app)


def test_traffic_generator_normal():
    gen = TrafficGenerator()
    config = SimulationConfig()
    
    embb = gen.generate_normal_traffic(SliceType.EMBB, config)
    assert embb["bandwidth"] > 0
    assert embb["latency"] > 0
    assert embb["connected_devices"] > 0
    assert embb["is_abnormal"] is False

    urllc = gen.generate_normal_traffic(SliceType.URLLC, config)
    assert urllc["latency"] < 5.0  # URLLC target latency is low
    assert urllc["is_abnormal"] is False

    mmtc = gen.generate_normal_traffic(SliceType.MMTC, config)
    assert mmtc["connected_devices"] > 10000  # High device count
    assert mmtc["is_abnormal"] is False


def test_traffic_generator_abnormal():
    gen = TrafficGenerator()
    config = SimulationConfig()

    ddos = gen.generate_abnormal_traffic(SliceType.EMBB, "DDOS_SURGE", config)
    assert ddos["is_abnormal"] is True
    assert ddos["anomaly_type"] == "DDOS_SURGE"
    assert ddos["cpu_usage"] > 80.0
    assert ddos["anomaly_score"] > 0.5

    jamming = gen.generate_abnormal_traffic(SliceType.URLLC, "RAN_JAMMING", config)
    assert jamming["is_abnormal"] is True
    assert jamming["anomaly_score"] > 0.7


def test_simulator_lifecycle():
    sim = NetworkSimulator()
    sim.reset_simulation()
    
    assert sim.state.step_count == 0
    assert sim.state.is_running is False
    assert len(sim.state.slices) == 3

    # Step simulation
    state_after = sim.run_multiple_simulation_steps(3)
    assert state_after.step_count == 3
    assert state_after.total_bandwidth_mbps > 0
    assert state_after.avg_latency_ms > 0

    # Test reset
    sim.reset_simulation()
    assert sim.state.step_count == 0


def test_simulator_anomaly_injection():
    sim = NetworkSimulator()
    sim.reset_simulation()
    
    event = sim.inject_anomaly("slice-urllc-01", "RAN_JAMMING", duration_steps=4)
    assert event.slice_id == "slice-urllc-01"
    assert len(sim.state.active_anomalies) == 1

    sim.run_multiple_simulation_steps(1)
    slice_urllc = sim.state.slices["slice-urllc-01"]
    assert slice_urllc.current_status in [SliceStatus.DEGRADED, SliceStatus.UNDER_ATTACK, SliceStatus.CRITICAL]


def test_api_simulation_control_endpoints():
    # 1. Reset
    resp = client.post(f"{settings.API_V1_STR}/simulation/reset")
    assert resp.status_code == 200
    assert resp.json()["state"]["step_count"] == 0

    # 2. Get state
    resp = client.get(f"{settings.API_V1_STR}/simulation/state")
    assert resp.status_code == 200
    data = resp.json()
    assert "slices" in data
    assert "slice-embb-01" in data["slices"]

    # 3. Step
    resp = client.post(f"{settings.API_V1_STR}/simulation/step", json={"steps": 5})
    assert resp.status_code == 200
    assert resp.json()["current_step"] == 5

    # 4. Config GET and PUT
    resp = client.get(f"{settings.API_V1_STR}/simulation/config")
    assert resp.status_code == 200
    config_data = resp.json()
    assert config_data["traffic_multiplier"] == 1.0

    config_data["traffic_multiplier"] = 1.5
    resp = client.put(f"{settings.API_V1_STR}/simulation/config", json=config_data)
    assert resp.status_code == 200
    assert resp.json()["traffic_multiplier"] == 1.5

    # 5. Inject anomaly API
    resp = client.post(
        f"{settings.API_V1_STR}/simulation/inject-anomaly",
        json={"slice_id": "slice-embb-01", "anomaly_type": "DDOS_SURGE", "duration_steps": 3}
    )
    assert resp.status_code == 200
    assert resp.json()["event"]["slice_id"] == "slice-embb-01"

    # 6. Start & Stop
    resp = client.post(f"{settings.API_V1_STR}/simulation/start")
    assert resp.status_code == 200

    resp = client.post(f"{settings.API_V1_STR}/simulation/stop")
    assert resp.status_code == 200
