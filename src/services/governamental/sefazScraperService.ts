
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
}

/**
 * Trigger the SEFAZ scraper for a specific client
 * @param clientId The ID of the client to scrape data for
 * @param uf The state code (UF) to scrape data from
 * @returns Promise with the scrape result
 */
export async function triggerSefazScrape(
  clientId: string,
  uf: string = "SP"
): Promise<ScrapeResult> {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    console.log(`Triggering SEFAZ-${uf} scrape for client: ${clientId}`);

    const { data, error } = await supabase.functions.invoke("scrape-sefaz", {
      body: { clientId, uf },
    });

    if (error) {
      console.error("Error invoking scrape-sefaz function:", error);
      throw new Error(error.message || "Failed to start SEFAZ data scraping");
    }

    toast({
      title: "Coleta de dados iniciada",
      description: "O processo de coleta de dados da SEFAZ foi iniciado com sucesso",
    });

    return { 
      success: true, 
      data, 
      count: data?.count || 0 
    };
  } catch (error: any) {
    console.error("Error triggering SEFAZ scrape:", error);
    
    toast({
      title: "Erro ao iniciar coleta",
      description: error.message || "Não foi possível iniciar a coleta de dados da SEFAZ",
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
 * @returns Promise with the scraped data
 */
export async function getSefazScrapedData(clientId: string) {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    const { data, error } = await supabase
      .from("sefaz_sp_scrapes")
      .select("*")
      .eq("client_id", clientId)
      .order("scraped_at", { ascending: false });

    if (error) {
      console.error("Error fetching SEFAZ scraped data:", error);
      throw error;
    }

    return { 
      success: true, 
      data 
    };
  } catch (error: any) {
    console.error("Error fetching SEFAZ scraped data:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch SEFAZ scraped data"
    };
  }
}
