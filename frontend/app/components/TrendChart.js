"use client";

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TrendChart({
  series,
  metric,
  title,
  subtitle = "Last 30 entries",
  stroke = "#22c55e",
  fill = "#22c55e",
  windowSize = 30,
}) {
  const latest = series.slice(-windowSize);

  if (!latest.length) {
    return (
      <div className="chart-shell">
        <div className="panel-head">
          <div>
            <h2>{title}</h2>
            <p className="panel-subtitle">{subtitle}</p>
          </div>
        </div>
        <div style={{ height: "280px", display: "grid", placeItems: "center", color: "var(--muted)" }}>
          No data available
        </div>
      </div>
    );
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getDisplayDate = (value) => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length === 2) {
      const monthIndex = Number(parts[1]) - 1;
      return monthNames[monthIndex] || value;
    }
    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}`;
    }
    return value;
  };

  const chartData = latest.map((point) => {
    const dateValue = point.date || point.month;
    return {
      date: dateValue,
      displayDate: getDisplayDate(dateValue),
      value: Number(point[metric]),
    };
  });

  return (
    <div className="chart-shell">
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fill} stopOpacity={0.48} />
              <stop offset="95%" stopColor={fill} stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(143, 163, 191, 0.12)" vertical={false} />
          <XAxis
            dataKey="displayDate"
            stroke="var(--muted)"
            style={{ fontSize: "0.75rem" }}
            tick={{ fill: "var(--muted)" }}
            interval={0}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            stroke="var(--muted)"
            style={{ fontSize: "0.75rem" }}
            tick={{ fill: "var(--muted)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
            formatter={(value) => Number(value).toFixed(2)}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={3}
            fill={`url(#gradient-${metric})`}
            isAnimationActive={true}
            animationDuration={1200}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="chart-footer">
        {chartData.slice(-7).map((point) => (
          <div key={`${metric}-${point.date}`} className="chart-pill">
            <span>{point.displayDate}</span>
            <strong>{point.value.toFixed(1)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
