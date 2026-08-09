import os
import json
import logging
from typing import Dict, List, Any
import numpy as np

from app.rl.environment import SecurityEnvironment, ACTIONS
from app.rl.dqn_agent import DQNAgent, DEFAULT_CHECKPOINT_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("5g_6g_security.rl.train")

METRICS_SAVE_PATH = "experiments/dqn_training_metrics.json"


def run_training_pipeline(
    num_episodes: int = 150,
    steps_per_episode: int = 50,
    checkpoint_path: str = DEFAULT_CHECKPOINT_PATH,
    metrics_path: str = METRICS_SAVE_PATH,
) -> Dict[str, Any]:
    """
    Run PyTorch Deep Q-Network training loop on Gymnasium SecurityEnvironment.
    Saves model checkpoint to `checkpoint_path` and metrics output to `metrics_path`.
    """
    logger.info(f"Starting DQN Training Pipeline over {num_episodes} episodes...")

    env = SecurityEnvironment(max_steps_per_episode=steps_per_episode, seed=42)
    agent = DQNAgent(checkpoint_path=checkpoint_path)

    episode_rewards: List[float] = []
    mitigation_rates: List[float] = []
    avg_latencies: List[float] = []
    avg_cpu_usages: List[float] = []
    successful_attack_counts: List[int] = []

    for ep in range(1, num_episodes + 1):
        state, info = env.reset()
        ep_reward = 0.0
        attacks_encountered = 0
        attacks_mitigated = 0
        successful_attacks = 0
        latencies = []
        cpus = []

        for step in range(steps_per_episode):
            action = agent.select_action(state, evaluate=False)
            next_state, reward, terminated, truncated, step_info = env.step(action)

            agent.memory.push(state, action, reward, next_state, terminated or truncated)
            agent.update()

            state = next_state
            ep_reward += reward

            if step_info.get("has_attack", False):
                attacks_encountered += 1
                if step_info.get("attack_damage", 0.0) < 0.25:
                    attacks_mitigated += 1
                else:
                    successful_attacks += 1

            latencies.append(step_info.get("latency_ms", 10.0))
            cpus.append(step_info.get("cpu_usage_pct", 20.0))

            if terminated or truncated:
                break

        ep_mitigation = round((attacks_mitigated / max(1, attacks_encountered)) * 100.0, 2)
        ep_lat = round(float(np.mean(latencies)), 2)
        ep_cpu = round(float(np.mean(cpus)), 2)

        episode_rewards.append(round(ep_reward, 2))
        mitigation_rates.append(ep_mitigation)
        avg_latencies.append(ep_lat)
        avg_cpu_usages.append(ep_cpu)
        successful_attack_counts.append(successful_attacks)

        if ep % 25 == 0 or ep == num_episodes:
            logger.info(
                f"Episode {ep}/{num_episodes} | Reward: {ep_reward:.2f} | Epsilon: {agent.epsilon:.3f} | "
                f"Mitigation: {ep_mitigation}% | Avg Latency: {ep_lat}ms | Avg CPU: {ep_cpu}%"
            )

    # Save model checkpoint
    agent.save_checkpoint(checkpoint_path)

    # Export training metrics log
    overall_metrics = {
        "num_episodes": num_episodes,
        "steps_per_episode": steps_per_episode,
        "final_epsilon": round(agent.epsilon, 4),
        "mean_cumulative_reward": round(float(np.mean(episode_rewards[-30:])), 2),
        "mean_attack_mitigation_rate_pct": round(float(np.mean(mitigation_rates[-30:])), 2),
        "mean_average_latency_ms": round(float(np.mean(avg_latencies[-30:])), 2),
        "mean_resource_usage_pct": round(float(np.mean(avg_cpu_usages[-30:])), 2),
        "total_successful_attacks": int(sum(successful_attack_counts[-30:])),
        "episode_rewards": episode_rewards,
        "mitigation_rates": mitigation_rates,
        "avg_latencies": avg_latencies,
        "avg_cpu_usages": avg_cpu_usages,
    }

    os.makedirs(os.path.dirname(metrics_path), exist_ok=True)
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(overall_metrics, f, indent=2)

    logger.info(f"DQN Training complete! Metrics log saved to '{metrics_path}'.")
    return overall_metrics


if __name__ == "__main__":
    run_training_pipeline()
