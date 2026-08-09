import os
import time
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import joblib
import numpy as np
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from app.models.slice import NetworkSlice, SliceStatus, SecurityLevel
from app.ml.features import FeatureExtractor, FEATURE_NAMES

logger = logging.getLogger("5g_6g_security.ml")

MODEL_SAVE_PATH = "backend/app/ml/saved_models/isolation_forest.joblib"


class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]] = Field(description="[[TN, FP], [FN, TP]]")
    trained_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    num_samples: int
    algorithm: str = "IsolationForest (Scikit-Learn)"


class DetectionResult(BaseModel):
    event_id: str
    affected_slice: str
    slice_type: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    anomaly_score: float = Field(ge=0.0, le=1.0, description="Normalized anomaly risk score (0.0=normal, 1.0=critical anomaly)")
    predicted_status: str = Field(description="'NORMAL' or 'ANOMALOUS'")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Model prediction confidence/risk score")
    threat_category: str = Field(default="NORMAL", description="Identified threat vector (DoS, Spoofing, Isolation Breach, Normal)")
    feature_contributions: Dict[str, float] = Field(default_factory=dict)


class AnomalyDetector:
    """Unsupervised & Supervised Anomaly Detection Engine using Scikit-Learn Isolation Forest."""

    def __init__(self, model_path: str = MODEL_SAVE_PATH):
        self.model_path = model_path
        self.model: Optional[IsolationForest] = None
        self.metrics: Optional[ModelMetrics] = None
        self.history: List[DetectionResult] = []
        self._load_or_initialize()

    def _load_or_initialize(self) -> None:
        """Attempt to load persisted model checkpoint, else initialize default baseline."""
        if os.path.exists(self.model_path):
            try:
                saved = joblib.load(self.model_path)
                self.model = saved.get("model")
                self.metrics = saved.get("metrics")
                logger.info(f"Loaded trained IsolationForest model checkpoint from '{self.model_path}'")
                return
            except Exception as e:
                logger.warning(f"Failed to load checkpoint '{self.model_path}': {e}")

        # Train initial baseline model automatically
        logger.info("Initializing baseline training pipeline for AnomalyDetector...")
        self.train_model()

    def train_model(self, num_samples_per_class: int = 350) -> ModelMetrics:
        """
        Run synthetic data generation pipeline, fit Isolation Forest model, and evaluate performance against ground truth labels.
        """
        logger.info("Generating synthetic training & evaluation dataset...")
        X, y_ground_truth, _ = FeatureExtractor.generate_synthetic_dataset(
            num_samples_per_class=num_samples_per_class
        )

        # Fit Isolation Forest (Unsupervised)
        # Contamination ~ 0.25 matching proportion of synthetic threat samples
        clf = IsolationForest(
            n_estimators=120,
            contamination=0.28,
            random_state=42,
            n_jobs=-1
        )
        clf.fit(X)

        # Evaluate predictions against ground truth labels (0=Normal, 1=Anomaly)
        # IsolationForest returns +1 for inliers (normal) and -1 for outliers (anomalous)
        raw_preds = clf.predict(X)
        y_preds = np.where(raw_preds == -1, 1, 0)

        acc = float(accuracy_score(y_ground_truth, y_preds))
        prec = float(precision_score(y_ground_truth, y_preds, zero_division=0))
        rec = float(recall_score(y_ground_truth, y_preds, zero_division=0))
        f1 = float(f1_score(y_ground_truth, y_preds, zero_division=0))
        cm = confusion_matrix(y_ground_truth, y_preds).tolist()

        self.metrics = ModelMetrics(
            accuracy=round(acc, 4),
            precision=round(prec, 4),
            recall=round(rec, 4),
            f1_score=round(f1, 4),
            confusion_matrix=cm,
            num_samples=len(y_ground_truth),
            algorithm="IsolationForest (Scikit-Learn)"
        )
        self.model = clf

        # Persist trained model checkpoint
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump({"model": self.model, "metrics": self.metrics}, self.model_path)
        logger.info(f"Trained model saved successfully to '{self.model_path}'. F1-Score: {f1:.4f}")
        return self.metrics

    def predict(self, slice_obj: NetworkSlice) -> DetectionResult:
        """
        Predict anomaly state for a single NetworkSlice instance.
        Returns DetectionResult with normalized risk score, status, and feature breakdown.
        """
        if self.model is None:
            self.train_model()

        feats = FeatureExtractor.extract_features(slice_obj)
        X_in = np.array([feats], dtype=np.float64)

        # Raw decision function score (positive = inlier/normal, negative = outlier/anomalous)
        raw_score = float(self.model.decision_function(X_in)[0])
        raw_pred = int(self.model.predict(X_in)[0])  # +1 = normal, -1 = anomaly

        # Map raw_score (approx -0.3 to +0.25) to normalized [0.0, 1.0] anomaly risk score
        # When raw_score > 0, anomaly_score < 0.5; when raw_score < 0, anomaly_score > 0.5
        anomaly_score = float(np.clip(0.5 - (raw_score * 2.0), 0.0, 1.0))
        is_anomalous = (raw_pred == -1) or (anomaly_score >= 0.55)

        predicted_status = "ANOMALOUS" if is_anomalous else "NORMAL"
        confidence_score = round(anomaly_score if is_anomalous else (1.0 - anomaly_score), 4)

        # Classify threat category based on feature deltas
        threat_cat = "NORMAL"
        if is_anomalous:
            # Check feature signatures
            pr, ps, lat, bw, loss, conn, auth_f, cpu, cross = feats
            if pr > 25000 or bw > 1500 or loss > 0.08:
                threat_cat = "Denial-of-Service"
            elif auth_f > 20 or conn > 80000:
                threat_cat = "Spoofing"
            elif cross > 10:
                threat_cat = "Network-Slice Isolation Breach"
            else:
                threat_cat = "Anomalous Traffic"

        feat_dict = dict(zip(FEATURE_NAMES, feats))

        res = DetectionResult(
            event_id=f"det-{int(time.time()*1000)%1000000}",
            affected_slice=slice_obj.slice_id,
            slice_type=slice_obj.slice_type.value,
            timestamp=datetime.now(timezone.utc),
            anomaly_score=round(anomaly_score, 4),
            predicted_status=predicted_status,
            confidence_score=confidence_score,
            threat_category=threat_cat,
            feature_contributions=feat_dict,
        )

        self.history.append(res)
        return res

    def get_history(self) -> List[DetectionResult]:
        """Return full list of historical detection predictions."""
        return self.history

    def get_metrics(self) -> Optional[ModelMetrics]:
        """Return latest trained model performance metrics."""
        return self.metrics


# Global singleton anomaly detector instance
anomaly_detector = AnomalyDetector()
