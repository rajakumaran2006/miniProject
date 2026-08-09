import os
import json
import csv
import random
from typing import List, Dict, Any, Tuple
import numpy as np

from app.models.slice import NetworkSlice, SliceType, AttackType, AttackSeverity, AttackEvent
from app.simulation.config import SimulationConfig
from app.simulation.traffic import TrafficGenerator
from app.simulation.attacks import AttackSimulator

FEATURE_NAMES = [
    "packet_rate",
    "packet_size",
    "latency",
    "bandwidth_usage",
    "packet_loss",
    "connection_count",
    "failed_authentication",
    "resource_usage",
    "cross_slice_access",
]


class FeatureExtractor:
    """Extracts and normalizes the 9 core telemetry features from NetworkSlice state."""

    @staticmethod
    def extract_features(slice_obj: NetworkSlice) -> List[float]:
        """
        Extract feature vector:
        1. packet_rate (packets/sec)
        2. packet_size (bytes)
        3. latency (ms)
        4. bandwidth_usage (Mbps)
        5. packet_loss (ratio 0-1)
        6. connection_count (connected devices)
        7. failed_authentication (auth_failures)
        8. resource_usage (cpu_usage %)
        9. cross_slice_access (unauthorized_cross_slice_flows)
        """
        bw = float(slice_obj.bandwidth)
        pr = max(1.0, float(slice_obj.packet_rate))
        # Compute avg packet size in bytes: (Mbps * 125000 bytes/sec) / packets/sec
        packet_size = round((bw * 125000.0) / pr, 2)

        lat = float(slice_obj.latency)
        loss = float(slice_obj.packet_loss)
        conn = float(slice_obj.connected_devices)
        cpu = float(slice_obj.cpu_usage)

        auth_fail = float(slice_obj.metrics.core_3gpp.get("auth_failures", 0.0))
        cross_access = float(slice_obj.metrics.transport_network.get("unauthorized_cross_slice_flows", 0.0))

        return [
            pr,
            packet_size,
            lat,
            bw,
            loss,
            conn,
            auth_fail,
            cpu,
            cross_access,
        ]

    @staticmethod
    def generate_synthetic_dataset(
        num_samples_per_class: int = 350, export_path: str = "data/telemetry_dataset.json"
    ) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, Any]]]:
        """
        Generate synthetic telemetry dataset containing normal traffic, DoS, Spoofing, and Isolation Breach threat samples.
        Saves dataset under `data/telemetry_dataset.json` and `data/telemetry_dataset.csv`.
        Returns (X_features, y_labels, raw_records).
        """
        config = SimulationConfig()
        traffic_gen = TrafficGenerator()
        attack_sim = AttackSimulator()

        records: List[Dict[str, Any]] = []
        X_list: List[List[float]] = []
        y_list: List[int] = []

        slice_types = [SliceType.EMBB, SliceType.URLLC, SliceType.MMTC]

        # 1. Normal Traffic Samples (Label 0)
        for _ in range(num_samples_per_class * 3):
            stype = random.choice(slice_types)
            norm_t = traffic_gen.generate_normal_traffic(stype, config)

            # Construct dummy slice
            sl = NetworkSlice(
                slice_id=f"slice-{stype.value.lower()}-demo",
                name=f"{stype.value} Slice",
                slice_type=stype,
                bandwidth=norm_t["bandwidth"],
                latency=norm_t["latency"],
                packet_rate=norm_t["packet_rate"],
                packet_loss=norm_t["packet_loss"],
                connected_devices=norm_t["connected_devices"],
                cpu_usage=norm_t["cpu_usage"],
                allocated_bandwidth_mbps=1000.0,
                max_latency_ms=20.0,
                target_reliability=0.999,
            )
            feats = FeatureExtractor.extract_features(sl)
            X_list.append(feats)
            y_list.append(0)

            records.append({
                "features": dict(zip(FEATURE_NAMES, feats)),
                "label": 0,
                "threat_type": "NORMAL",
                "slice_type": stype.value
            })

        # 2. DoS Threat Samples (Label 1)
        for _ in range(num_samples_per_class):
            stype = random.choice(slice_types)
            norm_t = traffic_gen.generate_normal_traffic(stype, config)
            sl = NetworkSlice(
                slice_id=f"slice-{stype.value.lower()}-dos",
                name=f"{stype.value} Slice",
                slice_type=stype,
                bandwidth=norm_t["bandwidth"],
                latency=norm_t["latency"],
                packet_rate=norm_t["packet_rate"],
                packet_loss=norm_t["packet_loss"],
                connected_devices=norm_t["connected_devices"],
                cpu_usage=norm_t["cpu_usage"],
                allocated_bandwidth_mbps=1000.0,
                max_latency_ms=20.0,
                target_reliability=0.999,
            )
            atk_evt = AttackEvent(
                event_id="dataset-dos",
                slice_id=sl.slice_id,
                attack_type=AttackType.DOS,
                severity=random.choice([AttackSeverity.MEDIUM, AttackSeverity.HIGH, AttackSeverity.CRITICAL])
            )
            attack_sim.apply_attack_effects(sl, atk_evt)
            feats = FeatureExtractor.extract_features(sl)
            X_list.append(feats)
            y_list.append(1)

            records.append({
                "features": dict(zip(FEATURE_NAMES, feats)),
                "label": 1,
                "threat_type": "Denial-of-Service",
                "slice_type": stype.value
            })

        # 3. Spoofing Threat Samples (Label 1)
        for _ in range(num_samples_per_class):
            stype = random.choice(slice_types)
            norm_t = traffic_gen.generate_normal_traffic(stype, config)
            sl = NetworkSlice(
                slice_id=f"slice-{stype.value.lower()}-spoof",
                name=f"{stype.value} Slice",
                slice_type=stype,
                bandwidth=norm_t["bandwidth"],
                latency=norm_t["latency"],
                packet_rate=norm_t["packet_rate"],
                packet_loss=norm_t["packet_loss"],
                connected_devices=norm_t["connected_devices"],
                cpu_usage=norm_t["cpu_usage"],
                allocated_bandwidth_mbps=1000.0,
                max_latency_ms=20.0,
                target_reliability=0.999,
            )
            atk_evt = AttackEvent(
                event_id="dataset-spoof",
                slice_id=sl.slice_id,
                attack_type=AttackType.SPOOFING,
                severity=random.choice([AttackSeverity.MEDIUM, AttackSeverity.HIGH, AttackSeverity.CRITICAL])
            )
            attack_sim.apply_attack_effects(sl, atk_evt)
            feats = FeatureExtractor.extract_features(sl)
            X_list.append(feats)
            y_list.append(1)

            records.append({
                "features": dict(zip(FEATURE_NAMES, feats)),
                "label": 1,
                "threat_type": "Spoofing",
                "slice_type": stype.value
            })

        # 4. Network-Slice Isolation Breach Samples (Label 1)
        for _ in range(num_samples_per_class):
            stype = random.choice(slice_types)
            norm_t = traffic_gen.generate_normal_traffic(stype, config)
            sl = NetworkSlice(
                slice_id=f"slice-{stype.value.lower()}-iso",
                name=f"{stype.value} Slice",
                slice_type=stype,
                bandwidth=norm_t["bandwidth"],
                latency=norm_t["latency"],
                packet_rate=norm_t["packet_rate"],
                packet_loss=norm_t["packet_loss"],
                connected_devices=norm_t["connected_devices"],
                cpu_usage=norm_t["cpu_usage"],
                allocated_bandwidth_mbps=1000.0,
                max_latency_ms=20.0,
                target_reliability=0.999,
            )
            atk_evt = AttackEvent(
                event_id="dataset-iso",
                slice_id=sl.slice_id,
                attack_type=AttackType.ISOLATION_BREACH,
                severity=random.choice([AttackSeverity.MEDIUM, AttackSeverity.HIGH, AttackSeverity.CRITICAL])
            )
            attack_sim.apply_attack_effects(sl, atk_evt)
            feats = FeatureExtractor.extract_features(sl)
            X_list.append(feats)
            y_list.append(1)

            records.append({
                "features": dict(zip(FEATURE_NAMES, feats)),
                "label": 1,
                "threat_type": "Network-Slice Isolation Breach",
                "slice_type": stype.value
            })

        # Save to export_path (JSON)
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        with open(export_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)

        # Also save CSV version
        csv_path = export_path.replace(".json", ".csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(FEATURE_NAMES + ["label", "threat_type", "slice_type"])
            for r in records:
                row = [r["features"][name] for name in FEATURE_NAMES] + [r["label"], r["threat_type"], r["slice_type"]]
                writer.writerow(row)

        X_np = np.array(X_list, dtype=np.float64)
        y_np = np.array(y_list, dtype=np.int32)
        return X_np, y_np, records
