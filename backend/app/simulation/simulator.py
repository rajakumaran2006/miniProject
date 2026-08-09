import asyncio
import uuid
import random
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

from app.models.slice import NetworkSlice, SliceType, SliceStatus, SecurityLevel, LayerMetrics, AttackEvent
from app.simulation.config import SimulationConfig
from app.simulation.traffic import TrafficGenerator
from app.simulation.state import NetworkState, AnomalyEvent
from app.simulation.attacks import attack_simulator

logger = logging.getLogger("5g_6g_security.simulator")


class NetworkSimulator:
    """Core 5G/6G Network Slicing Simulation Engine with Cyber Attack Module."""

    def __init__(self, config: Optional[SimulationConfig] = None):
        self.config = config or SimulationConfig()
        self.traffic_generator = TrafficGenerator()
        self.state = NetworkState()
        self._async_task: Optional[asyncio.Task] = None
        self.reset_simulation()

    def _create_initial_slices(self) -> Dict[str, NetworkSlice]:
        """Initialize standard 5G/6G slices (eMBB, URLLC, mMTC)."""
        embb_norm = self.traffic_generator.generate_normal_traffic(SliceType.EMBB, self.config)
        urllc_norm = self.traffic_generator.generate_normal_traffic(SliceType.URLLC, self.config)
        mmtc_norm = self.traffic_generator.generate_normal_traffic(SliceType.MMTC, self.config)

        slices = {
            "slice-embb-01": NetworkSlice(
                slice_id="slice-embb-01",
                name="eMBB Ultra-HD Video Slicing",
                slice_type=SliceType.EMBB,
                bandwidth=embb_norm["bandwidth"],
                latency=embb_norm["latency"],
                packet_rate=embb_norm["packet_rate"],
                packet_loss=embb_norm["packet_loss"],
                connected_devices=embb_norm["connected_devices"],
                cpu_usage=embb_norm["cpu_usage"],
                security_level=SecurityLevel.HIGH,
                current_status=SliceStatus.HEALTHY,
                anomaly_score=embb_norm["anomaly_score"],
                allocated_bandwidth_mbps=1000.0,
                max_latency_ms=20.0,
                target_reliability=0.999,
                metrics=LayerMetrics(
                    physical_ran={"snr_db": 28.2, "jamming_indicator": 0.01, "beamforming_efficiency": 0.98},
                    transport_network={"bandwidth_gbps": 8.5, "packet_loss_rate": 0.0005, "sdn_flow_entry_churn": 15.0},
                    core_3gpp={"nrf_registration_rate": 100.0, "auth_success_ratio": 0.9995, "mano_api_latency_ms": 3.8},
                    application={"active_sessions": 3400.0, "unauthorized_api_attempts": 0.0, "qos_compliance_score": 0.99}
                )
            ),
            "slice-urllc-01": NetworkSlice(
                slice_id="slice-urllc-01",
                name="URLLC Autonomous Transport Slice",
                slice_type=SliceType.URLLC,
                bandwidth=urllc_norm["bandwidth"],
                latency=urllc_norm["latency"],
                packet_rate=urllc_norm["packet_rate"],
                packet_loss=urllc_norm["packet_loss"],
                connected_devices=urllc_norm["connected_devices"],
                cpu_usage=urllc_norm["cpu_usage"],
                security_level=SecurityLevel.HIGH,
                current_status=SliceStatus.HEALTHY,
                anomaly_score=urllc_norm["anomaly_score"],
                allocated_bandwidth_mbps=250.0,
                max_latency_ms=1.0,
                target_reliability=0.99999,
                metrics=LayerMetrics(
                    physical_ran={"snr_db": 32.0, "jamming_indicator": 0.0, "beamforming_efficiency": 0.99},
                    transport_network={"bandwidth_gbps": 2.2, "packet_loss_rate": 0.00001, "sdn_flow_entry_churn": 4.2},
                    core_3gpp={"nrf_registration_rate": 100.0, "auth_success_ratio": 1.0, "mano_api_latency_ms": 1.2},
                    application={"active_sessions": 850.0, "unauthorized_api_attempts": 0.0, "qos_compliance_score": 1.0}
                )
            ),
            "slice-mmtc-01": NetworkSlice(
                slice_id="slice-mmtc-01",
                name="mMTC Smart Infrastructure Mesh",
                slice_type=SliceType.MMTC,
                bandwidth=mmtc_norm["bandwidth"],
                latency=mmtc_norm["latency"],
                packet_rate=mmtc_norm["packet_rate"],
                packet_loss=mmtc_norm["packet_loss"],
                connected_devices=mmtc_norm["connected_devices"],
                cpu_usage=mmtc_norm["cpu_usage"],
                security_level=SecurityLevel.MEDIUM,
                current_status=SliceStatus.HEALTHY,
                anomaly_score=mmtc_norm["anomaly_score"],
                allocated_bandwidth_mbps=50.0,
                max_latency_ms=100.0,
                target_reliability=0.98,
                metrics=LayerMetrics(
                    physical_ran={"snr_db": 19.4, "jamming_indicator": 0.08, "beamforming_efficiency": 0.89},
                    transport_network={"bandwidth_gbps": 0.45, "packet_loss_rate": 0.004, "sdn_flow_entry_churn": 48.0},
                    core_3gpp={"nrf_registration_rate": 97.5, "auth_success_ratio": 0.985, "mano_api_latency_ms": 8.5},
                    application={"active_sessions": 45000.0, "unauthorized_api_attempts": 12.0, "qos_compliance_score": 0.94}
                )
            )
        }
        return slices

    def start_simulation(self) -> bool:
        """Start asynchronous background simulation execution task."""
        if self.state.is_running:
            logger.info("Simulation is already running.")
            return False

        self.state.is_running = True
        logger.info("Starting background simulation runner...")
        
        try:
            loop = asyncio.get_running_loop()
            self._async_task = loop.create_task(self._background_runner())
        except RuntimeError:
            logger.warning("No active asyncio event loop found for background runner.")
        
        return True

    def stop_simulation(self) -> bool:
        """Pause asynchronous background simulation runner."""
        if not self.state.is_running:
            logger.info("Simulation is already stopped.")
            return False

        self.state.is_running = False
        if self._async_task and not self._async_task.done():
            self._async_task.cancel()
            self._async_task = None

        logger.info("Stopped simulation runner.")
        return True

    def reset_simulation(self) -> NetworkState:
        """Reset simulation environment to default initial state."""
        self.stop_simulation()
        for atk in list(attack_simulator._active_attacks.keys()):
            attack_simulator.stop_attack(atk)

        self.state = NetworkState(
            step_count=0,
            is_running=False,
            slices=self._create_initial_slices(),
            active_anomalies=[],
            active_attacks=[]
        )
        self.state.update_totals()
        logger.info("Simulation environment reset to baseline.")
        return self.state

    def generate_traffic(
        self, slice_id: str, is_abnormal: bool = False, anomaly_type: str = "DDOS_SURGE"
    ) -> Dict[str, Any]:
        """Generate single step traffic for specified slice."""
        slice_obj = self.state.slices.get(slice_id)
        if not slice_obj:
            raise ValueError(f"Slice '{slice_id}' not found")

        if is_abnormal:
            return self.traffic_generator.generate_abnormal_traffic(
                slice_obj.slice_type, anomaly_type, self.config
            )
        return self.traffic_generator.generate_normal_traffic(
            slice_obj.slice_type, self.config
        )

    def inject_anomaly(self, slice_id: str, anomaly_type: str = "DDOS_SURGE", duration_steps: int = 5) -> AnomalyEvent:
        """Manually trigger an anomaly event on a target slice."""
        if slice_id not in self.state.slices:
            raise ValueError(f"Slice '{slice_id}' does not exist")

        event = AnomalyEvent(
            anomaly_id=str(uuid.uuid4())[:8],
            slice_id=slice_id,
            anomaly_type=anomaly_type,
            severity="HIGH" if anomaly_type in ["DDOS_SURGE", "RAN_JAMMING"] else "MEDIUM",
            step_injected=self.state.step_count,
            duration_steps=duration_steps,
            steps_remaining=duration_steps,
        )
        self.state.active_anomalies.append(event)
        logger.warning(f"Injected anomaly '{anomaly_type}' on slice '{slice_id}' for {duration_steps} steps.")
        return event

    def run_multiple_simulation_steps(self, steps: int = 1) -> NetworkState:
        """Advance simulation state by specified number of discrete steps."""
        for _ in range(max(1, steps)):
            self._step_once()
        return self.state

    def _step_once(self) -> None:
        """Execute a single simulation time-step."""
        self.state.step_count += 1

        active_anomalies_map = {a.slice_id: a.anomaly_type for a in self.state.active_anomalies}
        
        # 1. Update traffic for each slice
        for slice_id, slice_obj in self.state.slices.items():
            is_anomalous = slice_id in active_anomalies_map
            anom_type = active_anomalies_map.get(slice_id, "DDOS_SURGE")

            t_data = self.generate_traffic(slice_id, is_abnormal=is_anomalous, anomaly_type=anom_type)

            slice_obj.bandwidth = t_data["bandwidth"]
            slice_obj.latency = t_data["latency"]
            slice_obj.packet_rate = t_data["packet_rate"]
            slice_obj.packet_loss = t_data["packet_loss"]
            slice_obj.connected_devices = t_data["connected_devices"]
            slice_obj.cpu_usage = t_data["cpu_usage"]
            slice_obj.anomaly_score = t_data["anomaly_score"]
            slice_obj.last_updated = datetime.now(timezone.utc)

            if is_anomalous or t_data["anomaly_score"] > 0.4:
                slice_obj.current_status = SliceStatus.CRITICAL if t_data["anomaly_score"] > 0.8 else SliceStatus.DEGRADED
                slice_obj.security_level = SecurityLevel.LOW if t_data["anomaly_score"] <= 0.8 else SecurityLevel.CRITICAL
            else:
                slice_obj.current_status = SliceStatus.HEALTHY
                slice_obj.security_level = SecurityLevel.HIGH

            # Reset layer metric baselines
            slice_obj.metrics.transport_network["bandwidth_gbps"] = round(slice_obj.bandwidth / 1000.0, 3)
            slice_obj.metrics.transport_network["packet_loss_rate"] = slice_obj.packet_loss
            slice_obj.metrics.transport_network["unauthorized_cross_slice_flows"] = 0.0
            slice_obj.metrics.transport_network["inter_slice_resource_leak_mbps"] = 0.0
            slice_obj.metrics.core_3gpp["mano_api_latency_ms"] = slice_obj.latency
            slice_obj.metrics.core_3gpp["auth_success_ratio"] = 0.999
            slice_obj.metrics.core_3gpp["spoofed_device_count"] = 0.0
            slice_obj.metrics.core_3gpp["auth_failures"] = 0.0
            slice_obj.metrics.application["active_sessions"] = float(slice_obj.connected_devices)
            slice_obj.metrics.application["suspicious_connections"] = 0.0
            slice_obj.metrics.application["unauthorized_api_attempts"] = 0.0

        # 2. Process active AttackEvents from AttackSimulator
        active_attacks = attack_simulator.get_active_attacks()
        still_active = []
        for atk_evt in active_attacks:
            target_slice = self.state.slices.get(atk_evt.slice_id)
            if target_slice:
                attack_simulator.apply_attack_effects(target_slice, atk_evt)
            
            atk_evt.steps_remaining -= 1
            if atk_evt.steps_remaining <= 0:
                atk_evt.is_active = False
                attack_simulator._active_attacks.pop(atk_evt.event_id, None)
                logger.info(f"Attack event '{atk_evt.event_id}' finished.")
            else:
                still_active.append(atk_evt)

        self.state.active_attacks = still_active

        # 3. Process remaining legacy anomalies
        remaining_anomalies = []
        for anomaly in self.state.active_anomalies:
            anomaly.steps_remaining -= 1
            if anomaly.steps_remaining > 0:
                remaining_anomalies.append(anomaly)
        self.state.active_anomalies = remaining_anomalies

        self.state.update_totals()

    def update_network_state(self) -> NetworkState:
        """Explicitly recalculate and return current state."""
        self.state.update_totals()
        return self.state

    def return_current_network_state(self) -> NetworkState:
        """Return the current NetworkState object."""
        return self.state

    async def _background_runner(self) -> None:
        """Loop running step execution asynchronously."""
        while self.state.is_running:
            self._step_once()
            await asyncio.sleep(self.config.step_interval_seconds)


# Global singleton simulator instance
simulator = NetworkSimulator()
