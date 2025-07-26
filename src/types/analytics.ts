/**
 * Interfaces específicas para dados de analytics
 */

export interface MetricData {
  value: number;
  timestamp: string;
  label?: string;
  category?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  timestamp?: string;
  category?: string;
}

export interface PerformanceMetric {
  id: string;
  function_name: string;
  execution_time_ms: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  error_rate: number;
  throughput_per_second: number;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface AnalyticsAlert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

export interface DashboardMetrics {
  totalUsers: number;
  activeClients: number;
  documentsProcessed: number;
  averageResponseTime: number;
  errorRate: number;
  systemUptime: number;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: TimeSeriesDataset[];
}

export interface TimeSeriesDataset {
  label: string;
  data: number[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

export interface AggregatedMetric {
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
  growth?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface PeriodComparison {
  current: AggregatedMetric;
  previous: AggregatedMetric;
  percentChange: number;
  period: 'hour' | 'day' | 'week' | 'month';
}

export interface UserActivity {
  userId: string;
  action: string;
  timestamp: string;
  duration?: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastChecked: string;
}