
import { supabase } from "@/integrations/supabase/client";
import { addMonths, startOfMonth, format } from "date-fns";
import { RevenueTrend } from "./types";
import { logger } from "@/utils/logger";

/**
 * Fetch monthly revenue trends from real database
 */
export async function fetchRevenueTrends(): Promise<RevenueTrend[]> {
  try {
    logger.info("Buscando tendências de receita reais", undefined, "RevenueService");
    
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
        logger.warn(`Aviso ao buscar receita para ${monthString}`, error, "RevenueService");
      }
      
      const revenue = data?.reduce((sum, item) => sum + Number(item.revenue_amount || 0), 0) || 0;
      
      result.push({
        month: format(month, 'MMM yyyy'),
        revenue
      });
    }
    
    logger.debug("Tendências de receita reais", result, "RevenueService");
    return result;
  } catch (error) {
    logger.error('Erro ao buscar tendências de receita', error, "RevenueService");
    return [];
  }
}
