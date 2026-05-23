/**
 * Type definitions for Rainfall Analysis Application
 */

// ==================== API Response Types ====================

export interface CentralTendency {
  mean: number;
  median: number;
  mode: number | null;
  count: number;
}

export interface Dispersion {
  variance: number;
  std_dev: number;
  range: number;
  min: number;
  max: number;
  iqr: number;
}

export interface Distribution {
  bins: number[];
  counts: number[];
  skewness: number;
  kurtosis: number;
  interpretation: string;
}

export interface Outliers {
  outlier_count: number;
  outliers: number[];
  method: string;
  percentage?: number;
}

export interface CorrelationAnalysis {
  correlation: number;
  p_value: number;
  interpretation: string;
  sample_size?: number;
}

export interface RegressionAnalysis {
  slope: number;
  intercept: number;
  r_squared: number;
  p_value: number;
  std_error: number;
  formula: string;
  interpretation: string;
}

export interface SeasonalStats {
  mean: number;
  median: number;
  std_dev: number;
  min: number;
  max: number;
}

export interface SeasonalData {
  seasonal_data: Record<string, SeasonalStats>;
}

export interface SeasonalResponse {
  status: string;
  seasonal_analysis?: SeasonalData;
  message?: string;
}

export interface StatisticsResponse {
  status: string;
  central_tendency?: CentralTendency;
  dispersion?: Dispersion;
  distribution?: Distribution;
  outliers?: Outliers;
  correlation_analysis?: CorrelationAnalysis;
  regression_analysis?: RegressionAnalysis;
  seasonal_analysis?: SeasonalData;
}

// ==================== ML Types ====================

export interface TrainingMetrics {
  status: string;
  train_mae?: number;
  test_mae?: number;
  train_rmse?: number;
  test_rmse?: number;
  train_r2_score?: number;
  test_r2_score?: number;
  samples?: {
    train: number;
    test: number;
  };
  features?: string[];
  interpretation?: string;
  error?: string;
}

export interface TrainingResponse {
  status: string;
  training_metrics?: TrainingMetrics;
  message?: string;
}

export interface Forecast {
  period: number;
  predicted_rainfall_mm: number;
}

export interface ForecastResponse {
  status: string;
  forecast_periods?: number;
  forecasts?: Forecast[];
  message?: string;
}

export interface PredictionResponse {
  status: string;
  prediction_mm?: number;
  confidence_interval?: {
    lower: number;
    upper: number;
  };
  input_features?: Record<string, number>;
  message?: string;
}

export interface FeatureImportance {
  status: string;
  feature_importance?: Record<string, number>;
  top_features?: string[];
  message?: string;
}

// ==================== Monthly Data Types ====================

export interface MonthlySummary {
  month_count: number;
  available_months: string[];
  latest_month: string;
  latest_total_rainfall_mm: number;
  latest_rolling_3mo_avg_mm: number;
}

export interface MonthlyTrend {
  month: string;
  total_rainfall_mm: number;
  avg_rainfall_mm: number;
  max_rainfall_mm: number;
  rainy_observations: number;
  observation_count: number;
  month_index?: number;
  rolling_3mo_avg_mm?: number;
  month_over_month_change_mm?: number;
}

export interface MonthlyTrendsResponse {
  series: MonthlyTrend[];
}

export interface LocationData {
  month: string;
  latitude: number;
  longitude: number;
  total_rainfall_mm: number;
  avg_rainfall_mm: number;
  max_rainfall_mm: number;
  rainy_days: number;
  observation_count: number;
}

export interface MonthlyDataResponse {
  month: string | null;
  records: LocationData[];
}

// ==================== Dashboard Types ====================

export interface RainfallRecord {
  date: string;
  rainfall_mm: number;
  latitude?: number;
  longitude?: number;
}

export interface DashboardSummary {
  row_count: number;
  date_count: number;
  available_dates: string[];
  min_date: string;
  max_date: string;
  latest_date: string;
  month_count: number;
  available_months: string[];
  latest_month: string;
}

export interface MapPoint {
  date: string | null;
  point_count: number;
  points: RainfallRecord[];
}

export interface TrendData {
  date: string;
  avg_rainfall_mm: number;
  max_rainfall_mm: number;
  rainy_locations: number;
  location_count: number;
}

export interface TrendsResponse {
  series: TrendData[];
}

// ==================== Report Types ====================

export interface ReportChapter {
  title: string;
  content: string;
}

export interface AnalysisReport {
  title: string;
  generated_date: string;
  version: string;
  chapters: ReportChapter[];
  total_chapters: number;
}

export interface ReportResponse {
  status: string;
  report?: AnalysisReport;
  message?: string;
}

export interface ExportResponse {
  status: string;
  format: string;
  content: string | AnalysisReport;
}

// ==================== Hook State Types ====================

export interface StatisticsState {
  stats: StatisticsResponse | null;
  correlation: {
    status?: string;
    correlation_analysis?: CorrelationAnalysis;
    message?: string;
  } | null;
  regression: {
    status?: string;
    regression_analysis?: RegressionAnalysis;
    message?: string;
  } | null;
  seasonal: SeasonalResponse | null;
  loading: boolean;
  error: string | null;
}

export interface PredictionState {
  predictions: PredictionResponse | null;
  forecast: ForecastResponse | null;
  features: FeatureImportance | null;
  training: TrainingResponse | null;
  loading: boolean;
  error: string | null;
  trainModel: () => Promise<TrainingResponse | null>;
  getPrediction: (month: number, year: number, dayOfYear: number) => Promise<PredictionResponse | null>;
  getForecast: (periods?: number) => Promise<ForecastResponse | null>;
  getFeatureImportance: () => Promise<FeatureImportance | null>;
}

export interface MonthlyDataState {
  monthlySummary: MonthlySummary | null;
  monthlyTrends: MonthlyTrendsResponse | null;
  monthlyData: MonthlyDataResponse | null;
  loading: boolean;
  error: string | null;
}

export interface ReportState {
  report: ReportResponse | null;
  loading: boolean;
  error: string | null;
  generateReport: () => Promise<ReportResponse | null>;
  exportReport: (format: 'json' | 'markdown') => Promise<ExportResponse | null>;
}

export interface DashboardDataState {
  summary: DashboardSummary | null;
  rows: RainfallRecord[];
  mapData: MapPoint;
  trendSeries: TrendData[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  status: string;
  error: string;
  mapError: string;
}

export interface DerivedMetrics {
  averageRainfall: number;
  maxRainfall: number;
  minRainfall: number;
  rainyLocations: number;
  heavyRainLocations: number;
  topLocations: RainfallRecord[];
  alertLocations: RainfallRecord[];
  latestRange: string;
}

// ==================== Component Props Types ====================

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: 'blue' | 'green' | 'cyan' | 'purple' | 'red' | 'orange';
  icon?: React.ReactNode;
}

export interface StatsCardProps {
  title: string;
  stats: Record<string, number | null>;
}

export interface ChartProps {
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  title: string;
  height?: number;
}

export interface DashboardShellProps {
  activePath: string;
  title: string;
  eyebrow: string;
  statusText?: string;
  summary?: DashboardSummary | null;
  selectedDate?: string;
  setSelectedDate?: (date: string) => void;
  latestRange?: string;
  selectionOptions?: string[];
  displayLabel?: string;
  children: React.ReactNode;
}

// ==================== Utility Types ====================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

export interface FormState {
  month: number;
  year: number;
  dayOfYear: number;
}
