
import { useEffect, useState } from "react";
import type { EquipmentAlert } from "../types/telemetry";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const WS_URL = `${API_URL.replace(/^http/, "ws").replace(/\/$/, "")}/ws/alerts`;

const ALERT_LIMIT = 100;

interface AlertsResponse {
  alerts?: EquipmentAlert[];
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<EquipmentAlert[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${API_URL}/alerts`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: EquipmentAlert[] | AlertsResponse =
          await response.json();

        const initialAlerts = Array.isArray(data)
          ? data
          : data.alerts ?? [];

        if (!disposed) {
          setAlerts(initialAlerts.slice(-ALERT_LIMIT).reverse());
        }
      } catch (error) {
        console.error("Failed to fetch alert history:", error);
      }
    };

    const connect = () => {
      if (disposed) return;

      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log("EdgeLink alerts WebSocket connected");
        setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const alert: EquipmentAlert = JSON.parse(event.data);

          setAlerts((previous) =>
            [alert, ...previous].slice(0, ALERT_LIMIT)
          );
        } catch (error) {
          console.error("Invalid alert message:", error);
        }
      };

      socket.onclose = () => {
        setConnected(false);

        if (!disposed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (error) => {
        console.error("EdgeLink alerts WebSocket error:", error);
        socket?.close();
      };
    };

    void fetchAlerts();
    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "critical"
  ).length;

  const warningCount = alerts.filter(
    (alert) => alert.severity === "warning"
  ).length;

  return {
    alerts,
    connected,
    criticalCount,
    warningCount,
    totalCount: alerts.length,
  };
}
