import os
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.models.slice import NetworkSlice, SliceType, AttackType, AttackSeverity
from app.ml.features import FeatureExtractor, FEATURE_NAMES
from app.ml.detector import anomaly_detector, AnomalyDetector
from app.simulation.simulator import simulator
from app.simulation.attacks import attack_simulator

client = TestClient(app)


def test_feature_extraction():
    slice_obj = NetworkSlice(
        slice_id="slice-test-01",
        name="Test eMBB Slice",
        slice_type=SliceType.EMBB,
        bandwidth=500.0,
        latency=15.0,
        packet_rate=10000.0,
        packet_loss=0.001,
        connected_devices=2500,
        cpu_usage=30.0,
        allocated_bandwidth_mbps=1000.0,
        max_latency_ms=20.0,
        target_reliability=0.999,
    )
    slice_obj.metrics.core_3gpp["auth_failures"] = 5.0
    slice_obj.metrics.transport_network["unauthorized_cross_slice_flows"] = 2.0

    feats = FeatureExtractor.extract_features(slice_obj)
    assert len(feats) == 9
    assert feats[0] == 10000.0  # packet_rate
    assert feats[2] == 15.0     # latency
    assert feats[3] == 500.0    # bandwidth_usage
    assert feats[4] == 0.001    # packet_loss
    assert feats[5] == 2500.0   # connection_count
    assert feats[6] == 5.0      # failed_authentication
    assert feats[7] == 30.0     # resource_usage
    assert feats[8] == 2.0      # cross_slice_access


def test_synthetic_dataset_generation():
    X, y, records = FeatureExtractor.generate_synthetic_dataset(
        num_samples_per_class=50, export_path="data/test_dataset.json"
    )
    assert len(X) == len(y)
    assert len(X) == 50 * 6  # 3 normal classes + 3 threat classes
    assert os.path.exists("data/test_dataset.json")
    assert os.path.exists("data/test_dataset.csv")


def test_model_training_and_evaluation_metrics():
    det = AnomalyDetector()
    metrics = det.train_model(num_samples_per_class=100)

    assert metrics.accuracy > 0.65
    assert metrics.precision > 0.65
    assert metrics.f1_score > 0.65
    assert len(metrics.confusion_matrix) == 2
    assert len(metrics.confusion_matrix[0]) == 2
    assert os.path.exists(det.model_path)


def test_prediction_normal_vs_attack():
    simulator.reset_simulation()
    slice_normal = simulator.state.slices["slice-embb-01"]
    
    # Predict on normal slice
    res_norm = anomaly_detector.predict(slice_normal)
    assert res_norm.anomaly_score < 0.60
    assert res_norm.predicted_status == "NORMAL"

    # Inject DoS attack and step
    attack_simulator.start_attack("slice-embb-01", AttackType.DOS, AttackSeverity.HIGH, 3)
    simulator.run_multiple_simulation_steps(1)
    slice_dos = simulator.state.slices["slice-embb-01"]

    res_attack = anomaly_detector.predict(slice_dos)
    assert res_attack.anomaly_score >= 0.50
    assert res_attack.predicted_status == "ANOMALOUS"


def test_detection_api_endpoints():
    # 1. Train API
    resp = client.post(f"{settings.API_V1_STR}/detection/train", json={"num_samples_per_class": 80})
    assert resp.status_code == 200
    metrics = resp.json()
    assert "f1_score" in metrics
    assert "confusion_matrix" in metrics

    # 2. Get Metrics API
    resp = client.get(f"{settings.API_V1_STR}/detection/metrics")
    assert resp.status_code == 200
    assert resp.json()["f1_score"] == metrics["f1_score"]

    # 3. Predict API
    resp = client.post(f"{settings.API_V1_STR}/detection/predict", json={"slice_id": "slice-urllc-01"})
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 1
    assert results[0]["affected_slice"] == "slice-urllc-01"

    # 4. History API
    resp = client.get(f"{settings.API_V1_STR}/detection/history")
    assert resp.status_code == 200
    history = resp.json()
    assert len(history) >= 1
