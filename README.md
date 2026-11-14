
# EdgeLink
### Industrial Communications Gateway

EdgeLink is a developing industrial IoT prototype designed to demonstrate communication between simulated industrial equipment, messaging infrastructure and software applications.

## Architecture

Python Sensor Simulator → MQTT Broker (Mosquitto) → FastAPI Backend → REST API → Dashboard (planned)

## Implemented Features

- Python-based industrial sensor simulation.
- MQTT publish/subscribe messaging using Eclipse Mosquitto.
- Docker-based MQTT broker deployment.
- FastAPI backend.
- MQTT telemetry ingestion.
- REST endpoints for latest readings and telemetry history.
- In-memory telemetry storage.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Sensor simulation and backend |
| FastAPI | REST API |
| MQTT | Messaging protocol |
| Eclipse Mosquitto | MQTT broker |
| Paho-MQTT | Python MQTT client |
| Docker | Containerisation |
| Pydantic | Data validation |

## Project Status

**Work in Progress**

The initial MQTT-to-FastAPI communication pipeline has been implemented and tested locally.

Planned development:
- WebSocket telemetry streaming.
- React and TypeScript dashboard.
- TCP and UDP socket communication demonstrations.
- Automated tests.
- Improved validation and reliability.
- Complete Docker Compose deployment.

## Running Locally

Start the MQTT broker:

```bash
docker compose up -d
```

Activate the Python virtual environment and install dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the API from the project root:

```bash
uvicorn app.main:app --reload --app-dir backend
```

API documentation:

http://127.0.0.1:8000/docs

## Disclaimer

EdgeLink is an educational and portfolio prototype using simulated equipment telemetry. It is not intended for production industrial control or safety-critical applications.
