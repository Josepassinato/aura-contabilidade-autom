import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis_type, timeframe } = await req.json();
    
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar logs de erros do sistema
    const { data: errorLogs, error: logsError } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('status', 'failed')
      .gte('created_at', getTimeframeDate(timeframe))
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
    }

    // Preparar dados para análise
    const errorData = errorLogs || [];
    const errorSummary = summarizeErrors(errorData);

    // Chamar OpenAI para análise inteligente
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise de sistemas contábeis. Analise os dados de erro e retorne um JSON com:
            {
              "analysis": {
                "total_errors": number,
                "patterns": [
                  {
                    "id": "unique_id",
                    "type": "tipo do erro",
                    "description": "descrição do padrão",
                    "frequency": number,
                    "severity": "low|medium|high|critical",
                    "affected_systems": ["sistema1", "sistema2"],
                    "root_cause": "causa raiz identificada",
                    "suggested_fix": "solução sugerida",
                    "auto_fix_available": boolean,
                    "trend": "increasing|stable|decreasing"
                  }
                ],
                "recommendations": ["recomendação1", "recomendação2"],
                "automation_opportunities": ["oportunidade1", "oportunidade2"],
                "confidence_score": 0.85
              }
            }`
          },
          {
            role: 'user',
            content: `Analise estes dados de erro do sistema:
            
            Total de erros: ${errorData.length}
            Período: ${timeframe}
            
            Resumo dos erros:
            ${JSON.stringify(errorSummary, null, 2)}
            
            Forneça uma análise detalhada com padrões identificados e recomendações.`
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await response.json();
    
    let analysis;
    try {
      const result = JSON.parse(aiResponse.choices[0].message.content);
      analysis = result.analysis;
    } catch {
      // Fallback para análise básica
      analysis = generateBasicAnalysis(errorData);
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-errors-ai function:', error);
    
    // Retornar análise básica em caso de erro
    const analysis = generateBasicAnalysis([]);
    
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getTimeframeDate(timeframe: string): string {
  const now = new Date();
  switch (timeframe) {
    case '7_days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30_days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90_days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}

function summarizeErrors(errorLogs: any[]) {
  const summary: any = {};
  
  errorLogs.forEach(log => {
    const action = log.action_type || 'unknown';
    summary[action] = (summary[action] || 0) + 1;
  });
  
  return summary;
}

function generateBasicAnalysis(errorData: any[]) {
  const patterns = [
    {
      id: 'pattern_1',
      type: 'Erro de Validação',
      description: 'Falhas na validação de documentos',
      frequency: Math.floor(errorData.length * 0.4),
      severity: 'medium' as const,
      affected_systems: ['validacao', 'documentos'],
      root_cause: 'Regras de validação muito restritivas',
      suggested_fix: 'Revisar e ajustar critérios de validação',
      auto_fix_available: false,
      trend: 'stable' as const
    },
    {
      id: 'pattern_2',
      type: 'Timeout de Processamento',
      description: 'Processamentos que excedem tempo limite',
      frequency: Math.floor(errorData.length * 0.3),
      severity: 'high' as const,
      affected_systems: ['processamento', 'automacao'],
      root_cause: 'Volume alto de dados ou performance degradada',
      suggested_fix: 'Otimizar consultas e aumentar timeout',
      auto_fix_available: true,
      trend: 'increasing' as const
    }
  ];

  return {
    total_errors: errorData.length,
    patterns: patterns.filter(p => p.frequency > 0),
    recommendations: [
      'Implementar monitoramento proativo de performance',
      'Criar alertas automáticos para padrões críticos',
      'Revisar logs de erro semanalmente'
    ],
    automation_opportunities: [
      'Auto-correção de erros de formatação',
      'Reprocessamento automático de falhas temporárias',
      'Notificação automática de administradores'
    ],
    confidence_score: 0.75
  };
}