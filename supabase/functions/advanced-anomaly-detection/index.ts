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
    const { client_id, period, analysis_type = 'financial' } = await req.json();

    console.log('Starting anomaly detection for client:', client_id);

    // Fetch data for analysis
    let dataToAnalyze = [];
    let currentData, historicalData;

    if (analysis_type === 'financial') {
      // Get processed accounting data
      const { data: accountingData, error: accountingError } = await supabase
        .from('processed_accounting_data')
        .select('*')
        .eq('client_id', client_id)
        .order('period', { ascending: false })
        .limit(12);

      if (accountingError) {
        console.error('Error fetching accounting data:', accountingError);
        throw new Error('Erro ao buscar dados contábeis');
      }

      dataToAnalyze = accountingData || [];
      currentData = dataToAnalyze[0];
      historicalData = dataToAnalyze.slice(1);

    } else if (analysis_type === 'documents') {
      // Get document processing patterns
      const { data: docData, error: docError } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', client_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (docError) {
        console.error('Error fetching document data:', docError);
        throw new Error('Erro ao buscar dados de documentos');
      }

      dataToAnalyze = docData || [];
    }

    if (!dataToAnalyze.length) {
      return new Response(
        JSON.stringify({
          success: true,
          anomalies: [],
          message: 'Dados insuficientes para análise de anomalias'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Anomaly detection algorithms
    const anomalies = [];

    if (analysis_type === 'financial' && currentData && historicalData.length >= 3) {
      // Statistical anomaly detection
      const revenues = historicalData.map(d => parseFloat(d.revenue || 0));
      const expenses = historicalData.map(d => parseFloat(d.expenses || 0));
      
      const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
      const avgExpenses = expenses.reduce((a, b) => a + b, 0) / expenses.length;
      
      const stdRevenue = Math.sqrt(revenues.reduce((sum, rev) => sum + Math.pow(rev - avgRevenue, 2), 0) / revenues.length);
      const stdExpenses = Math.sqrt(expenses.reduce((sum, exp) => sum + Math.pow(exp - avgExpenses, 2), 0) / expenses.length);

      const currentRevenue = parseFloat(currentData.revenue || 0);
      const currentExpenses = parseFloat(currentData.expenses || 0);

      // Check for revenue anomalies (> 2 standard deviations)
      if (Math.abs(currentRevenue - avgRevenue) > 2 * stdRevenue) {
        anomalies.push({
          type: 'revenue_anomaly',
          severity: currentRevenue > avgRevenue ? 'high_positive' : 'high_negative',
          description: currentRevenue > avgRevenue 
            ? `Receita ${((currentRevenue - avgRevenue) / avgRevenue * 100).toFixed(1)}% acima da média`
            : `Receita ${((avgRevenue - currentRevenue) / avgRevenue * 100).toFixed(1)}% abaixo da média`,
          current_value: currentRevenue,
          expected_range: [avgRevenue - 2 * stdRevenue, avgRevenue + 2 * stdRevenue],
          confidence: 0.85,
          period: currentData.period
        });
      }

      // Check for expense anomalies
      if (Math.abs(currentExpenses - avgExpenses) > 2 * stdExpenses) {
        anomalies.push({
          type: 'expense_anomaly',
          severity: currentExpenses > avgExpenses ? 'high_negative' : 'medium',
          description: currentExpenses > avgExpenses 
            ? `Despesas ${((currentExpenses - avgExpenses) / avgExpenses * 100).toFixed(1)}% acima da média`
            : `Despesas ${((avgExpenses - currentExpenses) / avgExpenses * 100).toFixed(1)}% abaixo da média`,
          current_value: currentExpenses,
          expected_range: [avgExpenses - 2 * stdExpenses, avgExpenses + 2 * stdExpenses],
          confidence: 0.80,
          period: currentData.period
        });
      }

      // Check profit margin anomalies
      const currentMargin = currentRevenue > 0 ? (currentRevenue - currentExpenses) / currentRevenue : 0;
      const historicalMargins = historicalData.map(d => {
        const rev = parseFloat(d.revenue || 0);
        return rev > 0 ? (rev - parseFloat(d.expenses || 0)) / rev : 0;
      });
      const avgMargin = historicalMargins.reduce((a, b) => a + b, 0) / historicalMargins.length;

      if (Math.abs(currentMargin - avgMargin) > 0.1) { // 10% difference
        anomalies.push({
          type: 'margin_anomaly',
          severity: currentMargin < avgMargin ? 'medium' : 'low',
          description: `Margem de lucro ${currentMargin < avgMargin ? 'reduzida' : 'aumentada'} significativamente`,
          current_value: currentMargin,
          expected_value: avgMargin,
          confidence: 0.75,
          period: currentData.period
        });
      }
    }

    // AI-powered anomaly detection using OpenAI
    const aiAnalysisPrompt = `
    Analise os seguintes dados contábeis e identifique possíveis anomalias ou padrões suspeitos:
    
    Dados atuais: ${JSON.stringify(currentData || {})}
    Histórico: ${JSON.stringify(historicalData?.slice(0, 6) || [])}
    
    Procure por:
    1. Padrões incomuns nos valores
    2. Inconsistências temporais
    3. Proporções anômalas entre receitas e despesas
    4. Indicadores de possíveis erros ou fraudes
    
    Retorne um JSON com anomalias encontradas:
    {
      "ai_anomalies": [
        {
          "type": "tipo_da_anomalia",
          "description": "descrição_detalhada",
          "severity": "low|medium|high",
          "confidence": 0.0-1.0,
          "recommendation": "recomendação_de_ação"
        }
      ]
    }
    `;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Você é um especialista em análise contábil e detecção de anomalias financeiras.'
          },
          {
            role: 'user',
            content: aiAnalysisPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    let aiAnomalies = [];
    if (openaiResponse.ok) {
      const aiResult = await openaiResponse.json();
      try {
        const aiContent = aiResult.choices[0].message.content;
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiAnalysis = JSON.parse(jsonMatch[0]);
          aiAnomalies = aiAnalysis.ai_anomalies || [];
        }
      } catch (e) {
        console.error('Error parsing AI analysis:', e);
      }
    }

    // Combine statistical and AI anomalies
    const allAnomalies = [...anomalies, ...aiAnomalies];

    // Log the analysis
    const { error: logError } = await supabase
      .from('automation_logs')
      .insert({
        process_type: 'anomaly_detection',
        client_id,
        status: 'completed',
        records_processed: dataToAnalyze.length,
        metadata: {
          analysis_type,
          anomalies_found: allAnomalies.length,
          period,
          detection_methods: ['statistical', 'ai_powered']
        }
      });

    if (logError) {
      console.error('Error logging analysis:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        anomalies: allAnomalies,
        analysis_summary: {
          total_anomalies: allAnomalies.length,
          high_severity: allAnomalies.filter(a => a.severity === 'high' || a.severity === 'high_negative' || a.severity === 'high_positive').length,
          medium_severity: allAnomalies.filter(a => a.severity === 'medium').length,
          low_severity: allAnomalies.filter(a => a.severity === 'low').length,
          analysis_date: new Date().toISOString(),
          data_points_analyzed: dataToAnalyze.length
        },
        recommendations: allAnomalies.map(a => a.recommendation).filter(Boolean)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Anomaly detection error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Erro na detecção de anomalias'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});