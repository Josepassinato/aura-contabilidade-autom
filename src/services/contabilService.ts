/**
 * Serviço centralizado para operações contábeis
 * BOUNDARY ÚNICO para todas as operações de lançamentos contábeis
 */

import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent, logDatabaseOperation } from "./auditService";
import { logger } from "@/utils/logger";

export interface LancamentoContabil {
  id?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface ItemLancamento {
  id?: string;
  lancamento_id?: string;
  conta_id: string;
  centro_custo_id?: string;
  tipo_movimento: 'DEBITO' | 'CREDITO';
  valor: number;
  historico_item?: string;
  ordem: number;
}

export interface LancamentoCompleto {
  lancamento: LancamentoContabil;
  itens: ItemLancamento[];
}

/**
 * Validações contábeis críticas - APENAS SERVER-SIDE
 */
export async function validarLancamentoContabil(dados: LancamentoCompleto): Promise<{
  valido: boolean;
  erros: string[];
}> {
  try {
    const { data, error } = await supabase.functions.invoke('validate-accounting-entry', {
      body: { lancamento: dados }
    });

    if (error) {
      await logAuditEvent({
        eventType: 'validation_error',
        message: 'Erro na validação de lançamento contábil',
        metadata: { error: error.message, dados },
        severity: 'error'
      });
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro na validação de lançamento', error, 'ContabilService');
    return {
      valido: false,
      erros: ['Erro interno na validação']
    };
  }
}

/**
 * Criar lançamento contábil - APENAS via Edge Function
 */
export async function criarLancamentoContabil(dados: LancamentoCompleto): Promise<{
  sucesso: boolean;
  lancamento?: LancamentoContabil;
  erro?: string;
}> {
  try {
    // Log de auditoria
    await logAuditEvent({
      eventType: 'lancamento_creation_attempt',
      message: 'Tentativa de criação de lançamento contábil',
      metadata: { 
        valor_total: dados.lancamento.valor_total,
        itens_count: dados.itens.length,
        client_id: dados.lancamento.client_id
      },
      severity: 'info'
    });

    const { data, error } = await supabase.functions.invoke('process-accounting-entry', {
      body: { 
        action: 'CREATE',
        dados 
      }
    });

    if (error) {
      await logAuditEvent({
        eventType: 'lancamento_creation_failed',
        message: 'Falha na criação de lançamento contábil',
        metadata: { error: error.message, dados },
        severity: 'error'
      });
      throw error;
    }

    // Log de auditoria de sucesso
    await logAuditEvent({
      eventType: 'lancamento_created',
      message: 'Lançamento contábil criado com sucesso',
      metadata: { 
        lancamento_id: data.lancamento.id,
        numero_lancamento: data.lancamento.numero_lancamento,
        valor_total: data.lancamento.valor_total
      },
      severity: 'info'
    });

    return { sucesso: true, lancamento: data.lancamento };
  } catch (error: any) {
    logger.error('Erro ao criar lançamento contábil', error, 'ContabilService');
    return {
      sucesso: false,
      erro: error.message || 'Erro interno'
    };
  }
}

/**
 * Buscar lançamentos contábeis
 */
export async function buscarLancamentosContabeis(filtros?: {
  client_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  limit?: number;
}): Promise<any[]> {
  try {
    let query = supabase
      .from('lancamentos_contabeis')
      .select('*')
      .order('data_lancamento', { ascending: false });

    if (filtros?.client_id) {
      query = query.eq('client_id', filtros.client_id);
    }

    if (filtros?.data_inicio) {
      query = query.gte('data_lancamento', filtros.data_inicio);
    }

    if (filtros?.data_fim) {
      query = query.lte('data_lancamento', filtros.data_fim);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.limit) {
      query = query.limit(filtros.limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Erro ao buscar lançamentos', error, 'ContabilService');
      throw error;
    }

    // Log de acesso aos dados
    await logDatabaseOperation(
      'lancamentos_contabeis',
      'SELECT',
      undefined,
      undefined,
      undefined,
      { filtros, result_count: data?.length || 0 }
    );

    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar lançamentos contábeis', error, 'ContabilService');
    return [];
  }
}

/**
 * Buscar plano de contas
 */
export async function buscarPlanoContas(): Promise<Array<{
  id: string;
  codigo: string;
  nome: string;
  aceita_lancamento: boolean;
}>> {
  try {
    const { data, error } = await supabase
      .from('plano_contas')
      .select('id, codigo, nome, aceita_lancamento')
      .eq('aceita_lancamento', true)
      .eq('ativo', true)
      .order('codigo');

    if (error) {
      logger.error('Erro ao buscar plano de contas', error, 'ContabilService');
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar plano de contas', error, 'ContabilService');
    return [];
  }
}

/**
 * Buscar centros de custo
 */
export async function buscarCentrosCusto(): Promise<Array<{
  id: string;
  codigo: string;
  nome: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('centro_custos')
      .select('id, codigo, nome')
      .eq('ativo', true)
      .order('codigo');

    if (error) {
      logger.error('Erro ao buscar centros de custo', error, 'ContabilService');
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('Erro ao buscar centros de custo', error, 'ContabilService');
    return [];
  }
}

/**
 * Calcular próximo número de lançamento - SERVER-SIDE
 */
export async function obterProximoNumeroLancamento(clientId: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('get-next-entry-number', {
      body: { client_id: clientId }
    });

    if (error) {
      logger.error('Erro ao obter próximo número', error, 'ContabilService');
      throw error;
    }

    return data.numero;
  } catch (error) {
    logger.error('Erro ao obter próximo número de lançamento', error, 'ContabilService');
    // Fallback local apenas para desenvolvimento
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    return `${ano}${mes}0001`;
  }
}