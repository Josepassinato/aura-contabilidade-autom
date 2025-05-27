
import { supabase } from "@/integrations/supabase/client";
import { addMonths, startOfMonth, format } from "date-fns";
import { MonthlyGrowth } from "./types";

/**
 * Fetch monthly growth data from real database - accounting firms only
 */
export async function fetchMonthlyGrowth(): Promise<MonthlyGrowth[]> {
  try {
    console.log("Buscando dados de crescimento mensal reais de escritórios de contabilidade...");
    
    // Get the last 12 months
    const months: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      months.push(startOfMonth(addMonths(new Date(), -i)));
    }
    
    const result: MonthlyGrowth[] = [];
    
    // For each month, count how many accounting firms were active
    for (const month of months) {
      const monthString = format(month, 'yyyy-MM-dd');
      
      // Count accounting firms that were created before or during this month
      const { count, error } = await supabase
        .from('accounting_firms')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', `${monthString}T23:59:59.999Z`);
      
      if (error) {
        console.warn(`Aviso ao buscar dados para ${monthString}:`, error);
      }
      
      result.push({
        month: format(month, 'MMM yyyy'),
        firms: count || 0
      });
    }
    
    console.log("Dados de crescimento mensal de escritórios de contabilidade:", result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar crescimento mensal:', error);
    return [];
  }
}
