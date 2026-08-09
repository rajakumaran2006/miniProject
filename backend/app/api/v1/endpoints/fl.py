import os
import json
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.fl.aggregator import FederatedAggregator, DEFAULT_GLOBAL_MODEL_PATH, EXPERIMENTAL_FL_RESULTS_PATH
from app.fl.edge_node import PrivacyViolationError
from app.fl.train import run_federated_learning_pipeline
from app.simulation.simulator import simulator

router = APIRouter()

# Global Federated Aggregator singleton
fl_aggregator = FederatedAggregator()


class FLTrainRequest(BaseModel):
    num_rounds: int = Field(default=10, ge=1, le=50, description="Number of FedAvg communication rounds")
    local_epochs: int = Field(default=5, ge=1, le=20, description="Local training epochs per edge node")


class FLPredictRequest(BaseModel):
    slice_id: str = Field(..., json_schema_extra={"example": "slice-urllc-01"}, description="Target slice ID to evaluate")


@router.post("/train", summary="Trigger Federated Learning Training")
def train_federated_model(req: FLTrainRequest = FLTrainRequest()):
    """
    Run multi-round Federated Learning using FedAvg across 3 simulated edge nodes.
    Aggregates PyTorch model weights without transmitting raw edge telemetry data.
    """
    try:
        results = run_federated_learning_pipeline(
            num_rounds=req.num_rounds,
            local_epochs=req.local_epochs,
        )
        fl_aggregator.load_global_model()
        return {
            "message": f"Successfully completed {req.num_rounds} communication rounds of FedAvg",
            "results": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Federated Learning training failed: {str(e)}")


@router.post("/predict", summary="Predict Anomaly Score using Global Federated Model")
def predict_federated_anomaly(req: FLPredictRequest):
    """
    Perform privacy-preserving anomaly prediction on an active slice using the Global Federated Model.
    """
    slice_obj = simulator.state.slices.get(req.slice_id)
    if not slice_obj:
        raise HTTPException(status_code=404, detail=f"Slice '{req.slice_id}' not found")

    res = fl_aggregator.predict_slice(slice_obj)
    return res


@router.get("/metrics", summary="Get Federated Learning Metrics & Privacy Proof Log")
def get_fl_metrics():
    """
    Retrieve latest Federated Learning round convergence metrics and privacy proof log.
    """
    if os.path.exists(EXPERIMENTAL_FL_RESULTS_PATH):
        try:
            with open(EXPERIMENTAL_FL_RESULTS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading FL metrics: {str(e)}")
    raise HTTPException(status_code=404, detail="No Federated Learning metrics found. Please trigger training first.")


@router.get("/status", summary="Get Federated Learning Status")
def get_fl_status():
    """
    Retrieve FL Aggregator readiness, participating edge nodes, and privacy status.
    """
    checkpoint_exists = os.path.exists(DEFAULT_GLOBAL_MODEL_PATH)
    return {
        "framework": "Privacy-Preserving Federated Learning (FedAvg)",
        "global_model_checkpoint_exists": checkpoint_exists,
        "global_model_path": DEFAULT_GLOBAL_MODEL_PATH,
        "current_round": fl_aggregator.current_round,
        "participating_edge_nodes": [
            {
                "node_id": node.node_id,
                "node_name": node.node_name,
                "slice_type_focus": node.slice_type_focus.value,
                "local_dataset_size": node.sample_count,
                "raw_data_transfer_allowed": False,
            }
            for node in fl_aggregator.edge_nodes.values()
        ],
        "privacy_guarantee": "Strict Isolation - Only PyTorch state_dict parameters (W_k) transmitted over network.",
    }
