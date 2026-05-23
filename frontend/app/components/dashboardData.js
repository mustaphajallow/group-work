"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export function useDashboardData() {
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [mapData, setMapData] = useState({ date: null, points: [] });
  const [trendSeries, setTrendSeries] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [status, setStatus] = useState("Loading dashboard data...");
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    async function loadSummaryAndTrends() {
      try {
        const [summaryResponse, trendsResponse] = await Promise.all([
          fetch(`${API_BASE}/api/summary`),
          fetch(`${API_BASE}/api/trends`),
        ]);

        if (!summaryResponse.ok || !trendsResponse.ok) {
          throw new Error("The backend summary services could not be loaded.");
        }

        const summaryData = await summaryResponse.json();
        const trendsData = await trendsResponse.json();
        setSummary(summaryData);
        setTrendSeries(trendsData.series || []);
        setSelectedDate(summaryData.latest_date || "");
        setError("");
      } catch {
        setSummary({
          row_count: 0,
          date_count: 0,
          available_dates: [],
          min_date: null,
          max_date: null,
          latest_date: null,
        });
        setRows([]);
        setMapData({ date: null, points: [] });
        setTrendSeries([]);
        setSelectedDate("");
        setMapError("");
        setError("The frontend is running, but the FastAPI backend is not reachable at http://127.0.0.1:8000.");
        setStatus("Unable to load data.");
      }
    }

    loadSummaryAndTrends();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    async function loadSelectedDateData() {
      setStatus(`Loading rainfall data for ${selectedDate}...`);

      try {
        const [dataResponse, mapResponse] = await Promise.all([
          fetch(`${API_BASE}/api/data?limit=250&date=${selectedDate}`),
          fetch(`${API_BASE}/api/map?date=${selectedDate}`),
        ]);

        if (!dataResponse.ok) {
          throw new Error("The selected date could not be loaded.");
        }

        const dataRows = await dataResponse.json();
        setRows(dataRows);
        setError("");

        if (!mapResponse.ok) {
          setMapData({ date: selectedDate, points: [] });
          setMapError("Map data is unavailable for the selected date.");
        } else {
          const latestMapData = await mapResponse.json();
          setMapData(latestMapData);
          setMapError("");
        }

        setStatus(`Showing rainfall for ${selectedDate}.`);
      } catch {
        setRows([]);
        setMapData({ date: selectedDate, points: [] });
        setMapError("");
        setError("The selected date could not be loaded from the backend.");
        setStatus("Unable to load selected date.");
      }
    }

    loadSelectedDateData();
  }, [selectedDate]);

  return {
    summary,
    rows,
    mapData,
    trendSeries,
    selectedDate,
    setSelectedDate,
    status,
    error,
    mapError,
  };
}

export function useDerivedMetrics(rows, summary, selectedDate, mapData) {
  return useMemo(() => {
    const averageRainfall = rows.length
      ? (rows.reduce((sum, row) => sum + Number(row.rainfall_mm), 0) / rows.length).toFixed(2)
      : "0.00";
    const maxRainfall = rows.length
      ? Math.max(...rows.map((row) => Number(row.rainfall_mm))).toFixed(2)
      : "0.00";
    const minRainfall = rows.length
      ? Math.min(...rows.map((row) => Number(row.rainfall_mm))).toFixed(2)
      : "0.00";
    const rainyLocations = rows.filter((row) => Number(row.rainfall_mm) > 0).length;
    const heavyRainLocations = rows.filter((row) => Number(row.rainfall_mm) >= 20).length;
    const topLocations = [...rows]
      .sort((left, right) => Number(right.rainfall_mm) - Number(left.rainfall_mm))
      .slice(0, 5);
    const alertLocations = [...rows]
      .filter((row) => Number(row.rainfall_mm) >= 10)
      .sort((left, right) => Number(right.rainfall_mm) - Number(left.rainfall_mm))
      .slice(0, 4);
    const latestRange = summary?.min_date && summary?.max_date
      ? `${summary.min_date} to ${summary.max_date}`
      : "Unavailable";

    return {
      averageRainfall,
      maxRainfall,
      minRainfall,
      rainyLocations,
      heavyRainLocations,
      topLocations,
      alertLocations,
      latestRange,
      mapPointCount: selectedDate ? mapData.points.length : 0,
    };
  }, [rows, summary, selectedDate, mapData]);
}

export function useMonthlyData() {
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [monthlySeries, setMonthlySeries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [status, setStatus] = useState("Loading monthly rainfall trends...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMonthlyOverview() {
      try {
        const [summaryResponse, trendsResponse] = await Promise.all([
          fetch(`${API_BASE}/api/monthly/summary`),
          fetch(`${API_BASE}/api/monthly/trends`),
        ]);

        if (!summaryResponse.ok || !trendsResponse.ok) {
          throw new Error("The monthly trend service could not be loaded.");
        }

        const summaryData = await summaryResponse.json();
        const monthlyData = await trendsResponse.json();
        setMonthlySummary(summaryData);
        setMonthlySeries(monthlyData.series || []);
        setSelectedMonth(summaryData.latest_month || "");
        setError("");
        setStatus("Monthly trends ready.");
      } catch {
        setMonthlySummary(null);
        setMonthlySeries([]);
        setSelectedMonth("");
        setMonthlyRows([]);
        setError("Monthly trends are unavailable. Check backend connectivity.");
        setStatus("Unable to load monthly data.");
      }
    }

    loadMonthlyOverview();
  }, []);

  useEffect(() => {
    if (!selectedMonth) {
      return;
    }

    async function loadMonthlyMonthData() {
      setStatus(`Loading location totals for ${selectedMonth}...`);
      try {
        const response = await fetch(`${API_BASE}/api/monthly/data?month=${selectedMonth}`);
        if (!response.ok) {
          throw new Error("The monthly data request failed.");
        }

        const data = await response.json();
        setMonthlyRows(data.records || []);
        setError("");
        setStatus(`Viewing ${selectedMonth} monthly totals.`);
      } catch {
        setMonthlyRows([]);
        setError(`Could not load monthly totals for ${selectedMonth}.`);
        setStatus("Unable to load monthly totals.");
      }
    }

    loadMonthlyMonthData();
  }, [selectedMonth]);

  return {
    monthlySummary,
    monthlySeries,
    monthlyRows,
    selectedMonth,
    setSelectedMonth,
    status,
    error,
  };
}
