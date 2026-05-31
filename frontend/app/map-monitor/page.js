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
  const spatialRows = rows.filter(
    (row) => Number.isFinite(row?.latitude) && Number.isFinite(row?.longitude)
  );
  const spatialAlerts = alertLocations.filter(
    (row) => Number.isFinite(row?.latitude) && Number.isFinite(row?.longitude)
  );
  const hasSpatialData = spatialRows.length > 0;

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
              <p className="panel-subtitle">
                {hasSpatialData
                  ? "Live selected-day map with rainfall hotspot tracking"
                  : "Current dataset has no coordinate fields for geospatial monitoring"}
              </p>
            </div>
            {hasSpatialData ? (
              <div className="legend-row">
                <span className="legend-chip low">Low</span>
                <span className="legend-chip medium">Moderate</span>
                <span className="legend-chip high">Heavy</span>
              </div>
            ) : null}
          </div>
          <RainfallMap points={mapData.points} mapDate={mapData.date} />
        </article>

        <article className="panel panel-alerts">
          <div className="panel-head">
            <div>
              <h2>Map Alerts</h2>
              <p className="panel-subtitle">
                {hasSpatialData
                  ? `${heavyRainLocations} heavy-rain locations flagged`
                  : "Coordinate-based alerting is disabled for this dataset"}
              </p>
            </div>
          </div>
          {hasSpatialData ? (
            <div className="alert-stack">
              {spatialAlerts.map((row, index) => (
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
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
              Coordinate-driven hotspot alerts need latitude and longitude columns. The current dataset can still drive
              time-series charts, summaries, and forecasts.
            </div>
          )}
        </article>
      </section>
    </DashboardShell>
  );
}
