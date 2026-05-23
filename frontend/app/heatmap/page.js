"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { useStatisticsData, useMonthlyData } from "../components/analysisHooks";
import DashboardShell from "../components/DashboardShell";

export default function HeatmapPage() {
  const { seasonal } = useStatisticsData();
  const { monthlyData } = useMonthlyData();

  const seasonalData = seasonal?.seasonal_analysis?.seasonal_data || {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const heatmapData = monthNames.map((month, idx) => {
    const key = `month_${idx + 1}`;
    const stats = seasonalData[key] || {};
    return {
      month,
      monthNum: idx + 1,
      mean: stats.mean || 0,
      median: stats.median || 0,
      min: stats.min || 0,
      max: stats.max || 0,
      std: stats.std_dev || 0,
    };
  });

  const locationData = monthlyData?.records || [];
  const maxRainfall = Math.max(...heatmapData.map((d) => d.max), 1);
  const minRainfall = Math.min(...heatmapData.map((d) => d.min), 0);

  const getColor = (value, min, max) => {
    const normalized = (value - min) / (max - min || 1);
    if (normalized < 0.25) return "#fef3c7";
    if (normalized < 0.5) return "#fcd34d";
    if (normalized < 0.75) return "#f59e0b";
    return "#d97706";
  };

  return (
    <DashboardShell
      activePath="/heatmap"
      eyebrow="Seasonal Analysis"
      title="Rainfall patterns and seasonal heatmaps"
    >
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-6 text-lg font-bold text-gray-800">Seasonal Rainfall Patterns (Monthly)</h3>
        <div className="mb-6 flex items-center justify-between px-4">
          <span className="text-xs text-gray-600">Low Rainfall</span>
          <div className="flex gap-1">
            <div className="h-6 w-6 border border-gray-300 bg-yellow-100" />
            <div className="h-6 w-6 border border-gray-300 bg-yellow-300" />
            <div className="h-6 w-6 border border-gray-300 bg-amber-400" />
            <div className="h-6 w-6 border border-gray-300 bg-amber-600" />
          </div>
          <span className="text-xs text-gray-600">High Rainfall</span>
        </div>

        <div className="grid grid-cols-6 gap-2 md:grid-cols-12">
          {heatmapData.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center" title={`${item.month}: ${item.mean.toFixed(1)} mm`}>
              <div
                className="flex aspect-square w-full items-center justify-center rounded border border-gray-300 text-xs font-semibold transition hover:shadow-lg"
                style={{
                  backgroundColor: getColor(item.mean, minRainfall, maxRainfall),
                  color: item.mean > (maxRainfall + minRainfall) / 2 ? "white" : "black",
                }}
              >
                {item.mean.toFixed(0)}
              </div>
              <span className="mt-1 text-xs text-gray-600">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Mean Monthly Rainfall</h3>
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthNum" name="Month" type="number" />
              <YAxis dataKey="mean" name="Rainfall (mm)" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Mean Rainfall" data={heatmapData} fill="#3b82f6">
                {heatmapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Rainfall Range by Month</h3>
          <div className="space-y-3">
            {heatmapData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-12 text-sm font-semibold">{item.month}</span>
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">
                    {item.min.toFixed(1)} - {item.max.toFixed(1)} mm
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-gray-200">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{ width: `${((item.max - item.min) / maxRainfall) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Seasonal Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Month</th>
                <th className="px-4 py-2 text-right">Mean (mm)</th>
                <th className="px-4 py-2 text-right">Median (mm)</th>
                <th className="px-4 py-2 text-right">Std Dev (mm)</th>
                <th className="px-4 py-2 text-right">Min (mm)</th>
                <th className="px-4 py-2 text-right">Max (mm)</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold">{item.month}</td>
                  <td className="px-4 py-2 text-right">{item.mean.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{item.median.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{item.std.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-blue-600">{item.min.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-red-600">{item.max.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h4 className="mb-2 font-bold text-blue-900">Seasonal Insights</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>- Peak months stand out immediately in the seasonal grid.</li>
          <li>- Median rainfall helps separate consistent seasons from outlier-driven spikes.</li>
          <li>- Standard deviation shows whether rainfall is stable or erratic within each month.</li>
          <li>- Use this view for irrigation, storage, and flood-readiness planning.</li>
        </ul>
        <p className="mt-3 text-xs text-blue-700">Current monthly location rows loaded: {locationData.length}</p>
      </div>
    </DashboardShell>
  );
}
