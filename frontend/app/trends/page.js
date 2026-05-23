"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMonthlyData, useStatisticsData } from "../components/analysisHooks";
import DashboardShell from "../components/DashboardShell";

export default function TrendAnalysisPage() {
  const { monthlyTrends, monthlySummary, loading } = useMonthlyData();
  const { stats, regression } = useStatisticsData();
  const [windowSize, setWindowSize] = useState(3);

  const trendData = (monthlyTrends?.series || []).map((item) => ({
    month: item.month,
    rainfall: item.total_rainfall_mm || 0,
    average: item.avg_rainfall_mm || 0,
    rolling: item.rolling_3mo_avg_mm || 0,
    change: item.month_over_month_change_mm || 0,
  }));

  const calculateMovingAverage = (data, window) =>
    data.map((item, idx) => {
      const start = Math.max(0, idx - window + 1);
      const subset = data.slice(start, idx + 1);
      const avg = subset.reduce((sum, d) => sum + d.rainfall, 0) / subset.length;
      return { ...item, movingAvg: Number(avg.toFixed(2)) };
    });

  const trendDataWithMA = calculateMovingAverage(trendData, windowSize);

  const calculateTrendDirection = () => {
    if (trendData.length < 2) return "Insufficient data";
    const firstWindow = trendData.slice(0, Math.min(3, trendData.length));
    const lastWindow = trendData.slice(-Math.min(3, trendData.length));
    const first = firstWindow.reduce((sum, d) => sum + d.rainfall, 0) / firstWindow.length;
    const last = lastWindow.reduce((sum, d) => sum + d.rainfall, 0) / lastWindow.length;
    const change = first === 0 ? 0 : ((last - first) / first) * 100;

    if (change > 5) return "Increasing";
    if (change < -5) return "Decreasing";
    return "Stable";
  };

  const trendDirection = calculateTrendDirection();

  return (
    <DashboardShell
      activePath="/trends"
      eyebrow="Trend Analysis"
      title="Rainfall trends and long-term patterns"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-2 text-sm font-semibold text-gray-600">Trend Direction</p>
          <p className="text-2xl font-bold text-blue-600">{trendDirection}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-2 text-sm font-semibold text-gray-600">Average Monthly Total</p>
          <p className="text-2xl font-bold text-green-600">
            {trendData.length ? (trendData.reduce((sum, d) => sum + d.rainfall, 0) / trendData.length).toFixed(1) : "-"} mm
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-2 text-sm font-semibold text-gray-600">Volatility (Std Dev)</p>
          <p className="text-2xl font-bold text-orange-600">{stats?.dispersion?.std_dev?.toFixed(1) || "-"} mm</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-2 text-sm font-semibold text-gray-600">Months Modeled</p>
          <p className="text-2xl font-bold text-purple-600">{monthlySummary?.month_count || trendData.length}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Monthly Rainfall Trend</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Window Size:</label>
            <select
              value={windowSize}
              onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
              className="rounded border border-gray-300 px-3 py-1 text-sm"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={9}>9 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400} minWidth={0}>
          <LineChart data={trendDataWithMA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" angle={-45} textAnchor="end" height={72} />
            <YAxis label={{ value: "Rainfall (mm)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rainfall" stroke="#cbd5e1" dot={false} strokeWidth={1} name="Monthly Total" />
            <Line type="monotone" dataKey="movingAvg" stroke="#2563eb" strokeWidth={2} dot={false} name={`${windowSize}-Month Moving Average`} />
          </LineChart>
        </ResponsiveContainer>

        <p className="mt-2 text-xs text-gray-500">
          This view now uses the backend monthly aggregation instead of a single-day slice.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Cumulative Monthly Rainfall</h3>
        <ResponsiveContainer width="100%" height={300} minWidth={0}>
          <AreaChart
            data={trendData.map((item, index) => ({
              ...item,
              cumulative:
                trendData.slice(0, index + 1).reduce((sum, row) => sum + row.rainfall, 0),
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" angle={-45} textAnchor="end" height={72} />
            <YAxis label={{ value: "Cumulative Rainfall (mm)", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Area type="monotone" dataKey="cumulative" fill="#bbf7d0" stroke="#16a34a" name="Cumulative Rainfall" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Linear Trend Analysis</h3>
        {regression?.regression_analysis ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-4 rounded bg-blue-50 p-4">
                <p className="mb-1 text-sm text-gray-600">Linear Regression Formula</p>
                <p className="text-lg font-mono font-bold text-blue-600">{regression.regression_analysis.formula}</p>
              </div>
              <p className="mb-2 text-sm text-gray-600">Interpretation</p>
              <p className="text-sm text-gray-700">{regression.regression_analysis.interpretation}</p>
            </div>
            <div className="space-y-3">
              <div className="rounded bg-gray-50 p-4">
                <p className="mb-1 text-xs text-gray-600">R^2 Score (Fit Quality)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(regression.regression_analysis.r_squared * 100).toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Model explains {(regression.regression_analysis.r_squared * 100).toFixed(1)}% of variance.
                </p>
              </div>
              <div className="rounded bg-gray-50 p-4">
                <p className="mb-1 text-xs text-gray-600">Slope</p>
                <p className="text-2xl font-bold text-green-600">{regression.regression_analysis.slope.toFixed(4)}</p>
                <p className="mt-1 text-xs text-gray-600">Change in rainfall per unit step.</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">{loading ? "Loading regression analysis..." : "Regression analysis not available."}</p>
        )}
      </div>
    </DashboardShell>
  );
}
