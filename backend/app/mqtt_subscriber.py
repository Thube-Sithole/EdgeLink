import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

TOPIC = "edgelink/factory-01/machine-01/telemetry"


def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected to MQTT broker: {reason_code}")

    client.subscribe(TOPIC, qos=1)

    print(f"Subscribed to: {TOPIC}")


def on_message(client, userdata, message):
    payload = message.payload.decode("utf-8")

    print(f"Received topic: {message.topic}")
    print(f"Received payload: {payload}")
    print("-" * 60)


client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION2,
    client_id="edgelink-backend-01"
)

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)

print("Listening for incoming telemetry...")

client.loop_forever()