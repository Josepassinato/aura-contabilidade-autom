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
    // Check if OPENAI_API_KEY secret exists
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const isConfigured = !!(openaiApiKey && openaiApiKey.trim() !== '');
    
    console.log('Checking OpenAI secret configuration:', { isConfigured });

    return new Response(
      JSON.stringify({
        isConfigured,
        message: isConfigured 
          ? "Chave OpenAI configurada no Supabase" 
          : "Chave OpenAI não encontrada no Supabase"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error checking OpenAI secret:', error);
    return new Response(
      JSON.stringify({
        isConfigured: false,
        message: `Erro ao verificar configuração: ${error.message}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});