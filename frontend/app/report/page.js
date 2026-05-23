"use client";

import { useState } from "react";
import { useReportData } from "../components/analysisHooks";
import DashboardShell from "../components/DashboardShell";

export default function ReportPage() {
  const { report, loading, error, generateReport, exportReport } = useReportData();
  const [exportFormat, setExportFormat] = useState("json");

  const handleGenerateReport = async () => {
    await generateReport();
  };

  const handleExportReport = async () => {
    const result = await exportReport(exportFormat);
    if (result && result.status === "success") {
      const dataStr = exportFormat === "markdown" ? result.content : JSON.stringify(result.content, null, 2);
      const dataBlob = new Blob([dataStr], { type: "text/plain" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rainfall-analysis-report.${exportFormat === "markdown" ? "md" : "json"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <DashboardShell
      activePath="/report"
      eyebrow="Analysis Report"
      title="Comprehensive Rainfall Analysis Report"
      statusText={loading ? "Generating report output..." : "Ready to generate a five-chapter report"}
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : null}

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Generate Report</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="rounded bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate Full Report"}
          </button>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full rounded border border-gray-300 px-4 py-2"
            >
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
          <button
            onClick={handleExportReport}
            disabled={loading}
            className="self-end rounded bg-green-600 px-6 py-2 font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      {report?.report ? (
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">{report.report.title}</h2>
            <p className="text-sm text-gray-600">Generated: {new Date(report.report.generated_date).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Version: {report.report.version}</p>
          </div>

          {report.report.chapters?.map((chapter, idx) => (
            <div key={idx} className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 border-b-2 border-blue-600 pb-2 text-xl font-bold text-gray-800">{chapter.title}</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{chapter.content}</p>
            </div>
          ))}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h4 className="mb-2 font-bold text-blue-900">Report Statistics</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>- Total Chapters: {report.report.total_chapters}</li>
              <li>- Report Format: Professional PDF-ready structure</li>
              <li>- Coverage: Statistical analysis, seasonality, ML, and discussion</li>
              <li>- Export Options: JSON and Markdown</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="mb-4 text-gray-600">No report generated yet</p>
          <p className="text-sm text-gray-500">
            Generate the report to preview the five backend-produced chapters here.
          </p>
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Report Structure</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div><h4 className="mb-2 font-semibold text-gray-800">Chapter 1: Introduction</h4><p className="text-sm text-gray-600">Climate relevance, forecasting value, and agricultural context.</p></div>
          <div><h4 className="mb-2 font-semibold text-gray-800">Chapter 2: Background</h4><p className="text-sm text-gray-600">Dataset context, monitoring scope, and historical framing.</p></div>
          <div><h4 className="mb-2 font-semibold text-gray-800">Chapter 3: Methodology</h4><p className="text-sm text-gray-600">Preprocessing, statistical methods, and ML workflow.</p></div>
          <div><h4 className="mb-2 font-semibold text-gray-800">Chapter 4: Results</h4><p className="text-sm text-gray-600">Descriptive statistics, seasonal patterns, and model performance.</p></div>
          <div className="md:col-span-2"><h4 className="mb-2 font-semibold text-gray-800">Chapter 5: Discussion</h4><p className="text-sm text-gray-600">Interpretation, limitations, practical implications, and recommendations.</p></div>
        </div>
      </div>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
        <h4 className="mb-2 font-bold text-purple-900">Key Formulas in Report</h4>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>- Pearson Correlation: r = sum((x_i - x_mean)(y_i - y_mean)) / sqrt(sum(x_i - x_mean)^2 * sum(y_i - y_mean)^2)</li>
          <li>- Linear Regression: y = mx + b</li>
          <li>- R^2 Score: coefficient of determination for fit quality</li>
          <li>- RMSE: square-root error magnitude across predictions</li>
          <li>- MAE: average absolute difference between actual and predicted rainfall</li>
        </ul>
      </div>
    </DashboardShell>
  );
}
