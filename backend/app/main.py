
import asyncio
import os

from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.telemetry import (
    start_mqtt,
    stop_mqtt,
    get_latest_readings,
    get_reading_history,
    get_alert_history,
)

from app.websocket_manager import manager


# ==========================================
# CONFIGURATION
# ==========================================

FRONTEND_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]


# ==========================================
# APPLICATION LIFECYCLE
# ==========================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    manager.set_event_loop(asyncio.get_running_loop())

    start_mqtt()

    yield

    stop_mqtt()

    manager.set_event_loop(None)


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="EdgeLink",
    description="Industrial Communications Gateway",
    version="1.0.0",
    lifespan=lifespan,
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# HEALTH & ROOT
# ==========================================

@app.get("/")
async def root():

    return {
        "application": "EdgeLink",
        "status": "online",
    }


@app.get("/health")
async def health_check():

    return {
        "status": "healthy",
    }


# ==========================================
# TELEMETRY ENDPOINTS
# ==========================================

@app.get("/telemetry/latest")
async def latest_telemetry():

    return get_latest_readings()


@app.get("/telemetry/history")
async def telemetry_history():

    return get_reading_history()


# ==========================================
# ALERT ENDPOINTS
# ==========================================

@app.get("/alerts")
async def alert_history():

    return get_alert_history()


# ==========================================
# TELEMETRY WEBSOCKET
# ==========================================

@app.websocket("/ws/telemetry")
async def telemetry_websocket(websocket: WebSocket):

    await manager.connect(websocket)

    try:

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)


# ==========================================
# ALERT WEBSOCKET
# ==========================================

@app.websocket("/ws/alerts")
async def alerts_websocket(websocket: WebSocket):

    await manager.connect_alert(websocket)

    try:

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect_alert(websocket)
