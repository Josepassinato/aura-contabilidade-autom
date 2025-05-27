
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { model } = await req.json();
    
    // Get API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Chave da API OpenAI não configurada. Configure a chave nas configurações do sistema."
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Test the connection with a simple API call
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new Response(
        JSON.stringify({
          success: false,
          message: `Erro na API OpenAI: ${response.status} - ${errorData}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const modelExists = data.data?.some((m: any) => m.id === model);

    if (!modelExists) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Modelo "${model}" não encontrado ou não acessível com esta chave API.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Configuração validada com sucesso. A IA está pronta para uso no sistema!"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro ao validar configuração: ${error.message}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
