
import { useMemo } from "react";
import type { TelemetryReading } from "../types/telemetry";

type MetricKey = "temperature" | "pressure" | "vibration";
type Trend = "rising" | "falling" | "stable";

interface MetricAnalytics {
  current: number | null;
  minimum: number | null;
  maximum: number | null;
  average: number | null;
  trend: Trend;
}

export function useAnalytics(
  readings: TelemetryReading[],
  metric: MetricKey
): MetricAnalytics {
  return useMemo(() => {
    if (readings.length === 0) {
      return {
        current: null,
        minimum: null,
        maximum: null,
        average: null,
        trend: "stable",
      };
    }

    const values = readings.map((reading) => reading[metric]);

    const current = values[values.length - 1];
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const average =
      values.reduce((total, value) => total + value, 0) /
      values.length;

    // Compare two consecutive windows of five readings.
    const windowSize = 5;

    let trend: Trend = "stable";

    if (values.length >= windowSize * 2) {
      const recentWindow = values.slice(-windowSize);
      const previousWindow = values.slice(
        -(windowSize * 2),
        -windowSize
      );

      const recentAverage =
        recentWindow.reduce((sum, value) => sum + value, 0) /
        windowSize;

      const previousAverage =
        previousWindow.reduce((sum, value) => sum + value, 0) /
        windowSize;

      const difference = recentAverage - previousAverage;

      // Relative tolerance of 1% of the previous average.
      const tolerance = Math.abs(previousAverage) * 0.01;

      if (difference > tolerance) {
        trend = "rising";
      } else if (difference < -tolerance) {
        trend = "falling";
      }
    }

    return {
      current,
      minimum,
      maximum,
      average,
      trend,
    };
  }, [readings, metric]);
}
