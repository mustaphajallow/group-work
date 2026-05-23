"use client";

import { useEffect, useState } from "react";
import type {
  StatisticsState,
  PredictionState,
  MonthlyDataState,
  ReportState,
  StatisticsResponse,
  CorrelationAnalysis,
  RegressionAnalysis,
  SeasonalResponse,
  TrainingResponse,
  PredictionResponse,
  ForecastResponse,
  FeatureImportance,
  MonthlySummary,
  MonthlyTrendsResponse,
  MonthlyDataResponse,
  ReportResponse,
  ExportResponse,
} from "../types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:8000";

/**
 * Hook for statistical analysis data with full type safety
 */
export function useStatisticsData(): StatisticsState {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [correlation, setCorrelation] = useState<{ status?: string; correlation_analysis?: CorrelationAnalysis } | null>(null);
  const [regression, setRegression] = useState<{ status?: string; regression_analysis?: RegressionAnalysis } | null>(null);
  const [seasonal, setSeasonal] = useState<SeasonalResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatistics(): Promise<void> {
      try {
        const [statsRes, corrRes, regRes, seasRes] = await Promise.all([
          fetch(`${API_BASE}/api/statistics/summary`),
          fetch(`${API_BASE}/api/statistics/correlation`),
          fetch(`${API_BASE}/api/statistics/regression`),
          fetch(`${API_BASE}/api/statistics/seasonal`),
        ]);

        if (!statsRes.ok) throw new Error("Failed to load statistics");

        const statsData: StatisticsResponse = await statsRes.json();
        setStats(statsData);

        if (corrRes.ok) {
          const corrData = await corrRes.json();
          setCorrelation(corrData);
        }

        if (regRes.ok) {
          const regData = await regRes.json();
          setRegression(regData);
        }

        if (seasRes.ok) {
          const seasData: SeasonalResponse = await seasRes.json();
          setSeasonal(seasData);
        }

        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadStatistics();
  }, []);

  return { stats, correlation, regression, seasonal, loading, error };
}

/**
 * Hook for ML predictions and forecasts with full type safety
 */
export function usePredictionData(): PredictionState {
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [features, setFeatures] = useState<FeatureImportance | null>(null);
  const [training, setTraining] = useState<TrainingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const trainModel = async (): Promise<TrainingResponse | null> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ml/train`, { method: "POST" });
      if (!res.ok) throw new Error("Training failed");
      const data: TrainingResponse = await res.json();
      setTraining(data);
      setError(data.status === "error" ? data.message ?? "Training failed" : null);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = async (month: number, year: number, dayOfYear: number): Promise<PredictionResponse | null> => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/ml/predict?month=${month}&year=${year}&day_of_year=${dayOfYear}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Prediction failed");
      const data: PredictionResponse = await res.json();
      setPredictions(data);
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getForecast = async (periods: number = 6): Promise<ForecastResponse | null> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ml/forecast?periods=${periods}`);
      if (!res.ok) throw new Error("Forecast failed");
      const data: ForecastResponse = await res.json();
      setForecast(data);
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getFeatureImportance = async (): Promise<FeatureImportance | null> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ml/feature-importance`);
      if (!res.ok) throw new Error("Feature importance fetch failed");
      const data: FeatureImportance = await res.json();
      setFeatures(data);
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    predictions,
    forecast,
    features,
    training,
    loading,
    error,
    trainModel,
    getPrediction,
    getForecast,
    getFeatureImportance,
  };
}

/**
 * Hook for monthly data with full type safety
 */
export function useMonthlyData(): MonthlyDataState {
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendsResponse | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMonthlyData(): Promise<void> {
      try {
        const [summaryRes, trendsRes, dataRes] = await Promise.all([
          fetch(`${API_BASE}/api/monthly/summary`),
          fetch(`${API_BASE}/api/monthly/trends`),
          fetch(`${API_BASE}/api/monthly/data`),
        ]);

        if (!summaryRes.ok) throw new Error("Failed to load monthly summary");

        const summaryData: MonthlySummary = await summaryRes.json();
        setMonthlySummary(summaryData);

        if (trendsRes.ok) {
          const trendsData: MonthlyTrendsResponse = await trendsRes.json();
          setMonthlyTrends(trendsData);
        }

        if (dataRes.ok) {
          const data: MonthlyDataResponse = await dataRes.json();
          setMonthlyData(data);
        }

        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadMonthlyData();
  }, []);

  return { monthlySummary, monthlyTrends, monthlyData, loading, error };
}

/**
 * Hook for report generation with full type safety
 */
export function useReportData(): ReportState {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (): Promise<ReportResponse | null> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/report/generate`);
      if (!res.ok) throw new Error("Report generation failed");
      const data: ReportResponse = await res.json();
      setReport(data);
      setError(null);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'json' | 'markdown'): Promise<ExportResponse | null> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/report/export?format=${format}`);
      if (!res.ok) throw new Error("Report export failed");
      const data: ExportResponse = await res.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { report, loading, error, generateReport, exportReport };
}
