
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

export type AlertSeverity = "warning" | "critical";

export interface EquipmentAlert {
  machine_id: string;
  metric: string;
  value: number;
  unit: string;
  severity: AlertSeverity;
  threshold: string;
  message: string;
  timestamp: string;
}
