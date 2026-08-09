from typing import List
from fastapi import APIRouter, HTTPException
from app.models.slice import NetworkSlice
from app.services.slice_service import slice_service

router = APIRouter()


@router.get("/slices", response_model=List[NetworkSlice], summary="Get All 5G/6G Network Slices")
def list_network_slices():
    """
    Retrieve telemetry and security status for all active 5G/6G network slices.
    """
    return slice_service.get_all_slices()


@router.get("/slices/{slice_id}", response_model=NetworkSlice, summary="Get Slice Detail by ID")
def get_network_slice(slice_id: str):
    """
    Retrieve detailed cross-layer telemetry for a specific network slice.
    """
    slice_item = slice_service.get_slice_by_id(slice_id)
    if not slice_item:
        raise HTTPException(status_code=404, detail=f"Network slice '{slice_id}' not found")
    return slice_item
