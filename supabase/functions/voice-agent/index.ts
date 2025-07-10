import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, clientId, context } = await req.json();

    if (!message || !clientId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client information
    const { data: client, error: clientError } = await supabase
      .from('accounting_clients')
      .select(`
        id, name, cnpj, regime, status,
        accounting_firms(name)
      `)
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found or unauthorized');
    }

    // Build context for the AI agent
    const systemPrompt = `Você é um assistente inteligente de contabilidade especializado em ajudar a empresa "${client.name}".

Informações da empresa:
- Nome: ${client.name}
- CNPJ: ${client.cnpj}
- Regime Tributário: ${client.regime}
- Contabilidade: ${client.accounting_firms?.name}

Suas responsabilidades:
1. Responder perguntas sobre contabilidade e questões fiscais
2. Fornecer informações específicas sobre a empresa quando disponível
3. Orientar sobre obrigações fiscais e prazos
4. Esclarecer dúvidas sobre documentos contábeis
5. Ser prestativo e profissional

Diretrizes importantes:
- Sempre seja específico e preciso
- Se não tiver informação específica, deixe claro
- Sugira entrar em contato com a contabilidade para questões complexas
- Mantenha um tom profissional mas amigável
- Responda de forma concisa mas completa

Pergunta do usuário: ${message}`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('OpenAI API error');
    }

    const aiData = await openAIResponse.json();
    const aiResponse = aiData.choices[0].message.content;

    // Log the interaction
    await supabase.from('automated_actions_log').insert({
      client_id: clientId,
      action_type: 'voice_agent_interaction',
      description: 'User interaction with voice agent',
      metadata: {
        user_message: message,
        ai_response: aiResponse,
        context: context,
        model_used: 'gpt-4.1-2025-04-14'
      },
      success: true
    });

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Voice agent error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "Desculpe, ocorreu um erro interno. Tente novamente ou entre em contato com sua contabilidade.",
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});