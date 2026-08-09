import os
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.experiments.benchmark import exp_runner, JSON_RESULT_PATH, CSV_RESULT_PATH

client = TestClient(app)


def test_comparative_experiment_runner():
    res = exp_runner.run_comparative_benchmark(eval_episodes=20, seed=42)

    assert "strategies" in res
    assert "static_baseline" in res["strategies"]
    assert "single_agent_rl" in res["strategies"]
    assert "multi_agent_cross_layer_rl" in res["strategies"]

    marl = res["strategies"]["multi_agent_cross_layer_rl"]
    assert marl["attack_detection_rate_pct"] == 100.0
    assert marl["attack_mitigation_rate_pct"] == 100.0
    assert marl["response_time_steps"] == 1.0

    assert os.path.exists(JSON_RESULT_PATH)
    assert os.path.exists(CSV_RESULT_PATH)


def test_experiments_api_endpoints():
    # 1. Run Experiment API
    resp = client.post(f"{settings.API_V1_STR}/experiments/run", json={"eval_episodes": 20, "seed": 42})
    assert resp.status_code == 200
    assert "strategies" in resp.json()

    # 2. Get Results API
    resp = client.get(f"{settings.API_V1_STR}/experiments/results")
    assert resp.status_code == 200
    assert "strategies" in resp.json()

    # 3. CSV Download API
    resp = client.get(f"{settings.API_V1_STR}/experiments/csv")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "text/csv; charset=utf-8"
