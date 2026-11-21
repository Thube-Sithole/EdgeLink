
import json
import time
import random
import os
import ssl
import logging

from datetime import datetime, timezone

import paho.mqtt.client as mqtt


# --------------------------------------------------
# Configuration
# --------------------------------------------------

BROKER = os.getenv("MQTT_BROKER_HOST", "localhost")

PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))

USERNAME = os.getenv("MQTT_USERNAME")

PASSWORD = os.getenv("MQTT_PASSWORD")

USE_TLS = os.getenv("MQTT_USE_TLS", "false").lower() == "true"

TOPIC = os.getenv(
    "MQTT_TOPIC",
    "edgelink/factory-01/machine-01/telemetry"
)

KEEPALIVE = 60

PUBLISH_INTERVAL = 2


# --------------------------------------------------
# Logging
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger("edgelink.simulator")


# --------------------------------------------------
# MQTT Client
# --------------------------------------------------

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="edgelink-sensor-01"
)


if USERNAME and PASSWORD:

    client.username_pw_set(
        USERNAME,
        PASSWORD
    )


if USE_TLS:

    client.tls_set(
        cert_reqs=ssl.CERT_REQUIRED,
        tls_version=ssl.PROTOCOL_TLS_CLIENT
    )


# --------------------------------------------------
# MQTT Callbacks
# --------------------------------------------------

def on_connect(client, userdata, flags, reason_code, properties):

    if reason_code == 0:

        logger.info("Connected to MQTT broker: %s", BROKER)

    else:

        logger.error(
            "MQTT connection failed: %s",
            reason_code
        )


def on_disconnect(client, userdata, disconnect_flags, reason_code, properties):

    if reason_code != 0:

        logger.warning(
            "Unexpected MQTT disconnection: %s",
            reason_code
        )


client.on_connect = on_connect

client.on_disconnect = on_disconnect


# --------------------------------------------------
# Connect to Broker
# --------------------------------------------------

logger.info("Connecting to MQTT broker...")

client.connect(
    BROKER,
    PORT,
    KEEPALIVE
)

client.loop_start()


# --------------------------------------------------
# Telemetry Publishing
# --------------------------------------------------

try:

    while True:

        telemetry = {

            "machine_id": "machine-01",

            "temperature": round(
                random.uniform(60, 95),
                2
            ),

            "pressure": round(
                random.uniform(90, 120),
                2
            ),

            "vibration": round(
                random.uniform(1, 10),
                2
            ),

            "timestamp": datetime.now(
                timezone.utc
            ).isoformat()

        }

        message = json.dumps(telemetry)

        result = client.publish(
            TOPIC,
            message,
            qos=1
        )

        result.wait_for_publish()

        if result.rc == mqtt.MQTT_ERR_SUCCESS:

            logger.info(
                "Telemetry published | Temperature: %.2f | Pressure: %.2f | Vibration: %.2f",
                telemetry["temperature"],
                telemetry["pressure"],
                telemetry["vibration"]
            )

        else:

            logger.error(
                "Failed to publish telemetry: %s",
                result.rc
            )

        time.sleep(PUBLISH_INTERVAL)


except KeyboardInterrupt:

    logger.info("Sensor simulator stopped.")


finally:

    client.loop_stop()

    client.disconnect()

    logger.info("MQTT connection closed.")
