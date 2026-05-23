"use client";

import type { ReactElement } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMonthlyData } from "../components/analysisHooks";
import DashboardShell from "../components/DashboardShell";
import type { MonthlyTrend } from "../types";

export default function MonthlyChartPage(): ReactElement {
  const { monthlyTrends, monthlySummary, loading, error } = useMonthlyData();

  if (error) {
    return (
      <DashboardShell activePath="/monthly" eyebrow="Monthly Analysis" title="Error loading data">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </DashboardShell>
    );
  }

  const trendData: MonthlyTrend[] = monthlyTrends?.series ?? [];

  return (
    <DashboardShell
      activePath="/monthly"
      eyebrow="Monthly Rainfall Chart"
      title="Trend analysis and monthly rainfall patterns"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-semibold mb-2">Total Months</p>
          <p className="text-3xl font-bold text-blue-600">{monthlySummary?.month_count ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-semibold mb-2">Latest Total</p>
          <p className="text-3xl font-bold text-green-600">
            {monthlySummary?.latest_total_rainfall_mm?.toFixed(1) ?? "–"}
          </p>
          <p className="text-gray-500 text-xs mt-2">mm</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-semibold mb-2">3-Month Average</p>
          <p className="text-3xl font-bold text-cyan-600">
            {monthlySummary?.latest_rolling_3mo_avg_mm?.toFixed(1) ?? "–"}
          </p>
          <p className="text-gray-500 text-xs mt-2">mm (rolling)</p>
        </div>
      </div>

      {/* Line Chart - Total Rainfall */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Total Monthly Rainfall Trend</h3>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_rainfall_mm" 
                stroke="#3b82f6" 
                dot={false}
                strokeWidth={2}
                name="Total Rainfall (mm)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Area Chart - Average Rainfall */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Average Monthly Rainfall</h3>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="avg_rainfall_mm" 
                fill="#10b981" 
                stroke="#059669"
                name="Average Rainfall (mm)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Rolling Average Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-800 mb-4">3-Month Rolling Average</h3>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rolling_3mo_avg_mm" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                name="3-Month Average (mm)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Data</h3>
        {trendData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-left">Total (mm)</th>
                  <th className="px-4 py-2 text-left">Avg (mm)</th>
                  <th className="px-4 py-2 text-left">Max (mm)</th>
                  <th className="px-4 py-2 text-left">Rainy Days</th>
                </tr>
              </thead>
              <tbody>
                {trendData.slice(0, 12).map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{row.month}</td>
                    <td className="px-4 py-2">{row.total_rainfall_mm?.toFixed(1)}</td>
                    <td className="px-4 py-2">{row.avg_rainfall_mm?.toFixed(1)}</td>
                    <td className="px-4 py-2">{row.max_rainfall_mm?.toFixed(1)}</td>
                    <td className="px-4 py-2">{row.rainy_observations ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    </DashboardShell>
  );
}
