
from datetime import datetime, timezone
from typing import Any


# Demonstration thresholds — not certified industrial safety limits.
THRESHOLDS = {
    "temperature": {
        "warning": {"max": 85.0},
        "critical": {"max": 92.0},
        "unit": "°C",
    },
    "pressure": {
        "warning": {"min": 95.0, "max": 115.0},
        "critical": {"min": 92.0, "max": 118.0},
        "unit": "kPa",
    },
    "vibration": {
        "warning": {"max": 8.0},
        "critical": {"max": 9.5},
        "unit": "units",
    },
}


def evaluate_reading(reading: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Evaluate one telemetry reading against configured thresholds.

    Returns a list containing any generated alerts.
    """

    alerts = []

    machine_id = reading["machine_id"]
    timestamp = reading.get("timestamp")

    if isinstance(timestamp, datetime):
        timestamp = timestamp.isoformat()

    if timestamp is None:
        timestamp = datetime.now(timezone.utc).isoformat()

    for metric, config in THRESHOLDS.items():
        value = reading.get(metric)

        if value is None:
            continue

        severity = None
        threshold_description = None

        critical = config["critical"]
        warning = config["warning"]

        # Check critical limits first.
        if "max" in critical and value >= critical["max"]:
            severity = "critical"
            threshold_description = f">= {critical['max']}"

        elif "min" in critical and value <= critical["min"]:
            severity = "critical"
            threshold_description = f"<= {critical['min']}"

        # Then check warning limits.
        elif "max" in warning and value >= warning["max"]:
            severity = "warning"
            threshold_description = f">= {warning['max']}"

        elif "min" in warning and value <= warning["min"]:
            severity = "warning"
            threshold_description = f"<= {warning['min']}"

        if severity is None:
            continue

        unit = config["unit"]

        alerts.append({
            "machine_id": machine_id,
            "metric": metric,
            "value": value,
            "unit": unit,
            "severity": severity,
            "threshold": threshold_description,
            "message": (
                f"{metric.capitalize()} is {severity}: "
                f"{value} {unit} (limit {threshold_description})"
            ),
            "timestamp": timestamp,
        })

    return alerts
