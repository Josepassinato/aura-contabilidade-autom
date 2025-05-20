
// SEFAZ Portal Scraper Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define necessary environment variables
const SEFAZ_USERNAME = Deno.env.get("SEFAZ_USERNAME") || "";
const SEFAZ_PASSWORD = Deno.env.get("SEFAZ_PASSWORD") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Verify we're receiving a POST request
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }), 
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    // Parse the request to get client ID and UF (state)
    const { clientId, uf = "SP" } = await req.json();
    
    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "Client ID is required" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    // Verify credentials are configured
    if (!SEFAZ_USERNAME || !SEFAZ_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "SEFAZ credentials not configured" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // First, verify the client exists
    const { data: clientData, error: clientError } = await supabase
      .from('accounting_clients')
      .select('id, name')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      return new Response(
        JSON.stringify({ error: "Client not found" }), 
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    console.log(`Starting SEFAZ-${uf} scrape for client: ${clientData.name}`);

    // Launch browser
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // In production, set headless to true
      headless: false 
    });
    
    const page = await browser.newPage();

    // Mock data for development (In production, this would be actual scraped data)
    const mockGuias = [
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

    // In a real implementation, we would navigate to the SEFAZ portal and login
    // Different portals for different states
    let portalUrl;
    switch(uf) {
      case "SP":
        portalUrl = "https://portal.fazenda.sp.gov.br/login";
        break;
      case "RJ":
        portalUrl = "https://www4.fazenda.rj.gov.br/";
        break;
      case "SC":
        portalUrl = "https://sat.sef.sc.gov.br/";
        break;
      default:
        portalUrl = "https://portal.fazenda.sp.gov.br/login";
    }
    
    // console.log(`Navigating to ${portalUrl} for SEFAZ-${uf}`);
    // await page.goto(portalUrl);
    // await page.fill('#username', SEFAZ_USERNAME);
    // await page.fill('#password', SEFAZ_PASSWORD);
    // await page.click('button[type="submit"]');
    // await page.waitForNavigation();
    
    // Then navigate to the tax obligations section and scrape data
    // await page.click('a[href*="obrigacoes"]');
    // await page.waitForSelector('table.obrigacoes');
    // 
    // const guias = await page.$$eval('table.obrigacoes tr', rows => {
    //   return rows.map(row => {
    //     const cells = row.querySelectorAll('td');
    //     return {
    //       competencia: cells[0]?.textContent?.trim() || '',
    //       numero_guia: cells[1]?.textContent?.trim() || '',
    //       valor: cells[2]?.textContent?.trim() || '',
    //       data_vencimento: cells[3]?.textContent?.trim() || '',
    //       status: cells[4]?.textContent?.trim() || ''
    //     };
    //   });
    // });

    await browser.close();

    // Insert the scraped data (using mock data for now)
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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
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
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in scrape-sefaz function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during scraping" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
