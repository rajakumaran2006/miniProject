import random
import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
import gymnasium as gym
from gymnasium import spaces

from app.models.slice import SliceType, SliceStatus, SecurityLevel, AttackType, AttackSeverity, AttackEvent, NetworkSlice
from app.simulation.config import SimulationConfig
from app.simulation.traffic import TrafficGenerator
from app.simulation.attacks import AttackSimulator

logger = logging.getLogger("5g_6g_security.rl.env")

# Discrete Action Map
ACTIONS = {
    0: {"name": "no_action", "latency_penalty_ms": 0.0, "cpu_penalty_pct": 0.0, "mitigation": 0.0},
    1: {"name": "increase_monitoring", "latency_penalty_ms": 1.0, "cpu_penalty_pct": 5.0, "mitigation": 0.20},
    2: {"name": "strengthen_authentication", "latency_penalty_ms": 3.0, "cpu_penalty_pct": 10.0, "mitigation": 0.45},
    3: {"name": "enable_stronger_encryption", "latency_penalty_ms": 8.0, "cpu_penalty_pct": 18.0, "mitigation": 0.70},
    4: {"name": "block_suspicious_device", "latency_penalty_ms": 2.0, "cpu_penalty_pct": 8.0, "mitigation": 0.85},
    5: {"name": "isolate_slice", "latency_penalty_ms": 25.0, "cpu_penalty_pct": 25.0, "mitigation": 0.98},
}


class SecurityEnvironment(gym.Env):
    """
    Gymnasium Reinforcement Learning Environment for 5G/6G Adaptive Security Orchestration.
    Models state observations, discrete security action space, and trade-off rewards.
    """

    metadata = {"render_modes": ["human"]}

    def __init__(self, max_steps_per_episode: int = 50, seed: Optional[int] = 42):
        super().__init__()
        self.max_steps_per_episode = max_steps_per_episode
        self.current_step_count = 0

        self.config = SimulationConfig()
        self.traffic_gen = TrafficGenerator()
        self.attack_sim = AttackSimulator()

        # Observation space: 9 normalized float features in range [0.0, 1.0]
        # [packet_rate, latency, packet_loss, bandwidth_usage, resource_usage, anomaly_score, attack_prob, security_level, slice_status]
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(9,), dtype=np.float32
        )

        # Action space: 6 discrete security orchestration actions
        self.action_space = spaces.Discrete(6)

        self._current_slice_type = SliceType.URLLC
        self._current_slice: Optional[NetworkSlice] = None
        self._active_attack: Optional[AttackEvent] = None
        self._seed_env(seed)

    def _seed_env(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)

    def _normalize_state(
        self,
        slice_obj: NetworkSlice,
        attack_prob: float,
    ) -> np.ndarray:
        """Convert NetworkSlice state into a normalized 9-element NumPy vector."""
        # 1. Packet rate: [0, 100,000] -> [0, 1]
        norm_pr = float(np.clip(slice_obj.packet_rate / 100000.0, 0.0, 1.0))
        # 2. Latency: [0, 200] -> [0, 1]
        norm_lat = float(np.clip(slice_obj.latency / 200.0, 0.0, 1.0))
        # 3. Packet loss: [0, 0.5] -> [0, 1]
        norm_loss = float(np.clip(slice_obj.packet_loss / 0.5, 0.0, 1.0))
        # 4. Bandwidth usage: [0, 2000] -> [0, 1]
        norm_bw = float(np.clip(slice_obj.bandwidth / 2000.0, 0.0, 1.0))
        # 5. Resource / CPU usage: [0, 100] -> [0, 1]
        norm_cpu = float(np.clip(slice_obj.cpu_usage / 100.0, 0.0, 1.0))
        # 6. Anomaly score: [0, 1]
        norm_anom = float(np.clip(slice_obj.anomaly_score, 0.0, 1.0))
        # 7. Attack probability: [0, 1]
        norm_atk_p = float(np.clip(attack_prob, 0.0, 1.0))
        # 8. Security level: HIGH=1.0, MEDIUM=0.7, LOW=0.4, CRITICAL=0.1
        sec_map = {SecurityLevel.HIGH: 1.0, SecurityLevel.MEDIUM: 0.7, SecurityLevel.LOW: 0.4, SecurityLevel.CRITICAL: 0.1}
        norm_sec = sec_map.get(slice_obj.security_level, 0.7)
        # 9. Slice status: HEALTHY=1.0, DEGRADED=0.7, UNDER_ATTACK=0.3, CRITICAL=0.0
        stat_map = {SliceStatus.HEALTHY: 1.0, SliceStatus.DEGRADED: 0.7, SliceStatus.UNDER_ATTACK: 0.3, SliceStatus.CRITICAL: 0.0}
        norm_stat = stat_map.get(slice_obj.current_status, 0.7)

        return np.array(
            [norm_pr, norm_lat, norm_loss, norm_bw, norm_cpu, norm_anom, norm_atk_p, norm_sec, norm_stat],
            dtype=np.float32,
        )

    def reset(
        self, seed: Optional[int] = None, options: Optional[Dict[str, Any]] = None
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Reset environment state for a new episode."""
        super().reset(seed=seed)
        self._seed_env(seed)
        self.current_step_count = 0

        self._current_slice_type = random.choice([SliceType.EMBB, SliceType.URLLC, SliceType.MMTC])
        t_data = self.traffic_gen.generate_normal_traffic(self._current_slice_type, self.config)

        self._current_slice = NetworkSlice(
            slice_id=f"slice-env-{self._current_slice_type.value.lower()}",
            name=f"{self._current_slice_type.value} Env Slice",
            slice_type=self._current_slice_type,
            bandwidth=t_data["bandwidth"],
            latency=t_data["latency"],
            packet_rate=t_data["packet_rate"],
            packet_loss=t_data["packet_loss"],
            connected_devices=t_data["connected_devices"],
            cpu_usage=t_data["cpu_usage"],
            anomaly_score=t_data["anomaly_score"],
            allocated_bandwidth_mbps=1000.0,
            max_latency_ms=20.0,
            target_reliability=0.999,
        )
        self._active_attack = None

        obs = self._normalize_state(self._current_slice, attack_prob=0.05)
        info = {
            "slice_type": self._current_slice_type.value,
            "step": self.current_step_count,
            "has_active_attack": False,
        }
        return obs, info

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        """
        Execute security action step in the environment.
        Calculates reward balancing security mitigation vs. latency & resource consumption penalties.
        """
        self.current_step_count += 1
        act_info = ACTIONS.get(action, ACTIONS[0])

        # Randomly trigger attack with 30% probability if no attack active
        if self._active_attack is None and random.random() < 0.35:
            atk_type = random.choice([AttackType.DOS, AttackType.SPOOFING, AttackType.ISOLATION_BREACH])
            sev = random.choice([AttackSeverity.HIGH, AttackSeverity.CRITICAL])
            self._active_attack = AttackEvent(
                event_id="env-atk",
                slice_id=self._current_slice.slice_id,
                attack_type=atk_type,
                severity=sev,
            )

        # Apply baseline traffic
        t_data = self.traffic_gen.generate_normal_traffic(self._current_slice_type, self.config)
        self._current_slice.bandwidth = t_data["bandwidth"]
        self._current_slice.latency = t_data["latency"]
        self._current_slice.packet_rate = t_data["packet_rate"]
        self._current_slice.packet_loss = t_data["packet_loss"]
        self._current_slice.connected_devices = t_data["connected_devices"]
        self._current_slice.cpu_usage = t_data["cpu_usage"]
        self._current_slice.anomaly_score = t_data["anomaly_score"]

        # Apply attack effects if active
        has_attack = self._active_attack is not None
        attack_intensity = 0.0
        if has_attack:
            attack_intensity = 1.0 if self._active_attack.severity == AttackSeverity.CRITICAL else 0.7
            self.attack_sim.apply_attack_effects(self._current_slice, self._active_attack)

        # Apply Security Action Effects & Penalties
        mitigation = act_info["mitigation"]
        lat_penalty = act_info["latency_penalty_ms"]
        cpu_penalty = act_info["cpu_penalty_pct"]

        # Action mitigates attack intensity & anomaly score
        if has_attack:
            effective_attack_damage = max(0.0, attack_intensity - mitigation)
            self._current_slice.anomaly_score = float(np.clip(self._current_slice.anomaly_score * (1.0 - mitigation), 0.05, 1.0))
        else:
            effective_attack_damage = 0.0

        # Action adds latency & resource penalties
        self._current_slice.latency = round(self._current_slice.latency + lat_penalty, 2)
        self._current_slice.cpu_usage = min(99.9, round(self._current_slice.cpu_usage + cpu_penalty, 2))

        # Reward Function Formula:
        # +25.0 * mitigation (if attack active)
        # -0.5 * latency_penalty
        # -0.3 * cpu_penalty
        # -50.0 * effective_attack_damage (high penalty for unmitigated attacks)
        # -5.0 * over_security_penalty (if strong action like isolation taken when no attack active!)
        reward = 0.0
        if has_attack:
            reward += 25.0 * mitigation
            reward -= 50.0 * effective_attack_damage
        else:
            # Over-security penalty if heavy actions used during normal traffic
            if action in [3, 4, 5]:
                reward -= (10.0 if action == 5 else 4.0)

        reward -= (0.5 * lat_penalty)
        reward -= (0.3 * cpu_penalty)

        # Determine termination
        terminated = False
        truncated = self.current_step_count >= self.max_steps_per_episode

        # Clear attack probabilistically after step
        if has_attack and random.random() < (0.3 + mitigation * 0.5):
            self._active_attack = None

        obs = self._normalize_state(self._current_slice, attack_prob=0.7 if has_attack else 0.05)
        info = {
            "step": self.current_step_count,
            "action_name": act_info["name"],
            "has_attack": has_attack,
            "attack_damage": effective_attack_damage,
            "latency_ms": self._current_slice.latency,
            "cpu_usage_pct": self._current_slice.cpu_usage,
            "anomaly_score": self._current_slice.anomaly_score,
            "reward": round(reward, 3),
        }

        return obs, round(reward, 3), terminated, truncated, info
