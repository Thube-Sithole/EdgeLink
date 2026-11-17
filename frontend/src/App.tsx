
import {
  Activity,
  LayoutDashboard,
  Radio,
  Factory,
  Bell,
  Settings,
  Search,
  Wifi,
  Zap,
} from "lucide-react";

import "./App.css";
import { useTelemetry } from "./hooks/useTelemetry";

function App() {
  const { latest, history, connected } = useTelemetry();

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>

          <div>
            <h2>EdgeLink</h2>
            <span>INDUSTRIAL INTELLIGENCE</span>
          </div>
        </div>

        <div className="nav-section">
          <p className="nav-label">WORKSPACE</p>

          <a className="nav-item active" href="#">
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </a>

          <a className="nav-item" href="#">
            <Activity size={19} />
            <span>Telemetry</span>
          </a>

          <a className="nav-item" href="#">
            <Factory size={19} />
            <span>Equipment</span>
          </a>

          <a className="nav-item" href="#">
            <Bell size={19} />
            <span>Alerts</span>
          </a>

          <a className="nav-item" href="#">
            <Radio size={19} />
            <span>Communications</span>
          </a>
        </div>

        <div className="sidebar-bottom">
          <a className="nav-item" href="#">
            <Settings size={19} />
            <span>Settings</span>
          </a>

          <div className="system-status">
            <span className="status-dot" />
            <span>System operational</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <p className="breadcrumb">WORKSPACE / OVERVIEW</p>
            <h1>Industrial Overview</h1>
          </div>

          <div className="topbar-actions">
            <div className="connection-status">
              <Wifi size={16} />

              <span>
                {connected
                  ? "WebSocket connected"
                  : "Connecting..."}
              </span>
            </div>

            <button className="icon-button" aria-label="Search">
              <Search size={19} />
            </button>

            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
          </div>
        </header>

        {/* WELCOME SECTION */}
        <section className="welcome-section">
          <div>
            <p className="eyebrow">
              INDUSTRIAL MONITORING PLATFORM
            </p>

            <h2>Operations at a glance.</h2>

            <p>
              Monitor equipment, analyse telemetry and track system health.
            </p>
          </div>

          <div className="live-indicator">
            <span className="status-dot" />
            LIVE MONITORING
          </div>
        </section>

        {/* OVERVIEW CARDS */}
        <section className="overview-grid">

          {/* Connected Machines */}
          <div className="overview-card">
            <div className="card-icon cyan">
              <Factory size={21} />
            </div>

            <p>Connected machines</p>

            <h3>01 <span>/ 01</span></h3>

            <small>All registered equipment online</small>
          </div>

          {/* Telemetry Status */}
          <div className="overview-card">
            <div className="card-icon violet">
              <Activity size={21} />
            </div>

            <p>Telemetry status</p>

            <h3>
              {connected && latest ? "LIVE" : "WAITING"}
            </h3>

            <small>
              {latest
                ? `Receiving data from ${latest.machine_id}`
                : "Waiting for sensor transmission"}
            </small>
          </div>

          {/* Communication */}
          <div className="overview-card">
            <div className="card-icon lime">
              <Wifi size={21} />
            </div>

            <p>Communication</p>

            <h3>MQTT</h3>

            <small>Industrial messaging protocol</small>
          </div>

          {/* Active Alerts */}
          <div className="overview-card">
            <div className="card-icon amber">
              <Zap size={21} />
            </div>

            <p>Active alerts</p>

            <h3>00</h3>

            <small>No alerts registered yet</small>
          </div>

        </section>

        {/* LIVE TELEMETRY */}
        <section className="content-placeholder telemetry-live">

          <div>
            <h3>Live machine telemetry</h3>

            {latest ? (
              <>
                <p>Machine: {latest.machine_id}</p>

                <div className="live-readings">

                  <div>
                    <span>Temperature</span>
                    <strong>
                      {latest.temperature.toFixed(2)} °C
                    </strong>
                  </div>

                  <div>
                    <span>Pressure</span>
                    <strong>
                      {latest.pressure.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Vibration</span>
                    <strong>
                      {latest.vibration.toFixed(2)}
                    </strong>
                  </div>

                </div>

                <p className="last-updated">
                  Last reading:{" "}
                  {new Date(latest.timestamp).toLocaleTimeString()}
                  {" · "}
                  {history.length} readings received
                </p>
              </>
            ) : (
              <p>
                {connected
                  ? "Connected. Waiting for sensor data..."
                  : "Waiting for WebSocket connection..."}
              </p>
            )}
          </div>

          <Activity size={36} />

        </section>

      </main>
    </div>
  );
}

export default App;
