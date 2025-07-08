// Edge Function para testes de estresse do sistema de automação
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

interface StressTestConfig {
  testType: 'load' | 'concurrent' | 'volume' | 'full';
  duration?: number; // em segundos
  concurrency?: number; // processos simultâneos
  dataVolume?: number; // quantidade de dados
}

// Executar testes de estresse
async function runStressTests(config: StressTestConfig) {
  const startTime = new Date();
  
  // Criar log inicial do teste
  const { data: testLogEntry } = await supabase
    .from('automation_logs')
    .insert({
      process_type: `stress_test_${config.testType}`,
      status: 'running',
      started_at: startTime.toISOString(),
      metadata: { 
        test_config: config,
        trigger: 'stress_test',
        environment: 'test'
      }
    })
    .select()
    .single();

  const results = {
    testType: config.testType,
    startTime: startTime.toISOString(),
    tests: [] as any[],
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      avgResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      throughput: 0
    }
  };

  try {
    console.log(`Iniciando teste de estresse: ${config.testType}`);

    switch (config.testType) {
      case 'load':
        await runLoadTest(results, config);
        break;
      case 'concurrent':
        await runConcurrencyTest(results, config);
        break;
      case 'volume':
        await runVolumeTest(results, config);
        break;
      case 'full':
        await runFullStressTest(results, config);
        break;
    }

    // Calcular estatísticas finais
    calculateFinalStatistics(results);

    // Atualizar log de conclusão
    await supabase
      .from('automation_logs')
      .update({
        status: results.summary.failed > 0 ? 'completed' : 'completed',
        completed_at: new Date().toISOString(),
        records_processed: results.summary.totalTests,
        errors_count: results.summary.failed,
        error_details: results.summary.failed > 0 ? { failed_tests: results.tests.filter(t => !t.success) } : null,
        metadata: {
          ...testLogEntry?.metadata,
          test_results: results.summary,
          detailed_results: results.tests.slice(0, 10) // Limitar detalhes
        }
      })
      .eq('id', testLogEntry?.id);

    return {
      success: true,
      results: results,
      message: `Teste ${config.testType} concluído: ${results.summary.passed}/${results.summary.totalTests} sucessos`
    };

  } catch (error: any) {
    console.error('Erro crítico no teste de estresse:', error);
    
    await supabase
      .from('automation_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        records_processed: results.summary.totalTests,
        errors_count: results.summary.failed + 1,
        error_details: { critical_error: error.message, partial_results: results }
      })
      .eq('id', testLogEntry?.id);

    return {
      success: false,
      error: error.message,
      partialResults: results
    };
  }
}

// Teste de carga - simular múltiplas requisições
async function runLoadTest(results: any, config: StressTestConfig) {
  const duration = config.duration || 30; // 30 segundos
  const requestsPerSecond = 5;
  const endTime = Date.now() + (duration * 1000);

  console.log(`Executando teste de carga por ${duration} segundos...`);

  while (Date.now() < endTime) {
    const batch = [];
    
    for (let i = 0; i < requestsPerSecond; i++) {
      batch.push(simulateAutomationProcess('daily_processing'));
    }

    const batchResults = await Promise.allSettled(batch);
    
    batchResults.forEach((result, index) => {
      results.tests.push({
        testId: `load_${results.tests.length + index}`,
        type: 'load_test',
        success: result.status === 'fulfilled',
        responseTime: result.status === 'fulfilled' ? result.value.responseTime : null,
        error: result.status === 'rejected' ? result.reason.message : null,
        timestamp: new Date().toISOString()
      });
    });

    // Aguardar 1 segundo antes do próximo batch
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Teste de concorrência - processos simultâneos
async function runConcurrencyTest(results: any, config: StressTestConfig) {
  const concurrency = config.concurrency || 10;
  
  console.log(`Executando teste de concorrência com ${concurrency} processos simultâneos...`);

  const processes = [
    'daily_processing',
    'data_ingestion',
    'payment_automation'
  ];

  const concurrentTasks = [];

  for (let i = 0; i < concurrency; i++) {
    const processType = processes[i % processes.length];
    concurrentTasks.push(simulateAutomationProcess(processType, `concurrent_${i}`));
  }

  const concurrentResults = await Promise.allSettled(concurrentTasks);
  
  concurrentResults.forEach((result, index) => {
    results.tests.push({
      testId: `concurrent_${index}`,
      type: 'concurrency_test',
      success: result.status === 'fulfilled',
      responseTime: result.status === 'fulfilled' ? result.value.responseTime : null,
      error: result.status === 'rejected' ? result.reason.message : null,
      timestamp: new Date().toISOString()
    });
  });
}

// Teste de volume - grande quantidade de dados
async function runVolumeTest(results: any, config: StressTestConfig) {
  const dataVolume = config.dataVolume || 1000;
  
  console.log(`Executando teste de volume com ${dataVolume} registros...`);

  // Simular processamento de grande volume de documentos
  const batchSize = 50;
  const batches = Math.ceil(dataVolume / batchSize);

  for (let batch = 0; batch < batches; batch++) {
    const start = Date.now();
    
    try {
      // Simular processamento de batch
      const batchResult = await simulateVolumeProcessing(batchSize);
      const responseTime = Date.now() - start;

      results.tests.push({
        testId: `volume_batch_${batch}`,
        type: 'volume_test',
        success: true,
        responseTime: responseTime,
        recordsProcessed: batchResult.processed,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      results.tests.push({
        testId: `volume_batch_${batch}`,
        type: 'volume_test',
        success: false,
        responseTime: Date.now() - start,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Teste completo - combinação de todos os testes
async function runFullStressTest(results: any, config: StressTestConfig) {
  console.log('Executando teste de estresse completo...');

  // Fase 1: Teste de carga leve
  await runLoadTest(results, { ...config, duration: 10 });
  
  // Fase 2: Teste de concorrência
  await runConcurrencyTest(results, { ...config, concurrency: 5 });
  
  // Fase 3: Teste de volume
  await runVolumeTest(results, { ...config, dataVolume: 200 });
  
  // Fase 4: Teste de resiliência - falhas simuladas
  await runResilienceTest(results);
}

// Teste de resiliência
async function runResilienceTest(results: any) {
  console.log('Executando teste de resiliência...');

  // Simular falhas e recuperação
  const failureScenarios = [
    'database_timeout',
    'api_rate_limit',
    'memory_pressure',
    'network_error'
  ];

  for (const scenario of failureScenarios) {
    const start = Date.now();
    
    try {
      await simulateFailureScenario(scenario);
      
      results.tests.push({
        testId: `resilience_${scenario}`,
        type: 'resilience_test',
        success: true,
        responseTime: Date.now() - start,
        scenario: scenario,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      results.tests.push({
        testId: `resilience_${scenario}`,
        type: 'resilience_test',
        success: false,
        responseTime: Date.now() - start,
        scenario: scenario,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Simular processo de automação
async function simulateAutomationProcess(processType: string, testId?: string): Promise<any> {
  const start = Date.now();
  
  // Simular tempo de processamento variável
  const processingTime = Math.random() * 2000 + 500; // 500ms a 2.5s
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Simular possíveis falhas (5% de chance)
  if (Math.random() < 0.05) {
    throw new Error(`Simulated failure in ${processType}`);
  }

  // Simular dados de retorno
  const mockData = {
    processType,
    testId,
    recordsProcessed: Math.floor(Math.random() * 100) + 1,
    responseTime: Date.now() - start,
    timestamp: new Date().toISOString()
  };

  return mockData;
}

// Simular processamento de volume
async function simulateVolumeProcessing(batchSize: number): Promise<any> {
  // Simular tempo proporcional ao tamanho do batch
  const processingTime = batchSize * 10; // 10ms por registro
  await new Promise(resolve => setTimeout(resolve, processingTime));

  return {
    processed: batchSize,
    duration: processingTime
  };
}

// Simular cenários de falha
async function simulateFailureScenario(scenario: string): Promise<void> {
  console.log(`Simulando cenário de falha: ${scenario}`);
  
  switch (scenario) {
    case 'database_timeout':
      // Simular timeout de banco
      await new Promise(resolve => setTimeout(resolve, 5000));
      break;
    case 'api_rate_limit':
      // Simular rate limit
      throw new Error('API rate limit exceeded');
    case 'memory_pressure':
      // Simular pressão de memória
      const largeArray = new Array(100000).fill('stress_test_data');
      await new Promise(resolve => setTimeout(resolve, 1000));
      break;
    case 'network_error':
      // Simular erro de rede
      if (Math.random() < 0.3) {
        throw new Error('Network timeout');
      }
      break;
  }
}

// Calcular estatísticas finais
function calculateFinalStatistics(results: any) {
  const tests = results.tests;
  results.summary.totalTests = tests.length;
  results.summary.passed = tests.filter(t => t.success).length;
  results.summary.failed = tests.filter(t => !t.success).length;

  const responseTimes = tests
    .filter(t => t.success && t.responseTime)
    .map(t => t.responseTime);

  if (responseTimes.length > 0) {
    results.summary.avgResponseTime = Math.round(
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    );
    results.summary.maxResponseTime = Math.max(...responseTimes);
    results.summary.minResponseTime = Math.min(...responseTimes);
    
    // Calcular throughput (operações por segundo)
    const totalDuration = (new Date(results.tests[results.tests.length - 1]?.timestamp).getTime() - 
                          new Date(results.tests[0]?.timestamp).getTime()) / 1000;
    results.summary.throughput = Math.round(results.summary.totalTests / Math.max(totalDuration, 1));
  }
}

// Servir a função
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const config: StressTestConfig = {
      testType: body.testType || 'load',
      duration: body.duration,
      concurrency: body.concurrency,
      dataVolume: body.dataVolume
    };

    const result = await runStressTests(config);
    
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
    console.error("Erro na Edge Function de stress test:", error);
    
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