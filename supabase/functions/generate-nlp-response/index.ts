
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
    const { nlpResult, clientContext } = await req.json();
    
    console.log('Gerando resposta para:', nlpResult, clientContext);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('OpenAI API key não configurada, usando template');
      const templateResponse = generateTemplateResponse(nlpResult, clientContext);
      return new Response(JSON.stringify({ response: templateResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use OpenAI for intelligent response generation
    const systemPrompt = `Você é um assistente contábil inteligente especializado em atendimento ao cliente.
    
    Contexto do cliente: ${clientContext ? `Cliente: ${clientContext.clientName} (ID: ${clientContext.clientId})` : 'Cliente geral'}
    
    Intenção identificada: ${nlpResult.intent}
    Texto original: "${nlpResult.originalText}"
    Entidades: ${JSON.stringify(nlpResult.entities)}
    
    Gere uma resposta profissional, útil e personalizada. Seja específico sobre ações que pode realizar ou informações que pode fornecer.
    Mantenha o tom amigável mas profissional. Limite a resposta a 2-3 frases.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: nlpResult.originalText
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      }),
    });

    if (!response.ok) {
      console.error('Erro na API OpenAI para geração de resposta:', response.status);
      throw new Error('Erro na geração de resposta');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Resposta gerada pela IA:', aiResponse);
    
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na geração de resposta:', error);
    
    // Fallback to template response
    const { nlpResult, clientContext } = await req.json();
    const templateResponse = generateTemplateResponse(nlpResult, clientContext);
    
    return new Response(JSON.stringify({ response: templateResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateTemplateResponse(nlpResult: any, clientContext: any): string {
  const clientName = clientContext?.clientName || 'cliente';
  
  switch (nlpResult.intent) {
    case 'fiscal_query':
      return `${clientName}, analisei sua situação fiscal e posso fornecer informações sobre obrigações, prazos e compliance. Como posso ajudar especificamente?`;
      
    case 'financial_report':
      const reportType = nlpResult.entities?.reportType || 'financeiro';
      return `Vou preparar um relatório de ${reportType} personalizado para ${clientName}. O documento incluirá análises baseadas nos dados mais recentes.`;
      
    case 'document_request':
      return `${clientName}, posso ajudar você a localizar e organizar os documentos necessários. Quais documentos específicos você precisa?`;
      
    case 'anomaly_detection':
      return `Realizei uma análise dos dados de ${clientName} e identifiquei alguns pontos que merecem atenção. Posso detalhar os achados para você.`;
      
    case 'cash_flow_prediction':
      return `Com base no histórico de ${clientName}, posso gerar projeções de fluxo de caixa considerando tendências e sazonalidade. Que período você gostaria de analisar?`;
      
    default:
      return `Olá ${clientName}! Sou seu assistente contábil inteligente. Posso ajudar com consultas fiscais, relatórios, análises e muito mais. Como posso ajudar?`;
  }
}
