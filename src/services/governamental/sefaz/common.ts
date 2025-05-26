
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UF } from "../estadualIntegration";
import { ScrapeResult, SefazScrapedData, SefazScrapedResult } from "./types";
import { consultarSefazPorEstado } from "./estadualApiService";
import { buscarProcuracaoValidaAutomatica } from "../sefazAutomaticService";

/**
 * Trigger the SEFAZ scraper for a specific client - REAL API integration only
 * @param clientId The ID of the client to scrape data for
 * @param uf The state code (UF) to scrape data from
 * @returns Promise with the scrape result
 */
export async function triggerSefazScrape(
  clientId: string,
  uf: UF = "SP"
): Promise<ScrapeResult> {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    console.log(`Iniciando coleta REAL de dados SEFAZ-${uf} para cliente: ${clientId}`);

    // Verificar se existe procuração válida (OBRIGATÓRIO)
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, uf);
    
    if (!procuracaoId) {
      const errorMessage = `Cliente não possui procuração eletrônica válida para SEFAZ-${uf}. Configure uma procuração eletrônica para acessar os dados reais.`;
      
      toast({
        title: "Procuração eletrônica necessária",
        description: errorMessage,
        variant: "destructive"
      });

      return { 
        success: false, 
        error: errorMessage
      };
    }

    // Usar APENAS a integração real
    console.log(`Procuração encontrada (${procuracaoId}), usando integração real`);
    
    const result = await consultarSefazPorEstado(clientId, uf);
    
    if (result.success) {
      toast({
        title: "Dados coletados com sucesso",
        description: `Dados reais da SEFAZ-${uf} coletados via procuração eletrônica`,
      });
    } else {
      toast({
        title: "Erro na coleta de dados",
        description: result.error || `Não foi possível coletar dados da SEFAZ-${uf}`,
        variant: "destructive",
      });
    }

    return result;
    
  } catch (error: any) {
    console.error("Error triggering SEFAZ scrape:", error);
    
    toast({
      title: "Erro ao iniciar coleta",
      description: error.message || `Não foi possível iniciar a coleta de dados da SEFAZ-${uf}`,
      variant: "destructive",
    });
    
    return { 
      success: false, 
      error: error.message || "Failed to trigger SEFAZ scrape"
    };
  }
}

/**
 * Get scraped SEFAZ data for a specific client
 * @param clientId The ID of the client to get data for
 * @param uf The state code (UF) to filter data by
 * @returns Promise with the scraped data
 */
export async function getSefazScrapedData(
  clientId: string, 
  uf: UF = "SP"
): Promise<SefazScrapedResult> {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    console.log(`Fetching SEFAZ-${uf} data for client: ${clientId}`);
    
    // Simplify query to avoid deep type instantiation
    let query = supabase
      .from("sefaz_sp_scrapes")
      .select("id, client_id, competencia, numero_guia, valor, data_vencimento, status, scraped_at, created_at")
      .eq("client_id", clientId)
      .order("scraped_at", { ascending: false });

    // Filter by UF if needed (for future multi-state support)
    if (uf !== "SP") {
      // Note: Current table doesn't have UF column, this is for future compatibility
      console.log(`Filtering by UF ${uf} (not yet implemented in database)`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching SEFAZ scraped data:", error);
      throw error;
    }
    
    // Process the data with explicit typing
    const scrapedData: SefazScrapedData[] = (data || []).map((item) => ({
      id: item.id,
      client_id: item.client_id,
      competencia: item.competencia || "",
      numero_guia: item.numero_guia || "",
      valor: item.valor || "",
      data_vencimento: item.data_vencimento || "",
      status: item.status || "",
      scraped_at: item.scraped_at || "",
      uf: uf // Use parameter value since database doesn't have UF column yet
    }));
    
    return { 
      success: true, 
      data: scrapedData
    };
  } catch (error: any) {
    console.error("Error fetching SEFAZ scraped data:", error);
    return { 
      success: false, 
      error: error.message || `Failed to fetch SEFAZ-${uf} scraped data`
    };
  }
}
