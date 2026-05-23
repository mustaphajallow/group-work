"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { ReactElement } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStatisticsData, usePredictionData, useMonthlyData } from "./components/analysisHooks";
import DashboardShell from "./components/DashboardShell";
import { useDashboardData, useDerivedMetrics } from "./components/dashboardData";

const RainfallMap = dynamic(() => import("./components/RainfallMap"), {
  ssr: false,
});

export default function HomePage(): ReactElement {
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
  const { stats, correlation, regression, seasonal } = useStatisticsData();
  const { forecast, getForecast } = usePredictionData();
  const { monthlySummary, monthlyTrends } = useMonthlyData();

  const {
    averageRainfall,
    maxRainfall,
    minRainfall,
    rainyLocations,
    heavyRainLocations,
    latestRange,
  } = useDerivedMetrics(rows, summary, selectedDate, mapData);

  useEffect(() => {
    void getForecast(6);
    // Preload a lightweight forecast snapshot for the dashboard cards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusText = error || mapError || status;
  const coverageTone = rainyLocations > 0 ? "ok" : "muted";
  const monthlySeries = monthlyTrends?.series ?? [];
  const seasonalRows = Object.entries(seasonal?.seasonal_analysis?.seasonal_data ?? {})
    .map(([key, value]) => ({
      month: `M${key.split("_")[1]}`,
      mean: value.mean,
      median: value.median,
    }))
    .slice(0, 12);
  const peakSeason = [...seasonalRows].sort((a, b) => b.mean - a.mean)[0];

  return (
    <DashboardShell
      activePath="/"
      eyebrow="Rainfall Dashboard"
      title="Comprehensive Rainfall Monitoring & Analysis"
      statusText={statusText}
      summary={summary}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      latestRange={latestRange}
      selectionOptions={summary?.available_dates}
      displayLabel="Display Date"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-2 text-sm font-semibold text-gray-600">Mean Rainfall</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.central_tendency?.mean?.toFixed(1) ?? "-"}</p>
          <p className="mt-2 text-xs text-gray-500">mm across the dataset</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-2 text-sm font-semibold text-gray-600">Median Rainfall</p>
          <p className="text-3xl font-bold text-green-600">{stats?.central_tendency?.median?.toFixed(1) ?? "-"}</p>
          <p className="mt-2 text-xs text-gray-500">mm central value</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-2 text-sm font-semibold text-gray-600">Monthly Periods</p>
          <p className="text-3xl font-bold text-cyan-600">{monthlySummary?.month_count ?? "-"}</p>
          <p className="mt-2 text-xs text-gray-500">months analyzed</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-2 text-sm font-semibold text-gray-600">Next Forecast</p>
          <p className="text-3xl font-bold text-purple-600">
            {forecast?.forecasts?.[0]?.predicted_rainfall_mm?.toFixed(1) ?? "-"}
          </p>
          <p className="mt-2 text-xs text-gray-500">mm predicted ahead</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Central Tendency</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Mean</span><span className="font-semibold">{stats?.central_tendency?.mean?.toFixed(2) ?? "-"} mm</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Median</span><span className="font-semibold">{stats?.central_tendency?.median?.toFixed(2) ?? "-"} mm</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Mode</span><span className="font-semibold">{stats?.central_tendency?.mode?.toFixed(2) ?? "-"} mm</span></div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Dispersion</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Std Dev</span><span className="font-semibold">{stats?.dispersion?.std_dev?.toFixed(2) ?? "-"} mm</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Range</span><span className="font-semibold">{stats?.dispersion?.range?.toFixed(2) ?? "-"} mm</span></div>
            <div className="flex justify-between"><span className="text-gray-600">IQR</span><span className="font-semibold">{stats?.dispersion?.iqr?.toFixed(2) ?? "-"} mm</span></div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Correlation</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pearson r</span>
              <span className="font-semibold">{correlation?.correlation_analysis?.correlation?.toFixed(3) ?? "-"}</span>
            </div>
            <p className="text-gray-600">{correlation?.correlation_analysis?.interpretation ?? "Waiting for analysis results."}</p>
            <p className="text-xs text-gray-500">Sample size: {correlation?.correlation_analysis?.sample_size ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Distribution and Outliers</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded bg-red-50 p-4">
              <p className="text-sm text-gray-600">Outliers</p>
              <p className="text-2xl font-bold text-red-600">{stats?.outliers?.outlier_count ?? 0}</p>
              <p className="text-xs text-gray-500">{stats?.outliers?.percentage?.toFixed(2) ?? "0.00"}% via {stats?.outliers?.method ?? "IQR"}</p>
            </div>
            <div className="rounded bg-slate-50 p-4">
              <p className="text-sm text-gray-600">Skewness</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.distribution?.skewness?.toFixed(3) ?? "-"}</p>
              <p className="text-xs text-gray-500">{stats?.distribution?.interpretation ?? "Distribution pending"}</p>
            </div>
          </div>
          <div className="mt-4 rounded bg-slate-50 p-4 text-sm text-gray-600">
            Kurtosis: <span className="font-semibold text-slate-900">{stats?.distribution?.kurtosis?.toFixed(3) ?? "-"}</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Backend Insight Snapshot</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Regression Formula</span><span className="font-semibold">{regression?.regression_analysis?.formula ?? "Pending"}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">R^2 Score</span><span className="font-semibold">{regression?.regression_analysis?.r_squared?.toFixed(3) ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Peak Seasonal Window</span><span className="font-semibold">{peakSeason ? `${peakSeason.month} (${peakSeason.mean.toFixed(1)} mm)` : "Pending"}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Selected-Day Mean</span><span className="font-semibold">{averageRainfall} mm</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Selected-Day Range</span><span className="font-semibold">{minRainfall} to {maxRainfall} mm</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Heavy Rain Locations</span><span className="font-semibold">{heavyRainLocations}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Monthly Trend</h3>
            <p className="text-xs text-gray-500">{monthlySeries.length} monthly points</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" hide />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total_rainfall_mm" stroke="#2563eb" fill="#bfdbfe" />
                <Line type="monotone" dataKey="rolling_3mo_avg_mm" stroke="#0f766e" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Seasonal Mean vs Median</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={seasonalRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="mean" fill="#cffafe" stroke="#0891b2" />
                <Line type="monotone" dataKey="median" stroke="#f97316" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Spatial Rainfall Distribution</h3>
        <RainfallMap points={mapData?.points} mapDate={mapData?.date} />
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Rainfall Records</h3>
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Rainfall (mm)</th>
                  <th className="px-4 py-2 text-left">Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{`Point ${idx + 1}`}</td>
                    <td className="px-4 py-2 font-semibold">{row.rainfall_mm?.toFixed(2)} mm</td>
                    <td className="px-4 py-2 text-xs">
                      {row.latitude?.toFixed(2)}, {row.longitude?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No data available for the selected date.</p>
        )}
      </div>
    </DashboardShell>
  );
}
