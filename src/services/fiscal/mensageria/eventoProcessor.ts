
/**
 * Serviço de processamento de eventos fiscais
 * Sistema de mensagens que conecta diferentes partes do sistema fiscal
 */

import { toast } from "@/hooks/use-toast";

// Tipos de eventos fiscais
export type TipoEvento = 
  | 'fiscal.calculated' 
  | 'fiscal.generated' 
  | 'guia.generated'
  | 'pagamento.scheduled'
  | 'pagamento.executed'
  | 'classificacao.completed';

// Interface de evento fiscal
export interface EventoFiscal {
  id: string;
  tipo: TipoEvento;
  timestamp: string;
  origem: string;
  dados: {
    [key: string]: any;
  };
}

// Tipo para funções de subscriber
export type EventoSubscriber = (evento: EventoFiscal) => Promise<void> | void;

// Repositório de listeners
const eventListeners: Record<string, EventoSubscriber[]> = {};
const historicoEventos: EventoFiscal[] = [];
const MAX_HISTORICO = 100;

/**
 * Registra um subscriber para um tipo de evento
 */
export const subscribe = (tipo: TipoEvento, callback: EventoSubscriber): () => void => {
  if (!eventListeners[tipo]) {
    eventListeners[tipo] = [];
  }
  
  eventListeners[tipo].push(callback);
  console.log(`Novo subscriber registrado para eventos do tipo: ${tipo}`);
  
  // Retorna função para cancelar a inscrição
  return () => {
    eventListeners[tipo] = eventListeners[tipo].filter(cb => cb !== callback);
    console.log(`Subscriber removido para eventos do tipo: ${tipo}`);
  };
};

/**
 * Publica um novo evento fiscal
 */
export const publicarEvento = async (tipo: TipoEvento, dados: any, origem: string = 'sistema'): Promise<EventoFiscal> => {
  const evento: EventoFiscal = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    tipo,
    timestamp: new Date().toISOString(),
    origem,
    dados
  };
  
  console.log(`Evento publicado: ${tipo}`, evento);
  
  // Adicionar ao histórico
  historicoEventos.unshift(evento);
  
  // Limitar tamanho do histórico
  if (historicoEventos.length > MAX_HISTORICO) {
    historicoEventos.length = MAX_HISTORICO;
  }
  
  // Processar subscribers
  if (eventListeners[tipo]) {
    await Promise.all(
      eventListeners[tipo].map(async (callback) => {
        try {
          await callback(evento);
        } catch (error) {
          console.error(`Erro ao processar evento ${tipo} em um subscriber:`, error);
        }
      })
    );
  }
  
  return evento;
};

/**
 * Obtém o histórico de eventos
 */
export const obterHistoricoEventos = (): EventoFiscal[] => {
  return [...historicoEventos];
};

/**
 * Limpa o histórico de eventos
 */
export const limparHistoricoEventos = (): void => {
  historicoEventos.length = 0;
};

/**
 * Simulador de eventos para teste
 */
export const simularEvento = async (tipo: TipoEvento): Promise<EventoFiscal> => {
  let dadosSimulados: any = {};
  
  switch (tipo) {
    case 'fiscal.calculated':
      dadosSimulados = {
        cnpj: '12345678000190',
        periodo: '2023-05',
        impostos: {
          irpj: 1200.50,
          csll: 720.30,
          pis: 195.45,
          cofins: 900.20
        }
      };
      break;
    case 'fiscal.generated':
      dadosSimulados = {
        cnpj: '12345678000190',
        tipoImposto: 'IRPJ',
        valor: 1250.75,
        dataVencimento: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodo: '2023-05',
        contribuinte: 'Empresa Teste LTDA'
      };
      break;
    case 'guia.generated':
      dadosSimulados = {
        cnpj: '12345678000190',
        tipoImposto: 'DAS',
        valor: 580.32,
        dataVencimento: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        periodo: '2023-05',
        codigoBarras: '85800000008-6 58032073801-4 24062023030-6 67890123456-7',
        contribuinte: 'Empresa Teste LTDA'
      };
      break;
    case 'pagamento.scheduled':
      dadosSimulados = {
        jobId: `PAG-${Date.now()}`,
        tipoImposto: 'DARF',
        valor: 1250.75,
        dataAgendamento: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      break;
    case 'pagamento.executed':
      dadosSimulados = {
        jobId: `PAG-${Date.now() - 10000}`,
        tipoImposto: 'DAS',
        valor: 580.32,
        sucesso: Math.random() > 0.2,
        mensagem: Math.random() > 0.2 ? 'Pagamento realizado com sucesso' : 'Falha ao processar pagamento'
      };
      break;
    case 'classificacao.completed':
      dadosSimulados = {
        totalLancamentos: 45,
        lancamentosClassificados: 38,
        precisao: 0.84
      };
      break;
    default:
      dadosSimulados = { mensagem: 'Evento simulado genérico' };
  }
  
  const evento = await publicarEvento(tipo, dadosSimulados, 'simulador');
  
  toast({
    title: `Evento ${tipo} simulado`,
    description: `Um evento do tipo ${tipo} foi simulado para fins de teste.`
  });
  
  return evento;
};

/**
 * Inicializa o sistema de eventos, registrando os manipuladores padrão
 */
export const inicializarSistemaEventos = (): void => {
  console.log('Inicializando sistema de eventos fiscais...');
  
  // Registrar manipulador de log para todos os eventos
  for (const tipo of [
    'fiscal.calculated', 'fiscal.generated', 'guia.generated',
    'pagamento.scheduled', 'pagamento.executed', 'classificacao.completed'
  ] as TipoEvento[]) {
    subscribe(tipo, (evento) => {
      console.log(`[EventLog] Evento ${tipo} processado:`, evento);
    });
  }
};
