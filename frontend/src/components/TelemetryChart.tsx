
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { TelemetryReading } from "../types/telemetry";

interface TelemetryChartProps {
  title: string;
  dataKey: "temperature" | "pressure" | "vibration";
  color: string;
  unit: string;
  readings: TelemetryReading[];
}

function TelemetryChart({
  title,
  dataKey,
  color,
  unit,
  readings,
}: TelemetryChartProps) {

  const chartData = readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    ),
    value: reading[dataKey],
  }));

  return (
    <div className="chart-card">

      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          <p>Live sensor readings</p>
        </div>

        <span
          className="chart-indicator"
          style={{ backgroundColor: color }}
        />
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 12,
            left: -15,
            bottom: 0,
          }}
        >

          <CartesianGrid
            stroke="#263149"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            stroke="#8793aa"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            minTickGap={25}
          />

          <YAxis
            stroke="#8793aa"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={45}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#171e30",
              border: "1px solid #35415a",
              borderRadius: "8px",
              color: "#edf2ff",
            }}
            formatter={(value) => [
              `${value} ${unit}`,
              title,
            ]}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              stroke: color,
              strokeWidth: 2,
              fill: "#111725",
            }}
            isAnimationActive={false}
          />

        </LineChart>
      </ResponsiveContainer>

      <div className="chart-footer">
        <span>{readings.length} data points</span>
        <span>Last 30 readings</span>
      </div>

    </div>
  );
}

export default TelemetryChart;
