import os
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.rl.environment import SecurityEnvironment, ACTIONS
from app.rl.dqn_agent import DQNAgent, DEFAULT_CHECKPOINT_PATH
from app.rl.train import run_training_pipeline, METRICS_SAVE_PATH
from app.simulation.simulator import simulator

client = TestClient(app)


def test_gymnasium_security_environment():
    env = SecurityEnvironment(max_steps_per_episode=20, seed=42)
    obs, info = env.reset()

    assert obs.shape == (9,)
    assert info["step"] == 0

    # Step action 0 (no_action)
    next_obs, reward, terminated, truncated, step_info = env.step(0)
    assert next_obs.shape == (9,)
    assert isinstance(reward, float)
    assert step_info["action_name"] == "no_action"

    # Step action 5 (isolate_slice) - should have high latency penalty
    _, reward_iso, _, _, info_iso = env.step(5)
    assert info_iso["latency_ms"] >= 25.0
    assert info_iso["cpu_usage_pct"] >= 25.0


def test_dqn_agent_lifecycle():
    agent = DQNAgent(state_dim=9, action_dim=6)
    state = env_obs = np_state = np_obs = np_array = np_obs = SecurityEnvironment().reset()[0]

    action = agent.select_action(state, evaluate=True)
    assert 0 <= action < 6

    # Test replay buffer push and update
    agent.memory.push(state, action, 10.0, state, False)
    # Fill batch to trigger update
    for _ in range(70):
        agent.memory.push(state, action, 5.0, state, False)

    loss = agent.update()
    assert loss is not None
    assert isinstance(loss, float)


def test_standalone_training_run():
    metrics = run_training_pipeline(num_episodes=5, steps_per_episode=10)
    assert metrics["num_episodes"] == 5
    assert os.path.exists(DEFAULT_CHECKPOINT_PATH)
    assert os.path.exists(METRICS_SAVE_PATH)


def test_rl_api_endpoints():
    # 1. Status API
    resp = client.get(f"{settings.API_V1_STR}/rl/status")
    assert resp.status_code == 200
    assert resp.json()["model_checkpoint_exists"] is True

    # 2. Select Action API
    resp = client.post(f"{settings.API_V1_STR}/rl/select-action", json={"slice_id": "slice-urllc-01"})
    assert resp.status_code == 200
    data = resp.json()
    assert "selected_action_name" in data
    assert data["selected_action_id"] in [0, 1, 2, 3, 4, 5]

    # 3. Metrics API
    resp = client.get(f"{settings.API_V1_STR}/rl/metrics")
    assert resp.status_code == 200
    assert "mean_cumulative_reward" in resp.json()

    # 4. Train API
    resp = client.post(f"{settings.API_V1_STR}/rl/train", json={"num_episodes": 3, "steps_per_episode": 5})
    assert resp.status_code == 200
    assert resp.json()["metrics"]["num_episodes"] == 3
