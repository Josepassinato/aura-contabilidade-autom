
import { supabase } from "@/integrations/supabase/client";
import { addMonths, startOfMonth, format } from "date-fns";

// Types for our analytics data
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

/**
 * Fetch high-level business analytics data
 */
export async function fetchBusinessMetrics(): Promise<BusinessMetrics> {
  try {
    // Get total number of firms
    const { count: totalFirms } = await supabase
      .from('accounting_clients')
      .select('*', { count: 'exact', head: true });
    
    // Get active subscriptions
    const { data: activeSubscriptions } = await supabase
      .from('accounting_firm_subscriptions')
      .select('monthly_fee')
      .eq('status', 'active');
      
    // Calculate monthly revenue
    const monthlyRevenue = activeSubscriptions?.reduce((sum, sub) => sum + Number(sub.monthly_fee), 0) || 0;
    
    // Calculate retention and churn rates
    const { data: allSubscriptions } = await supabase
      .from('accounting_firm_subscriptions')
      .select('status');
      
    const totalSubs = allSubscriptions?.length || 0;
    const activeSubs = activeSubscriptions?.length || 0;
    
    const retentionRate = totalSubs > 0 ? (activeSubs / totalSubs) * 100 : 0;
    const churnRate = 100 - retentionRate;
    
    // Calculate average revenue per firm
    const averageRevenuePerFirm = activeSubs > 0 ? monthlyRevenue / activeSubs : 0;
    
    // Calculate growth rate (last month vs. current month)
    const currentMonth = startOfMonth(new Date());
    const lastMonth = startOfMonth(addMonths(new Date(), -1));
    
    const { data: currentMonthData } = await supabase
      .from('firm_monthly_statistics')
      .select('revenue_amount')
      .eq('month', format(currentMonth, 'yyyy-MM-dd'));
    
    const { data: lastMonthData } = await supabase
      .from('firm_monthly_statistics')
      .select('revenue_amount')
      .eq('month', format(lastMonth, 'yyyy-MM-dd'));
    
    const currentMonthRevenue = currentMonthData?.reduce((sum, item) => sum + Number(item.revenue_amount), 0) || 0;
    const lastMonthRevenue = lastMonthData?.reduce((sum, item) => sum + Number(item.revenue_amount), 0) || 0;
    
    const growthRate = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;
    
    return {
      totalFirms: totalFirms || 0,
      growthRate,
      monthlyRevenue,
      annualRevenue: monthlyRevenue * 12, // Simple annual projection
      retentionRate,
      churnRate,
      averageRevenuePerFirm
    };
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    return {
      totalFirms: 0,
      growthRate: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      retentionRate: 0,
      churnRate: 0,
      averageRevenuePerFirm: 0
    };
  }
}

/**
 * Fetch monthly growth data for the last 12 months
 */
export async function fetchMonthlyGrowth(): Promise<MonthlyGrowth[]> {
  try {
    // Get the last 12 months
    const months: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      months.push(startOfMonth(addMonths(new Date(), -i)));
    }
    
    const result: MonthlyGrowth[] = [];
    
    for (const month of months) {
      const monthString = format(month, 'yyyy-MM-dd');
      const { data } = await supabase
        .from('firm_monthly_statistics')
        .select('firm_id')
        .eq('month', monthString);
      
      result.push({
        month: format(month, 'MMM yyyy'),
        firms: data?.length || 0
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching monthly growth:', error);
    return [];
  }
}

/**
 * Fetch monthly revenue trends for the last 12 months
 */
export async function fetchRevenueTrends(): Promise<RevenueTrend[]> {
  try {
    // Get the last 12 months
    const months: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      months.push(startOfMonth(addMonths(new Date(), -i)));
    }
    
    const result: RevenueTrend[] = [];
    
    for (const month of months) {
      const monthString = format(month, 'yyyy-MM-dd');
      const { data } = await supabase
        .from('firm_monthly_statistics')
        .select('revenue_amount')
        .eq('month', monthString);
      
      const revenue = data?.reduce((sum, item) => sum + Number(item.revenue_amount), 0) || 0;
      
      result.push({
        month: format(month, 'MMM yyyy'),
        revenue
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    return [];
  }
}

/**
 * Fetch distribution of firms by subscription plan
 */
export async function fetchPlanDistribution(): Promise<PlanDistribution[]> {
  try {
    const { data: subscriptions } = await supabase
      .from('accounting_firm_subscriptions')
      .select('plan_type')
      .eq('status', 'active');
    
    if (!subscriptions || subscriptions.length === 0) {
      return [];
    }
    
    // Count occurrences of each plan type
    const planCounts: Record<string, number> = {};
    subscriptions.forEach(sub => {
      planCounts[sub.plan_type] = (planCounts[sub.plan_type] || 0) + 1;
    });
    
    // Calculate percentages and format as PlanDistribution[]
    const result: PlanDistribution[] = Object.entries(planCounts).map(([plan, count]) => ({
      plan,
      count,
      percentage: (count / subscriptions.length) * 100
    }));
    
    return result;
  } catch (error) {
    console.error('Error fetching plan distribution:', error);
    return [];
  }
}
