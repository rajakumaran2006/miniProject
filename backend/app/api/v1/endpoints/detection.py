from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.models.slice import NetworkSlice
from app.ml.detector import anomaly_detector, ModelMetrics, DetectionResult
from app.simulation.simulator import simulator

router = APIRouter()


class TrainRequest(BaseModel):
    num_samples_per_class: int = Field(default=350, ge=50, le=2000, description="Synthetic samples per class")


class PredictRequest(BaseModel):
    slice_id: Optional[str] = Field(default=None, json_schema_extra={"example": "slice-embb-01"}, description="Target slice ID to evaluate (None evaluates all active slices)")


@router.post("/train", response_model=ModelMetrics, summary="Train Anomaly Detector Model")
def train_anomaly_detector(req: TrainRequest = TrainRequest()):
    """
    Generate synthetic telemetry dataset (Normal, DoS, Spoofing, Isolation Breach),
    fit Scikit-Learn Isolation Forest model, save dataset to `data/` and checkpoint to disk,
    and return evaluation metrics (Accuracy, Precision, Recall, F1, Confusion Matrix).
    """
    try:
        metrics = anomaly_detector.train_model(num_samples_per_class=req.num_samples_per_class)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.post("/predict", response_model=List[DetectionResult], summary="Run Anomaly Detection")
def predict_anomalies(req: PredictRequest = PredictRequest()):
    """
    Run Isolation Forest anomaly detection on active 5G/6G slices.
    Returns anomaly risk score, predicted status (NORMAL/ANOMALOUS), confidence score, and feature contributions.
    """
    slices_to_check: List[NetworkSlice] = []
    if req.slice_id:
        target = simulator.state.slices.get(req.slice_id)
        if not target:
            raise HTTPException(status_code=404, detail=f"Slice '{req.slice_id}' not found")
        slices_to_check.append(target)
    else:
        slices_to_check = list(simulator.state.slices.values())

    results: List[DetectionResult] = []
    for s in slices_to_check:
        res = anomaly_detector.predict(s)
        results.append(res)

    return results


@router.get("/history", response_model=List[DetectionResult], summary="Retrieve Detection History")
def get_detection_history():
    """
    Retrieve historical log of all anomaly detection predictions.
    """
    return anomaly_detector.get_history()


@router.get("/metrics", response_model=ModelMetrics, summary="Get Model Evaluation Metrics")
def get_model_metrics():
    """
    Retrieve current Isolation Forest model evaluation metrics (Accuracy, Precision, Recall, F1-Score, Confusion Matrix).
    """
    metrics = anomaly_detector.get_metrics()
    if not metrics:
        raise HTTPException(status_code=404, detail="No trained model metrics found. Please trigger training first.")
    return metrics
