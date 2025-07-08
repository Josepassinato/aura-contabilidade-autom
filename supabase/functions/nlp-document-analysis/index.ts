import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, document_id, analysis_type = 'classification' } = await req.json();

    if (!text) {
      throw new Error('Text content is required for NLP analysis');
    }

    console.log('Starting NLP analysis for document:', document_id);

    let analysisResults = {};

    if (analysis_type === 'classification' || analysis_type === 'full') {
      // Document classification
      const classificationPrompt = `
      Classifique este documento contábil/fiscal e extraia informações estruturadas:
      
      Texto: "${text}"
      
      Retorne um JSON com:
      {
        "categoria": "NFe|Recibo|Balancete|DRE|Balanço|Contrato|Outros",
        "subcategoria": "string",
        "entidades": {
          "empresas": ["array de nomes de empresas"],
          "pessoas": ["array de nomes de pessoas"],
          "valores_monetarios": ["array de valores encontrados"],
          "datas": ["array de datas encontradas"],
          "cnpjs": ["array de CNPJs"],
          "cpfs": ["array de CPFs"]
        },
        "sentimento": "positivo|neutro|negativo",
        "urgencia": "baixa|media|alta",
        "confianca_classificacao": 0.0-1.0,
        "palavras_chave": ["array de palavras-chave relevantes"],
        "resumo": "resumo do documento em uma frase"
      }
      `;

      const classificationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise e classificação de documentos contábeis e fiscais.'
            },
            {
              role: 'user',
              content: classificationPrompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.2
        }),
      });

      if (classificationResponse.ok) {
        const result = await classificationResponse.json();
        try {
          const content = result.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResults.classification = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error('Error parsing classification:', e);
        }
      }
    }

    if (analysis_type === 'sentiment' || analysis_type === 'full') {
      // Sentiment and risk analysis
      const sentimentPrompt = `
      Analise o sentimento e riscos deste texto contábil/legal:
      
      "${text}"
      
      Retorne JSON:
      {
        "sentimento_detalhado": {
          "score": -1.0 a 1.0,
          "confianca": 0.0-1.0,
          "emocoes": ["array de emoções detectadas"]
        },
        "analise_riscos": {
          "nivel_risco": "baixo|medio|alto",
          "tipos_risco": ["array de tipos de risco"],
          "indicadores_alerta": ["array de indicadores"],
          "recomendacoes": ["array de recomendações"]
        },
        "compliance": {
          "conformidade": "conforme|nao_conforme|verificar",
          "normas_aplicaveis": ["array de normas"],
          "pontos_atencao": ["array de pontos que requerem atenção"]
        }
      }
      `;

      const sentimentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de riscos e compliance fiscal.'
            },
            {
              role: 'user',
              content: sentimentPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        }),
      });

      if (sentimentResponse.ok) {
        const result = await sentimentResponse.json();
        try {
          const content = result.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const sentimentData = JSON.parse(jsonMatch[0]);
            analysisResults.sentiment = sentimentData.sentimento_detalhado;
            analysisResults.risk_analysis = sentimentData.analise_riscos;
            analysisResults.compliance = sentimentData.compliance;
          }
        } catch (e) {
          console.error('Error parsing sentiment analysis:', e);
        }
      }
    }

    if (analysis_type === 'extraction' || analysis_type === 'full') {
      // Key information extraction
      const extractionPrompt = `
      Extraia informações-chave deste documento:
      
      "${text}"
      
      Retorne JSON:
      {
        "dados_financeiros": {
          "receitas": [],
          "despesas": [],
          "impostos": [],
          "totais": []
        },
        "datas_importantes": [],
        "partes_envolvidas": [],
        "obrigacoes": [],
        "prazos": [],
        "referencias_legais": []
      }
      `;

      const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: extractionPrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        }),
      });

      if (extractionResponse.ok) {
        const result = await extractionResponse.json();
        try {
          const content = result.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResults.extraction = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error('Error parsing extraction:', e);
        }
      }
    }

    // Save classification results to database if we have document_id
    if (document_id && analysisResults.classification) {
      const { error: classificationError } = await supabase
        .from('document_classifications')
        .insert({
          document_id,
          category: analysisResults.classification.categoria,
          confidence: analysisResults.classification.confianca_classificacao || 0.8,
          metadata: {
            subcategoria: analysisResults.classification.subcategoria,
            entidades: analysisResults.classification.entidades,
            palavras_chave: analysisResults.classification.palavras_chave,
            resumo: analysisResults.classification.resumo
          }
        });

      if (classificationError) {
        console.error('Error saving classification:', classificationError);
      }
    }

    // Log the analysis
    const { error: logError } = await supabase
      .from('automation_logs')
      .insert({
        process_type: 'nlp_analysis',
        status: 'completed',
        records_processed: 1,
        metadata: {
          document_id,
          analysis_type,
          features_analyzed: Object.keys(analysisResults),
          text_length: text.length
        }
      });

    if (logError) {
      console.error('Error logging NLP analysis:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis_results: analysisResults,
        analysis_summary: {
          document_id,
          analysis_type,
          features_analyzed: Object.keys(analysisResults),
          processing_time: new Date().toISOString(),
          text_length: text.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('NLP analysis error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Erro na análise NLP do documento'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});