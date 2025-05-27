
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
    const { text } = await req.json();
    
    if (!text) {
      throw new Error('Texto não fornecido');
    }

    console.log('Processando NLP para texto:', text);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('OpenAI API key não configurada, usando análise de palavras-chave');
      // Fallback to keyword analysis
      const result = analyzeWithKeywords(text);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use OpenAI for real NLP processing
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
            content: `Você é um assistente de análise de linguagem natural especializado em contabilidade. 
            Analise o texto fornecido e identifique a intenção (intent) e entidades relevantes.
            
            Intenções possíveis:
            - fiscal_query: consultas sobre obrigações fiscais, impostos, compliance
            - financial_report: solicitações de relatórios financeiros, demonstrativos
            - document_request: pedidos de documentos, arquivos, comprovantes
            - anomaly_detection: detecção de irregularidades, erros, inconsistências
            - cash_flow_prediction: previsões de fluxo de caixa, projeções financeiras
            - tax_calculation: cálculos de impostos, tributos
            - unknown: quando não conseguir identificar a intenção
            
            Responda APENAS com um JSON no formato:
            {
              "intent": "nome_da_intencao",
              "confidence": 0.85,
              "entities": {"key": "value"},
              "originalText": "texto_original"
            }`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      console.error('Erro na API OpenAI:', response.status);
      throw new Error('Erro na análise NLP');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Resposta da OpenAI:', aiResponse);
    
    try {
      const nlpResult = JSON.parse(aiResponse);
      console.log('Resultado NLP parseado:', nlpResult);
      
      return new Response(JSON.stringify(nlpResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
      // Fallback to keyword analysis
      const result = analyzeWithKeywords(text);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Erro no processamento NLP:', error);
    
    // Fallback response
    const fallbackResult = {
      intent: 'unknown',
      confidence: 0.5,
      entities: {},
      originalText: req.body?.text || ''
    };
    
    return new Response(JSON.stringify(fallbackResult), {
      status: 200, // Return 200 to avoid breaking the flow
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback keyword analysis function
function analyzeWithKeywords(text: string) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('relatório') || lowerText.includes('relatorio')) {
    return {
      intent: 'financial_report',
      confidence: 0.8,
      entities: { reportType: extractReportType(lowerText) },
      originalText: text
    };
  }
  
  if (lowerText.includes('obrigação') || lowerText.includes('fiscal') || lowerText.includes('imposto')) {
    return {
      intent: 'fiscal_query',
      confidence: 0.85,
      entities: {},
      originalText: text
    };
  }
  
  if (lowerText.includes('documento') || lowerText.includes('arquivo')) {
    return {
      intent: 'document_request',
      confidence: 0.75,
      entities: {},
      originalText: text
    };
  }
  
  if (lowerText.includes('anomalia') || lowerText.includes('detectar')) {
    return {
      intent: 'anomaly_detection',
      confidence: 0.82,
      entities: {},
      originalText: text
    };
  }
  
  if (lowerText.includes('fluxo') || lowerText.includes('previsão')) {
    return {
      intent: 'cash_flow_prediction',
      confidence: 0.78,
      entities: {},
      originalText: text
    };
  }
  
  return {
    intent: 'unknown',
    confidence: 0.5,
    entities: {},
    originalText: text
  };
}

function extractReportType(text: string): string {
  if (text.includes('faturamento')) return 'faturamento';
  if (text.includes('despesa')) return 'despesas';
  if (text.includes('balanço')) return 'balanco';
  if (text.includes('dre')) return 'dre';
  if (text.includes('fluxo')) return 'fluxo_caixa';
  return 'geral';
}
