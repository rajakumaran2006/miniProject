import random
import logging
from typing import Dict, Any, Tuple, Optional, List
import numpy as np
import gymnasium as gym
from gymnasium import spaces

from app.models.slice import SliceType, SliceStatus, SecurityLevel, AttackType, AttackSeverity, AttackEvent, NetworkSlice
from app.simulation.config import SimulationConfig
from app.simulation.traffic import TrafficGenerator
from app.simulation.attacks import AttackSimulator

logger = logging.getLogger("5g_6g_security.rl.marl_env")

# Agent Names matching cross-layer stack
AGENT_NAMES = ["physical", "mac", "network", "application"]

# Layer-specific Action Spaces (4 discrete actions per agent)
LAYER_ACTIONS = {
    "physical": {
        0: {"name": "no_action", "lat_pen": 0.0, "cpu_pen": 0.0, "mitigation": 0.0},
        1: {"name": "adjust_beamforming", "lat_pen": 1.0, "cpu_pen": 4.0, "mitigation": 0.35},
        2: {"name": "increase_tx_power", "lat_pen": 0.5, "cpu_pen": 8.0, "mitigation": 0.50},
        3: {"name": "phy_channel_hopping", "lat_pen": 3.0, "cpu_pen": 12.0, "mitigation": 0.85},
    },
    "mac": {
        0: {"name": "no_action", "lat_pen": 0.0, "cpu_pen": 0.0, "mitigation": 0.0},
        1: {"name": "reallocate_mac_slots", "lat_pen": 1.5, "cpu_pen": 5.0, "mitigation": 0.40},
        2: {"name": "enable_mac_filtering", "lat_pen": 2.0, "cpu_pen": 8.0, "mitigation": 0.65},
        3: {"name": "adjust_cqi_threshold", "lat_pen": 1.0, "cpu_pen": 4.0, "mitigation": 0.30},
    },
    "network": {
        0: {"name": "no_action", "lat_pen": 0.0, "cpu_pen": 0.0, "mitigation": 0.0},
        1: {"name": "reroute_sdn_flows", "lat_pen": 4.0, "cpu_pen": 10.0, "mitigation": 0.60},
        2: {"name": "throttle_slice_bandwidth", "lat_pen": 6.0, "cpu_pen": 6.0, "mitigation": 0.75},
        3: {"name": "network_rate_limit", "lat_pen": 3.0, "cpu_pen": 8.0, "mitigation": 0.70},
    },
    "application": {
        0: {"name": "no_action", "lat_pen": 0.0, "cpu_pen": 0.0, "mitigation": 0.0},
        1: {"name": "enforce_mfa", "lat_pen": 5.0, "cpu_pen": 8.0, "mitigation": 0.55},
        2: {"name": "block_api_client", "lat_pen": 2.0, "cpu_pen": 6.0, "mitigation": 0.85},
        3: {"name": "rotate_auth_tokens", "lat_pen": 4.0, "cpu_pen": 12.0, "mitigation": 0.70},
    },
}


class CrossLayerCoordinationHub:
    """Manages shared coordination signals and cross-layer action propagation."""

    def __init__(self):
        self.joint_actions: Dict[str, int] = {agent: 0 for agent in AGENT_NAMES}
        self.coordination_signal: np.ndarray = np.zeros(4, dtype=np.float32)

    def reset(self):
        self.joint_actions = {agent: 0 for agent in AGENT_NAMES}
        self.coordination_signal = np.zeros(4, dtype=np.float32)

    def update_coordination(self, joint_actions: Dict[str, int]) -> np.ndarray:
        self.joint_actions = joint_actions
        # Normalized 4-element joint action vector
        self.coordination_signal = np.array(
            [joint_actions.get(name, 0) / 3.0 for name in AGENT_NAMES], dtype=np.float32
        )
        return self.coordination_signal


class MultiAgentSecurityEnv:
    """
    Multi-Agent Reinforcement Learning Environment for 5G/6G Cross-Layer Security Orchestration.
    Integrates 4 layer agents (Physical, MAC, Network, Application) with shared cross-layer coordination.
    """

    def __init__(self, max_steps_per_episode: int = 50, seed: Optional[int] = 42):
        self.max_steps_per_episode = max_steps_per_episode
        self.current_step_count = 0

        self.config = SimulationConfig()
        self.traffic_gen = TrafficGenerator()
        self.attack_sim = AttackSimulator()
        self.coordination_hub = CrossLayerCoordinationHub()

        # Each agent observes 4 layer-specific features + 4 shared coordination signals = 8 features
        self.state_dim = 8
        self.action_dim = 4

        self.agents = AGENT_NAMES
        self.observation_spaces = {agent: spaces.Box(0.0, 1.0, shape=(8,), dtype=np.float32) for agent in AGENT_NAMES}
        self.action_spaces = {agent: spaces.Discrete(4) for agent in AGENT_NAMES}

        self._current_slice_type = SliceType.URLLC
        self._current_slice: Optional[NetworkSlice] = None
        self._active_attack: Optional[AttackEvent] = None
        self._seed_env(seed)

    def _seed_env(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)

    def _extract_layer_states(self, slice_obj: NetworkSlice, attack_prob: float) -> Dict[str, np.ndarray]:
        """Extract 4-element layer-specific states."""
        coord = self.coordination_hub.coordination_signal

        # 1. Physical Layer State: [snr_db/40, jamming_ind, beam_eff, phy_noise]
        snr = float(slice_obj.metrics.physical_ran.get("snr_db", 25.0)) / 40.0
        jam = float(slice_obj.metrics.physical_ran.get("jamming_indicator", 0.0))
        beam = float(slice_obj.metrics.physical_ran.get("beamforming_efficiency", 0.95))
        phy_noise = float(np.clip(attack_prob if self._active_attack and self._active_attack.attack_type == AttackType.DOS else 0.05, 0, 1))
        s_phy = np.array([snr, jam, beam, phy_noise], dtype=np.float32)

        # 2. MAC Layer State: [packet_rate/100k, frame_err, slot_util, cqi/15]
        pr = float(np.clip(slice_obj.packet_rate / 100000.0, 0, 1))
        fer = float(np.clip(slice_obj.packet_loss * 2.0, 0, 1))
        slot_util = float(np.clip(slice_obj.cpu_usage / 100.0, 0, 1))
        cqi = 0.85
        s_mac = np.array([pr, fer, slot_util, cqi], dtype=np.float32)

        # 3. Network Layer State: [bandwidth/2000, packet_loss/0.5, sdn_churn/100, cross_flows/100]
        bw = float(np.clip(slice_obj.bandwidth / 2000.0, 0, 1))
        loss = float(np.clip(slice_obj.packet_loss / 0.5, 0, 1))
        churn = float(np.clip(slice_obj.metrics.transport_network.get("sdn_flow_entry_churn", 15.0) / 100.0, 0, 1))
        cross = float(np.clip(slice_obj.metrics.transport_network.get("unauthorized_cross_slice_flows", 0.0) / 100.0, 0, 1))
        s_net = np.array([bw, loss, churn, cross], dtype=np.float32)

        # 4. Application Layer State: [active_sessions/50k, auth_failures/200, spoofed_devs/1000, unauth_api/50]
        sess = float(np.clip(slice_obj.connected_devices / 50000.0, 0, 1))
        auth_f = float(np.clip(slice_obj.metrics.core_3gpp.get("auth_failures", 0.0) / 200.0, 0, 1))
        spoof = float(np.clip(slice_obj.metrics.core_3gpp.get("spoofed_device_count", 0.0) / 1000.0, 0, 1))
        api = float(np.clip(slice_obj.metrics.application.get("unauthorized_api_attempts", 0.0) / 50.0, 0, 1))
        s_app = np.array([sess, auth_f, spoof, api], dtype=np.float32)

        # Concatenate layer state + 4-element coordination vector
        return {
            "physical": np.concatenate([s_phy, coord]),
            "mac": np.concatenate([s_mac, coord]),
            "network": np.concatenate([s_net, coord]),
            "application": np.concatenate([s_app, coord]),
        }

    def reset(self, seed: Optional[int] = None) -> Tuple[Dict[str, np.ndarray], Dict[str, Any]]:
        """Reset environment for a new episode."""
        self._seed_env(seed)
        self.current_step_count = 0
        self.coordination_hub.reset()

        self._current_slice_type = random.choice([SliceType.EMBB, SliceType.URLLC, SliceType.MMTC])
        t_data = self.traffic_gen.generate_normal_traffic(self._current_slice_type, self.config)

        self._current_slice = NetworkSlice(
            slice_id=f"slice-marl-{self._current_slice_type.value.lower()}",
            name=f"{self._current_slice_type.value} MARL Slice",
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

        obs_dict = self._extract_layer_states(self._current_slice, attack_prob=0.05)
        info = {"slice_type": self._current_slice_type.value, "step": self.current_step_count}
        return obs_dict, info

    def step(
        self, joint_actions: Dict[str, int]
    ) -> Tuple[Dict[str, np.ndarray], Dict[str, float], Dict[str, bool], Dict[str, bool], Dict[str, Any]]:
        """
        Execute joint actions across 4 cross-layer security agents.
        Updates coordination hub and applies cross-layer interaction dynamics.
        """
        self.current_step_count += 1
        coord_signal = self.coordination_hub.update_coordination(joint_actions)

        # Trigger random threat with 35% probability if no attack active
        if self._active_attack is None and random.random() < 0.35:
            atk_type = random.choice([AttackType.DOS, AttackType.SPOOFING, AttackType.ISOLATION_BREACH])
            sev = random.choice([AttackSeverity.HIGH, AttackSeverity.CRITICAL])
            self._active_attack = AttackEvent(
                event_id="marl-atk",
                slice_id=self._current_slice.slice_id,
                attack_type=atk_type,
                severity=sev,
            )

        # Generate baseline traffic
        t_data = self.traffic_gen.generate_normal_traffic(self._current_slice_type, self.config)
        self._current_slice.bandwidth = t_data["bandwidth"]
        self._current_slice.latency = t_data["latency"]
        self._current_slice.packet_rate = t_data["packet_rate"]
        self._current_slice.packet_loss = t_data["packet_loss"]
        self._current_slice.connected_devices = t_data["connected_devices"]
        self._current_slice.cpu_usage = t_data["cpu_usage"]
        self._current_slice.anomaly_score = t_data["anomaly_score"]

        has_attack = self._active_attack is not None
        if has_attack:
            self.attack_sim.apply_attack_effects(self._current_slice, self._active_attack)

        # Compute per-layer action impacts & cross-layer interaction propagation
        tot_mitigation = 0.0
        tot_lat_penalty = 0.0
        tot_cpu_penalty = 0.0

        layer_mitigations = {}
        for agent_name, act_idx in joint_actions.items():
            act_info = LAYER_ACTIONS[agent_name].get(act_idx, LAYER_ACTIONS[agent_name][0])
            mit = act_info["mitigation"]
            lat_pen = act_info["lat_pen"]
            cpu_pen = act_info["cpu_pen"]

            # Cross-layer action interactions:
            # Physical channel hopping (3) reduces jamming but adds MAC slot sync latency (+2ms)
            if agent_name == "physical" and act_idx == 3:
                tot_lat_penalty += 2.0

            # Network bandwidth throttling (2) reduces unauthorized API attempts at App layer
            if agent_name == "network" and act_idx == 2:
                self._current_slice.metrics.application["unauthorized_api_attempts"] = max(
                    0.0, self._current_slice.metrics.application.get("unauthorized_api_attempts", 0.0) - 15.0
                )

            # Application API blocking (2) reduces Network SDN flow table churn
            if agent_name == "application" and act_idx == 2:
                self._current_slice.metrics.transport_network["sdn_flow_entry_churn"] = max(
                    5.0, self._current_slice.metrics.transport_network.get("sdn_flow_entry_churn", 15.0) * 0.6
                )

            layer_mitigations[agent_name] = mit
            tot_mitigation += mit
            tot_lat_penalty += lat_pen
            tot_cpu_penalty += cpu_pen

        # Normalize total mitigation across 4 agents
        effective_mitigation = min(0.98, tot_mitigation / 2.5)

        attack_damage = 0.0
        if has_attack:
            attack_damage = max(0.0, 1.0 - effective_mitigation)
            self._current_slice.anomaly_score = float(
                np.clip(self._current_slice.anomaly_score * (1.0 - effective_mitigation), 0.05, 1.0)
            )

        self._current_slice.latency = round(self._current_slice.latency + tot_lat_penalty, 2)
        self._current_slice.cpu_usage = min(99.9, round(self._current_slice.cpu_usage + tot_cpu_penalty, 2))

        # Calculate Agent Rewards & Joint Cross-Layer Reward
        # Joint Reward = +25.0 * Mitigation - 0.5 * Latency - 0.3 * CPU - 50.0 * Attack Damage
        rewards_dict = {}
        joint_reward = 0.0
        if has_attack:
            joint_reward += 30.0 * effective_mitigation - 45.0 * attack_damage
        else:
            # Over-security penalty if heavy actions used in normal operations
            heavy_actions = sum(1 for a, idx in joint_actions.items() if idx in [2, 3])
            joint_reward -= (3.0 * heavy_actions)

        joint_reward -= (0.4 * tot_lat_penalty + 0.25 * tot_cpu_penalty)

        for agent in AGENT_NAMES:
            rewards_dict[agent] = round(joint_reward + (layer_mitigations[agent] * 5.0), 3)

        terminated = {agent: False for agent in AGENT_NAMES}
        truncated = {agent: self.current_step_count >= self.max_steps_per_episode for agent in AGENT_NAMES}

        # Clear attack probabilistically if mitigated
        if has_attack and random.random() < (0.35 + effective_mitigation * 0.5):
            self._active_attack = None

        obs_dict = self._extract_layer_states(self._current_slice, attack_prob=0.8 if has_attack else 0.05)
        info = {
            "step": self.current_step_count,
            "has_attack": has_attack,
            "attack_type": self._active_attack.attack_type.value if self._active_attack else None,
            "effective_mitigation": round(effective_mitigation, 3),
            "attack_damage": round(attack_damage, 3),
            "latency_ms": self._current_slice.latency,
            "cpu_usage_pct": self._current_slice.cpu_usage,
            "joint_reward": round(joint_reward, 3),
            "actions_taken": {agent: LAYER_ACTIONS[agent][idx]["name"] for agent, idx in joint_actions.items()},
        }

        return obs_dict, rewards_dict, terminated, truncated, info


# Global MultiAgentSecurityEnv Singleton Instance
marl_env = MultiAgentSecurityEnv()
