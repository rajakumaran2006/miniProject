import os
import json
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.rl.environment import ACTIONS, SecurityEnvironment
from app.rl.dqn_agent import DQNAgent, DEFAULT_CHECKPOINT_PATH
from app.rl.train import run_training_pipeline, METRICS_SAVE_PATH
from app.rl.marl_env import MultiAgentSecurityEnv, AGENT_NAMES, LAYER_ACTIONS
from app.rl.marl_agents import MultiAgentDQN, DEFAULT_MARL_CHECKPOINT_PATH
from app.rl.marl_train import train_marl_agents, run_comparative_experiment, EXPERIMENT_RESULTS_PATH
from app.simulation.simulator import simulator

router = APIRouter()

# Global Single-Agent & Multi-Agent singletons
rl_agent = DQNAgent()
rl_env = SecurityEnvironment()

marl_agent = MultiAgentDQN()
marl_env = MultiAgentSecurityEnv()


class RLTrainRequest(BaseModel):
    num_episodes: int = Field(default=100, ge=1, le=1000, description="Number of training episodes")
    steps_per_episode: int = Field(default=50, ge=1, le=200, description="Steps per episode")


class RLSelectActionRequest(BaseModel):
    slice_id: str = Field(..., json_schema_extra={"example": "slice-urllc-01"}, description="Target slice ID to evaluate")


class MARLTrainRequest(BaseModel):
    num_episodes: int = Field(default=100, ge=1, le=1000, description="Number of training episodes")
    steps_per_episode: int = Field(default=50, ge=1, le=200, description="Steps per episode")


class MARLEvaluateRequest(BaseModel):
    eval_episodes: int = Field(default=50, ge=5, le=500, description="Number of evaluation episodes")
    seed: int = Field(default=42, description="Random seed for reproducibility")


# Single-Agent RL Endpoints

@router.post("/train", summary="Trigger Single-Agent RL Training")
def train_rl_agent(req: RLTrainRequest = RLTrainRequest()):
    """Train single-agent PyTorch DQN policy on Gymnasium SecurityEnvironment."""
    try:
        metrics = run_training_pipeline(
            num_episodes=req.num_episodes,
            steps_per_episode=req.steps_per_episode,
        )
        rl_agent.load_checkpoint()
        return {
            "message": f"Successfully completed PyTorch DQN training over {req.num_episodes} episodes",
            "metrics": metrics,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RL training failed: {str(e)}")


@router.post("/select-action", summary="Query Single-Agent Security Action")
def select_security_action(req: RLSelectActionRequest):
    """Query trained single-agent PyTorch RL policy for target slice."""
    slice_obj = simulator.state.slices.get(req.slice_id)
    if not slice_obj:
        raise HTTPException(status_code=404, detail=f"Slice '{req.slice_id}' not found")

    has_attack = any(a.slice_id == req.slice_id for a in simulator.state.active_attacks)
    obs = rl_env._normalize_state(slice_obj, attack_prob=0.8 if has_attack else 0.05)

    action_idx = rl_agent.select_action(obs, evaluate=True)
    act_info = ACTIONS.get(action_idx, ACTIONS[0])

    return {
        "slice_id": req.slice_id,
        "slice_type": slice_obj.slice_type.value,
        "selected_action_id": action_idx,
        "selected_action_name": act_info["name"],
        "expected_mitigation": act_info["mitigation"],
        "latency_penalty_ms": act_info["latency_penalty_ms"],
        "cpu_penalty_pct": act_info["cpu_penalty_pct"],
        "has_active_attack": has_attack,
        "current_anomaly_score": slice_obj.anomaly_score,
    }


@router.get("/metrics", summary="Get Single-Agent RL Metrics")
def get_rl_metrics():
    """Retrieve single-agent training metrics."""
    if os.path.exists(METRICS_SAVE_PATH):
        try:
            with open(METRICS_SAVE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading metrics: {str(e)}")
    raise HTTPException(status_code=404, detail="No RL training metrics found. Please trigger training first.")


@router.get("/status", summary="Get Single-Agent RL Status")
def get_rl_status():
    """Retrieve single-agent RL readiness."""
    checkpoint_exists = os.path.exists(DEFAULT_CHECKPOINT_PATH)
    return {
        "framework": "Gymnasium + PyTorch Deep Q-Network (DQN)",
        "model_checkpoint_exists": checkpoint_exists,
        "checkpoint_path": DEFAULT_CHECKPOINT_PATH,
        "state_dim": rl_agent.state_dim,
        "action_dim": rl_agent.action_dim,
        "current_epsilon": round(rl_agent.epsilon, 4),
        "actions_space": [a["name"] for a in ACTIONS.values()],
    }


# Multi-Agent Cross-Layer RL Endpoints

@router.post("/marl/train", summary="Trigger Multi-Agent RL Training")
def train_marl_agent_endpoint(req: MARLTrainRequest = MARLTrainRequest()):
    """Train 4 cross-layer security agents (Physical, MAC, Network, Application) using PyTorch MARL."""
    try:
        metrics = train_marl_agents(
            num_episodes=req.num_episodes,
            steps_per_episode=req.steps_per_episode,
        )
        marl_agent.load_checkpoints()
        return {
            "message": f"Successfully trained 4-layer MARL security agents over {req.num_episodes} episodes",
            "metrics": metrics,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MARL training failed: {str(e)}")


@router.post("/marl/evaluate", summary="Run 3-Way Comparative Experiment")
def evaluate_marl_comparative(req: MARLEvaluateRequest = MARLEvaluateRequest()):
    """
    Run reproducible comparative benchmark evaluating 100 identical attack episodes under:
    1. Static Security Baseline
    2. Single-Agent RL
    3. Multi-Agent Coordinated MARL
    """
    try:
        results = run_comparative_experiment(eval_episodes=req.eval_episodes, seed=req.seed)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparative evaluation failed: {str(e)}")


@router.get("/marl/metrics", summary="Get MARL Comparative Metrics")
def get_marl_metrics():
    """Retrieve 3-way comparative experiment results."""
    if os.path.exists(EXPERIMENT_RESULTS_PATH):
        try:
            with open(EXPERIMENT_RESULTS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading MARL metrics: {str(e)}")
    raise HTTPException(status_code=404, detail="No MARL metrics found. Please trigger comparative evaluation first.")


@router.get("/marl/status", summary="Get MARL Readiness Status")
def get_marl_status():
    """Retrieve 4-layer MARL agent readiness status."""
    checkpoint_exists = os.path.exists(DEFAULT_MARL_CHECKPOINT_PATH)
    return {
        "framework": "Multi-Agent Reinforcement Learning (MARL) Cross-Layer Architecture",
        "checkpoint_exists": checkpoint_exists,
        "checkpoint_path": DEFAULT_MARL_CHECKPOINT_PATH,
        "agents": AGENT_NAMES,
        "state_dim_per_agent": 8,
        "action_dim_per_agent": 4,
        "shared_coordination_dim": 4,
        "layer_action_spaces": LAYER_ACTIONS,
    }
