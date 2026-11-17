
import { useEffect, useState } from "react";
import type {
  TelemetryReading,
  TelemetryState
} from "../types/telemetry";

import { connectTelemetry } from "../services/websocket";

const HISTORY_LIMIT = 30;

export function useTelemetry() {
  const [state, setState] = useState<TelemetryState>({
    latest: null,
    history: [],
    connected: false,
  });

  useEffect(() => {
    const socket = connectTelemetry(
      (reading: TelemetryReading) => {
        setState((previous) => ({
          ...previous,
          latest: reading,
          history: [
            ...previous.history,
            reading
          ].slice(-HISTORY_LIMIT),
        }));
      },

      (connected) => {
        setState((previous) => ({
          ...previous,
          connected,
        }));
      }
    );

    return () => {
      socket.close();
    };
  }, []);

  return state;
}
