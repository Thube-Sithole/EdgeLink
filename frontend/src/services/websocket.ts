
import type { TelemetryReading } from "../types/telemetry";

const WS_URL = "ws://127.0.0.1:8000/ws/telemetry";

export function connectTelemetry(
  onMessage: (reading: TelemetryReading) => void,
  onStatusChange: (connected: boolean) => void
): WebSocket {

  console.log("Connecting to EdgeLink:", WS_URL);

  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("EdgeLink WebSocket connected");
    onStatusChange(true);
  };

  socket.onmessage = (event) => {
    try {
      const reading: TelemetryReading = JSON.parse(event.data);
      console.log("Telemetry received:", reading);
      onMessage(reading);
    } catch (error) {
      console.error("Invalid telemetry message:", error);
    }
  };

  socket.onclose = (event) => {
    console.log(
      "WebSocket closed:",
      event.code,
      event.reason
    );
    onStatusChange(false);
  };

  socket.onerror = (event) => {
    console.error("EdgeLink WebSocket error:", event);
  };

  return socket;
}
