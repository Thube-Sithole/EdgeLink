
import asyncio
import logging

from fastapi import WebSocket, WebSocketDisconnect


logger = logging.getLogger("edgelink.websocket")


class ConnectionManager:

    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.active_alert_connections: list[WebSocket] = []
        self.event_loop = None

    def set_event_loop(self, loop):
        self.event_loop = loop

    # ----------------------------------------------
    # Telemetry connections
    # ----------------------------------------------

    async def connect(self, websocket: WebSocket):
        await self._connect(websocket, self.active_connections)

    def disconnect(self, websocket: WebSocket):
        self._disconnect(websocket, self.active_connections)

    async def broadcast(self, message: dict):
        await self._broadcast(message, self.active_connections)

    def broadcast_from_thread(self, message: dict):
        self._broadcast_from_thread(message, self.broadcast)

    # ----------------------------------------------
    # Alert connections
    # ----------------------------------------------

    async def connect_alert(self, websocket: WebSocket):
        await self._connect(websocket, self.active_alert_connections)

    def disconnect_alert(self, websocket: WebSocket):
        self._disconnect(websocket, self.active_alert_connections)

    async def broadcast_alert(self, message: dict):
        await self._broadcast(message, self.active_alert_connections)

    def broadcast_alert_from_thread(self, message: dict):
        self._broadcast_from_thread(message, self.broadcast_alert)

    # ----------------------------------------------
    # Shared connection management
    # ----------------------------------------------

    async def _connect(self, websocket: WebSocket, connections: list):
        await websocket.accept()
        connections.append(websocket)

        logger.info(
            "WebSocket connected. Active clients: %s",
            len(connections)
        )

    def _disconnect(self, websocket: WebSocket, connections: list):
        if websocket in connections:
            connections.remove(websocket)

        logger.info(
            "WebSocket disconnected. Active clients: %s",
            len(connections)
        )

    async def _broadcast(self, message: dict, connections: list):
        disconnected = []

        for connection in list(connections):
            try:
                await connection.send_json(message)

            except (WebSocketDisconnect, RuntimeError):
                disconnected.append(connection)

            except Exception:
                logger.exception("WebSocket broadcast failed")
                disconnected.append(connection)

        for connection in disconnected:
            self._disconnect(connection, connections)

    def _broadcast_from_thread(self, message: dict, broadcast_method):
        loop = self.event_loop

        if loop is None or not loop.is_running():
            return

        try:
            future = asyncio.run_coroutine_threadsafe(
                broadcast_method(message),
                loop
            )

            def handle_result(future):
                try:
                    future.result()
                except Exception:
                    logger.exception(
                        "Scheduled WebSocket broadcast failed"
                    )

            future.add_done_callback(handle_result)

        except RuntimeError:
            logger.warning("Unable to schedule WebSocket broadcast")


manager = ConnectionManager()
