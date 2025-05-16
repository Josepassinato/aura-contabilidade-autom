
/**
 * Serviço de mensageria para eventos fiscais
 * Implementa um sistema pub/sub para comunicação entre módulos
 */

import { v4 as uuidv4 } from "uuid";
import { EventoFiscal, TipoEvento, EventoSubscriber } from "../types";

// Re-export types for components that need them
export type { EventoFiscal, TipoEvento, EventoSubscriber };

// Armazenamento interno de subscribers por tipo de evento
const subscribers: Map<TipoEvento, EventoSubscriber[]> = new Map();

// Fila de eventos para simulação
const eventosRecentes: EventoFiscal[] = [];
const MAX_EVENTOS_GUARDADOS = 100;

/**
 * Inicializa o sistema de eventos
 */
export const inicializarSistemaEventos = () => {
  console.log('Sistema de eventos fiscais inicializado');
  
  // Limpar subscribers existentes
  subscribers.clear();
  
  // Registrar tipos de eventos suportados
  const tiposEvento: TipoEvento[] = [
    'fiscal.calculated',
    'fiscal.generated',
    'guia.generated',
    'pagamento.scheduled',
    'pagamento.executed',
    'bank.transaction',
    'entry.created',
    'entry.classified',
    'entry.reconciled',
  ];
  
  tiposEvento.forEach(tipo => {
    subscribers.set(tipo, []);
  });
  
  return {
    nomeServico: 'Sistema de Eventos Fiscais',
    versao: '1.0.0',
    tiposEventoSuportados: tiposEvento,
  };
};

/**
 * Assina um tipo de evento para receber notificações
 */
export const subscribe = (tipo: TipoEvento, callback: EventoSubscriber): () => void => {
  // Verificar se o tipo de evento é suportado
  if (!subscribers.has(tipo)) {
    console.warn(`Tipo de evento não suportado: ${tipo}. Criando dinamicamente.`);
    subscribers.set(tipo, []);
  }
  
  // Adicionar o callback à lista de subscribers
  subscribers.get(tipo)!.push(callback);
  
  // Retornar função para cancelar a assinatura
  return () => {
    const eventoSubscribers = subscribers.get(tipo);
    if (eventoSubscribers) {
      const index = eventoSubscribers.indexOf(callback);
      if (index !== -1) {
        eventoSubscribers.splice(index, 1);
      }
    }
  };
};

/**
 * Publica um evento para todos os subscribers
 */
export const publicarEvento = async (tipo: TipoEvento, dados: Record<string, any>): Promise<EventoFiscal> => {
  const evento: EventoFiscal = {
    id: uuidv4(),
    tipo,
    timestamp: new Date().toISOString(),
    origem: 'sistema-fiscal',
    dados,
  };
  
  // Guardar evento na lista recente
  eventosRecentes.push(evento);
  
  // Manter apenas os MAX_EVENTOS_GUARDADOS mais recentes
  if (eventosRecentes.length > MAX_EVENTOS_GUARDADOS) {
    eventosRecentes.shift();
  }
  
  console.log(`Evento publicado: ${tipo}`, dados);
  
  // Notificar todos os subscribers de forma assíncrona
  const eventoSubscribers = subscribers.get(tipo);
  if (eventoSubscribers && eventoSubscribers.length > 0) {
    // Usar Promise.all para esperar que todos os handlers completem
    await Promise.all(
      eventoSubscribers.map(async (callback) => {
        try {
          await callback(evento);
        } catch (error) {
          console.error(`Erro ao processar evento ${tipo} por subscriber:`, error);
        }
      })
    );
  }
  
  return evento;
};

/**
 * Simula um evento fiscal para testes
 */
export const simularEvento = async (tipo: TipoEvento): Promise<EventoFiscal> => {
  const dados = {
    simulacao: true,
    cnpj: '12345678000199',
    periodo: '2023-01',
    valor: Math.floor(Math.random() * 1000) + 500,
    tipoImposto: 'IRPJ' as TipoImposto,
    dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contribuinte: 'Empresa Simulada LTDA'
  };
  
  console.log(`Simulando evento: ${tipo}`, dados);
  
  // Publicar o evento simulado
  return await publicarEvento(tipo, dados);
};

/**
 * Retorna os eventos recentes para fins de debug
 */
export const obterEventosRecentes = (): EventoFiscal[] => {
  return [...eventosRecentes];
};

/**
 * Limpa a lista de eventos recentes
 */
export const limparEventosRecentes = (): void => {
  eventosRecentes.length = 0;
};

/**
 * Adiciona função para simulação de fluxo de processamento 
 * necessário para ReconciliacaoBancaria.tsx
 */
export const simularFluxoProcessamento = async (
  tipo: TipoEvento, 
  quantidadeEventos: number = 5, 
  intervalMs: number = 1000
): Promise<void> => {
  for (let i = 0; i < quantidadeEventos; i++) {
    const dados = {
      simulacao: true,
      indice: i + 1,
      total: quantidadeEventos,
      timestamp: new Date().toISOString(),
      detalhes: {
        descricao: `Evento simulado ${i + 1} de ${quantidadeEventos}`,
        progresso: ((i + 1) / quantidadeEventos) * 100
      }
    };
    
    await publicarEvento(tipo, dados);
    
    // Esperar intervalo antes de próximo evento
    if (i < quantidadeEventos - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
};
