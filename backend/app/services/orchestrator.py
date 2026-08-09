import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from app.simulation.simulator import simulator
from app.ml.detector import anomaly_detector
from app.fl.aggregator import fl_aggregator
from app.rl.marl_agents import marl_agent
from app.rl.marl_env import marl_env, AGENT_NAMES, LAYER_ACTIONS
from app.controls.controller import security_controller
from app.models.slice import NetworkSlice, SliceStatus, AttackEvent

logger = logging.getLogger("5g_6g_security.services.orchestrator")


class IntegratedSecurityOrchestrator:
    """
    Master Closed-Loop Orchestrator for the Adaptive Cross-Layer Security Framework.
    Unifies: Simulator -> Traffic -> Anomaly Detector -> Federated FL -> MARL Agents -> SecurityController.
    """

    def __init__(self):
        self.auto_defense_enabled: bool = True
        self.step_history: List[Dict[str, Any]] = []

    def set_auto_defense(self, enabled: bool) -> bool:
        self.auto_defense_enabled = enabled
        logger.info(f"Closed-Loop RL Auto-Defense Mode set to: {self.auto_defense_enabled}")
        return self.auto_defense_enabled

    def step_integrated_pipeline(self, auto_defend: Optional[bool] = None) -> Dict[str, Any]:
        """
        Execute one complete closed-loop pipeline iteration through all 7 framework stages.
        """
        should_defend = self.auto_defense_enabled if auto_defend is None else auto_defend

        # Stage 1 & 2: Simulator & Traffic Generation Step
        simulator.run_multiple_simulation_steps(steps=1)
        sim_state = simulator.return_current_network_state()

        slice_evaluations = {}
        marl_decisions_logged = {}
        applied_controls_logged = {}

        # Stage 3 & 4: Anomaly Detection & Federated FL Evaluation
        for slice_id, slice_obj in simulator.state.slices.items():
            # 1. Isolation Forest prediction
            iso_res = anomaly_detector.predict(slice_obj)
            # 2. Global Federated Model prediction
            fl_res = fl_aggregator.predict_slice(slice_obj)

            slice_evaluations[slice_id] = {
                "isolation_forest_risk": iso_res.anomaly_score,
                "isolation_forest_status": iso_res.predicted_status,
                "federated_risk": fl_res["anomaly_score"],
                "federated_status": fl_res["predicted_status"],
                "has_active_attack": any(a.slice_id == slice_id for a in simulator.state.active_attacks),
            }

        # Stage 5, 6 & 7: MARL Policy Inference & SecurityController Enforcement
        if should_defend and simulator.state.slices:
            # Extract MARL layer states from active URLLC/eMBB slice
            target_slice = simulator.state.slices.get("slice-urllc-01") or list(simulator.state.slices.values())[0]
            has_atk = any(a.slice_id == target_slice.slice_id for a in simulator.state.active_attacks)

            obs_dict = marl_env._extract_layer_states(target_slice, attack_prob=0.8 if has_atk else 0.05)
            joint_actions = marl_agent.select_actions(obs_dict, evaluate=True)

            # Map joint actions to agent decisions
            marl_decisions_logged = {
                "physical": LAYER_ACTIONS["physical"][joint_actions["physical"]]["name"],
                "mac": LAYER_ACTIONS["mac"][joint_actions["mac"]]["name"],
                "network": LAYER_ACTIONS["network"][joint_actions["network"]]["name"],
                "application": LAYER_ACTIONS["application"][joint_actions["application"]]["name"],
            }

            active_threat_name = simulator.state.active_attacks[0].attack_type.value if has_atk else "Baseline_Anomaly"

            # SecurityController enforces security controls
            primary_action = marl_decisions_logged["application"] if "enforce" in marl_decisions_logged["application"] else marl_decisions_logged["network"]
            log_entry = security_controller.process_rl_decision(
                slice_obj=target_slice,
                rl_agent_name="MARL_CrossLayer_Orchestrator",
                action_name=primary_action,
                threat_vector=active_threat_name,
            )
            applied_controls_logged = log_entry

        # Compile Pipeline Frame
        frame = {
            "step_count": simulator.state.step_count,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "auto_defense_enabled": should_defend,
            "slices_telemetry": {
                sid: {
                    "slice_type": s.slice_type.value,
                    "bandwidth": s.bandwidth,
                    "latency": s.latency,
                    "packet_rate": s.packet_rate,
                    "packet_loss": s.packet_loss,
                    "cpu_usage": s.cpu_usage,
                    "security_level": s.security_level.value,
                    "current_status": s.current_status.value,
                    "anomaly_score": s.anomaly_score,
                }
                for sid, s in simulator.state.slices.items()
            },
            "active_attacks": [
                {
                    "event_id": a.event_id,
                    "slice_id": a.slice_id,
                    "attack_type": a.attack_type.value,
                    "severity": a.severity.value,
                }
                for a in simulator.state.active_attacks
            ],
            "slice_evaluations": slice_evaluations,
            "marl_decisions": marl_decisions_logged,
            "applied_controls": applied_controls_logged,
        }

        self.step_history.insert(0, frame)
        if len(self.step_history) > 100:
            self.step_history.pop()

        return frame


# Master Orchestrator Singleton
orchestrator = IntegratedSecurityOrchestrator()
