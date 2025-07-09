import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentData {
  clientId: string;
  documentType: 'nfe' | 'receipt' | 'invoice' | 'extract';
  content: string; // Base64 ou texto
  metadata?: any;
}

interface ProcessingResult {
  success: boolean;
  data?: {
    lancamentos: Array<{
      conta_debito: string;
      conta_credito: string;
      valor: number;
      historico: string;
      data_competencia: string;
    }>;
    tributacao?: {
      impostos_calculados: any;
      regime_recomendado?: string;
    };
  };
  errors?: string[];
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
    const { clientId, documentType, content, metadata }: DocumentData = await req.json();

    console.log(`Processando documento ${documentType} para cliente ${clientId}`);

    // 1. EXTRAÇÃO DE DADOS COM IA
    const extractedData = await extractDataWithAI(content, documentType, openaiApiKey);
    
    // 2. CLASSIFICAÇÃO CONTÁBIL AUTOMATIZADA
    const contabilClassification = await classifyAccountingEntries(extractedData, openaiApiKey);
    
    // 3. CÁLCULO TRIBUTÁRIO AUTOMÁTICO
    const taxCalculation = await calculateTaxes(extractedData, clientId, supabase);
    
    // 4. GERAÇÃO AUTOMÁTICA DE LANÇAMENTOS
    const lancamentos = await generateAccountingEntries(contabilClassification, extractedData);
    
    // 5. VALIDAÇÃO CRUZADA
    const validation = await validateEntries(lancamentos, clientId, supabase);
    
    if (!validation.valid) {
      throw new Error(`Validação falhou: ${validation.errors.join(', ')}`);
    }

    // 6. SALVAR LANÇAMENTOS AUTOMATICAMENTE
    const { error: insertError } = await supabase
      .from('lancamentos_contabeis')
      .insert(lancamentos.map(l => ({
        ...l,
        client_id: clientId,
        origem: 'AUTOMATICO',
        status: 'APROVADO'
      })));

    if (insertError) throw insertError;

    // 7. ATUALIZAR AUTOMAÇÃO LOG
    await supabase
      .from('automation_logs')
      .insert({
        process_type: 'document_processing',
        client_id: clientId,
        status: 'completed',
        records_processed: lancamentos.length,
        metadata: { 
          document_type: documentType, 
          extracted_data: extractedData,
          tax_calculation: taxCalculation
        }
      });

    const result: ProcessingResult = {
      success: true,
      data: {
        lancamentos,
        tributacao: taxCalculation
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento automatizado:', error);
    
    return new Response(JSON.stringify({
      success: false,
      errors: [error.message]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// FUNÇÃO DE EXTRAÇÃO COM IA
async function extractDataWithAI(content: string, documentType: string, apiKey: string) {
  const prompt = generateExtractionPrompt(documentType);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Extrair dados do documento: ${content}` }
      ],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// CLASSIFICAÇÃO CONTÁBIL COM IA
async function classifyAccountingEntries(extractedData: any, apiKey: string) {
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
          content: `Você é um especialista em contabilidade. Classifique os dados extraídos em contas contábeis seguindo o plano de contas padrão brasileiro. Retorne JSON com: conta_debito, conta_credito, valor, historico.` 
        },
        { role: 'user', content: JSON.stringify(extractedData) }
      ],
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// CÁLCULO TRIBUTÁRIO AUTOMÁTICO
async function calculateTaxes(extractedData: any, clientId: string, supabase: any) {
  // Buscar regime tributário do cliente
  const { data: client } = await supabase
    .from('accounting_clients')
    .select('regime')
    .eq('id', clientId)
    .single();

  const regime = client?.regime || 'SIMPLES_NACIONAL';
  
  // Lógica de cálculo por regime
  switch (regime) {
    case 'SIMPLES_NACIONAL':
      return calculateSimplesNacional(extractedData);
    case 'LUCRO_PRESUMIDO':
      return calculateLucroPresumido(extractedData);
    case 'LUCRO_REAL':
      return calculateLucroReal(extractedData);
    default:
      return { impostos_calculados: {}, regime_atual: regime };
  }
}

// GERAÇÃO DE LANÇAMENTOS
async function generateAccountingEntries(classification: any, extractedData: any) {
  return classification.lancamentos || [];
}

// VALIDAÇÃO CRUZADA
async function validateEntries(lancamentos: any[], clientId: string, supabase: any) {
  const errors = [];
  
  // Validar balanceamento
  const totalDebito = lancamentos.reduce((sum, l) => sum + l.valor, 0);
  const totalCredito = lancamentos.reduce((sum, l) => sum + l.valor, 0);
  
  if (Math.abs(totalDebito - totalCredito) > 0.01) {
    errors.push('Lançamentos não estão balanceados');
  }
  
  // Validar contas existentes
  for (const lancamento of lancamentos) {
    const { data: conta } = await supabase
      .from('plano_contas')
      .select('id')
      .eq('codigo', lancamento.conta_debito)
      .single();
      
    if (!conta) {
      errors.push(`Conta ${lancamento.conta_debito} não encontrada no plano de contas`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// PROMPTS ESPECÍFICOS POR TIPO DE DOCUMENTO
function generateExtractionPrompt(documentType: string): string {
  const prompts = {
    'nfe': 'Extraia dados da NFe: valor total, CNPJ emissor, itens, impostos, data emissão. Retorne JSON estruturado.',
    'receipt': 'Extraia dados do recibo: valor, descrição, data, categorize como receita/despesa. Retorne JSON.',
    'invoice': 'Extraia dados da fatura: fornecedor, valor, vencimento, descrição. Retorne JSON.',
    'extract': 'Extraia dados do extrato bancário: movimentações, saldos, datas. Retorne JSON.'
  };
  
  return prompts[documentType] || 'Extraia dados relevantes do documento financeiro. Retorne JSON.';
}

// CÁLCULOS TRIBUTÁRIOS ESPECÍFICOS
function calculateSimplesNacional(data: any) {
  // Implementar cálculo real do Simples Nacional
  const receita = data.valor || 0;
  const aliquota = 0.06; // 6% exemplo
  
  return {
    impostos_calculados: {
      simples_nacional: receita * aliquota,
      aliquota_aplicada: aliquota,
      base_calculo: receita
    },
    regime_atual: 'SIMPLES_NACIONAL'
  };
}

function calculateLucroPresumido(data: any) {
  // Implementar cálculo do Lucro Presumido
  return {
    impostos_calculados: {
      irpj: 0,
      csll: 0,
      pis: 0,
      cofins: 0
    },
    regime_atual: 'LUCRO_PRESUMIDO'
  };
}

function calculateLucroReal(data: any) {
  // Implementar cálculo do Lucro Real
  return {
    impostos_calculados: {
      irpj: 0,
      csll: 0,
      pis: 0,
      cofins: 0
    },
    regime_atual: 'LUCRO_REAL'
  };
}