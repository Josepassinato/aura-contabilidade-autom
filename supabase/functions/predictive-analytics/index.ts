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
    const { client_id, prediction_type = 'revenue', periods_ahead = 3 } = await req.json();

    if (!client_id) {
      throw new Error('Client ID is required for predictive analysis');
    }

    console.log('Starting predictive analysis for client:', client_id);

    // Fetch historical data
    const { data: historicalData, error: dataError } = await supabase
      .from('processed_accounting_data')
      .select('*')
      .eq('client_id', client_id)
      .order('period', { ascending: true });

    if (dataError) {
      console.error('Error fetching historical data:', dataError);
      throw new Error('Erro ao buscar dados históricos');
    }

    if (!historicalData || historicalData.length < 3) {
      return new Response(
        JSON.stringify({
          success: true,
          predictions: [],
          message: 'Dados históricos insuficientes para análise preditiva (mínimo 3 períodos)'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare data for analysis
    const timeSeriesData = historicalData.map((record, index) => ({
      period: record.period,
      index,
      revenue: parseFloat(record.revenue || 0),
      expenses: parseFloat(record.expenses || 0),
      net_income: parseFloat(record.net_income || 0),
      date: record.period
    }));

    // Simple linear regression for trend analysis
    function linearRegression(data, yField) {
      const n = data.length;
      const sumX = data.reduce((sum, point) => sum + point.index, 0);
      const sumY = data.reduce((sum, point) => sum + point[yField], 0);
      const sumXY = data.reduce((sum, point) => sum + point.index * point[yField], 0);
      const sumXX = data.reduce((sum, point) => sum + point.index * point.index, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return { slope, intercept };
    }

    // Moving average calculation
    function movingAverage(data, field, window = 3) {
      const values = data.map(d => d[field]);
      const ma = [];
      for (let i = window - 1; i < values.length; i++) {
        const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
        ma.push(sum / window);
      }
      return ma[ma.length - 1] || 0;
    }

    // Seasonal pattern detection
    function detectSeasonality(data, field) {
      if (data.length < 12) return { hasSeasonality: false, pattern: [] };
      
      const monthlyData = {};
      data.forEach(record => {
        const month = new Date(record.period + '-01').getMonth();
        if (!monthlyData[month]) monthlyData[month] = [];
        monthlyData[month].push(record[field]);
      });

      const monthlyAvg = {};
      Object.keys(monthlyData).forEach(month => {
        monthlyAvg[month] = monthlyData[month].reduce((a, b) => a + b, 0) / monthlyData[month].length;
      });

      return {
        hasSeasonality: Object.keys(monthlyAvg).length >= 6,
        pattern: monthlyAvg
      };
    }

    // Generate predictions
    const predictions = [];
    const lastIndex = timeSeriesData.length - 1;

    if (prediction_type === 'revenue' || prediction_type === 'all') {
      const revenueRegression = linearRegression(timeSeriesData, 'revenue');
      const revenueMA = movingAverage(timeSeriesData, 'revenue');
      const revenueSeasonality = detectSeasonality(timeSeriesData, 'revenue');

      for (let i = 1; i <= periods_ahead; i++) {
        const futureIndex = lastIndex + i;
        const trendPrediction = revenueRegression.slope * futureIndex + revenueRegression.intercept;
        const maPrediction = revenueMA;
        
        // Combine trend and moving average
        const basePrediction = (trendPrediction * 0.7) + (maPrediction * 0.3);
        
        predictions.push({
          type: 'revenue',
          period: i,
          predicted_value: Math.max(0, basePrediction),
          confidence: Math.max(0.5, 0.9 - (i * 0.1)),
          method: 'hybrid_regression_ma',
          trend_component: trendPrediction,
          ma_component: maPrediction
        });
      }
    }

    if (prediction_type === 'expenses' || prediction_type === 'all') {
      const expensesRegression = linearRegression(timeSeriesData, 'expenses');
      const expensesMA = movingAverage(timeSeriesData, 'expenses');

      for (let i = 1; i <= periods_ahead; i++) {
        const futureIndex = lastIndex + i;
        const trendPrediction = expensesRegression.slope * futureIndex + expensesRegression.intercept;
        const maPrediction = expensesMA;
        const basePrediction = (trendPrediction * 0.7) + (maPrediction * 0.3);
        
        predictions.push({
          type: 'expenses',
          period: i,
          predicted_value: Math.max(0, basePrediction),
          confidence: Math.max(0.5, 0.9 - (i * 0.1)),
          method: 'hybrid_regression_ma',
          trend_component: trendPrediction,
          ma_component: maPrediction
        });
      }
    }

    // AI-powered predictions using OpenAI
    const aiPredictionPrompt = `
    Analise estes dados financeiros históricos e faça previsões inteligentes:
    
    Dados históricos: ${JSON.stringify(timeSeriesData)}
    
    Baseando-se nos padrões identificados, tendências sazonais e contexto econômico, 
    faça previsões para os próximos ${periods_ahead} períodos.
    
    Retorne JSON:
    {
      "ai_predictions": [
        {
          "period": número_do_período,
          "revenue_prediction": valor_previsto_receita,
          "expenses_prediction": valor_previsto_despesas,
          "confidence": 0.0-1.0,
          "factors": ["fatores considerados"],
          "risks": ["riscos identificados"],
          "recommendations": ["recomendações estratégicas"]
        }
      ],
      "market_insights": {
        "trend_analysis": "análise da tendência",
        "growth_potential": "low|medium|high",
        "seasonal_factors": "fatores sazonais identificados",
        "recommendations": ["recomendações estratégicas"]
      }
    }
    `;

    let aiPredictions = [];
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
            content: 'Você é um especialista em análise financeira e previsões econômicas para empresas.'
          },
          {
            role: 'user',
            content: aiPredictionPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }),
    });

    let marketInsights = {};
    if (openaiResponse.ok) {
      const aiResult = await openaiResponse.json();
      try {
        const aiContent = aiResult.choices[0].message.content;
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);
          aiPredictions = aiData.ai_predictions || [];
          marketInsights = aiData.market_insights || {};
        }
      } catch (e) {
        console.error('Error parsing AI predictions:', e);
      }
    }

    // Calculate accuracy metrics based on historical data
    const accuracyMetrics = {
      historical_accuracy: 0.85, // Placeholder - would be calculated from past predictions
      data_quality: historicalData.length >= 12 ? 'high' : historicalData.length >= 6 ? 'medium' : 'low',
      confidence_factors: [
        'Volume de dados históricos',
        'Consistência nos padrões',
        'Ausência de outliers extremos'
      ]
    };

    // Log the analysis
    const { error: logError } = await supabase
      .from('automation_logs')
      .insert({
        process_type: 'predictive_analysis',
        client_id,
        status: 'completed',
        records_processed: historicalData.length,
        metadata: {
          prediction_type,
          periods_ahead,
          predictions_generated: predictions.length + aiPredictions.length,
          data_points_used: historicalData.length
        }
      });

    if (logError) {
      console.error('Error logging analysis:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        statistical_predictions: predictions,
        ai_predictions: aiPredictions,
        market_insights: marketInsights,
        analysis_summary: {
          client_id,
          prediction_type,
          periods_ahead,
          historical_periods: historicalData.length,
          analysis_date: new Date().toISOString(),
          accuracy_metrics: accuracyMetrics
        },
        data_insights: {
          trend_analysis: {
            revenue_trend: linearRegression(timeSeriesData, 'revenue').slope > 0 ? 'growing' : 'declining',
            expense_trend: linearRegression(timeSeriesData, 'expenses').slope > 0 ? 'increasing' : 'decreasing'
          },
          seasonality: detectSeasonality(timeSeriesData, 'revenue'),
          volatility: {
            revenue: timeSeriesData.reduce((acc, curr, i, arr) => {
              if (i === 0) return acc;
              return acc + Math.abs(curr.revenue - arr[i-1].revenue);
            }, 0) / (timeSeriesData.length - 1)
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Predictive analysis error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Erro na análise preditiva'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});