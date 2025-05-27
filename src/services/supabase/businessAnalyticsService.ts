
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
 * Fetch high-level business analytics data from real database
 */
export async function fetchBusinessMetrics(): Promise<BusinessMetrics> {
  try {
    console.log("Buscando métricas reais do banco de dados...");
    
    // Get total number of firms from real data
    const { count: totalFirms, error: firmsError } = await supabase
      .from('accounting_clients')
      .select('*', { count: 'exact', head: true });
    
    if (firmsError) {
      console.error('Erro ao buscar total de contabilidades:', firmsError);
      throw firmsError;
    }
    
    console.log("Total de contabilidades reais:", totalFirms);
    
    // Get active subscriptions from real data
    const { data: activeSubscriptions, error: subsError } = await supabase
      .from('accounting_firm_subscriptions')
      .select('monthly_fee, plan_type')
      .eq('status', 'active');
      
    if (subsError) {
      console.error('Erro ao buscar assinaturas ativas:', subsError);
      throw subsError;
    }
    
    console.log("Assinaturas ativas reais:", activeSubscriptions?.length || 0);
      
    // Calculate monthly revenue from real data
    const monthlyRevenue = activeSubscriptions?.reduce((sum, sub) => sum + Number(sub.monthly_fee || 0), 0) || 0;
    console.log("Receita mensal real:", monthlyRevenue);
    
    // Get all subscriptions to calculate retention
    const { data: allSubscriptions, error: allSubsError } = await supabase
      .from('accounting_firm_subscriptions')
      .select('status');
      
    if (allSubsError) {
      console.error('Erro ao buscar todas as assinaturas:', allSubsError);
      throw allSubsError;
    }
      
    const totalSubs = allSubscriptions?.length || 0;
    const activeSubs = activeSubscriptions?.length || 0;
    
    // Calculate real retention and churn rates
    const retentionRate = totalSubs > 0 ? (activeSubs / totalSubs) * 100 : 0;
    const churnRate = 100 - retentionRate;
    
    console.log("Taxa de retenção real:", retentionRate);
    console.log("Taxa de cancelamento real:", churnRate);
    
    // Calculate average revenue per firm from real data
    const averageRevenuePerFirm = activeSubs > 0 ? monthlyRevenue / activeSubs : 0;
    
    // Calculate growth rate from real statistics data
    const currentMonth = startOfMonth(new Date());
    const lastMonth = startOfMonth(addMonths(new Date(), -1));
    
    const { data: currentMonthData, error: currentError } = await supabase
      .from('firm_monthly_statistics')
      .select('revenue_amount')
      .eq('month', format(currentMonth, 'yyyy-MM-dd'));
    
    const { data: lastMonthData, error: lastError } = await supabase
      .from('firm_monthly_statistics')
      .select('revenue_amount')
      .eq('month', format(lastMonth, 'yyyy-MM-dd'));
    
    if (currentError) console.warn('Aviso ao buscar dados do mês atual:', currentError);
    if (lastError) console.warn('Aviso ao buscar dados do mês anterior:', lastError);
    
    const currentMonthRevenue = currentMonthData?.reduce((sum, item) => sum + Number(item.revenue_amount || 0), 0) || 0;
    const lastMonthRevenue = lastMonthData?.reduce((sum, item) => sum + Number(item.revenue_amount || 0), 0) || 0;
    
    const growthRate = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;
    
    console.log("Taxa de crescimento real:", growthRate);
    
    const metrics = {
      totalFirms: totalFirms || 0,
      growthRate,
      monthlyRevenue,
      annualRevenue: monthlyRevenue * 12,
      retentionRate,
      churnRate,
      averageRevenuePerFirm
    };
    
    console.log("Métricas finais calculadas:", metrics);
    return metrics;
    
  } catch (error) {
    console.error('Erro ao buscar métricas de negócio:', error);
    // Return empty metrics instead of mock data
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
 * Fetch monthly growth data from real database
 */
export async function fetchMonthlyGrowth(): Promise<MonthlyGrowth[]> {
  try {
    console.log("Buscando dados de crescimento mensal reais...");
    
    // Get the last 12 months
    const months: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      months.push(startOfMonth(addMonths(new Date(), -i)));
    }
    
    const result: MonthlyGrowth[] = [];
    
    for (const month of months) {
      const monthString = format(month, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('firm_monthly_statistics')
        .select('firm_id')
        .eq('month', monthString);
      
      if (error) {
        console.warn(`Aviso ao buscar dados para ${monthString}:`, error);
      }
      
      result.push({
        month: format(month, 'MMM yyyy'),
        firms: data?.length || 0
      });
    }
    
    console.log("Dados de crescimento mensal reais:", result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar crescimento mensal:', error);
    return [];
  }
}

/**
 * Fetch monthly revenue trends from real database
 */
export async function fetchRevenueTrends(): Promise<RevenueTrend[]> {
  try {
    console.log("Buscando tendências de receita reais...");
    
    // Get the last 12 months
    const months: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      months.push(startOfMonth(addMonths(new Date(), -i)));
    }
    
    const result: RevenueTrend[] = [];
    
    for (const month of months) {
      const monthString = format(month, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('firm_monthly_statistics')
        .select('revenue_amount')
        .eq('month', monthString);
      
      if (error) {
        console.warn(`Aviso ao buscar receita para ${monthString}:`, error);
      }
      
      const revenue = data?.reduce((sum, item) => sum + Number(item.revenue_amount || 0), 0) || 0;
      
      result.push({
        month: format(month, 'MMM yyyy'),
        revenue
      });
    }
    
    console.log("Tendências de receita reais:", result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar tendências de receita:', error);
    return [];
  }
}

/**
 * Fetch distribution of firms by subscription plan from real data
 */
export async function fetchPlanDistribution(): Promise<PlanDistribution[]> {
  try {
    console.log("Buscando distribuição de planos reais...");
    
    const { data: subscriptions, error } = await supabase
      .from('accounting_firm_subscriptions')
      .select('plan_type')
      .eq('status', 'active');
    
    if (error) {
      console.error('Erro ao buscar assinaturas para distribuição:', error);
      throw error;
    }
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log("Nenhuma assinatura ativa encontrada");
      return [];
    }
    
    // Count occurrences of each plan type from real data
    const planCounts: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const planType = sub.plan_type || 'undefined';
      planCounts[planType] = (planCounts[planType] || 0) + 1;
    });
    
    // Calculate percentages and format as PlanDistribution[]
    const result: PlanDistribution[] = Object.entries(planCounts).map(([plan, count]) => ({
      plan,
      count,
      percentage: (count / subscriptions.length) * 100
    }));
    
    console.log("Distribuição de planos real:", result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar distribuição de planos:', error);
    return [];
  }
}
