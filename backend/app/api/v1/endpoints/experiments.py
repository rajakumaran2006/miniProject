import os
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.experiments.benchmark import exp_runner, CSV_RESULT_PATH

router = APIRouter()


class RunExperimentRequest(BaseModel):
    eval_episodes: int = Field(default=50, ge=10, le=200, description="Evaluation episodes per strategy")
    seed: int = Field(default=42, description="Random seed for reproducible benchmark")


@router.post("/run", summary="Run 3-Way Comparative Experiment Benchmark")
def run_comparative_experiment(req: RunExperimentRequest):
    """
    Execute repeatable 3-way comparative benchmark across:
    1. Static / Rule-Based Baseline
    2. Single-Agent RL (DQN)
    3. Multi-Agent Cross-Layer RL (ACLS)
    Measures 9 empirical metrics from actual simulation iterations.
    """
    results = exp_runner.run_comparative_benchmark(eval_episodes=req.eval_episodes, seed=req.seed)
    return results


@router.get("/results", summary="Get Stored Experiment Benchmark Results")
def get_experiment_results():
    """Retrieve stored benchmark results & empirical metrics."""
    if not exp_runner.cached_results:
        # Run default benchmark if no cached results exist
        exp_runner.run_comparative_benchmark(eval_episodes=50, seed=42)
    return exp_runner.cached_results


@router.get("/csv", summary="Download Experiment Results CSV File")
def download_experiment_csv():
    """Download the generated experiment results CSV file for project reports."""
    if not os.path.exists(CSV_RESULT_PATH):
        exp_runner.run_comparative_benchmark(eval_episodes=50, seed=42)

    return FileResponse(
        path=CSV_RESULT_PATH,
        filename="experiment_comparative_results.csv",
        media_type="text/csv",
    )
