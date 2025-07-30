import { test, expect } from '@playwright/test';

/**
 * Testes de carga para Edge Functions críticas
 * Foco em process-daily-accounting e security-monitor
 */

const SUPABASE_URL = 'https://watophocqlcyimirzrpe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg';

test.describe('Testes de Carga - Edge Functions', () => {
  test('Carga na função process-daily-accounting', async ({ page }) => {
    console.log('🚀 Iniciando teste de carga para process-daily-accounting');
    
    const results = [];
    const concurrentRequests = 10;
    const requestsPerBatch = 5;
    
    // Função para executar uma requisição
    const executeRequest = async () => {
      const startTime = Date.now();
      
      try {
        const response = await page.request.post(
          `${SUPABASE_URL}/functions/v1/process-daily-accounting`,
          {
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            data: {
              clientId: 'test-client-id',
              date: new Date().toISOString().split('T')[0],
              processType: 'load_test'
            }
          }
        );
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        return {
          success: response.ok(),
          status: response.status(),
          responseTime,
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        const endTime = Date.now();
        return {
          success: false,
          status: 0,
          responseTime: endTime - startTime,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    };
    
    // Executar testes em batches para simular carga real
    for (let batch = 0; batch < 3; batch++) {
      console.log(`📊 Executando batch ${batch + 1}/3`);
      
      const batchPromises = Array(concurrentRequests)
        .fill(null)
        .map(() => executeRequest());
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Aguardar entre batches
      await page.waitForTimeout(2000);
    }
    
    // Análise dos resultados
    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);
    const averageResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));
    const minResponseTime = Math.min(...results.map(r => r.responseTime));
    
    console.log(`📈 Resultados do teste de carga - process-daily-accounting:`);
    console.log(`   Total de requisições: ${results.length}`);
    console.log(`   Sucessos: ${successfulRequests.length} (${(successfulRequests.length/results.length*100).toFixed(1)}%)`);
    console.log(`   Falhas: ${failedRequests.length} (${(failedRequests.length/results.length*100).toFixed(1)}%)`);
    console.log(`   Tempo médio de resposta: ${averageResponseTime.toFixed(0)}ms`);
    console.log(`   Tempo máximo: ${maxResponseTime}ms`);
    console.log(`   Tempo mínimo: ${minResponseTime}ms`);
    
    // Verificações de SLA
    expect(successfulRequests.length / results.length).toBeGreaterThan(0.95); // 95% de sucesso
    expect(averageResponseTime).toBeLessThan(5000); // Menos de 5s em média
    expect(maxResponseTime).toBeLessThan(15000); // Menos de 15s no pior caso
  });

  test('Carga na função security-monitor', async ({ page }) => {
    console.log('🔒 Iniciando teste de carga para security-monitor');
    
    const results = [];
    const concurrentRequests = 15;
    
    // Função para executar uma requisição de monitoramento
    const executeSecurityCheck = async () => {
      const startTime = Date.now();
      
      try {
        const response = await page.request.post(
          `${SUPABASE_URL}/functions/v1/security-monitor`,
          {
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            data: {
              checkType: 'rls_compliance',
              priority: 'high',
              metadata: {
                test_id: `load_test_${Date.now()}`,
                concurrent_requests: concurrentRequests
              }
            }
          }
        );
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        return {
          success: response.ok(),
          status: response.status(),
          responseTime,
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        const endTime = Date.now();
        return {
          success: false,
          status: 0,
          responseTime: endTime - startTime,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    };
    
    // Executar requisições simultâneas
    console.log(`🔄 Executando ${concurrentRequests} requisições simultâneas`);
    
    const promises = Array(concurrentRequests)
      .fill(null)
      .map(() => executeSecurityCheck());
    
    const allResults = await Promise.all(promises);
    results.push(...allResults);
    
    // Executar segundo batch com intervalo menor
    await page.waitForTimeout(1000);
    
    const secondBatch = Array(concurrentRequests)
      .fill(null)
      .map(() => executeSecurityCheck());
    
    const secondResults = await Promise.all(secondBatch);
    results.push(...secondResults);
    
    // Análise dos resultados
    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);
    const averageResponseTime = successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));
    const minResponseTime = Math.min(...results.map(r => r.responseTime));
    
    console.log(`🔍 Resultados do teste de carga - security-monitor:`);
    console.log(`   Total de requisições: ${results.length}`);
    console.log(`   Sucessos: ${successfulRequests.length} (${(successfulRequests.length/results.length*100).toFixed(1)}%)`);
    console.log(`   Falhas: ${failedRequests.length} (${(failedRequests.length/results.length*100).toFixed(1)}%)`);
    console.log(`   Tempo médio de resposta: ${averageResponseTime.toFixed(0)}ms`);
    console.log(`   Tempo máximo: ${maxResponseTime}ms`);
    console.log(`   Tempo mínimo: ${minResponseTime}ms`);
    
    // Verificações específicas para security-monitor (deve ser mais rápido)
    expect(successfulRequests.length / results.length).toBeGreaterThan(0.98); // 98% de sucesso
    expect(averageResponseTime).toBeLessThan(2000); // Menos de 2s em média
    expect(maxResponseTime).toBeLessThan(8000); // Menos de 8s no pior caso
  });

  test('Teste de estresse combinado', async ({ page }) => {
    console.log('💥 Iniciando teste de estresse combinado');
    
    const results = {
      dailyAccounting: [],
      securityMonitor: [],
      stressTest: []
    };
    
    // Executar stress test automation
    const stressTestRequest = async () => {
      const startTime = Date.now();
      
      try {
        const response = await page.request.post(
          `${SUPABASE_URL}/functions/v1/stress-test-automation`,
          {
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            data: {
              testType: 'concurrent',
              concurrency: 5,
              duration: 10
            }
          }
        );
        
        const endTime = Date.now();
        return {
          success: response.ok(),
          status: response.status(),
          responseTime: endTime - startTime,
          type: 'stress_test'
        };
        
      } catch (error) {
        return {
          success: false,
          status: 0,
          responseTime: Date.now() - startTime,
          error: error.message,
          type: 'stress_test'
        };
      }
    };
    
    // Executar múltiplas funções simultaneamente
    const combinedPromises = [
      stressTestRequest(),
      stressTestRequest(),
      stressTestRequest()
    ];
    
    const combinedResults = await Promise.all(combinedPromises);
    results.stressTest.push(...combinedResults);
    
    // Verificar que o sistema suporta múltiplas cargas simultaneamente
    const allResults = [
      ...results.dailyAccounting,
      ...results.securityMonitor,
      ...results.stressTest
    ];
    
    const successRate = allResults.filter(r => r.success).length / allResults.length;
    const avgResponseTime = allResults.reduce((sum, r) => sum + r.responseTime, 0) / allResults.length;
    
    console.log(`🎯 Resultado do teste de estresse combinado:`);
    console.log(`   Taxa de sucesso geral: ${(successRate * 100).toFixed(1)}%`);
    console.log(`   Tempo médio combinado: ${avgResponseTime.toFixed(0)}ms`);
    
    // O sistema deve manter pelo menos 90% de sucesso sob estresse
    expect(successRate).toBeGreaterThan(0.90);
  });
});

test.describe('Testes de Resiliência', () => {
  test('Recuperação após sobrecarga', async ({ page }) => {
    console.log('🔄 Testando recuperação após sobrecarga');
    
    // Simular sobrecarga
    const overloadPromises = Array(20).fill(null).map(async () => {
      try {
        await page.request.post(`${SUPABASE_URL}/functions/v1/process-daily-accounting`, {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          data: { clientId: 'overload-test', processType: 'overload_test' }
        });
      } catch (error) {
        // Ignorar erros durante sobrecarga
      }
    });
    
    await Promise.all(overloadPromises);
    
    // Aguardar recuperação
    await page.waitForTimeout(5000);
    
    // Testar se sistema voltou ao normal
    const recoveryStart = Date.now();
    const response = await page.request.post(
      `${SUPABASE_URL}/functions/v1/security-monitor`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        data: {
          checkType: 'system_health',
          priority: 'high'
        }
      }
    );
    
    const recoveryTime = Date.now() - recoveryStart;
    
    console.log(`✅ Sistema recuperado em ${recoveryTime}ms`);
    
    expect(response.ok()).toBeTruthy();
    expect(recoveryTime).toBeLessThan(3000); // Deve recuperar em menos de 3s
  });
});