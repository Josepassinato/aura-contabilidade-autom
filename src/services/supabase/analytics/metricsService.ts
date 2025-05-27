
import { supabase } from "@/integrations/supabase/client";
import { BusinessMetrics } from "./types";

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
    const growthRate = await calculateGrowthRate();
    
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

async function calculateGrowthRate(): Promise<number> {
  try {
    const { addMonths, startOfMonth, format } = await import("date-fns");
    
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
    return growthRate;
  } catch (error) {
    console.error('Erro ao calcular taxa de crescimento:', error);
    return 0;
  }
}
