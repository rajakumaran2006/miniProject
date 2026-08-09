import os
import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.rl.marl_env import MultiAgentSecurityEnv, AGENT_NAMES, LAYER_ACTIONS, CrossLayerCoordinationHub
from app.rl.marl_agents import MultiAgentDQN, DEFAULT_MARL_CHECKPOINT_PATH
from app.rl.marl_train import train_marl_agents, run_comparative_experiment, EXPERIMENT_RESULTS_PATH

client = TestClient(app)


def test_multi_agent_security_environment():
    env = MultiAgentSecurityEnv(max_steps_per_episode=20, seed=42)
    obs_dict, info = env.reset()

    assert len(obs_dict) == 4
    for agent in AGENT_NAMES:
        assert agent in obs_dict
        assert obs_dict[agent].shape == (8,)

    # Execute joint step
    joint_actions = {agent: 1 for agent in AGENT_NAMES}
    next_obs, rewards, terms, truncs, step_info = env.step(joint_actions)

    assert len(next_obs) == 4
    assert len(rewards) == 4
    assert "effective_mitigation" in step_info
    assert "actions_taken" in step_info


def test_cross_layer_coordination_hub():
    hub = CrossLayerCoordinationHub()
    joint_act = {"physical": 3, "mac": 1, "network": 2, "application": 0}
    sig = hub.update_coordination(joint_act)

    assert sig.shape == (4,)
    assert sig[0] == 1.0  # 3 / 3.0
    assert sig[3] == 0.0  # 0 / 3.0


def test_multi_agent_dqn_lifecycle():
    marl = MultiAgentDQN(state_dim=8, action_dim=4)
    dummy_obs = {agent: np.random.rand(8).astype(np.float32) for agent in AGENT_NAMES}

    actions = marl.select_actions(dummy_obs, evaluate=True)
    assert len(actions) == 4
    for agent, act in actions.items():
        assert 0 <= act < 4

    # Push to replay buffer for each agent
    for agent in AGENT_NAMES:
        marl.brains[agent].memory.push(dummy_obs[agent], actions[agent], 10.0, dummy_obs[agent], False)
        for _ in range(70):
            marl.brains[agent].memory.push(dummy_obs[agent], actions[agent], 5.0, dummy_obs[agent], False)

    losses = marl.update()
    assert len(losses) == 4
    for agent in AGENT_NAMES:
        assert agent in losses
        assert isinstance(losses[agent], float)


def test_marl_training_and_comparative_experiment():
    # 1. Test MARL training
    train_res = train_marl_agents(num_episodes=2, steps_per_episode=5)
    assert train_res["num_episodes"] == 2
    assert os.path.exists(DEFAULT_MARL_CHECKPOINT_PATH)

    # 2. Test Comparative Benchmark
    comp_res = run_comparative_experiment(eval_episodes=3, seed=42)
    assert comp_res["eval_episodes"] == 3
    assert "static_baseline" in comp_res["strategies"]
    assert "single_agent_rl" in comp_res["strategies"]
    assert "multi_agent_rl" in comp_res["strategies"]
    assert os.path.exists(EXPERIMENT_RESULTS_PATH)


def test_marl_api_endpoints():
    # 1. Status API
    resp = client.get(f"{settings.API_V1_STR}/rl/marl/status")
    assert resp.status_code == 200
    assert resp.json()["checkpoint_exists"] is True
    assert len(resp.json()["agents"]) == 4

    # 2. Metrics API
    resp = client.get(f"{settings.API_V1_STR}/rl/marl/metrics")
    assert resp.status_code == 200
    assert "strategies" in resp.json()

    # 3. Train API
    resp = client.post(f"{settings.API_V1_STR}/rl/marl/train", json={"num_episodes": 2, "steps_per_episode": 5})
    assert resp.status_code == 200
    assert resp.json()["metrics"]["num_episodes"] == 2

    # 4. Evaluate API
    resp = client.post(f"{settings.API_V1_STR}/rl/marl/evaluate", json={"eval_episodes": 5, "seed": 42})
    assert resp.status_code == 200
    assert "multi_agent_rl" in resp.json()["strategies"]
