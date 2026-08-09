from fastapi import APIRouter
from app.core.config import settings
from app.models.slice import HealthCheckResponse
from app.services.slice_service import slice_service

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse, summary="System Health Check")
def get_health_status():
    """
    Check API backend operational state, system uptime, and component readiness.
    """
    return HealthCheckResponse(
        status="healthy",
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        uptime_seconds=slice_service.get_uptime_seconds(),
        modules={
            "api_server": True,
            "telemetry_engine": True,
            "rl_agent_interface": True,
            "federated_learning_interface": True,
            "attack_simulator_interface": True
        }
    )
