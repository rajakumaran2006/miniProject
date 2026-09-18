import os
import csv
import random
import logging
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from app.ml.features import FeatureExtractor
from app.models.slice import SliceType, NetworkSlice
from app.simulation.config import SimulationConfig
from app.simulation.traffic import TrafficGenerator
from app.simulation.attacks import AttackSimulator, AttackType, AttackSeverity, AttackEvent

logger = logging.getLogger("5g_6g_security.fl.edge_node")


class PrivacyViolationError(Exception):
    """Exception raised if an unauthorized entity attempts to access raw edge datasets."""
    pass


class PyTorchAnomalyNN(nn.Module):
    """Binary Anomaly Classifier Neural Network for Federated Learning."""

    def __init__(self, input_dim: int = 9, hidden_dim1: int = 64, hidden_dim2: int = 32):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim1),
            nn.ReLU(),
            nn.Linear(hidden_dim1, hidden_dim2),
            nn.ReLU(),
            nn.Linear(hidden_dim2, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class EdgeNode:
    """
    Simulated 5G/6G Edge Node holding isolated non-IID local telemetry dataset.
    Trains local PyTorch anomaly model and returns model weights without sharing raw data.
    """

    def __init__(
        self,
        node_id: str,
        node_name: str,
        slice_type_focus: SliceType,
        dataset_dir: str,
        sample_count: int = 400,
        seed: int = 42,
    ):
        self.node_id = node_id
        self.node_name = node_name
        self.slice_type_focus = slice_type_focus
        self.dataset_dir = dataset_dir
        self.sample_count = sample_count
        self.seed = seed

        self.dataset_path = os.path.join(self.dataset_dir, "local_dataset.csv")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.local_model = PyTorchAnomalyNN().to(self.device)

        self.X_local: Optional[np.ndarray] = None
        self.y_local: Optional[np.ndarray] = None
        self.vnet_captured_count: int = 0
        self.last_vnet_sync: Optional[str] = None

        self._generate_isolated_local_dataset()

    def _generate_isolated_local_dataset(self):
        """Generate non-IID synthetic telemetry dataset isolated to this edge node's local disk."""
        os.makedirs(self.dataset_dir, exist_ok=True)
        random.seed(self.seed + hash(self.node_id) % 10000)
        np.random.seed(self.seed + hash(self.node_id) % 10000)

        config = SimulationConfig()
        traffic_gen = TrafficGenerator()
        attack_sim = AttackSimulator()

        features_list = []
        labels_list = []

        half_samples = self.sample_count // 2

        # 1. Generate normal samples matching node focus
        for _ in range(half_samples):
            t_data = traffic_gen.generate_normal_traffic(self.slice_type_focus, config)
            s_obj = NetworkSlice(
                slice_id=f"slice-{self.node_id}",
                name=f"{self.node_name} Slice",
                slice_type=self.slice_type_focus,
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
            feats = FeatureExtractor.extract_features(s_obj)
            features_list.append(feats)
            labels_list.append(0)  # 0 = Normal

        # 2. Generate non-IID threat samples
        threat_type = (
            AttackType.DOS if self.slice_type_focus == SliceType.EMBB else
            (AttackType.ISOLATION_BREACH if self.slice_type_focus == SliceType.URLLC else AttackType.SPOOFING)
        )

        for _ in range(half_samples):
            t_data = traffic_gen.generate_normal_traffic(self.slice_type_focus, config)
            s_obj = NetworkSlice(
                slice_id=f"slice-{self.node_id}",
                name=f"{self.node_name} Slice",
                slice_type=self.slice_type_focus,
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
            atk = AttackEvent(event_id="local-atk", slice_id=s_obj.slice_id, attack_type=threat_type, severity=AttackSeverity.HIGH)
            attack_sim.apply_attack_effects(s_obj, atk)

            feats = FeatureExtractor.extract_features(s_obj)
            features_list.append(feats)
            labels_list.append(1)  # 1 = Threat

        self.X_local = np.array(features_list, dtype=np.float32)
        self.y_local = np.array(labels_list, dtype=np.float32)

        # Standard scaling per node
        mean = np.mean(self.X_local, axis=0, keepdims=True)
        std = np.std(self.X_local, axis=0, keepdims=True) + 1e-6
        self.X_local = (self.X_local - mean) / std

        feature_names = [
            "packet_rate", "packet_size", "latency", "bandwidth_usage", "packet_loss",
            "connection_count", "failed_authentication", "resource_usage", "cross_slice_access"
        ]
        with open(self.dataset_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(feature_names + ["ground_truth_label"])
            for f_row, l_val in zip(self.X_local, self.y_local):
                writer.writerow(list(f_row) + [int(l_val)])

        logger.info(f"Generated isolated local dataset for '{self.node_name}' ({len(self.X_local)} samples) -> '{self.dataset_path}'")

    def append_vnet_telemetry(self, raw_features: List[float], label: int, info_note: Optional[str] = None):
        """
        Append a real telemetry observation captured from the Virtual Network (OVS)
        directly into this edge node's local CSV dataset.
        """
        from datetime import datetime, timezone
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        self.last_vnet_sync = now_str
        self.vnet_captured_count += 1

        # Append to CSV on disk
        with open(self.dataset_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(list(raw_features) + [int(label)])

        # Scale raw feature using current mean/std approximation
        new_vec = np.array(raw_features, dtype=np.float32)
        if self.X_local is not None and len(self.X_local) > 0:
            mean = np.mean(self.X_local, axis=0)
            std = np.std(self.X_local, axis=0) + 1e-6
            norm_vec = (new_vec - mean) / std

            self.X_local = np.vstack([self.X_local, norm_vec.reshape(1, -1)])
            self.y_local = np.append(self.y_local, float(label))
        else:
            self.X_local = new_vec.reshape(1, -1)
            self.y_local = np.array([float(label)], dtype=np.float32)

        self.sample_count = len(self.X_local)
        logger.info(
            f"[{self.node_name}] Ingested VNet live packet trace (Label={label}, Total={self.sample_count}, VNetSamples={self.vnet_captured_count})"
        )

    def get_dataset_stats(self) -> Dict[str, Any]:
        """Return metadata summary for this Edge Node's local dataset."""
        return {
            "node_id": self.node_id,
            "node_name": self.node_name,
            "slice_focus": self.slice_type_focus.value,
            "total_samples": len(self.X_local) if self.X_local is not None else 0,
            "vnet_captured_samples": self.vnet_captured_count,
            "dataset_path": self.dataset_path,
            "last_vnet_sync": self.last_vnet_sync,
            "source_type": "Live Open vSwitch Overlay (172.28.0.0/16)" if self.vnet_captured_count > 0 else "Base Telemetry Seed",
        }

    def get_raw_dataset_prohibited(self):
        """Strict privacy assertion blocking external raw data export."""
        raise PrivacyViolationError(
            f"PRIVACY VIOLATION DETECTED: Raw dataset export from '{self.node_name}' is strictly prohibited! "
            f"Only trained local model weights (W) may be transmitted to the central server."
        )

    def train_local_model(
        self, global_state_dict: Optional[Dict[str, torch.Tensor]] = None, epochs: int = 5, lr: float = 0.01
    ) -> Tuple[Dict[str, torch.Tensor], int, Dict[str, float]]:
        """
        Train local PyTorch model on isolated local dataset.
        Receives global weights $W_{global}$ from aggregator, trains for $E$ epochs,
        and returns local state_dict $W_k$, local sample count $n_k$, and evaluation metrics.
        """
        if global_state_dict is not None:
            self.local_model.load_state_dict(global_state_dict)

        self.local_model.train()
        criterion = nn.BCELoss()
        optimizer = optim.Adam(self.local_model.parameters(), lr=lr)

        X_tensor = torch.tensor(self.X_local, dtype=torch.float32, device=self.device)
        y_tensor = torch.tensor(self.y_local, dtype=torch.float32, device=self.device).unsqueeze(1)

        loss_val = 0.0
        for _ in range(epochs):
            optimizer.zero_grad()
            preds = self.local_model(X_tensor)
            loss = criterion(preds, y_tensor)
            loss.backward()
            optimizer.step()
            loss_val = float(loss.item())

        # Evaluate local performance
        self.local_model.eval()
        with torch.no_grad():
            preds_prob = self.local_model(X_tensor).cpu().numpy().flatten()
            preds_binary = (preds_prob > 0.5).astype(int)
            y_true = self.y_local.astype(int)

            acc = float(np.mean(preds_binary == y_true))
            tp = int(np.sum((preds_binary == 1) & (y_true == 1)))
            fp = int(np.sum((preds_binary == 1) & (y_true == 0)))
            fn = int(np.sum((preds_binary == 0) & (y_true == 1)))

            prec = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
            rec = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
            f1 = float(2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        metrics = {
            "loss": round(loss_val, 4),
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
        }

        # Return (local_weights, dataset_size, local_metrics)
        return self.local_model.state_dict(), len(self.X_local), metrics
