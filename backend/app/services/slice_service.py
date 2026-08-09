import time
from typing import List, Optional
from app.models.slice import NetworkSlice
from app.simulation.simulator import simulator

_START_TIME = time.time()


class SliceService:
    def get_all_slices(self) -> List[NetworkSlice]:
        """Return all active 5G/6G network slices from simulator state."""
        return list(simulator.state.slices.values())

    def get_slice_by_id(self, slice_id: str) -> Optional[NetworkSlice]:
        """Return specific slice from simulator state."""
        return simulator.state.slices.get(slice_id)

    @staticmethod
    def get_uptime_seconds() -> float:
        return round(time.time() - _START_TIME, 2)


slice_service = SliceService()
