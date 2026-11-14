from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.telemetry import (
    start_mqtt,
    stop_mqtt,
    get_latest_readings,
    get_reading_history
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_mqtt()
    yield
    stop_mqtt()


app = FastAPI(
    title="EdgeLink",
    description="Industrial Communications Gateway",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
async def root():
    return {
        "application": "EdgeLink",
        "status": "online"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }


@app.get("/telemetry/latest")
async def latest_telemetry():
    return get_latest_readings()


@app.get("/telemetry/history")
async def telemetry_history():
    return get_reading_history()