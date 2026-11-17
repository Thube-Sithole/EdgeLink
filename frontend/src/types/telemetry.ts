
export interface TelemetryReading {
  machine_id: string;
  temperature: number;
  pressure: number;
  vibration: number;
  timestamp: string;
}

export interface TelemetryState {
  latest: TelemetryReading | null;
  history: TelemetryReading[];
  connected: boolean;
}
