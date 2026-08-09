import random
from typing import Dict, Any
from app.models.slice import SliceType
from app.simulation.config import SimulationConfig, SliceBaselineConfig


class TrafficGenerator:
    """Generates synthetic network traffic for 5G/6G network slices."""

    @staticmethod
    def _apply_noise(value: float, noise_factor: float, lower_bound: float = 0.0) -> float:
        """Apply Gaussian noise variation around target value."""
        variation = random.gauss(0, value * noise_factor)
        return max(lower_bound, round(value + variation, 4))

    def generate_normal_traffic(self, slice_type: SliceType, config: SimulationConfig) -> Dict[str, Any]:
        """Generate normal operating telemetry for a given slice type."""
        profile: SliceBaselineConfig
        if slice_type == SliceType.EMBB:
            profile = config.embb_profile
        elif slice_type == SliceType.URLLC:
            profile = config.urllc_profile
        else:
            profile = config.mmtc_profile

        mult = config.traffic_multiplier
        noise = config.noise_factor

        bandwidth = self._apply_noise(profile.target_bandwidth_mbps * mult, noise, lower_bound=1.0)
        latency = self._apply_noise(profile.target_latency_ms, noise, lower_bound=0.1)
        packet_rate = self._apply_noise(profile.target_packet_rate * mult, noise, lower_bound=100.0)
        connected_devices = int(self._apply_noise(profile.target_devices, noise, lower_bound=1.0))
        packet_loss = max(0.0, round(random.uniform(0.00001, profile.target_packet_loss * 2), 6))
        
        # Calculate realistic CPU usage based on traffic load & packet processing
        cpu_load_ratio = (bandwidth / profile.target_bandwidth_mbps) * 0.4 + (packet_rate / profile.target_packet_rate) * 0.6
        cpu_usage = min(95.0, self._apply_noise(profile.target_cpu_usage * cpu_load_ratio, noise, lower_bound=5.0))

        return {
            "bandwidth": bandwidth,
            "latency": latency,
            "packet_rate": packet_rate,
            "packet_loss": packet_loss,
            "connected_devices": connected_devices,
            "cpu_usage": round(cpu_usage, 2),
            "anomaly_score": round(random.uniform(0.01, 0.08), 4),
            "is_abnormal": False,
            "anomaly_type": None,
        }

    def generate_abnormal_traffic(
        self, slice_type: SliceType, anomaly_type: str, config: SimulationConfig
    ) -> Dict[str, Any]:
        """Generate anomalous / attack traffic patterns (e.g. DDoS, Jamming, Slice Hopping)."""
        normal_data = self.generate_normal_traffic(slice_type, config)

        if anomaly_type == "DDOS_SURGE":
            # Massive packet surge & CPU spikes
            normal_data["bandwidth"] = round(normal_data["bandwidth"] * random.uniform(3.5, 6.0), 2)
            normal_data["packet_rate"] = round(normal_data["packet_rate"] * random.uniform(4.0, 8.0), 2)
            normal_data["latency"] = round(normal_data["latency"] * random.uniform(2.5, 5.0), 2)
            normal_data["packet_loss"] = round(random.uniform(0.05, 0.25), 4)
            normal_data["cpu_usage"] = min(99.9, round(random.uniform(85.0, 99.5), 2))
            normal_data["anomaly_score"] = round(random.uniform(0.75, 0.98), 4)

        elif anomaly_type == "RAN_JAMMING":
            # Severe latency spike, SNR drop, high packet loss
            normal_data["latency"] = round(normal_data["latency"] * random.uniform(8.0, 15.0), 2)
            normal_data["packet_loss"] = round(random.uniform(0.15, 0.45), 4)
            normal_data["bandwidth"] = round(normal_data["bandwidth"] * random.uniform(0.1, 0.3), 2)
            normal_data["anomaly_score"] = round(random.uniform(0.80, 0.99), 4)

        elif anomaly_type == "BOTNET_FLOOD":
            # Massive connected devices spike on mMTC / IoT
            normal_data["connected_devices"] = int(normal_data["connected_devices"] * random.uniform(2.5, 5.0))
            normal_data["packet_rate"] = round(normal_data["packet_rate"] * random.uniform(3.0, 5.0), 2)
            normal_data["cpu_usage"] = min(98.0, round(random.uniform(75.0, 92.0), 2))
            normal_data["anomaly_score"] = round(random.uniform(0.65, 0.92), 4)

        elif anomaly_type == "SLICE_HOPPING":
            # Unauthorized cross-slice traffic injection
            normal_data["packet_rate"] = round(normal_data["packet_rate"] * random.uniform(2.0, 3.5), 2)
            normal_data["anomaly_score"] = round(random.uniform(0.55, 0.85), 4)

        normal_data["is_abnormal"] = True
        normal_data["anomaly_type"] = anomaly_type
        return normal_data
