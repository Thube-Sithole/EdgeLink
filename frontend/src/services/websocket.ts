
import type { TelemetryReading } from "../types/telemetry";

// Local development fallback.
// In production, VITE_API_URL will point to the deployed FastAPI backend.
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Convert HTTP/HTTPS into the corresponding WebSocket protocol.
const WS_URL = `${API_URL.replace(/^http/, "ws").replace(/\/$/, "")}/ws/telemetry`;

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
