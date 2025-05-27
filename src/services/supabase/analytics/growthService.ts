
import { supabase } from "@/integrations/supabase/client";
import { addMonths, startOfMonth, format } from "date-fns";
import { MonthlyGrowth } from "./types";

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
