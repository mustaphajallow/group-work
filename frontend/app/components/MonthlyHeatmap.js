"use client";

export default function MonthlyHeatmap({ locationData, month, title = "Location Rainfall Intensity" }) {
  if (!locationData || locationData.length === 0) {
    return (
      <div className="chart-shell">
        <div className="panel-head">
          <h2>{title}</h2>
          <p className="panel-subtitle">Top 16 locations for {month}</p>
        </div>
        <div style={{ height: "320px", display: "grid", placeItems: "center", color: "var(--muted)" }}>
          No location data available
        </div>
      </div>
    );
  }

  const topLocations = locationData.slice(0, 16);
  const maxRainfall = Math.max(...topLocations.map((loc) => Number(loc.total_rainfall_mm)));
  const minRainfall = Math.min(...topLocations.map((loc) => Number(loc.total_rainfall_mm)));
  const range = Math.max(maxRainfall - minRainfall, 1);

  const getHeatColor = (value) => {
    const normalized = (value - minRainfall) / range;
    if (normalized > 0.75) return "#fbbf24"; // Amber
    if (normalized > 0.5) return "#20c7d9"; // Cyan
    if (normalized > 0.25) return "#22c55e"; // Green
    return "#38bdf8"; // Blue
  };

  return (
    <div className="chart-shell">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <p className="panel-subtitle">Top 16 locations for {month}</p>
        </div>
      </div>
      <div className="heatmap-grid">
        {topLocations.map((location, index) => {
          const value = Number(location.total_rainfall_mm);
          const color = getHeatColor(value);

          return (
            <div
              key={`${location.latitude}-${location.longitude}`}
              className="heatmap-cell"
              style={{
                backgroundColor: color,
                opacity: 0.8 + (value - minRainfall) / range * 0.2,
              }}
              title={`Lat ${location.latitude}, Lon ${location.longitude}\n${value.toFixed(1)} mm`}
            >
              <span className="heatmap-index">{index + 1}</span>
              <span className="heatmap-value">{value.toFixed(0)}</span>
              <span className="heatmap-coord">
                {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="heatmap-legend">
        <div className="heatmap-legend-item">
          <span className="heatmap-legend-block" style={{ backgroundColor: "#38bdf8" }} />
          <span>Low ({minRainfall.toFixed(0)} mm)</span>
        </div>
        <div className="heatmap-legend-item">
          <span className="heatmap-legend-block" style={{ backgroundColor: "#22c55e" }} />
          <span>Moderate</span>
        </div>
        <div className="heatmap-legend-item">
          <span className="heatmap-legend-block" style={{ backgroundColor: "#20c7d9" }} />
          <span>High</span>
        </div>
        <div className="heatmap-legend-item">
          <span className="heatmap-legend-block" style={{ backgroundColor: "#fbbf24" }} />
          <span>Peak ({maxRainfall.toFixed(0)} mm)</span>
        </div>
      </div>
    </div>
  );
}
