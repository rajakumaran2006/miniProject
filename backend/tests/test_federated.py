import os
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.fl.edge_node import EdgeNode, PrivacyViolationError
from app.fl.aggregator import FederatedAggregator, DEFAULT_GLOBAL_MODEL_PATH, EXPERIMENTAL_FL_RESULTS_PATH
from app.fl.train import run_federated_learning_pipeline
from app.models.slice import SliceType, NetworkSlice
from app.simulation.simulator import simulator

client = TestClient(app)


def test_edge_node_privacy_isolation(tmp_path):
    node = EdgeNode("test-node-1", "Test Node", SliceType.EMBB, str(tmp_path), sample_count=50)

    assert len(node.X_local) == 50
    assert len(node.y_local) == 50
    assert os.path.exists(node.dataset_path)

    # Privacy Assertion: Raw dataset export must throw PrivacyViolationError
    with pytest.raises(PrivacyViolationError):
        node.get_raw_dataset_prohibited()


def test_fedavg_parameter_aggregation():
    aggregator = FederatedAggregator()
    res = aggregator.run_federated_round(local_epochs=2)

    assert res["round"] >= 1
    assert "local_training_metrics" in res
    assert "global_model_metrics" in res
    assert res["global_model_metrics"]["accuracy"] > 0.60
    assert res["privacy_proof"]["raw_feature_vectors_transmitted"] == 0


def test_standalone_fl_training_pipeline():
    res = run_federated_learning_pipeline(num_rounds=2, local_epochs=2)

    assert res["num_communication_rounds"] == 2
    assert len(res["participating_edge_nodes"]) == 3
    assert os.path.exists(DEFAULT_GLOBAL_MODEL_PATH)
    assert os.path.exists(EXPERIMENTAL_FL_RESULTS_PATH)


def test_global_federated_model_prediction():
    aggregator = FederatedAggregator()
    s_obj = simulator.state.slices["slice-embb-01"]

    pred = aggregator.predict_slice(s_obj)
    assert "anomaly_score" in pred
    assert pred["predicted_status"] in ["NORMAL", "ANOMALOUS"]
    assert 0.0 <= pred["anomaly_score"] <= 1.0


def test_federated_api_endpoints():
    # 1. Status API
    resp = client.get(f"{settings.API_V1_STR}/fl/status")
    assert resp.status_code == 200
    assert resp.json()["global_model_checkpoint_exists"] is True
    assert len(resp.json()["participating_edge_nodes"]) == 3

    # 2. Predict API
    resp = client.post(f"{settings.API_V1_STR}/fl/predict", json={"slice_id": "slice-embb-01"})
    assert resp.status_code == 200
    assert "anomaly_score" in resp.json()

    # 3. Metrics API
    resp = client.get(f"{settings.API_V1_STR}/fl/metrics")
    assert resp.status_code == 200
    assert "privacy_proof" in resp.json()

    # 4. Train API
    resp = client.post(f"{settings.API_V1_STR}/fl/train", json={"num_rounds": 2, "local_epochs": 2})
    assert resp.status_code == 200
    assert resp.json()["results"]["num_communication_rounds"] == 2
