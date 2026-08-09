import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "health_check" in data


def test_health_check_endpoint():
    response = client.get(f"{settings.API_V1_STR}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["project_name"] == settings.PROJECT_NAME
    assert data["version"] == settings.VERSION
    assert "uptime_seconds" in data
    assert data["modules"]["api_server"] is True
    assert data["modules"]["rl_agent_interface"] is True


def test_list_slices_endpoint():
    response = client.get(f"{settings.API_V1_STR}/slices")
    assert response.status_code == 200
    slices = response.json()
    assert isinstance(slices, list)
    assert len(slices) >= 3
    slice_ids = [s["slice_id"] for s in slices]
    assert "slice-embb-01" in slice_ids
    assert "slice-urllc-01" in slice_ids
    assert "slice-mmtc-01" in slice_ids


def test_get_slice_detail():
    response = client.get(f"{settings.API_V1_STR}/slices/slice-urllc-01")
    assert response.status_code == 200
    data = response.json()
    assert data["slice_id"] == "slice-urllc-01"
    assert data["slice_type"] == "URLLC"
    assert "metrics" in data
    assert "physical_ran" in data["metrics"]


def test_get_nonexistent_slice():
    response = client.get(f"{settings.API_V1_STR}/slices/non-existent-id")
    assert response.status_code == 404
