
import json
import logging
import threading

from collections import deque

import paho.mqtt.client as mqtt

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
)

from app.alert_engine import evaluate_reading
from app.websocket_manager import manager


# --------------------------------------------------
# Configuration
# --------------------------------------------------

BROKER = "localhost"
PORT = 1883

TOPIC = "edgelink/factory-01/machine-01/telemetry"

KEEPALIVE = 60

HISTORY_LIMIT = 100
ALERT_HISTORY_LIMIT = 100


# --------------------------------------------------
# Logging
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger("edgelink.telemetry")


# --------------------------------------------------
# Telemetry data model
# --------------------------------------------------

class TelemetryReading(BaseModel):

    model_config = ConfigDict(extra="forbid")

    machine_id: str = Field(min_length=1, max_length=100)

    temperature: float = Field(ge=-50, le=200)

    pressure: float = Field(gt=0, le=500)

    vibration: float = Field(ge=0, le=100)

    timestamp: str


# --------------------------------------------------
# In-memory storage
# --------------------------------------------------

latest_readings = {}

reading_history = deque(maxlen=HISTORY_LIMIT)

alert_history = deque(maxlen=ALERT_HISTORY_LIMIT)

data_lock = threading.Lock()


# --------------------------------------------------
# MQTT connection state
# --------------------------------------------------

mqtt_connected = threading.Event()

mqtt_started = False

lifecycle_lock = threading.Lock()


# --------------------------------------------------
# MQTT callbacks
# --------------------------------------------------

def on_connect(client, userdata, flags, reason_code, properties):

    if reason_code != 0:

        mqtt_connected.clear()

        logger.error(
            "MQTT connection rejected: %s",
            reason_code
        )

        return

    mqtt_connected.set()

    logger.info("Connected to MQTT broker")

    result, message_id = client.subscribe(TOPIC, qos=1)

    if result == mqtt.MQTT_ERR_SUCCESS:

        logger.info(
            "Subscribed to topic: %s",
            TOPIC
        )

    else:

        logger.error(
            "Failed to subscribe: %s",
            result
        )


def on_disconnect(client, userdata, disconnect_flags, reason_code, properties):

    mqtt_connected.clear()

    if reason_code != 0:

        logger.warning(
            "Unexpected MQTT disconnection: %s",
            reason_code
        )

    else:

        logger.info("MQTT disconnected")


def on_message(client, userdata, message):

    try:

        # Decode incoming MQTT payload.
        payload = message.payload.decode("utf-8")

        raw_reading = json.loads(payload)

        # Validate telemetry.
        reading = TelemetryReading.model_validate(raw_reading)

        validated_reading = reading.model_dump(mode="json")

        # ------------------------------------------
        # Store telemetry
        # ------------------------------------------

        with data_lock:

            latest_readings[reading.machine_id] = validated_reading

            reading_history.append(validated_reading)

        # ------------------------------------------
        # Broadcast telemetry
        # ------------------------------------------

        manager.broadcast_from_thread(validated_reading)

        # ------------------------------------------
        # Evaluate equipment thresholds
        # ------------------------------------------

        generated_alerts = evaluate_reading(validated_reading)

        # ------------------------------------------
        # Store and broadcast alerts
        # ------------------------------------------

        for alert in generated_alerts:

            with data_lock:

                alert_history.append(alert)

            manager.broadcast_alert_from_thread(alert)

            logger.warning(
                "Equipment alert | Machine: %s | Metric: %s | Severity: %s",
                alert["machine_id"],
                alert["metric"],
                alert["severity"]
            )

        logger.info(
            "Telemetry received from %s",
            reading.machine_id
        )

    except (UnicodeDecodeError, json.JSONDecodeError) as error:

        logger.warning(
            "Invalid JSON telemetry: %s",
            error
        )

    except ValidationError as error:

        logger.warning(
            "Telemetry validation failed: %s",
            error
        )

    except Exception:

        logger.exception(
            "Unexpected error processing MQTT telemetry"
        )


# --------------------------------------------------
# MQTT client configuration
# --------------------------------------------------

mqtt_client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="edgelink-fastapi"
)

mqtt_client.on_connect = on_connect

mqtt_client.on_disconnect = on_disconnect

mqtt_client.on_message = on_message


# Automatically retry connections after unexpected disconnects.
mqtt_client.reconnect_delay_set(
    min_delay=1,
    max_delay=30
)


# --------------------------------------------------
# MQTT lifecycle management
# --------------------------------------------------

def start_mqtt():

    global mqtt_started

    with lifecycle_lock:

        if mqtt_started:

            logger.warning(
                "MQTT client is already running"
            )

            return

        mqtt_started = True

        try:

            mqtt_client.connect_async(
                BROKER,
                PORT,
                KEEPALIVE
            )

            mqtt_client.loop_start()

            logger.info("MQTT client started")

        except Exception:

            mqtt_started = False

            logger.exception(
                "Failed to start MQTT client"
            )

            raise


def stop_mqtt():

    global mqtt_started

    with lifecycle_lock:

        if not mqtt_started:
            return

        mqtt_started = False

        mqtt_client.disconnect()

        mqtt_client.loop_stop()

        mqtt_connected.clear()

        logger.info("MQTT client stopped")


# --------------------------------------------------
# Telemetry access functions
# --------------------------------------------------

def get_latest_readings():

    with data_lock:

        return dict(latest_readings)


def get_reading_history():

    with data_lock:

        return list(reading_history)


# --------------------------------------------------
# Alert access functions
# --------------------------------------------------

def get_alert_history():

    with data_lock:

        return list(alert_history)
