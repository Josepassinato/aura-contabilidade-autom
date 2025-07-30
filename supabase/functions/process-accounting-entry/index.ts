import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LancamentoContabil {
  numero_lancamento: string;
  data_lancamento: string;
  data_competencia: string;
  historico: string;
  valor_total: number;
  tipo_documento?: string;
  numero_documento?: string;
  observacoes?: string;
  origem: 'MANUAL' | 'AUTOMATICO' | 'IMPORTACAO';
  status: 'RASCUNHO' | 'LANCADO' | 'CANCELADO';
  client_id: string;
}

interface ItemLancamento {
  conta_id: string;
  centro_custo_id?: string;
  tipo_movimento: 'DEBITO' | 'CREDITO';
  valor: number;
  historico_item?: string;
  ordem: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧮 Processando operação contábil');
    const { action, dados } = await req.json();
    
    // Log de auditoria crítica
    await supabase.rpc('log_critical_event', {
      p_event_type: 'accounting_operation_started',
      p_message: `Operação contábil iniciada: ${action}`,
      p_metadata: {
        action,
        client_id: dados.lancamento?.client_id,
        valor_total: dados.lancamento?.valor_total,
        function_name: 'process-accounting-entry'
      },
      p_severity: 'info'
    });

    if (action === 'CREATE') {
      return await processarCriacaoLancamento(supabase, dados);
    } else if (action === 'VALIDATE') {
      return await validarLancamento(supabase, dados);
    }

    throw new Error('Ação não reconhecida');

  } catch (error) {
    console.error('❌ Erro crítico no processamento contábil:', error);
    
    // Log erro crítico
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.rpc('log_critical_event', {
        p_event_type: 'accounting_operation_failed',
        p_message: `Falha crítica no processamento contábil: ${error.message}`,
        p_metadata: {
          error_stack: error.stack,
          function_name: 'process-accounting-entry'
        },
        p_severity: 'critical'
      });
    } catch (auditError) {
      console.error('Falha ao registrar erro de auditoria:', auditError);
    }

    return new Response(
      JSON.stringify({ 
        sucesso: false, 
        erro: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function processarCriacaoLancamento(supabase: any, dados: any) {
  const startTime = Date.now();
  
  try {
    console.log('📝 Iniciando criação de lançamento contábil');
    
    // 1. Validações críticas server-side
    const validacao = await validarLancamento(supabase, dados);
    if (!validacao.valido) {
      console.error('❌ Validação falhou:', validacao.erros);
      return new Response(
        JSON.stringify({ 
          sucesso: false, 
          erros: validacao.erros 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Transação contábil atômica
    const { data: lancamento, error: lancamentoError } = await supabase
      .from('lancamentos_contabeis')
      .insert([dados.lancamento])
      .select()
      .single();

    if (lancamentoError) {
      console.error('❌ Erro ao inserir lançamento:', lancamentoError);
      throw lancamentoError;
    }

    console.log('✅ Lançamento criado:', lancamento.id);

    // 3. Inserir itens do lançamento
    const itensComLancamentoId = dados.itens.map((item: ItemLancamento) => ({
      ...item,
      lancamento_id: lancamento.id
    }));

    const { error: itensError } = await supabase
      .from('itens_lancamento')
      .insert(itensComLancamentoId);

    if (itensError) {
      console.error('❌ Erro ao inserir itens:', itensError);
      // Rollback do lançamento
      await supabase
        .from('lancamentos_contabeis')
        .delete()
        .eq('id', lancamento.id);
      throw itensError;
    }

    console.log('✅ Itens inseridos com sucesso');

    // 4. Log de auditoria de sucesso
    const executionTime = Date.now() - startTime;
    await supabase.rpc('log_critical_event', {
      p_event_type: 'accounting_entry_created',
      p_message: `Lançamento contábil criado com sucesso em ${executionTime}ms`,
      p_metadata: {
        lancamento_id: lancamento.id,
        numero_lancamento: lancamento.numero_lancamento,
        valor_total: lancamento.valor_total,
        itens_count: dados.itens.length,
        execution_time_ms: executionTime,
        function_name: 'process-accounting-entry'
      },
      p_severity: 'info'
    });

    // 5. Enfileirar tarefas de pós-processamento
    await enfileirarTarefasContabeis(supabase, lancamento.id, dados);

    return new Response(
      JSON.stringify({ 
        sucesso: true, 
        lancamento,
        execution_time_ms: executionTime
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro na criação do lançamento:', error);
    throw error;
  }
}

async function validarLancamento(supabase: any, dados: any): Promise<{
  valido: boolean;
  erros: string[];
}> {
  console.log('🔍 Validando lançamento contábil');
  const erros: string[] = [];

  try {
    // 1. Validação de balanceamento
    const totalDebitos = dados.itens
      .filter((item: ItemLancamento) => item.tipo_movimento === 'DEBITO')
      .reduce((sum: number, item: ItemLancamento) => sum + item.valor, 0);
    
    const totalCreditos = dados.itens
      .filter((item: ItemLancamento) => item.tipo_movimento === 'CREDITO')
      .reduce((sum: number, item: ItemLancamento) => sum + item.valor, 0);

    if (Math.abs(totalDebitos - totalCreditos) > 0.01) {
      erros.push('Lançamento não balanceado: débitos e créditos devem ser iguais');
    }

    // 2. Validação de contas contábeis
    const contasIds = dados.itens.map((item: ItemLancamento) => item.conta_id);
    const { data: contas, error: contasError } = await supabase
      .from('plano_contas')
      .select('id, aceita_lancamento, ativo')
      .in('id', contasIds);

    if (contasError) {
      erros.push('Erro ao validar contas contábeis');
    } else {
      for (const conta of contas) {
        if (!conta.ativo || !conta.aceita_lancamento) {
          erros.push(`Conta ${conta.id} não aceita lançamentos ou está inativa`);
        }
      }
    }

    // 3. Validação de valores
    for (const item of dados.itens) {
      if (item.valor <= 0) {
        erros.push('Todos os valores devem ser positivos');
        break;
      }
    }

    // 4. Validação de duplicidade (número de lançamento)
    if (dados.lancamento.numero_lancamento) {
      const { data: existente, error: duplicationError } = await supabase
        .from('lancamentos_contabeis')
        .select('id')
        .eq('numero_lancamento', dados.lancamento.numero_lancamento)
        .eq('client_id', dados.lancamento.client_id);

      if (duplicationError) {
        erros.push('Erro ao verificar duplicidade');
      } else if (existente && existente.length > 0) {
        erros.push('Número de lançamento já existe');
      }
    }

    const resultado = {
      valido: erros.length === 0,
      erros
    };

    console.log(`${resultado.valido ? '✅' : '❌'} Validação concluída:`, resultado);
    return resultado;

  } catch (error) {
    console.error('❌ Erro na validação:', error);
    return {
      valido: false,
      erros: ['Erro interno na validação']
    };
  }
}

async function enfileirarTarefasContabeis(supabase: any, lancamentoId: string, dados: any) {
  console.log('📋 Enfileirando tarefas de pós-processamento');
  
  try {
    // Tarefa 1: Atualização de saldos
    await supabase
      .from('processing_queue')
      .insert({
        task_type: 'update_account_balances',
        priority: 1,
        max_retries: 3,
        parameters: {
          lancamento_id: lancamentoId,
          client_id: dados.lancamento.client_id,
          contas_afetadas: dados.itens.map((item: ItemLancamento) => item.conta_id)
        },
        scheduled_at: new Date().toISOString()
      });

    // Tarefa 2: Cálculo de relatórios
    await supabase
      .from('processing_queue')
      .insert({
        task_type: 'recalculate_reports',
        priority: 2,
        max_retries: 2,
        parameters: {
          lancamento_id: lancamentoId,
          client_id: dados.lancamento.client_id,
          periodo: dados.lancamento.data_competencia
        },
        scheduled_at: new Date(Date.now() + 30000).toISOString() // 30s delay
      });

    // Tarefa 3: Notificações
    await supabase
      .from('processing_queue')
      .insert({
        task_type: 'send_notifications',
        priority: 3,
        max_retries: 5,
        parameters: {
          lancamento_id: lancamentoId,
          client_id: dados.lancamento.client_id,
          notification_type: 'lancamento_created'
        },
        scheduled_at: new Date(Date.now() + 5000).toISOString() // 5s delay
      });

    console.log('✅ Tarefas enfileiradas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao enfileirar tarefas:', error);
    // Não falha a operação principal por erro nas tarefas secundárias
  }
}