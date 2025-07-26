export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  type: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any[];
  enabled: boolean;
  last_run?: string;
  success_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  client_id?: string;
}

export interface AutomationMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  activeRules: number;
  rulesWithErrors: number;
}