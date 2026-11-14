import json
import threading
from collections import deque

import paho.mqtt.client as mqtt


BROKER = "localhost"
PORT = 1883

TOPIC = "edgelink/factory-01/machine-01/telemetry"

latest_readings = {}
reading_history = deque(maxlen=100)

data_lock = threading.Lock()


def on_connect(client, userdata, flags, reason_code, properties):
    print(f"MQTT connected: {reason_code}")

    client.subscribe(TOPIC, qos=1)

    print(f"Subscribed to {TOPIC}")


def on_message(client, userdata, message):
    try:
        reading = json.loads(message.payload.decode("utf-8"))

        with data_lock:
            latest_readings[reading["machine_id"]] = reading
            reading_history.append(reading)

        print(f"Telemetry received: {reading}")

    except (json.JSONDecodeError, KeyError) as error:
        print(f"Invalid telemetry message: {error}")


mqtt_client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="edgelink-fastapi"
)

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message


def start_mqtt():
    mqtt_client.connect(BROKER, PORT, 60)
    mqtt_client.loop_start()


def stop_mqtt():
    mqtt_client.loop_stop()
    mqtt_client.disconnect()


def get_latest_readings():
    with data_lock:
        return dict(latest_readings)


def get_reading_history():
    with data_lock:
        return list(reading_history)