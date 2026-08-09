import os
import json
import random
import logging
from typing import Dict, List, Any, Optional
import numpy as np

from app.rl.environment import SecurityEnvironment, ACTIONS as SINGLE_ACTIONS
from app.rl.dqn_agent import DQNAgent
from app.rl.marl_env import MultiAgentSecurityEnv, AGENT_NAMES, LAYER_ACTIONS
from app.rl.marl_agents import MultiAgentDQN, DEFAULT_MARL_CHECKPOINT_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("5g_6g_security.rl.marl_train")

EXPERIMENT_RESULTS_PATH = "experiments/multi_agent_experiment_results.json"


def train_marl_agents(
    num_episodes: int = 150,
    steps_per_episode: int = 50,
    checkpoint_path: str = DEFAULT_MARL_CHECKPOINT_PATH,
) -> Dict[str, Any]:
    """Train 4 cross-layer security agents using MultiAgentDQN on MultiAgentSecurityEnv."""
    logger.info(f"Starting Multi-Agent RL Training over {num_episodes} episodes...")

    env = MultiAgentSecurityEnv(max_steps_per_episode=steps_per_episode, seed=42)
    marl_agent = MultiAgentDQN(checkpoint_path=checkpoint_path)

    joint_rewards: List[float] = []
    mitigation_rates: List[float] = []
    avg_latencies: List[float] = []
    avg_cpu_usages: List[float] = []

    for ep in range(1, num_episodes + 1):
        obs_dict, info = env.reset()
        ep_joint_reward = 0.0
        attacks_encountered = 0
        attacks_mitigated = 0
        latencies = []
        cpus = []

        for step in range(steps_per_episode):
            joint_actions = marl_agent.select_actions(obs_dict, evaluate=False)
            next_obs_dict, rewards_dict, term_dict, trunc_dict, step_info = env.step(joint_actions)

            # Push experiences into replay buffers for all 4 agents
            for agent in AGENT_NAMES:
                done = term_dict[agent] or trunc_dict[agent]
                marl_agent.brains[agent].memory.push(
                    obs_dict[agent], joint_actions[agent], rewards_dict[agent], next_obs_dict[agent], done
                )

            marl_agent.update()
            obs_dict = next_obs_dict
            ep_joint_reward += step_info.get("joint_reward", 0.0)

            if step_info.get("has_attack", False):
                attacks_encountered += 1
                if step_info.get("effective_mitigation", 0.0) > 0.4:
                    attacks_mitigated += 1

            latencies.append(step_info.get("latency_ms", 10.0))
            cpus.append(step_info.get("cpu_usage_pct", 20.0))

            if all(term_dict.values()) or all(trunc_dict.values()):
                break

        ep_mitigation = round((attacks_mitigated / max(1, attacks_encountered)) * 100.0, 2)
        ep_lat = round(float(np.mean(latencies)), 2)
        ep_cpu = round(float(np.mean(cpus)), 2)

        joint_rewards.append(round(ep_joint_reward, 2))
        mitigation_rates.append(ep_mitigation)
        avg_latencies.append(ep_lat)
        avg_cpu_usages.append(ep_cpu)

        if ep % 25 == 0 or ep == num_episodes:
            logger.info(
                f"MARL Episode {ep}/{num_episodes} | Joint Reward: {ep_joint_reward:.2f} | Epsilon: {marl_agent.epsilon:.3f} | "
                f"Mitigation: {ep_mitigation}% | Avg Latency: {ep_lat}ms | Avg CPU: {ep_cpu}%"
            )

    marl_agent.save_checkpoints(checkpoint_path)
    logger.info("MARL Training Complete!")
    return {
        "num_episodes": num_episodes,
        "final_epsilon": round(marl_agent.epsilon, 4),
        "mean_cumulative_reward": round(float(np.mean(joint_rewards[-30:])), 2),
        "mean_mitigation_rate_pct": round(float(np.mean(mitigation_rates[-30:])), 2),
        "mean_latency_ms": round(float(np.mean(avg_latencies[-30:])), 2),
        "mean_cpu_usage_pct": round(float(np.mean(avg_cpu_usages[-30:])), 2),
    }


def run_comparative_experiment(
    eval_episodes: int = 100, seed: int = 42, export_path: str = EXPERIMENT_RESULTS_PATH
) -> Dict[str, Any]:
    """
    Run 3-way comparative experiment evaluating 100 identical attack episodes under:
    1. Static Security Baseline (Rule-based)
    2. Single-Agent RL (DQN)
    3. Multi-Agent Cross-Layer RL (Coordinated MARL)
    """
    logger.info(f"Running 3-Way Comparative Experiment ({eval_episodes} episodes, seed={seed})...")

    # Load agents
    single_agent = DQNAgent()
    marl_agent = MultiAgentDQN()

    # Strategy 1: Static Rule-Based Baseline
    static_res = _eval_strategy("Static Baseline", eval_episodes, seed, mode="static")
    # Strategy 2: Single-Agent RL
    single_res = _eval_strategy("Single-Agent RL", eval_episodes, seed, mode="single_rl", agent=single_agent)
    # Strategy 3: Multi-Agent Cross-Layer RL
    marl_res = _eval_strategy("Multi-Agent RL", eval_episodes, seed, mode="marl", marl_agent=marl_agent)

    results = {
        "experiment_seed": seed,
        "eval_episodes": eval_episodes,
        "strategies": {
            "static_baseline": static_res,
            "single_agent_rl": single_res,
            "multi_agent_rl": marl_res,
        },
    }

    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Comparative experiment results saved to '{export_path}'")
    return results


def _eval_strategy(
    name: str,
    episodes: int,
    seed: int,
    mode: str,
    agent: Optional[DQNAgent] = None,
    marl_agent: Optional[MultiAgentDQN] = None,
) -> Dict[str, Any]:
    """Helper evaluator for strategy benchmark."""
    env = MultiAgentSecurityEnv(max_steps_per_episode=50, seed=seed)

    joint_rewards = []
    mitigation_rates = []
    latencies = []
    cpu_usages = []
    response_times = []
    successful_attacks = 0
    total_attacks = 0

    for ep in range(1, episodes + 1):
        obs_dict, _ = env.reset(seed=seed + ep)
        ep_reward = 0.0
        ep_attacks = 0
        ep_mitigated = 0
        ep_resp = []

        for step in range(50):
            joint_actions = {}
            if mode == "static":
                # Static Rule-Based Baseline:
                # If attack present, pick static action 2 (strengthen_authentication / reallocate_mac_slots / rate_limit)
                has_atk = env._active_attack is not None
                act_val = 2 if has_atk else 0
                joint_actions = {agent_name: act_val for agent_name in AGENT_NAMES}

            elif mode == "single_rl":
                # Single-Agent RL:
                # Single policy maps global state to joint action index
                s_single = np.mean(list(obs_dict.values()), axis=0)[:9]
                if len(s_single) < 9:
                    s_single = np.pad(s_single, (0, 9 - len(s_single)))
                act_idx = agent.select_action(s_single[:9], evaluate=True)
                mapped_act = min(3, act_idx % 4)
                joint_actions = {agent_name: mapped_act for agent_name in AGENT_NAMES}

            elif mode == "marl":
                # Multi-Agent Coordinated MARL:
                joint_actions = marl_agent.select_actions(obs_dict, evaluate=True)

            next_obs_dict, rewards_dict, term_dict, trunc_dict, step_info = env.step(joint_actions)
            obs_dict = next_obs_dict
            ep_reward += step_info.get("joint_reward", 0.0)

            latencies.append(step_info.get("latency_ms", 10.0))
            cpu_usages.append(step_info.get("cpu_usage_pct", 20.0))

            if step_info.get("has_attack", False):
                ep_attacks += 1
                total_attacks += 1
                if step_info.get("effective_mitigation", 0.0) > 0.4:
                    ep_mitigated += 1
                    ep_resp.append(1)  # 1 step response time
                else:
                    successful_attacks += 1
                    ep_resp.append(4)  # Delayed response

            if all(term_dict.values()) or all(trunc_dict.values()):
                break

        joint_rewards.append(ep_reward)
        mitigation_rates.append((ep_mitigated / max(1, ep_attacks)) * 100.0)
        response_times.append(float(np.mean(ep_resp)) if ep_resp else 1.0)

    detection_rate = round(float(np.mean(mitigation_rates)), 2)
    avg_resp = round(float(np.mean(response_times)), 2)
    avg_lat = round(float(np.mean(latencies)), 2)
    avg_cpu = round(float(np.mean(cpu_usages)), 2)
    avg_rew = round(float(np.mean(joint_rewards)), 2)

    return {
        "strategy_name": name,
        "detection_rate_pct": detection_rate,
        "response_time_steps": avg_resp,
        "latency_ms": avg_lat,
        "resource_consumption_cpu_pct": avg_cpu,
        "attack_mitigation_rate_pct": detection_rate,
        "cumulative_reward": avg_rew,
        "successful_attacks_count": successful_attacks,
        "total_attacks_simulated": total_attacks,
    }


if __name__ == "__main__":
    train_marl_agents()
    run_comparative_experiment()
