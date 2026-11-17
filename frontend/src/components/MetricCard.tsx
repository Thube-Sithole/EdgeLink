
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

import type { ReactNode } from "react";

type Trend = "rising" | "falling" | "stable";

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  minimum: number | null;
  maximum: number | null;
  average: number | null;
  trend: Trend;
  color: string;
  icon: ReactNode;
  precision?: number;
}

function MetricCard({
  title,
  value,
  unit,
  minimum,
  maximum,
  average,
  trend,
  color,
  icon,
  precision = 2,
}: MetricCardProps) {

  const formatValue = (number: number | null) =>
    number === null ? "--" : number.toFixed(precision);

  const TrendIcon =
    trend === "rising"
      ? TrendingUp
      : trend === "falling"
        ? TrendingDown
        : Minus;

  return (
    <div className="metric-card">

      <div className="metric-card-header">
        <div className="metric-icon" style={{ color }}>
          {icon}
        </div>

        <div className={`trend-indicator ${trend}`}>
          <TrendIcon size={16} />
          <span>{trend}</span>
        </div>
      </div>

      <p className="metric-title">{title}</p>

      <div className="metric-current">
        <strong style={{ color }}>
          {formatValue(value)}
        </strong>
        <span>{unit}</span>
      </div>

      <div className="metric-statistics">

        <div>
          <span>MIN</span>
          <strong>{formatValue(minimum)}</strong>
        </div>

        <div>
          <span>AVG</span>
          <strong>{formatValue(average)}</strong>
        </div>

        <div>
          <span>MAX</span>
          <strong>{formatValue(maximum)}</strong>
        </div>

      </div>

      <div className="metric-card-footer">
        <Activity size={13} />
        <span>Session analytics</span>
      </div>

    </div>
  );
}

export default MetricCard;
