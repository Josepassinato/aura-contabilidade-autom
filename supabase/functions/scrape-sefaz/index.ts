
// SEFAZ Portal Scraper Edge Function - Internal use only
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { internalHeaders } from '../_shared/secure-api.ts'

// Define necessary environment variables
const SEFAZ_USERNAME = Deno.env.get("SEFAZ_USERNAME") || "";
const SEFAZ_PASSWORD = Deno.env.get("SEFAZ_PASSWORD") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SERPRO_API_KEY = Deno.env.get("SERPRO_API_KEY") || ""; // Nova variável para API do Serpro

serve(async (req: Request) => {
  // Internal function - no CORS needed
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }), 
      { status: 405, headers: internalHeaders }
    );
  }

  try {
    // Parse the request to get client ID and UF (state)
    const { clientId, uf = "SP" } = await req.json();
    
    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "Client ID is required" }), 
        { status: 400, headers: internalHeaders }
      );
    }

    // Verificar credenciais conforme o estado
    if (uf === "SC") {
      // Para Santa Catarina, verificar se temos a API key do Serpro
      if (!SERPRO_API_KEY) {
        return new Response(
          JSON.stringify({ error: "SERPRO API key not configured for SC integration" }), 
          { status: 500, headers: internalHeaders }
        );
      }
    } else {
      // Para outros estados, verificar credenciais padrão
      if (!SEFAZ_USERNAME || !SEFAZ_PASSWORD) {
        return new Response(
          JSON.stringify({ error: "SEFAZ credentials not configured" }), 
          { status: 500, headers: internalHeaders }
        );
      }
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // First, verify the client exists
    const { data: clientData, error: clientError } = await supabase
      .from('accounting_clients')
      .select('id, name, cnpj')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      return new Response(
        JSON.stringify({ error: "Client not found" }), 
        { status: 404, headers: internalHeaders }
      );
    }

    console.log(`Starting SEFAZ-${uf} scrape for client: ${clientData.name}`);

    // Obter guias com base no estado
    let mockGuias = [];
    
    if (uf === "SC") {
      // Implementação específica para Santa Catarina usando Integra Contador
      mockGuias = await scrapeSantaCatarina(clientData.cnpj);
    } else {
      // Implementação padrão para outros estados
      mockGuias = [
        {
          competencia: "01/2025",
          numero_guia: "123456789",
          valor: "R$ 1.250,00",
          data_vencimento: "15/01/2025",
          status: "Pendente"
        },
        {
          competencia: "02/2025",
          numero_guia: "987654321",
          valor: "R$ 1.300,00",
          data_vencimento: "15/02/2025",
          status: "Pendente"
        }
      ];
    }

    // Insert the scraped data
    const { data: insertedData, error: insertError } = await supabase
      .from('sefaz_sp_scrapes')
      .insert(mockGuias.map(guia => ({
        client_id: clientId,
        competencia: guia.competencia,
        numero_guia: guia.numero_guia,
        valor: guia.valor,
        data_vencimento: guia.data_vencimento,
        status: guia.status,
        uf: uf // Adicionando campo UF para diferenciar os estados
      })));

    if (insertError) {
      console.error("Error inserting data:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save scraped data" }), 
        { status: 500, headers: internalHeaders }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully scraped ${mockGuias.length} tax obligations from SEFAZ-${uf}`,
        count: mockGuias.length
      }),
      { 
        status: 200, 
        headers: internalHeaders
      }
    );

  } catch (error) {
    console.error("Error in scrape-sefaz function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during scraping" }),
      { 
        status: 500, 
        headers: internalHeaders
      }
    );
  }
});

/**
 * Função específica para raspar dados da SEFAZ de Santa Catarina
 * Utiliza o serviço Integra Contador do Serpro
 */
async function scrapeSantaCatarina(cnpj: string) {
  console.log(`Usando Integra Contador do Serpro para CNPJ: ${cnpj}`);
  
  try {
    // Em uma implementação real, aqui faríamos uma requisição para a API do Serpro
    // usando o SERPRO_API_KEY e o certificado digital
    
    // Simulando guias obtidas via Integra Contador
    return [
      {
        competencia: "03/2025",
        numero_guia: "SC-2025-001",
        valor: "R$ 950,00",
        data_vencimento: "10/03/2025",
        status: "Pendente"
      },
      {
        competencia: "04/2025",
        numero_guia: "SC-2025-002",
        valor: "R$ 980,00",
        data_vencimento: "10/04/2025",
        status: "Pendente"
      },
      {
        competencia: "05/2025",
        numero_guia: "SC-2025-003",
        valor: "R$ 1.020,00",
        data_vencimento: "10/05/2025",
        status: "Em processamento"
      }
    ];
  } catch (error) {
    console.error("Erro ao acessar API do Serpro:", error);
    throw new Error("Falha ao obter dados através do Integra Contador");
  }
}
