
/**
 * Processador de eventos de mensageria
 * Simula um sistema Kafka/RabbitMQ para processamento de eventos relacionados a lançamentos
 */

import { toast } from "@/hooks/use-toast";
import { Lancamento } from "../classificacao/classificacaoML";
import { classificarLancamento } from "../classificacao/classificacaoML";
import { TransacaoBancaria } from "../../bancario/openBankingService";
import { reconciliarTransacoes } from "../reconciliacao/reconciliacaoBancaria";

// Tipos de eventos
export type TipoEvento = 
  | 'bank.transaction'
  | 'entry.created'
  | 'entry.classified'
  | 'entry.reconciled'
  | 'fiscal.calculated'
  | 'fiscal.generated';

// Interface de evento
export interface Evento<T = any> {
  id: string;
  tipo: TipoEvento;
  timestamp: string;
  payload: T;
  origem: string;
  correlationId?: string;
}

// Callbacks de assinatura de eventos
type EventCallback<T = any> = (evento: Evento<T>) => void | Promise<void>;

// Assinantes de eventos
const assinantes: Record<TipoEvento, EventCallback[]> = {
  'bank.transaction': [],
  'entry.created': [],
  'entry.classified': [],
  'entry.reconciled': [],
  'fiscal.calculated': [],
  'fiscal.generated': []
};

/**
 * Assina um tipo de evento
 * @param tipoEvento Tipo de evento a ser assinado
 * @param callback Função a ser chamada quando o evento ocorrer
 * @returns Função para cancelar a assinatura
 */
export const assinarEvento = <T = any>(
  tipoEvento: TipoEvento, 
  callback: EventCallback<T>
): () => void => {
  assinantes[tipoEvento].push(callback as EventCallback);
  
  console.log(`Novo assinante para eventos do tipo ${tipoEvento}`);
  
  // Retorna função para cancelar a assinatura
  return () => {
    const index = assinantes[tipoEvento].indexOf(callback as EventCallback);
    if (index !== -1) {
      assinantes[tipoEvento].splice(index, 1);
      console.log(`Assinatura para ${tipoEvento} cancelada`);
    }
  };
};

/**
 * Publica um evento
 * @param tipoEvento Tipo do evento
 * @param payload Dados do evento
 * @param origem Origem do evento
 * @param correlationId ID de correlação (opcional)
 */
export const publicarEvento = <T = any>(
  tipoEvento: TipoEvento,
  payload: T,
  origem: string,
  correlationId?: string
): Evento<T> => {
  const evento: Evento<T> = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    tipo: tipoEvento,
    timestamp: new Date().toISOString(),
    payload,
    origem,
    correlationId
  };
  
  console.log(`Evento publicado: ${tipoEvento}`, evento);
  
  // Notifica todos os assinantes
  setTimeout(() => {
    assinantes[tipoEvento].forEach(callback => {
      try {
        callback(evento);
      } catch (error) {
        console.error(`Erro ao processar evento ${tipoEvento}:`, error);
      }
    });
  }, 0);
  
  return evento;
};

/**
 * Inicializa os processadores padrão
 */
export const inicializarProcessadores = () => {
  // Processador que classifica lançamentos automaticamente
  assinarEvento('entry.created', (evento: Evento<Lancamento>) => {
    try {
      const lancamento = evento.payload;
      
      console.log(`Processando lançamento criado: ${lancamento.descricao}`);
      
      // Classifica o lançamento
      const lancamentoClassificado = classificarLancamento(lancamento);
      
      // Publica evento de lançamento classificado
      if (lancamentoClassificado.status === 'classificado') {
        publicarEvento(
          'entry.classified',
          lancamentoClassificado,
          'classificador-automatico',
          evento.id
        );
      }
    } catch (error) {
      console.error("Erro ao classificar lançamento:", error);
    }
  });
  
  // Processador que tenta reconciliar transações bancárias com lançamentos classificados
  assinarEvento('bank.transaction', (evento: Evento<TransacaoBancaria[]>) => {
    try {
      const transacoes = evento.payload;
      
      console.log(`Processando ${transacoes.length} transações bancárias para reconciliação`);
      
      // Seria necessário buscar lançamentos classificados para reconciliar
      // Em uma implementação real, buscaríamos do banco de dados
      // Para simplificar, não faremos a reconciliação automática aqui
      
      toast({
        title: "Transações importadas",
        description: `${transacoes.length} transações bancárias recebidas para processamento.`
      });
      
    } catch (error) {
      console.error("Erro ao processar transações bancárias:", error);
    }
  });
  
  console.log("Processadores de eventos inicializados");
};

/**
 * Função de conveniência para simular o fluxo completo de processamento
 */
export const simularFluxoProcessamento = async (
  transacoes: TransacaoBancaria[], 
  lancamentos: Lancamento[]
) => {
  try {
    // Passo 1: Publica evento de transações bancárias
    publicarEvento(
      'bank.transaction',
      transacoes,
      'simulacao',
    );
    
    // Atraso simulado para processamento assíncrono
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Passo 2: Para cada lançamento, publica um evento de criação
    for (const lancamento of lancamentos) {
      publicarEvento(
        'entry.created',
        lancamento,
        'simulacao'
      );
    }
    
    // Atraso simulado para processamento assíncrono
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Passo 3: Tenta reconciliar lançamentos classificados e transações
    // Em uma implementação real, isso seria feito por um microserviço que assinaria os eventos classificados
    const lancamentosClassificados = lancamentos.map(l => classificarLancamento(l));
    const resultado = reconciliarTransacoes(transacoes, lancamentosClassificados);
    
    // Passo 4: Publica resultados da reconciliação
    resultado.transacoesConciliadas.forEach(item => {
      publicarEvento(
        'entry.reconciled',
        item,
        'reconciliador-automatico'
      );
    });
    
    return resultado;
    
  } catch (error) {
    console.error("Erro ao simular fluxo de processamento:", error);
    toast({
      title: "Erro no processamento",
      description: "Ocorreu um erro ao simular o fluxo de processamento",
      variant: "destructive"
    });
    throw error;
  }
};

// Inicializa os processadores padrão
inicializarProcessadores();
