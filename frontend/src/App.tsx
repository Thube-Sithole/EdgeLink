
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
  Thermometer,
  Gauge,
} from "lucide-react";

import "./App.css";

import { useTelemetry } from "./hooks/useTelemetry";
import { useAnalytics } from "./hooks/useAnalytics";
import { useAlerts } from "./hooks/useAlerts";

import TelemetryChart from "./components/TelemetryChart";
import MetricCard from "./components/MetricCard";
import AlertPanel from "./components/AlertPanel";


function App() {

  // ==========================================
  // TELEMETRY
  // ==========================================

  const {
    latest,
    history,
    connected,
  } = useTelemetry();


  // ==========================================
  // EQUIPMENT ANALYTICS
  // ==========================================

  const temperature = useAnalytics(history, "temperature");

  const pressure = useAnalytics(history, "pressure");

  const vibration = useAnalytics(history, "vibration");


  // ==========================================
  // EQUIPMENT ALERTS
  // ==========================================

  const {
    alerts,
    criticalCount,
    warningCount,
    totalCount,
  } = useAlerts();


  return (

    <div className="dashboard">

      {/* ======================================
          SIDEBAR
      ====================================== */}

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

          <a className="nav-item" href="#equipment-alerts">
            <Bell size={19} />
            <span>Alerts</span>

            {totalCount > 0 && (
              <span className="nav-alert-count">
                {totalCount}
              </span>
            )}

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


      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">


        {/* ======================================
            HEADER
        ====================================== */}

        <header className="topbar">

          <div>
            <p className="breadcrumb">
              WORKSPACE / OVERVIEW
            </p>

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


            <button
              className="icon-button"
              aria-label="Search"
            >
              <Search size={19} />
            </button>


            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => {
                document
                  .getElementById("equipment-alerts")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Bell size={19} />

              {totalCount > 0 && (
                <span className="notification-indicator" />
              )}

            </button>

          </div>

        </header>



        {/* ======================================
            WELCOME SECTION
        ====================================== */}

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



        {/* ======================================
            OVERVIEW CARDS
        ====================================== */}

        <section className="overview-grid">


          {/* CONNECTED MACHINES */}

          <div className="overview-card">

            <div className="card-icon cyan">
              <Factory size={21} />
            </div>

            <p>Connected machines</p>

            <h3>
              01 <span>/ 01</span>
            </h3>

            <small>
              All registered equipment online
            </small>

          </div>



          {/* TELEMETRY STATUS */}

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



          {/* COMMUNICATION */}

          <div className="overview-card">

            <div className="card-icon lime">
              <Wifi size={21} />
            </div>

            <p>Communication</p>

            <h3>MQTT</h3>

            <small>
              Industrial messaging protocol
            </small>

          </div>



          {/* RECORDED ALERTS */}

          <div className="overview-card">

            <div className="card-icon amber">
              <Zap size={21} />
            </div>

            <p>Recorded alerts</p>

            <h3>
              {totalCount.toString().padStart(2, "0")}
            </h3>

            <small>
              {criticalCount} critical · {warningCount} warnings
            </small>

          </div>


        </section>



        {/* ======================================
            EQUIPMENT ALERTS
        ====================================== */}

        <div id="equipment-alerts">
          <AlertPanel alerts={alerts} />
        </div>



        {/* ======================================
            EQUIPMENT PERFORMANCE
        ====================================== */}

        <section className="analytics-section">

          <div className="section-heading">

            <div>
              <h2>Equipment Performance</h2>

              <p>
                Live sensor metrics and statistical analysis
              </p>
            </div>

          </div>


          <div className="metric-grid">


            {/* TEMPERATURE */}

            <MetricCard
              title="Temperature"
              value={temperature.current}
              unit="°C"
              minimum={temperature.minimum}
              maximum={temperature.maximum}
              average={temperature.average}
              trend={temperature.trend}
              color="#00D4FF"
              icon={<Thermometer size={22} />}
            />


            {/* PRESSURE */}

            <MetricCard
              title="Pressure"
              value={pressure.current}
              unit="kPa"
              minimum={pressure.minimum}
              maximum={pressure.maximum}
              average={pressure.average}
              trend={pressure.trend}
              color="#A855F7"
              icon={<Gauge size={22} />}
            />


            {/* VIBRATION */}

            <MetricCard
              title="Vibration"
              value={vibration.current}
              unit="units"
              minimum={vibration.minimum}
              maximum={vibration.maximum}
              average={vibration.average}
              trend={vibration.trend}
              color="#A3E635"
              icon={<Activity size={22} />}
            />


          </div>

        </section>



        {/* ======================================
            LIVE MACHINE TELEMETRY
        ====================================== */}

        <section className="content-placeholder telemetry-live">

          <div>

            <h3>Live machine telemetry</h3>


            {latest ? (

              <>

                <p>
                  Machine: {latest.machine_id}
                </p>


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
                      {latest.pressure.toFixed(2)} kPa
                    </strong>
                  </div>


                  <div>
                    <span>Vibration</span>

                    <strong>
                      {latest.vibration.toFixed(2)} units
                    </strong>
                  </div>


                </div>


                <p className="last-updated">

                  Last reading:{" "}

                  {new Date(
                    latest.timestamp
                  ).toLocaleTimeString()}

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



        {/* ======================================
            SENSOR ANALYTICS
        ====================================== */}

        <section className="analytics-section">

          <div className="section-heading">

            <div>
              <h2>Sensor Analytics</h2>

              <p>
                Real-time industrial telemetry trends
              </p>
            </div>


            <div className="live-indicator">
              <span className="status-dot" />
              LIVE DATA
            </div>

          </div>


          <div className="chart-grid">


            <TelemetryChart
              title="Temperature"
              dataKey="temperature"
              color="#00D4FF"
              unit="°C"
              readings={history}
            />


            <TelemetryChart
              title="Pressure"
              dataKey="pressure"
              color="#A855F7"
              unit="kPa"
              readings={history}
            />


            <TelemetryChart
              title="Vibration"
              dataKey="vibration"
              color="#A3E635"
              unit="units"
              readings={history}
            />


          </div>

        </section>


      </main>

    </div>

  );

}

export default App;
