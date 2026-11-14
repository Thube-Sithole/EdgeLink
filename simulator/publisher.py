import json
import time
import random
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

TOPIC = "edgelink/factory-01/machine-01/telemetry"

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="edgelink-sensor-01"
)

client.connect(BROKER, PORT, 60)
client.loop_start()

try:
    while True:
        telemetry = {
            "machine_id": "machine-01",
            "temperature": round(random.uniform(60, 95), 2),
            "pressure": round(random.uniform(90, 120), 2),
            "vibration": round(random.uniform(1, 10), 2),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        message = json.dumps(telemetry)

        result = client.publish(TOPIC, message, qos=1)

        print(f"Published: {message}")

        result.wait_for_publish()
        time.sleep(2)

except KeyboardInterrupt:
    print("Sensor simulator stopped.")

finally:
    client.loop_stop()
    client.disconnect()