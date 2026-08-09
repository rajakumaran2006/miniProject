import asyncio
import logging
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.orchestrator import orchestrator

logger = logging.getLogger("5g_6g_security.api.websocket")

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket client connections for live telemetry streaming."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error broadcasting to WebSocket client: {e}")


manager = ConnectionManager()


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint streaming live 5G/6G telemetry, active threats, anomaly risk scores,
    MARL decisions, and active security control levels every 1.5 seconds.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Execute closed-loop pipeline iteration and send stream frame
            frame = orchestrator.step_integrated_pipeline(auto_defend=True)
            await websocket.send_json(frame)
            await asyncio.sleep(1.5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket session error: {e}")
        manager.disconnect(websocket)
