
import { supabase } from "@/integrations/supabase/client";
import { PlanDistribution } from "./types";

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
