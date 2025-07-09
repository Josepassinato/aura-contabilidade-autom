import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClientContext {
  id: string;
  name: string;
  cnpj: string;
  regime: string;
  permissions: string[];
  recentObligations: any[];
  accountantName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, token, message, audioData } = await req.json();

    // Validar token e obter contexto do cliente
    const { data: tokenData, error: tokenError } = await supabase
      .from('client_access_tokens')
      .select(`
        *,
        accounting_clients (
          id, name, cnpj, regime,
          user_profiles!accounting_clients_accounting_firm_id_fkey (full_name)
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = tokenData.accounting_clients;
    const clientContext: ClientContext = {
      id: client.id,
      name: client.name,
      cnpj: client.cnpj,
      regime: client.regime,
      permissions: tokenData.description ? JSON.parse(tokenData.description).permissions || [] : [],
      recentObligations: [],
      accountantName: client.user_profiles?.full_name || 'seu contador'
    };

    // Buscar obrigações recentes do cliente
    const { data: obligations } = await supabase
      .from('obrigacoes_fiscais')
      .select('*')
      .eq('client_id', client.id)
      .gte('data_vencimento', new Date().toISOString())
      .order('data_vencimento', { ascending: true })
      .limit(5);

    if (obligations) {
      clientContext.recentObligations = obligations;
    }

    switch (action) {
      case 'get_context':
        return new Response(
          JSON.stringify({ 
            success: true, 
            context: clientContext 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'process_audio':
        return await processAudioMessage(audioData, clientContext);

      case 'process_text':
        return await processTextMessage(message, clientContext);

      case 'get_obligations':
        return await getClientObligations(supabase, client.id);

      case 'schedule_meeting':
        return await scheduleMeeting(supabase, client.id, message);

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('❌ Erro no agente de voz:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processAudioMessage(audioData: string, context: ClientContext) {
  try {
    // 1. Transcrever áudio usando Whisper
    const transcription = await transcribeAudio(audioData);
    
    // 2. Processar com GPT
    const response = await processWithGPT(transcription, context);
    
    // 3. Converter resposta para áudio
    const audioResponse = await generateAudioResponse(response);

    return new Response(
      JSON.stringify({
        success: true,
        transcription,
        textResponse: response,
        audioResponse: audioResponse
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro processando áudio:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar áudio' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function processTextMessage(message: string, context: ClientContext) {
  try {
    const response = await processWithGPT(message, context);
    const audioResponse = await generateAudioResponse(response);

    return new Response(
      JSON.stringify({
        success: true,
        textResponse: response,
        audioResponse: audioResponse
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro processando texto:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar mensagem' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function transcribeAudio(audioData: string): Promise<string> {
  const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
  const formData = new FormData();
  formData.append('file', new Blob([binaryAudio], { type: 'audio/webm' }), 'audio.webm');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro na transcrição de áudio');
  }

  const result = await response.json();
  return result.text;
}

async function processWithGPT(message: string, context: ClientContext): Promise<string> {
  const systemPrompt = `Você é um assistente fiscal especializado para ${context.name} (CNPJ: ${context.cnpj}).
  
INFORMAÇÕES DO CLIENTE:
- Empresa: ${context.name}
- Regime: ${context.regime}
- Contador responsável: ${context.accountantName}

INSTRUÇÕES IMPORTANTES:
1. Seja cordial e use o nome da empresa
2. Responda apenas sobre assuntos fiscais/contábeis
3. Se não souber algo específico, ofereça agendar com o contador
4. Mantenha respostas concisas (máximo 2 parágrafos)
5. Use linguagem acessível, evite jargões técnicos excessivos

PERMISSÕES DISPONÍVEIS:
${context.permissions.length > 0 ? context.permissions.join(', ') : 'Consultas básicas'}

OBRIGAÇÕES PRÓXIMAS:
${context.recentObligations.map(o => `- ${o.descricao}: ${new Date(o.data_vencimento).toLocaleDateString('pt-BR')}`).join('\n')}

Responda de forma natural e útil:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro na resposta do GPT');
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

async function generateAudioResponse(text: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'nova', // Voz feminina brasileira
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    throw new Error('Erro na geração de áudio');
  }

  const arrayBuffer = await response.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}

async function getClientObligations(supabase: any, clientId: string) {
  const { data, error } = await supabase
    .from('obrigacoes_fiscais')
    .select('*')
    .eq('client_id', clientId)
    .gte('data_vencimento', new Date().toISOString())
    .order('data_vencimento', { ascending: true });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar obrigações' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, obligations: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scheduleMeeting(supabase: any, clientId: string, details: string) {
  // Criar notificação para o contador
  const { error } = await supabase
    .from('notifications')
    .insert({
      title: 'Solicitação de reunião via IA',
      message: `Cliente solicitou agendamento: ${details}`,
      type: 'meeting_request',
      category: 'client_communication',
      metadata: { clientId, requestedVia: 'voice_agent', details }
    });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao agendar reunião' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Solicitação enviada para seu contador. Ele entrará em contato em breve.' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}