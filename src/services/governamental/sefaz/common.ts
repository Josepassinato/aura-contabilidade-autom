
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UF } from "../estadualIntegration";
import { ScrapeResult, SefazScrapedData, SefazScrapedResult } from "./types";

/**
 * Trigger the SEFAZ scraper for a specific client
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
      description: `O processo de coleta de dados da SEFAZ-${uf} foi iniciado com sucesso`,
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
    
    // Avoid type inference issues by using a more direct approach without chaining
    // Get data first, then handle the response separately
    type ScrapesResponse = {
      data: SefazScrapedData[] | null;
      error: Error | null;
    };
    
    // Use explicit typing to break the deep type instantiation
    const { data, error }: ScrapesResponse = await supabase
      .from("sefaz_sp_scrapes")
      .select("*")
      .eq("client_id", clientId)
      .order("scraped_at", { ascending: false })
      .eq("uf", uf);
      
    if (error) {
      console.error("Error fetching SEFAZ scraped data:", error);
      throw error;
    }

    // Safely handle potentially null data
    const scrapedData: SefazScrapedData[] = data || [];
    
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
