"""Machine-learning helpers for rainfall prediction and forecasting."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)


@dataclass
class PreparedDataset:
    """Container for model-ready features and targets."""

    features: pd.DataFrame
    target: pd.Series
    feature_names: list[str]
    history: pd.DataFrame


class RainfallPredictor:
    """Train and serve rainfall predictions using a Random Forest regressor."""

    def __init__(self) -> None:
        self.model: RandomForestRegressor | None = None
        self.feature_names: list[str] = []
        self.training_frame: pd.DataFrame | None = None
        self.history_frame: pd.DataFrame | None = None
        self.target_mean: float = 0.0
        self.target_std: float = 0.0
        self.target_frequency: str = "monthly"
        self.is_trained: bool = False

    def _prepare_dataset(self, df: pd.DataFrame) -> PreparedDataset:
        """Create a consistent feature set from daily or monthly rainfall data."""
        if df is None or df.empty:
            raise ValueError("No data available for model training.")

        working = df.copy()
        if "total_rainfall_mm" in working.columns:
            target_col = "total_rainfall_mm"
        elif "rainfall_mm" in working.columns:
            target_col = "rainfall_mm"
        else:
            raise ValueError("Dataset must contain total_rainfall_mm or rainfall_mm.")

        if "month" in working.columns:
            working["timestamp"] = pd.to_datetime(working["month"], errors="coerce")
            self.target_frequency = "monthly"
        elif "date" in working.columns:
            working["timestamp"] = pd.to_datetime(working["date"], errors="coerce")
            self.target_frequency = "daily"
        else:
            raise ValueError("Dataset must contain a month or date column.")

        working = working.dropna(subset=["timestamp", target_col]).sort_values("timestamp").reset_index(drop=True)
        if len(working) < 4:
            raise ValueError("Need at least 4 observations to train the model.")

        working["year"] = working["timestamp"].dt.year
        working["month_num"] = working["timestamp"].dt.month
        working["day_of_year"] = working["timestamp"].dt.dayofyear
        working["time_index"] = np.arange(1, len(working) + 1)
        working["lag_1"] = working[target_col].shift(1)
        working["lag_3"] = working[target_col].shift(3)
        working["rolling_mean_3"] = working[target_col].shift(1).rolling(window=3, min_periods=1).mean()

        history = working[
            ["timestamp", target_col, "year", "month_num", "day_of_year", "time_index"]
        ].copy()

        model_frame = working.dropna(
            subset=["lag_1", "lag_3", "rolling_mean_3"]
        ).copy()
        if model_frame.empty:
            raise ValueError("Not enough historical records to build lag features.")

        feature_names = [
            "year",
            "month_num",
            "day_of_year",
            "time_index",
            "lag_1",
            "lag_3",
            "rolling_mean_3",
        ]
        return PreparedDataset(
            features=model_frame[feature_names],
            target=model_frame[target_col],
            feature_names=feature_names,
            history=history,
        )

    def _build_model(self) -> RandomForestRegressor:
        return RandomForestRegressor(
            n_estimators=200,
            max_depth=12,
            min_samples_leaf=2,
            random_state=42,
        )

    @staticmethod
    def _safe_r2(y_true: pd.Series, y_pred: np.ndarray) -> float:
        if len(y_true) < 2:
            return 0.0
        score = r2_score(y_true, y_pred)
        if np.isnan(score):
            return 0.0
        return float(score)

    @staticmethod
    def _rmse(y_true: pd.Series, y_pred: np.ndarray) -> float:
        try:
            return float(mean_squared_error(y_true, y_pred, squared=False))
        except TypeError:
            return float(np.sqrt(mean_squared_error(y_true, y_pred)))

    def train(self, df: pd.DataFrame) -> dict[str, Any]:
        """Train the rainfall model and return evaluation metrics."""
        prepared = self._prepare_dataset(df)
        x_train, x_test, y_train, y_test = train_test_split(
            prepared.features,
            prepared.target,
            test_size=0.2,
            random_state=42,
            shuffle=False,
        )

        if x_train.empty or x_test.empty:
            raise ValueError("Insufficient data after train/test split.")

        model = self._build_model()
        model.fit(x_train, y_train)

        train_pred = model.predict(x_train)
        test_pred = model.predict(x_test)

        self.model = model
        self.feature_names = prepared.feature_names
        self.training_frame = pd.concat([prepared.features, prepared.target.rename("target")], axis=1)
        self.history_frame = prepared.history
        self.target_mean = float(prepared.target.mean())
        self.target_std = float(prepared.target.std(ddof=0) or 0.0)
        self.is_trained = True

        test_r2 = self._safe_r2(y_test, test_pred)
        interpretation = (
            "Model fit looks strong for exploratory forecasting."
            if test_r2 >= 0.7
            else "Model fit is moderate; forecasts are useful for directional guidance."
            if test_r2 >= 0.4
            else "Model fit is weak; treat outputs as rough estimates."
        )

        return {
            "status": "trained",
            "train_mae": round(float(mean_absolute_error(y_train, train_pred)), 2),
            "test_mae": round(float(mean_absolute_error(y_test, test_pred)), 2),
            "train_rmse": round(self._rmse(y_train, train_pred), 2),
            "test_rmse": round(self._rmse(y_test, test_pred), 2),
            "train_r2_score": round(self._safe_r2(y_train, train_pred), 3),
            "test_r2_score": round(test_r2, 3),
            "samples": {
                "train": int(len(x_train)),
                "test": int(len(x_test)),
            },
            "features": prepared.feature_names,
            "interpretation": interpretation,
        }

    def _require_model(self) -> RandomForestRegressor:
        if not self.is_trained or self.model is None or self.history_frame is None:
            raise ValueError("Model not trained.")
        return self.model

    def _feature_row_from_input(self, input_data: dict[str, Any]) -> pd.DataFrame:
        self._require_model()
        history = self.history_frame
        assert history is not None

        latest = history.iloc[-1]
        lag_1 = float(latest.iloc[1])
        lag_3_source = history.iloc[-3 if len(history) >= 3 else 0]
        lag_3 = float(lag_3_source.iloc[1])
        rolling_mean_3 = float(history.iloc[-3:][history.columns[1]].mean())

        year = int(input_data.get("year", latest["year"]))
        month_num = int(input_data.get("month", latest["month_num"]))
        day_of_year = int(input_data.get("day_of_year", latest["day_of_year"]))
        time_index = int(latest["time_index"]) + 1

        feature_row = pd.DataFrame(
            [
                {
                    "year": year,
                    "month_num": month_num,
                    "day_of_year": day_of_year,
                    "time_index": time_index,
                    "lag_1": lag_1,
                    "lag_3": lag_3,
                    "rolling_mean_3": rolling_mean_3,
                }
            ]
        )
        return feature_row[self.feature_names]

    def predict(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """Predict rainfall for a single set of temporal features."""
        model = self._require_model()
        feature_row = self._feature_row_from_input(input_data)
        prediction = float(model.predict(feature_row)[0])

        spread = max(self.target_std * 0.75, abs(prediction) * 0.15, 1.0)
        lower = max(0.0, prediction - spread)
        upper = max(lower, prediction + spread)

        return {
            "status": "success",
            "prediction_mm": round(prediction, 2),
            "confidence_interval": {
                "lower": round(lower, 2),
                "upper": round(upper, 2),
            },
            "input_features": {
                key: round(float(value), 2) for key, value in feature_row.iloc[0].to_dict().items()
            },
        }

    def generate_forecast(self, df: pd.DataFrame, periods: int = 6) -> dict[str, Any]:
        """Generate iterative future predictions based on the latest history."""
        if not self.is_trained:
            self.train(df)

        model = self._require_model()
        history = self.history_frame.copy()
        assert history is not None

        value_col = history.columns[1]
        forecasts: list[dict[str, Any]] = []

        for period in range(1, periods + 1):
            latest = history.iloc[-1]
            if self.target_frequency == "monthly":
                next_timestamp = latest["timestamp"] + pd.offsets.MonthBegin(1)
                day_of_year = int(next_timestamp.dayofyear)
            else:
                next_timestamp = latest["timestamp"] + pd.Timedelta(days=1)
                day_of_year = int(next_timestamp.dayofyear)

            lag_1 = float(history.iloc[-1][value_col])
            lag_3 = float(history.iloc[-3][value_col]) if len(history) >= 3 else lag_1
            rolling_mean_3 = float(history.iloc[-3:][value_col].mean())

            feature_row = pd.DataFrame(
                [
                    {
                        "year": int(next_timestamp.year),
                        "month_num": int(next_timestamp.month),
                        "day_of_year": day_of_year,
                        "time_index": int(latest["time_index"]) + 1,
                        "lag_1": lag_1,
                        "lag_3": lag_3,
                        "rolling_mean_3": rolling_mean_3,
                    }
                ]
            )[self.feature_names]

            predicted_value = max(0.0, float(model.predict(feature_row)[0]))
            forecasts.append(
                {
                    "period": period,
                    "predicted_rainfall_mm": round(predicted_value, 2),
                }
            )

            history.loc[len(history)] = {
                "timestamp": next_timestamp,
                value_col: predicted_value,
                "year": int(next_timestamp.year),
                "month_num": int(next_timestamp.month),
                "day_of_year": day_of_year,
                "time_index": int(latest["time_index"]) + 1,
            }

        return {
            "status": "success",
            "forecast_periods": periods,
            "forecasts": forecasts,
        }

    def get_feature_importance(self) -> dict[str, Any]:
        """Return normalized feature importance for the trained model."""
        model = self._require_model()
        importances = model.feature_importances_
        feature_map = {
            feature: round(float(importance), 4)
            for feature, importance in sorted(
                zip(self.feature_names, importances),
                key=lambda item: item[1],
                reverse=True,
            )
        }
        return {
            "status": "success",
            "feature_importance": feature_map,
            "top_features": list(feature_map.keys())[:5],
        }
