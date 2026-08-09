import os
import json
import logging
from typing import Dict, Any

from app.fl.aggregator import FederatedAggregator, DEFAULT_GLOBAL_MODEL_PATH, EXPERIMENTAL_FL_RESULTS_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("5g_6g_security.fl.train")


def run_federated_learning_pipeline(
    num_rounds: int = 10,
    local_epochs: int = 5,
    lr: float = 0.01,
    model_path: str = DEFAULT_GLOBAL_MODEL_PATH,
    results_path: str = EXPERIMENTAL_FL_RESULTS_PATH,
) -> Dict[str, Any]:
    """
    Run multi-round Federated Learning pipeline using FedAvg across 3 Edge Nodes.
    Saves global model checkpoint and exports metrics & privacy proof log to disk.
    """
    logger.info(f"Starting Privacy-Preserving Federated Learning Pipeline over {num_rounds} communication rounds...")

    aggregator = FederatedAggregator(global_model_path=model_path)
    rounds_summary = []

    for r in range(num_rounds):
        round_res = aggregator.run_federated_round(local_epochs=local_epochs, lr=lr)
        rounds_summary.append(round_res)

    final_metrics = rounds_summary[-1]["global_model_metrics"]

    overall_results = {
        "num_communication_rounds": num_rounds,
        "local_epochs_per_round": local_epochs,
        "participating_edge_nodes": [
            {
                "node_id": node.node_id,
                "node_name": node.node_name,
                "slice_type_focus": node.slice_type_focus.value,
                "dataset_size": node.sample_count,
                "dataset_path": node.dataset_path,
            }
            for node in aggregator.edge_nodes.values()
        ],
        "final_global_model_metrics": final_metrics,
        "privacy_proof": aggregator.privacy_proof_logs[-1],
        "round_history": rounds_summary,
    }

    os.makedirs(os.path.dirname(results_path), exist_ok=True)
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(overall_results, f, indent=2)

    logger.info(f"Federated Learning Pipeline Complete! Final Global Accuracy: {final_metrics['accuracy']} | F1: {final_metrics['f1_score']}")
    logger.info(f"Results exported to '{results_path}'")

    return overall_results


if __name__ == "__main__":
    run_federated_learning_pipeline()
