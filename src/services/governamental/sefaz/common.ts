
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UF } from "../estadualIntegration";
import { ScrapeResult, SefazScrapedData, SefazScrapedResult } from "./types";
import { consultarSefazPorEstado } from "./estadualApiService";
import { buscarProcuracaoValidaAutomatica } from "../sefazAutomaticService";

/**
 * Trigger the SEFAZ scraper for a specific client - now using real API integration
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

    console.log(`Iniciando coleta real de dados SEFAZ-${uf} para cliente: ${clientId}`);

    // Verificar se existe procuração válida
    const procuracaoId = await buscarProcuracaoValidaAutomatica(clientId, uf);
    
    if (!procuracaoId) {
      // Se não tem procuração, usar o método de fallback (edge function simulada)
      console.log(`Nenhuma procuração encontrada para ${uf}, usando método de fallback`);
      
      const { data, error } = await supabase.functions.invoke("scrape-sefaz", {
        body: { clientId, uf },
      });

      if (error) {
        console.error("Error invoking scrape-sefaz function:", error);
        throw new Error(error.message || "Failed to start SEFAZ data scraping");
      }

      toast({
        title: "Coleta de dados iniciada (simulada)",
        description: `Processo de coleta simulada da SEFAZ-${uf} iniciado. Configure uma procuração eletrônica para acesso real.`,
        variant: "destructive"
      });

      return { 
        success: true, 
        data, 
        count: data?.count || 0 
      };
    }

    // Se tem procuração, usar a integração real
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
    
    // Define the raw type structure to avoid deep inference
    interface RawScrapeData {
      id: string;
      client_id: string;
      competencia: string | null;
      numero_guia: string | null;
      valor: string | null;
      data_vencimento: string | null;
      status: string | null;
      scraped_at: string | null;
      created_at: string | null;
      uf?: string | null;
    }
    
    // Execute the query with a simple type annotation
    let query = supabase
      .from("sefaz_sp_scrapes")
      .select("*")
      .eq("client_id", clientId)
      .order("scraped_at", { ascending: false });

    // Filter by UF if the column exists
    if (uf !== "SP") {
      query = query.eq("uf", uf);
    }
    
    const { data: rawData, error } = await query;
    
    if (error) {
      console.error("Error fetching SEFAZ scraped data:", error);
      throw error;
    }
    
    // Process and map the raw data to our expected type
    const scrapedData: SefazScrapedData[] = (rawData || []).map((item: RawScrapeData) => ({
      id: item.id,
      client_id: item.client_id,
      competencia: item.competencia || "",
      numero_guia: item.numero_guia || "",
      valor: item.valor || "",
      data_vencimento: item.data_vencimento || "",
      status: item.status || "",
      scraped_at: item.scraped_at || "",
      uf: item.uf || uf // Use database value if available, fallback to parameter
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
