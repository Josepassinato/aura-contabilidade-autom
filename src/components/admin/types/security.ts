export interface SecurityMetric {
  metric_name: string;
  metric_value: number;
  labels: any;
  timestamp: string;
}

export interface ValidationResult {
  validation_id: string;
  type: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: Record<string, any>;
  recommendations: string[];
}