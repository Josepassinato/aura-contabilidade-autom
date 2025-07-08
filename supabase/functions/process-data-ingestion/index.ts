// Edge Function para ingestão automática de dados
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função principal de ingestão de dados
async function processDataIngestion() {
  const startTime = new Date();
  
  // Criar log inicial
  const { data: logEntry } = await supabase
    .from('automation_logs')
    .insert({
      process_type: 'data_ingestion',
      status: 'running',
      started_at: startTime.toISOString(),
      metadata: { trigger: 'automated_cron' }
    })
    .select()
    .single();

  let totalProcessed = 0;
  let errors = 0;
  const errorDetails: any[] = [];

  try {
    console.log('Iniciando ingestão automática de dados');

    // 1. Processar fontes de dados configuradas
    const dataSources = [
      { type: 'ocr', name: 'OCR Documentos' },
      { type: 'openbanking', name: 'Open Banking' },
      { type: 'api_fiscal', name: 'API Fiscal' },
      { type: 'erp', name: 'Integração ERP' }
    ];

    for (const source of dataSources) {
      try {
        const result = await processDataSource(source.type);
        totalProcessed += result.recordsProcessed;
        console.log(`${source.name}: ${result.recordsProcessed} registros processados`);
      } catch (error: any) {
        errors++;
        errorDetails.push({
          source: source.name,
          error: error.message
        });
        console.error(`Erro ao processar ${source.name}:`, error);
      }
    }

    // 2. Processar classificação automática de documentos pendentes
    const classificationResult = await processAutomaticClassification();
    totalProcessed += classificationResult.classified;

    // 3. Atualizar log de conclusão
    await supabase
      .from('automation_logs')
      .update({
        status: errors === 0 ? 'completed' : 'completed',
        completed_at: new Date().toISOString(),
        records_processed: totalProcessed,
        errors_count: errors,
        error_details: errorDetails.length > 0 ? errorDetails : null
      })
      .eq('id', logEntry?.id);

    return {
      success: true,
      processed: totalProcessed,
      errors: errors,
      message: `Ingestão concluída: ${totalProcessed} registros processados, ${errors} erros`
    };

  } catch (error: any) {
    console.error('Erro crítico na ingestão de dados:', error);
    
    await supabase
      .from('automation_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        records_processed: totalProcessed,
        errors_count: errors + 1,
        error_details: [...errorDetails, { critical_error: error.message }]
      })
      .eq('id', logEntry?.id);

    return {
      success: false,
      error: error.message,
      processed: totalProcessed
    };
  }
}

// Processar fonte de dados específica
async function processDataSource(sourceType: string) {
  console.log(`Processando fonte: ${sourceType}`);
  
  // Simular processamento baseado no tipo de fonte
  switch (sourceType) {
    case 'ocr':
      return await processOCRDocuments();
    case 'openbanking':
      return await processOpenBankingData();
    case 'api_fiscal':
      return await processFiscalAPIData();
    case 'erp':
      return await processERPData();
    default:
      return { recordsProcessed: 0 };
  }
}

// Processar documentos OCR pendentes
async function processOCRDocuments() {
  // Buscar documentos não processados
  const { data: pendingDocs } = await supabase
    .from('client_documents')
    .select('*')
    .eq('status', 'pendente')
    .limit(50);

  let processed = 0;
  
  for (const doc of pendingDocs || []) {
    try {
      // Simular processamento OCR
      await simulateOCRProcessing(doc);
      
      // Atualizar status do documento
      await supabase
        .from('client_documents')
        .update({ status: 'processado' })
        .eq('id', doc.id);
      
      processed++;
    } catch (error) {
      console.error(`Erro ao processar documento ${doc.id}:`, error);
    }
  }

  return { recordsProcessed: processed };
}

// Simular processamento OCR
async function simulateOCRProcessing(document: any) {
  // Em uma implementação real, aqui seria feita a chamada para o serviço OCR
  console.log(`Processando OCR para documento: ${document.name}`);
  
  // Simular tempo de processamento
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simular extração de dados
  const extractedData = {
    tipo: 'NFe',
    valor: Math.random() * 10000,
    data_emissao: new Date().toISOString().split('T')[0],
    cnpj_emissor: '12345678000123'
  };

  // Salvar dados extraídos (em implementação real)
  console.log('Dados extraídos:', extractedData);
}

// Processar dados Open Banking
async function processOpenBankingData() {
  console.log('Processando dados Open Banking');
  
  // Simular busca de transações bancárias
  const simulatedTransactions = Array.from({ length: Math.floor(Math.random() * 20) }, (_, i) => ({
    id: `tx_${Date.now()}_${i}`,
    amount: Math.random() * 5000,
    description: `Transação ${i + 1}`,
    date: new Date().toISOString().split('T')[0]
  }));

  // Em implementação real, salvar no banco de dados
  console.log(`${simulatedTransactions.length} transações processadas`);
  
  return { recordsProcessed: simulatedTransactions.length };
}

// Processar dados de API Fiscal
async function processFiscalAPIData() {
  console.log('Processando dados de API Fiscal');
  
  // Simular busca de notas fiscais
  const simulatedNFes = Array.from({ length: Math.floor(Math.random() * 15) }, (_, i) => ({
    numero: `NFe_${Date.now()}_${i}`,
    valor: Math.random() * 8000,
    status: 'Autorizada'
  }));

  console.log(`${simulatedNFes.length} NFes processadas`);
  
  return { recordsProcessed: simulatedNFes.length };
}

// Processar dados ERP
async function processERPData() {
  console.log('Processando dados ERP');
  
  // Simular sincronização com ERP
  const simulatedData = Array.from({ length: Math.floor(Math.random() * 30) }, (_, i) => ({
    id: `erp_${Date.now()}_${i}`,
    type: 'lançamento',
    value: Math.random() * 3000
  }));

  console.log(`${simulatedData.length} registros ERP processados`);
  
  return { recordsProcessed: simulatedData.length };
}

// Processar classificação automática
async function processAutomaticClassification() {
  console.log('Processando classificação automática de documentos');
  
  // Buscar documentos sem classificação
  const { data: unclassifiedDocs } = await supabase
    .from('client_documents')
    .select('*')
    .eq('status', 'processado')
    .limit(30);

  let classified = 0;

  for (const doc of unclassifiedDocs || []) {
    try {
      // Verificar se já tem classificação
      const { data: existingClassification } = await supabase
        .from('document_classifications')
        .select('id')
        .eq('document_id', doc.id)
        .single();

      if (!existingClassification) {
        // Simular classificação automática
        const category = classifyDocument(doc);
        
        await supabase
          .from('document_classifications')
          .insert({
            document_id: doc.id,
            category: category,
            confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
            metadata: { auto_classified: true }
          });
        
        classified++;
      }
    } catch (error) {
      console.error(`Erro ao classificar documento ${doc.id}:`, error);
    }
  }

  return { classified };
}

// Simular classificação de documento
function classifyDocument(document: any): string {
  const types = ['NFe', 'Recibo', 'Fatura', 'Contrato', 'Demonstrativo', 'Comprovante'];
  
  // Classificação baseada no nome/tipo do arquivo
  if (document.name.toLowerCase().includes('nfe') || document.type.includes('nfe')) {
    return 'NFe';
  } else if (document.name.toLowerCase().includes('recibo')) {
    return 'Recibo';
  } else if (document.name.toLowerCase().includes('fatura')) {
    return 'Fatura';
  } else {
    // Classificação aleatória para outros tipos
    return types[Math.floor(Math.random() * types.length)];
  }
}

// Servir a função
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await processDataIngestion();
    
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: result.success ? 200 : 500,
      }
    );
  } catch (error: any) {
    console.error("Erro na Edge Function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});