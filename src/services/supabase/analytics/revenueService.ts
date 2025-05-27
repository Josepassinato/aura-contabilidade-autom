
import { supabase } from "@/integrations/supabase/client";
import { addMonths, startOfMonth, format } from "date-fns";
import { RevenueTrend } from "./types";

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
