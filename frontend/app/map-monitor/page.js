"use client";

import dynamic from "next/dynamic";

import DashboardShell from "../components/DashboardShell";
import { useDashboardData, useDerivedMetrics } from "../components/dashboardData";

const RainfallMap = dynamic(() => import("../components/RainfallMap"), {
  ssr: false,
});

export default function MapMonitorPage() {
  const {
    summary,
    rows,
    mapData,
    selectedDate,
    setSelectedDate,
    status,
    error,
    mapError,
  } = useDashboardData();

  const { latestRange, alertLocations, heavyRainLocations } =
    useDerivedMetrics(rows, summary, selectedDate, mapData);

  return (
    <DashboardShell
      activePath="/map-monitor"
      eyebrow="Map Monitor"
      title="Dedicated geospatial monitoring for rainfall hotspots."
      statusText={error || mapError || status}
      summary={summary}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      latestRange={latestRange}
    >
      <section className="main-grid">
        <article className="panel panel-map">
          <div className="panel-head">
            <div>
              <h2>Full Map Monitor</h2>
              <p className="panel-subtitle">Live selected-day map with rainfall hotspot tracking</p>
            </div>
            <div className="legend-row">
              <span className="legend-chip low">Low</span>
              <span className="legend-chip medium">Moderate</span>
              <span className="legend-chip high">Heavy</span>
            </div>
          </div>
          <RainfallMap points={mapData.points} mapDate={mapData.date} />
        </article>

        <article className="panel panel-alerts">
          <div className="panel-head">
            <div>
              <h2>Map Alerts</h2>
              <p className="panel-subtitle">{heavyRainLocations} heavy-rain locations flagged</p>
            </div>
          </div>
          <div className="alert-stack">
            {alertLocations.map((row, index) => (
              <article className="alert-card" key={`${row.date}-${row.latitude}-${row.longitude}-monitor`}>
                <div className="alert-topline">
                  <span className="alert-age">Monitor {index + 1}</span>
                  <span className={`alert-badge ${Number(row.rainfall_mm) >= 20 ? "critical" : "warning"}`}>
                    {Number(row.rainfall_mm) >= 20 ? "Heavy" : "Watch"}
                  </span>
                </div>
                <p className="alert-title">{Number(row.rainfall_mm).toFixed(2)} mm</p>
                <p className="alert-location">Lat {row.latitude}, Lon {row.longitude}</p>
                <div className="alert-actions">
                  <span className="ghost-action">{row.date}</span>
                  <span className="ghost-action">Inspect</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
