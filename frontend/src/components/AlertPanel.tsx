
import { AlertTriangle, AlertCircle, Clock } from "lucide-react";
import type { EquipmentAlert } from "../types/telemetry";

interface AlertPanelProps {
  alerts: EquipmentAlert[];
}

function AlertPanel({ alerts }: AlertPanelProps) {
  return (
    <section className="alert-panel">
      <div className="section-heading">
        <div>
          <h2>Equipment Alerts</h2>
          <p>Recent equipment threshold events</p>
        </div>

        <span className="alert-total">
          {alerts.length} EVENTS
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-alerts">
          <AlertCircle size={28} />
          <p>No equipment alerts recorded.</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert, index) => (
            <article
              className={`alert-item ${alert.severity}`}
              key={`${alert.machine_id}-${alert.metric}-${alert.timestamp}-${index}`}
            >
              <div className="alert-icon">
                <AlertTriangle size={20} />
              </div>

              <div className="alert-details">
                <div className="alert-title-row">
                  <h3>
                    {alert.metric.charAt(0).toUpperCase() +
                      alert.metric.slice(1)}
                  </h3>

                  <span className={`severity-badge ${alert.severity}`}>
                    {alert.severity}
                  </span>
                </div>

                <p>{alert.message}</p>

                <div className="alert-metadata">
                  <span>{alert.machine_id}</span>
                  <span>
                    {alert.value.toFixed(2)} {alert.unit}
                  </span>
                  <span>Limit: {alert.threshold}</span>
                </div>

                <small>
                  <Clock size={13} />
                  {new Date(alert.timestamp).toLocaleString()}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AlertPanel;
