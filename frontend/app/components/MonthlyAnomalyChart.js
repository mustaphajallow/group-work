"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function MonthlyAnomalyChart({ series, title = "Rainfall Anomaly" }) {
  if (!series || series.length === 0) {
    return (
      <div className="chart-shell">
        <div className="panel-head">
          <h2>{title}</h2>
          <p className="panel-subtitle">Month-over-month deviation</p>
        </div>
        <div style={{ height: "280px", display: "grid", placeItems: "center", color: "var(--muted)" }}>
          No anomaly data available
        </div>
      </div>
    );
  }

  const avgRainfall = series.reduce((sum, s) => sum + Number(s.total_rainfall_mm), 0) / series.length;

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const chartData = series.slice(-12).map((point) => {
    const [year, month] = point.month.split("-").map(Number);
    const monthLabel = `${monthNames[month - 1]} ${year}`;
    const anomaly = point.total_rainfall_mm - avgRainfall;
    return {
      month: monthLabel,
      anomaly: anomaly,
      actual: point.total_rainfall_mm,
      fullMonth: point.month
    };
  });

  const getBarColor = (value) => {
    return value > 0 ? "#ef4444" : "#3b82f6";
  };

  return (
    <div className="chart-shell">
      <div className="panel-head">
        <h2>{title}</h2>
        <p className="panel-subtitle">Month-over-month deviation from {avgRainfall.toFixed(1)}mm average</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`${value.toFixed(1)}mm`, "Anomaly"]}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="anomaly" fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.anomaly)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="anomaly-legend">
        <span className="anomaly-legend-item">
          <span className="anomaly-legend-dot positive" /> Above average
        </span>
        <span className="anomaly-legend-item">
          <span className="anomaly-legend-dot negative" /> Below average
        </span>
      </div>
    </div>
  );
}