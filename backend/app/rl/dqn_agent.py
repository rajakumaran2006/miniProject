import os
import random
import logging
from collections import deque
from typing import List, Tuple, Dict, Any, Optional

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

logger = logging.getLogger("5g_6g_security.rl.dqn")

DEFAULT_CHECKPOINT_PATH = "experiments/dqn_security_model.pth"


class QNetwork(nn.Module):
    """Deep Q-Network mapping 9-element state vector to 6 discrete action Q-values."""

    def __init__(self, state_dim: int = 9, action_dim: int = 6, hidden_dim: int = 128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class ReplayBuffer:
    """Experience Replay Buffer storing transition tuples."""

    def __init__(self, capacity: int = 10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state: np.ndarray, action: int, reward: float, next_state: np.ndarray, done: bool):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            np.array(states, dtype=np.float32),
            np.array(actions, dtype=np.int64),
            np.array(rewards, dtype=np.float32),
            np.array(next_states, dtype=np.float32),
            np.array(dones, dtype=np.float32),
        )

    def __len__(self) -> int:
        return len(self.buffer)


class DQNAgent:
    """Deep Q-Network Agent for 5G/6G Adaptive Security Orchestration."""

    def __init__(
        self,
        state_dim: int = 9,
        action_dim: int = 6,
        lr: float = 1e-3,
        gamma: float = 0.99,
        epsilon_start: float = 1.0,
        epsilon_min: float = 0.05,
        epsilon_decay: float = 0.995,
        buffer_capacity: int = 10000,
        batch_size: int = 64,
        target_update_freq: int = 10,
        checkpoint_path: str = DEFAULT_CHECKPOINT_PATH,
    ):
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

        self.policy_net = QNetwork(state_dim, action_dim).to(self.device)
        self.target_net = QNetwork(state_dim, action_dim).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()

        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)
        self.memory = ReplayBuffer(buffer_capacity)
        self.train_step_counter = 0

        self.load_checkpoint()

    def select_action(self, state: np.ndarray, evaluate: bool = False) -> int:
        """Select action using Epsilon-Greedy policy or greedy evaluation."""
        if not evaluate and random.random() < self.epsilon:
            return random.randint(0, self.action_dim - 1)

        state_t = torch.tensor(state, dtype=torch.float32, device=self.device).unsqueeze(0)
        with torch.no_grad():
            q_values = self.policy_net(state_t)
            action = int(torch.argmax(q_values, dim=1).item())
        return action

    def update(self) -> Optional[float]:
        """Perform Q-network optimization step on a sampled minibatch."""
        if len(self.memory) < self.batch_size:
            return None

        states, actions, rewards, next_states, dones = self.memory.sample(self.batch_size)

        states_t = torch.tensor(states, device=self.device)
        actions_t = torch.tensor(actions, device=self.device).unsqueeze(1)
        rewards_t = torch.tensor(rewards, device=self.device).unsqueeze(1)
        next_states_t = torch.tensor(next_states, device=self.device)
        dones_t = torch.tensor(dones, device=self.device).unsqueeze(1)

        # Current Q-values
        q_eval = self.policy_net(states_t).gather(1, actions_t)

        # Target Q-values using Target Network
        with torch.no_grad():
            q_next = self.target_net(next_states_t).max(1, keepdim=True)[0]
            q_target = rewards_t + (1.0 - dones_t) * self.gamma * q_next

        loss = nn.SmoothL1Loss()(q_eval, q_target)

        self.optimizer.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(self.policy_net.parameters(), max_norm=10.0)
        self.optimizer.step()

        self.train_step_counter += 1
        if self.train_step_counter % self.target_update_freq == 0:
            self.target_net.load_state_dict(self.policy_net.state_dict())

        # Decay epsilon
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

        return float(loss.item())

    def save_checkpoint(self, path: Optional[str] = None):
        """Save model checkpoint state to disk."""
        target_path = path or self.checkpoint_path
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        torch.save(
            {
                "policy_net_state_dict": self.policy_net.state_dict(),
                "target_net_state_dict": self.target_net.state_dict(),
                "optimizer_state_dict": self.optimizer.state_dict(),
                "epsilon": self.epsilon,
                "train_step_counter": self.train_step_counter,
            },
            target_path,
        )
        logger.info(f"Saved PyTorch DQN checkpoint to '{target_path}'")

    def load_checkpoint(self, path: Optional[str] = None) -> bool:
        """Load model checkpoint state from disk if exists."""
        target_path = path or self.checkpoint_path
        if os.path.exists(target_path):
            try:
                ckpt = torch.load(target_path, map_location=self.device)
                self.policy_net.load_state_dict(ckpt["policy_net_state_dict"])
                self.target_net.load_state_dict(ckpt["target_net_state_dict"])
                self.optimizer.load_state_dict(ckpt["optimizer_state_dict"])
                self.epsilon = ckpt.get("epsilon", self.epsilon_min)
                self.train_step_counter = ckpt.get("train_step_counter", 0)
                logger.info(f"Loaded PyTorch DQN checkpoint from '{target_path}'")
                return True
            except Exception as e:
                logger.warning(f"Could not load checkpoint '{target_path}': {e}")
        return False
