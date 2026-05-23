"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePredictionData } from "../components/analysisHooks";
import DashboardShell from "../components/DashboardShell";

export default function PredictionPage() {
  const {
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
  } = usePredictionData();
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(2024);
  const [dayOfYear, setDayOfYear] = useState(1);

  const trained = training?.training_metrics?.status === "trained";

  const handleTrainModel = async () => {
    await trainModel();
  };

  const ensureTraining = async () => {
    if (trained) {
      return training;
    }
    return trainModel();
  };

  const handleGetPrediction = async () => {
    const trainedModel = await ensureTraining();
    if (trainedModel?.status !== "success") return;
    await getPrediction(month, year, dayOfYear);
  };

  const handleGetForecast = async () => {
    const trainedModel = await ensureTraining();
    if (trainedModel?.status !== "success") return;
    await getForecast(12);
  };

  const handleGetFeatures = async () => {
    const trainedModel = await ensureTraining();
    if (trainedModel?.status !== "success") return;
    await getFeatureImportance();
  };

  const forecastChartData = forecast?.forecasts || [];
  const featureChartData = useMemo(
    () =>
      Object.entries(features?.feature_importance || {}).map(([feature, importance]) => ({
        feature,
        importance: Number((importance * 100).toFixed(2)),
      })),
    [features]
  );

  return (
    <DashboardShell
      activePath="/prediction"
      eyebrow="ML Prediction Model"
      title="Rainfall Prediction & Forecasting"
      statusText={loading ? "Working with prediction services..." : "Ready for training and forecasts"}
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : null}

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Model Training</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm text-gray-600">
              Train the Random Forest rainfall model on the backend. The API returns evaluation metrics, feature names,
              and a short interpretation of fit quality.
            </p>
            <button
              onClick={handleTrainModel}
              disabled={loading}
              className="rounded bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Training..." : "Train Model"}
            </button>
          </div>
          <div className="rounded bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">Status</p>
            <p className="text-gray-600">{trained ? "Model trained" : "Model not trained yet"}</p>
            {training?.training_metrics?.interpretation ? (
              <p className="mt-2 text-xs text-gray-500">{training.training_metrics.interpretation}</p>
            ) : null}
          </div>
        </div>
      </div>

      {training?.training_metrics ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="mb-1 text-xs text-gray-500">Test MAE</p>
            <p className="text-2xl font-bold text-blue-600">{training.training_metrics.test_mae?.toFixed(2) ?? "-"}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="mb-1 text-xs text-gray-500">Test RMSE</p>
            <p className="text-2xl font-bold text-green-600">{training.training_metrics.test_rmse?.toFixed(2) ?? "-"}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="mb-1 text-xs text-gray-500">Test R^2</p>
            <p className="text-2xl font-bold text-purple-600">{training.training_metrics.test_r2_score?.toFixed(3) ?? "-"}</p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow">
            <p className="mb-1 text-xs text-gray-500">Features Used</p>
            <p className="text-2xl font-bold text-orange-600">{training.training_metrics.features?.length ?? 0}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Make Prediction</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                className="w-full rounded border border-gray-300 px-4 py-2"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value || "2024", 10))}
                className="w-full rounded border border-gray-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Day of Year</label>
              <input
                type="number"
                min="1"
                max="365"
                value={dayOfYear}
                onChange={(e) => setDayOfYear(parseInt(e.target.value || "1", 10))}
                className="w-full rounded border border-gray-300 px-4 py-2"
              />
            </div>
            <button
              onClick={handleGetPrediction}
              disabled={loading}
              className="w-full rounded bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Predicting..." : "Get Prediction"}
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Prediction Result</h3>
          {predictions && predictions.status === "success" ? (
            <div className="space-y-4">
              <div className="rounded bg-blue-50 p-4">
                <p className="mb-1 text-sm text-gray-600">Predicted Rainfall</p>
                <p className="text-3xl font-bold text-blue-600">{predictions.prediction_mm} mm</p>
              </div>
              {predictions.confidence_interval ? (
                <div className="rounded bg-gray-50 p-4">
                  <p className="mb-2 text-sm text-gray-600">Confidence Interval</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {predictions.confidence_interval.lower} - {predictions.confidence_interval.upper} mm
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-500">Train the model or request a prediction to see results here.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">12-Month Forecast</h3>
          <button
            onClick={handleGetForecast}
            disabled={loading}
            className="rounded bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate Forecast"}
          </button>
        </div>
        {forecastChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <BarChart data={forecastChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" label={{ value: "Month Ahead", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Rainfall (mm)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="predicted_rainfall_mm" fill="#8b5cf6" name="Forecasted Rainfall (mm)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Generate a forecast to see multi-step predictions.</p>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Model Feature Importance</h3>
          <button
            onClick={handleGetFeatures}
            disabled={loading}
            className="rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Load Features"}
          </button>
        </div>
        {features && features.status === "success" && featureChartData.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <BarChart data={featureChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" angle={-20} textAnchor="end" height={72} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="importance" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              <p className="mb-4 text-sm text-gray-600">Top predictive features returned by the backend model:</p>
              {featureChartData.slice(0, 5).map(({ feature, importance }) => (
                <div key={feature} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
                  <span className="text-sm font-semibold text-gray-700">{feature}</span>
                  <span className="text-sm font-semibold text-gray-600">{importance.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Load feature importance to inspect the trained model.</p>
        )}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h4 className="mb-2 font-bold text-blue-900">About the Model</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>- Algorithm: Random Forest Regressor with temporal and lag features.</li>
          <li>- Inputs: month, year, day of year, and previous rainfall history when available.</li>
          <li>- Validation: MAE, RMSE, and R^2 are returned directly from backend training.</li>
          <li>- Outputs: point prediction, confidence interval, feature importance, and multi-step forecast.</li>
        </ul>
      </div>
    </DashboardShell>
  );
}
