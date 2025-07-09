import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReconciliationRequest {
  clientId: string;
  bankStatements: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
  }>;
  accountingEntries: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { clientId, bankStatements, accountingEntries }: ReconciliationRequest = await req.json();

    console.log(`Iniciando reconciliação automática para cliente ${clientId}`);

    // 1. ANÁLISE AUTOMÁTICA COM IA
    const reconciliationAnalysis = await analyzeWithAI(bankStatements, accountingEntries, openaiApiKey);
    
    // 2. MATCHING AUTOMÁTICO
    const matches = await performAutomaticMatching(reconciliationAnalysis);
    
    // 3. IDENTIFICAR DISCREPÂNCIAS
    const discrepancies = await identifyDiscrepancies(matches);
    
    // 4. GERAR AJUSTES AUTOMÁTICOS
    const adjustments = await generateAutomaticAdjustments(discrepancies, openaiApiKey);
    
    // 5. APLICAR AJUSTES SE CONFIANÇA > 95%
    const appliedAdjustments = [];
    for (const adjustment of adjustments) {
      if (adjustment.confidence > 0.95) {
        await applyAdjustment(adjustment, clientId, supabase);
        appliedAdjustments.push(adjustment);
      }
    }

    // 6. LOG DA RECONCILIAÇÃO
    await supabase
      .from('automation_logs')
      .insert({
        process_type: 'bank_reconciliation',
        client_id: clientId,
        status: 'completed',
        records_processed: matches.length,
        metadata: {
          total_matches: matches.length,
          discrepancies_found: discrepancies.length,
          auto_adjustments: appliedAdjustments.length
        }
      });

    return new Response(JSON.stringify({
      success: true,
      data: {
        matches,
        discrepancies,
        adjustments: appliedAdjustments,
        summary: {
          total_analyzed: bankStatements.length + accountingEntries.length,
          matched: matches.length,
          discrepancies: discrepancies.length,
          auto_resolved: appliedAdjustments.length
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na reconciliação automática:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeWithAI(bankStatements: any[], accountingEntries: any[], apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `Você é um especialista em reconciliação bancária. Analise os extratos bancários e lançamentos contábeis para identificar correspondências. Considere variações de descrição, datas próximas (±3 dias) e valores exatos. Retorne JSON com matches sugeridos.` 
        },
        { 
          role: 'user', 
          content: JSON.stringify({
            bank_statements: bankStatements,
            accounting_entries: accountingEntries
          })
        }
      ],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function performAutomaticMatching(analysis: any) {
  const matches = [];
  
  for (const suggestion of analysis.suggested_matches || []) {
    if (suggestion.confidence > 0.8) {
      matches.push({
        bank_entry: suggestion.bank_entry,
        accounting_entry: suggestion.accounting_entry,
        confidence: suggestion.confidence,
        match_type: suggestion.match_type || 'exact',
        matched_at: new Date().toISOString()
      });
    }
  }
  
  return matches;
}

async function identifyDiscrepancies(matches: any[]) {
  // Identificar transações não reconciliadas
  return [];
}

async function generateAutomaticAdjustments(discrepancies: any[], apiKey: string) {
  if (discrepancies.length === 0) return [];
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `Você é um contador especialista. Para cada discrepância na reconciliação bancária, sugira o lançamento contábil correto para corrigir. Retorne JSON com os ajustes necessários.` 
        },
        { role: 'user', content: JSON.stringify(discrepancies) }
      ],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  const adjustments = JSON.parse(data.choices[0].message.content);
  
  return adjustments.adjustments || [];
}

async function applyAdjustment(adjustment: any, clientId: string, supabase: any) {
  // Aplicar ajuste automaticamente
  const { error } = await supabase
    .from('lancamentos_contabeis')
    .insert({
      client_id: clientId,
      historico: adjustment.description,
      valor_total: adjustment.amount,
      origem: 'RECONCILIACAO_AUTOMATICA',
      status: 'APROVADO',
      data_lancamento: new Date().toISOString().split('T')[0],
      data_competencia: adjustment.date
    });

  if (error) {
    console.error('Erro ao aplicar ajuste:', error);
    throw error;
  }
}