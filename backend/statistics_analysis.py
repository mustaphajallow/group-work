"""Statistical analysis module for rainfall data."""

import logging
from typing import Dict, List, Any
import pandas as pd
import numpy as np
from scipy import stats

logger = logging.getLogger(__name__)


class StatisticalAnalysis:
    """Perform comprehensive statistical analysis on rainfall data."""

    @staticmethod
    def calculate_central_tendency(rainfall_data: pd.Series) -> Dict[str, Any]:
        """
        Calculate central tendency measures: mean, median, mode.
        
        Returns:
            Dictionary with mean, median, mode values
        """
        if rainfall_data.empty:
            return {"mean": 0, "median": 0, "mode": None, "count": 0}
        
        try:
            mean_val = float(rainfall_data.mean())
            median_val = float(rainfall_data.median())
            
            # Calculate mode (most frequent value)
            try:
                mode_result = stats.mode(rainfall_data.dropna(), keepdims=True)
                mode_val = float(mode_result.mode[0]) if len(mode_result.mode) > 0 else None
            except:
                mode_val = None
            
            return {
                "mean": round(mean_val, 2),
                "median": round(median_val, 2),
                "mode": round(mode_val, 2) if mode_val is not None else None,
                "count": len(rainfall_data)
            }
        except Exception as e:
            logger.error(f"Error calculating central tendency: {e}")
            return {"mean": 0, "median": 0, "mode": None, "count": 0}

    @staticmethod
    def calculate_dispersion(rainfall_data: pd.Series) -> Dict[str, Any]:
        """
        Calculate dispersion measures: variance, standard deviation, range.
        
        Returns:
            Dictionary with variance, std_dev, range, and other dispersion metrics
        """
        if rainfall_data.empty or len(rainfall_data) < 2:
            return {
                "variance": 0,
                "std_dev": 0,
                "range": 0,
                "min": 0,
                "max": 0,
                "iqr": 0
            }
        
        try:
            variance = float(rainfall_data.var())
            std_dev = float(rainfall_data.std())
            data_range = float(rainfall_data.max() - rainfall_data.min())
            
            # Interquartile range
            q1 = rainfall_data.quantile(0.25)
            q3 = rainfall_data.quantile(0.75)
            iqr = float(q3 - q1)
            
            return {
                "variance": round(variance, 2),
                "std_dev": round(std_dev, 2),
                "range": round(data_range, 2),
                "min": round(float(rainfall_data.min()), 2),
                "max": round(float(rainfall_data.max()), 2),
                "iqr": round(iqr, 2)
            }
        except Exception as e:
            logger.error(f"Error calculating dispersion: {e}")
            return {
                "variance": 0,
                "std_dev": 0,
                "range": 0,
                "min": 0,
                "max": 0,
                "iqr": 0
            }

    @staticmethod
    def calculate_correlation(df: pd.DataFrame, var1: str, var2: str) -> Dict[str, Any]:
        """
        Calculate Pearson correlation coefficient between two variables.
        
        Formula: r = Σ((x_i - x̄)(y_i - ȳ)) / √(Σ(x_i - x̄)² * Σ(y_i - ȳ)²)
        
        Args:
            df: DataFrame containing the data
            var1: First variable name
            var2: Second variable name
            
        Returns:
            Dictionary with correlation coefficient and p-value
        """
        if var1 not in df.columns or var2 not in df.columns:
            return {"correlation": 0, "p_value": 1.0, "interpretation": "Variables not found"}
        
        try:
            # Remove NaN values
            valid_data = df[[var1, var2]].dropna()
            
            if len(valid_data) < 2:
                return {"correlation": 0, "p_value": 1.0, "interpretation": "Insufficient data"}
            
            correlation, p_value = stats.pearsonr(valid_data[var1], valid_data[var2])
            
            # Interpretation
            if abs(correlation) < 0.3:
                interpretation = "weak correlation"
            elif abs(correlation) < 0.7:
                interpretation = "moderate correlation"
            else:
                interpretation = "strong correlation"
            
            if correlation > 0:
                interpretation += " (positive)"
            else:
                interpretation += " (negative)"
            
            return {
                "correlation": round(correlation, 3),
                "p_value": round(p_value, 4),
                "interpretation": interpretation,
                "sample_size": len(valid_data)
            }
        except Exception as e:
            logger.error(f"Error calculating correlation: {e}")
            return {"correlation": 0, "p_value": 1.0, "interpretation": f"Error: {str(e)}"}

    @staticmethod
    def calculate_linear_regression(df: pd.DataFrame, x_var: str, y_var: str) -> Dict[str, Any]:
        """
        Calculate linear regression: y = mx + b
        
        Args:
            df: DataFrame containing the data
            x_var: Independent variable name
            y_var: Dependent variable name
            
        Returns:
            Dictionary with slope (m), intercept (b), R² score
        """
        if x_var not in df.columns or y_var not in df.columns:
            return {"slope": 0, "intercept": 0, "r_squared": 0, "error": "Variables not found"}
        
        try:
            # Remove NaN values
            valid_data = df[[x_var, y_var]].dropna()
            
            if len(valid_data) < 2:
                return {"slope": 0, "intercept": 0, "r_squared": 0, "error": "Insufficient data"}
            
            x = valid_data[x_var].values
            y = valid_data[y_var].values
            
            # Calculate regression
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
            r_squared = r_value ** 2
            
            return {
                "slope": round(float(slope), 4),
                "intercept": round(float(intercept), 2),
                "r_squared": round(float(r_squared), 4),
                "p_value": round(float(p_value), 4),
                "std_error": round(float(std_err), 4),
                "formula": f"y = {round(slope, 4)}x + {round(intercept, 2)}",
                "interpretation": f"For each unit increase in {x_var}, {y_var} changes by {round(slope, 4)} units"
            }
        except Exception as e:
            logger.error(f"Error calculating linear regression: {e}")
            return {"slope": 0, "intercept": 0, "r_squared": 0, "error": str(e)}

    @staticmethod
    def calculate_moving_average(rainfall_data: pd.Series, window: int = 3) -> List[float]:
        """
        Calculate moving average for trend analysis.
        
        Args:
            rainfall_data: Series of rainfall values
            window: Window size for moving average
            
        Returns:
            List of moving average values
        """
        try:
            if len(rainfall_data) < window:
                return rainfall_data.tolist()
            
            ma = rainfall_data.rolling(window=window, min_periods=1).mean()
            return [round(float(x), 2) if not pd.isna(x) else None for x in ma]
        except Exception as e:
            logger.error(f"Error calculating moving average: {e}")
            return rainfall_data.tolist()

    @staticmethod
    def detect_outliers(rainfall_data: pd.Series, method: str = "iqr") -> Dict[str, Any]:
        """
        Detect outliers using IQR method (boxplot).
        
        Args:
            rainfall_data: Series of rainfall values
            method: Detection method ('iqr' or 'zscore')
            
        Returns:
            Dictionary with outlier indices and values
        """
        if rainfall_data.empty:
            return {"outlier_count": 0, "outliers": [], "method": method}
        
        try:
            if method == "iqr":
                Q1 = rainfall_data.quantile(0.25)
                Q3 = rainfall_data.quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers = rainfall_data[(rainfall_data < lower_bound) | (rainfall_data > upper_bound)]
            else:  # zscore
                z_scores = np.abs(stats.zscore(rainfall_data.dropna()))
                outliers = rainfall_data[z_scores > 3]
            
            return {
                "outlier_count": len(outliers),
                "outliers": [round(float(x), 2) for x in outliers.values],
                "method": method,
                "percentage": round(len(outliers) / len(rainfall_data) * 100, 2)
            }
        except Exception as e:
            logger.error(f"Error detecting outliers: {e}")
            return {"outlier_count": 0, "outliers": [], "method": method, "error": str(e)}

    @staticmethod
    def calculate_seasonal_statistics(df: pd.DataFrame, date_col: str, value_col: str) -> Dict[str, Any]:
        """
        Calculate seasonal statistics (by month).
        
        Args:
            df: DataFrame with date and value columns
            date_col: Name of date column
            value_col: Name of value column
            
        Returns:
            Dictionary with seasonal statistics
        """
        if date_col not in df.columns or value_col not in df.columns:
            return {"seasonal_data": {}, "error": "Columns not found"}
        
        try:
            df_copy = df.copy()
            df_copy[date_col] = pd.to_datetime(df_copy[date_col])
            df_copy['month'] = df_copy[date_col].dt.month
            
            seasonal_stats = {}
            for month in range(1, 13):
                month_data = df_copy[df_copy['month'] == month][value_col]
                if not month_data.empty:
                    seasonal_stats[f"month_{month}"] = {
                        "mean": round(float(month_data.mean()), 2),
                        "median": round(float(month_data.median()), 2),
                        "std_dev": round(float(month_data.std()), 2),
                        "min": round(float(month_data.min()), 2),
                        "max": round(float(month_data.max()), 2)
                    }
            
            return {"seasonal_data": seasonal_stats}
        except Exception as e:
            logger.error(f"Error calculating seasonal statistics: {e}")
            return {"seasonal_data": {}, "error": str(e)}

    @staticmethod
    def generate_distribution_analysis(rainfall_data: pd.Series) -> Dict[str, Any]:
        """
        Generate histogram bins and distribution analysis.
        
        Returns:
            Dictionary with histogram data for visualization
        """
        if rainfall_data.empty:
            return {"bins": [], "counts": [], "skewness": 0, "kurtosis": 0}
        
        try:
            # Calculate histogram
            counts, bins = np.histogram(rainfall_data.dropna(), bins=20)
            bin_edges = [round(float(x), 2) for x in bins[:-1]]
            
            # Calculate skewness and kurtosis
            skewness = float(stats.skew(rainfall_data.dropna()))
            kurtosis_val = float(stats.kurtosis(rainfall_data.dropna()))
            
            return {
                "bins": bin_edges,
                "counts": counts.tolist(),
                "skewness": round(skewness, 3),
                "kurtosis": round(kurtosis_val, 3),
                "interpretation": "right-skewed" if skewness > 0 else "left-skewed" if skewness < 0 else "symmetric"
            }
        except Exception as e:
            logger.error(f"Error generating distribution analysis: {e}")
            return {"bins": [], "counts": [], "skewness": 0, "kurtosis": 0, "error": str(e)}
