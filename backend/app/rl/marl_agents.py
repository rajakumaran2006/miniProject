import os
import random
import logging
from typing import Dict, List, Tuple, Optional, Any
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from app.rl.marl_env import AGENT_NAMES
from app.rl.dqn_agent import QNetwork, ReplayBuffer

logger = logging.getLogger("5g_6g_security.rl.marl_agents")

DEFAULT_MARL_CHECKPOINT_PATH = "experiments/marl_security_models.pth"


class SingleAgentBrain:
    """Individual PyTorch Q-Network brain for a specific cross-layer agent."""

    def __init__(self, agent_name: str, state_dim: int = 8, action_dim: int = 4, lr: float = 1e-3, device: torch.device = None):
        self.agent_name = agent_name
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.policy_net = QNetwork(state_dim, action_dim).to(self.device)
        self.target_net = QNetwork(state_dim, action_dim).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()

        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)
        self.memory = ReplayBuffer(capacity=10000)

    def select_action(self, state: np.ndarray, epsilon: float, evaluate: bool = False) -> int:
        if not evaluate and random.random() < epsilon:
            return random.randint(0, self.action_dim - 1)

        state_t = torch.tensor(state, dtype=torch.float32, device=self.device).unsqueeze(0)
        with torch.no_grad():
            q_vals = self.policy_net(state_t)
            return int(torch.argmax(q_vals, dim=1).item())

    def update(self, batch_size: int, gamma: float = 0.99) -> Optional[float]:
        if len(self.memory) < batch_size:
            return None

        states, actions, rewards, next_states, dones = self.memory.sample(batch_size)

        states_t = torch.tensor(states, device=self.device)
        actions_t = torch.tensor(actions, device=self.device).unsqueeze(1)
        rewards_t = torch.tensor(rewards, device=self.device).unsqueeze(1)
        next_states_t = torch.tensor(next_states, device=self.device)
        dones_t = torch.tensor(dones, device=self.device).unsqueeze(1)

        q_eval = self.policy_net(states_t).gather(1, actions_t)
        with torch.no_grad():
            q_next = self.target_net(next_states_t).max(1, keepdim=True)[0]
            q_target = rewards_t + (1.0 - dones_t) * gamma * q_next

        loss = nn.SmoothL1Loss()(q_eval, q_target)
        self.optimizer.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(self.policy_net.parameters(), max_norm=10.0)
        self.optimizer.step()

        return float(loss.item())

    def update_target_network(self):
        self.target_net.load_state_dict(self.policy_net.state_dict())


class MultiAgentDQN:
    """Multi-Agent Deep Q-Network Manager for 4-layer 5G/6G security orchestration."""

    def __init__(
        self,
        agents: List[str] = AGENT_NAMES,
        state_dim: int = 8,
        action_dim: int = 4,
        lr: float = 1e-3,
        gamma: float = 0.99,
        epsilon_start: float = 1.0,
        epsilon_min: float = 0.05,
        epsilon_decay: float = 0.995,
        batch_size: int = 64,
        target_update_freq: int = 10,
        checkpoint_path: str = DEFAULT_MARL_CHECKPOINT_PATH,
    ):
        self.agent_names = agents
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size
        self.target_update_freq = target_update_freq
        self.checkpoint_path = checkpoint_path

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.brains: Dict[str, SingleAgentBrain] = {
            name: SingleAgentBrain(name, state_dim, action_dim, lr, self.device) for name in agents
        }
        self.train_step_counter = 0

        self.load_checkpoints()

    def select_actions(self, states_dict: Dict[str, np.ndarray], evaluate: bool = False) -> Dict[str, int]:
        """Select joint actions for all 4 layer agents."""
        joint_actions = {}
        for agent_name in self.agent_names:
            state = states_dict.get(agent_name, np.zeros(self.state_dim, dtype=np.float32))
            brain = self.brains[agent_name]
            joint_actions[agent_name] = brain.select_action(state, self.epsilon, evaluate=evaluate)
        return joint_actions

    def update(self) -> Dict[str, float]:
        """Update Q-networks for all 4 layer agents."""
        losses = {}
        for agent_name, brain in self.brains.items():
            loss = brain.update(self.batch_size, self.gamma)
            if loss is not None:
                losses[agent_name] = loss

        self.train_step_counter += 1
        if self.train_step_counter % self.target_update_freq == 0:
            for brain in self.brains.values():
                brain.update_target_network()

        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
        return losses

    def save_checkpoints(self, path: Optional[str] = None):
        """Save model checkpoints for all 4 agents."""
        target_path = path or self.checkpoint_path
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        checkpoint_dict = {
            "epsilon": self.epsilon,
            "train_step_counter": self.train_step_counter,
            "agents": {
                name: {
                    "policy_net": brain.policy_net.state_dict(),
                    "target_net": brain.target_net.state_dict(),
                    "optimizer": brain.optimizer.state_dict(),
                }
                for name, brain in self.brains.items()
            },
        }
        torch.save(checkpoint_dict, target_path)
        logger.info(f"Saved MARL checkpoints for all 4 agents to '{target_path}'")

    def load_checkpoints(self, path: Optional[str] = None) -> bool:
        """Load model checkpoints for all 4 agents if exists."""
        target_path = path or self.checkpoint_path
        if os.path.exists(target_path):
            try:
                ckpt = torch.load(target_path, map_location=self.device)
                self.epsilon = ckpt.get("epsilon", self.epsilon_min)
                self.train_step_counter = ckpt.get("train_step_counter", 0)

                agent_data = ckpt.get("agents", {})
                for name, brain in self.brains.items():
                    if name in agent_data:
                        brain.policy_net.load_state_dict(agent_data[name]["policy_net"])
                        brain.target_net.load_state_dict(agent_data[name]["target_net"])
                        brain.optimizer.load_state_dict(agent_data[name]["optimizer"])
                logger.info(f"Loaded MARL checkpoints for 4 agents from '{target_path}'")
                return True
            except Exception as e:
                logger.warning(f"Failed to load MARL checkpoint '{target_path}': {e}")
        return False


# Global MultiAgentDQN Singleton Instance
marl_agent = MultiAgentDQN()
