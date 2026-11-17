
import asyncio
import logging

from fastapi import WebSocket, WebSocketDisconnect


logger = logging.getLogger("edgelink.websocket")


class ConnectionManager:

    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.event_loop = None

    def set_event_loop(self, loop):
        self.event_loop = loop

    async def connect(self, websocket: WebSocket):

        await websocket.accept()

        self.active_connections.append(websocket)

        logger.info(
            "WebSocket connected. Active clients: %s",
            len(self.active_connections)
        )

    def disconnect(self, websocket: WebSocket):

        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        logger.info(
            "WebSocket disconnected. Active clients: %s",
            len(self.active_connections)
        )

    async def broadcast(self, message: dict):

        disconnected = []

        for connection in list(self.active_connections):

            try:
                await connection.send_json(message)

            except (WebSocketDisconnect, RuntimeError):
                disconnected.append(connection)

            except Exception:
                logger.exception("WebSocket broadcast failed")
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

    def broadcast_from_thread(self, message: dict):

        loop = self.event_loop

        if loop is None or not loop.is_running():
            return

        try:

            future = asyncio.run_coroutine_threadsafe(
                self.broadcast(message),
                loop
            )

            def handle_result(future):
                try:
                    future.result()
                except Exception:
                    logger.exception("Scheduled WebSocket broadcast failed")

            future.add_done_callback(handle_result)

        except RuntimeError:
            logger.warning("Unable to schedule WebSocket broadcast")


manager = ConnectionManager()
