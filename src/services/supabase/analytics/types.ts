
// Types for business analytics data
export interface BusinessMetrics {
  totalFirms: number;
  growthRate: number;
  monthlyRevenue: number;
  annualRevenue: number;
  retentionRate: number;
  churnRate: number;
  averageRevenuePerFirm: number;
}

export interface MonthlyGrowth {
  month: string;
  firms: number;
}

export interface RevenueTrend {
  month: string;
  revenue: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
  percentage: number;
}
