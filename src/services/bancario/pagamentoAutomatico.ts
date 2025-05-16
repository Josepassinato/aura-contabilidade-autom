
/**
 * Serviço de automação de pagamentos
 * Responsável por integrar o módulo fiscal com pagamentos automatizados
 */

import { toast } from "@/hooks/use-toast";
import { realizarPagamentoAvancado, PagamentoResponse } from "./openBankingService";
import { ResultadoCalculo, TipoImposto } from "@/services/fiscal/types";
import { EventoFiscal } from "@/services/fiscal/mensageria/eventoProcessor";

// Interface para armazenar jobs de pagamento
export interface JobPagamento {
  id: string;
  createdAt: string;
  scheduledFor: string;
  status: 'agendado' | 'em_processamento' | 'concluido' | 'falha' | 'retry';
  tentativas: number;
  maxTentativas: number;
  proximaTentativa?: string;
  detalhes: {
    tipoPagamento: string;
    tipoImposto?: TipoImposto;
    codigoBarras?: string;
    valor: number;
    dataVencimento: string;
    contribuinte?: {
      nome: string;
      documento: string;
    };
    resultado?: PagamentoResponse;
  };
}

// Repositório simulado de jobs (em produção seria um banco de dados)
let jobsAgendados: JobPagamento[] = [];

/**
 * Processa um evento fiscal gerado e cria um job de pagamento
 * quando necessário e apropriado
 */
export const processarEventoFiscal = async (evento: EventoFiscal): Promise<JobPagamento | null> => {
  // Verificamos se o evento é do tipo que nos interessa
  if (evento.tipo !== 'fiscal.generated' && evento.tipo !== 'guia.generated') {
    console.log(`Evento do tipo ${evento.tipo} ignorado para automação de pagamento.`);
    return null;
  }
  
  console.log('Processando evento fiscal para possível pagamento automático:', evento);
  
  // Verificar se temos configurações bancárias disponíveis
  const bancoSelecionado = localStorage.getItem("banco-selecionado");
  if (!bancoSelecionado) {
    console.warn('Banco não configurado. Pagamento automático não será realizado.');
    return null;
  }
  
  try {
    // Extrair dados relevantes do evento
    const cnpj = evento.dados.cnpj || '00000000000000'; // CNPJ do contribuinte
    const valor = evento.dados.valor || 0; // Valor do pagamento
    const tipoImposto = evento.dados.tipoImposto as TipoImposto; // Tipo do imposto
    const dataVencimento = evento.dados.dataVencimento || new Date().toISOString().split('T')[0]; // Data de vencimento
    
    // Gerar código de barras simulado se necessário
    let codigoBarras = evento.dados.codigoBarras;
    if (!codigoBarras) {
      const randomCode = Math.floor(10000000000 + Math.random() * 90000000000);
      codigoBarras = `85810000${randomCode}-5 ${randomCode % 1000}0065${randomCode % 1000}-1 ${dataVencimento.replace(/-/g, "")}2-6 ${cnpj.substring(0,8)}55-9`;
    }
    
    // Calcular a data de pagamento ideal (1 dia antes do vencimento)
    const dataVenc = new Date(dataVencimento);
    const dataPagamento = new Date(dataVenc);
    dataPagamento.setDate(dataVenc.getDate() - 1); // Um dia antes do vencimento
    
    // Se a data já passou, pagar hoje
    const hoje = new Date();
    if (dataPagamento < hoje) {
      dataPagamento.setTime(hoje.getTime());
    }
    
    // Criar o job de pagamento
    const job: JobPagamento = {
      id: `PAG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      scheduledFor: dataPagamento.toISOString(),
      status: 'agendado',
      tentativas: 0,
      maxTentativas: 3,
      detalhes: {
        tipoPagamento: 'tributo',
        tipoImposto,
        codigoBarras,
        valor,
        dataVencimento,
        contribuinte: {
          nome: evento.dados.contribuinte || 'Empresa',
          documento: cnpj
        }
      }
    };
    
    // Adicionar ao repositório de jobs
    jobsAgendados.push(job);
    
    console.log(`Job de pagamento criado para ${tipoImposto}, valor: ${valor}, vencimento: ${dataVencimento}, agendado para: ${dataPagamento.toISOString().split('T')[0]}`);
    
    // Notificar sobre o agendamento
    toast({
      title: "Pagamento agendado automaticamente",
      description: `${tipoImposto || 'Tributo'} no valor de R$ ${valor.toFixed(2)} agendado para ${dataPagamento.toISOString().split('T')[0]}`
    });
    
    return job;
  } catch (error) {
    console.error('Erro ao processar evento fiscal para pagamento:', error);
    return null;
  }
};

/**
 * Endpoint simulado para execução de pagamentos
 */
export const executarPagamento = async (jobId: string): Promise<PagamentoResponse | null> => {
  const job = jobsAgendados.find(j => j.id === jobId);
  
  if (!job) {
    console.error(`Job de pagamento não encontrado: ${jobId}`);
    return null;
  }
  
  try {
    console.log(`Iniciando execução do pagamento: ${jobId}`);
    
    // Atualizar status
    job.status = 'em_processamento';
    job.tentativas += 1;
    
    // Obter configurações bancárias
    const bancoSelecionado = localStorage.getItem("banco-selecionado") || "";
    const bankCredentials = {
      banco: bancoSelecionado,
      agencia: localStorage.getItem(`banco-${bancoSelecionado}-agencia`) || "",
      conta: localStorage.getItem(`banco-${bancoSelecionado}-conta`) || "",
      tipoConta: "corrente" as const
    };
    
    // Realizar o pagamento
    const response = await realizarPagamentoAvancado({
      credentials: bankCredentials,
      codigoBarras: job.detalhes.codigoBarras || "",
      valor: job.detalhes.valor,
      dataVencimento: job.detalhes.dataVencimento,
      dataPagamento: new Date().toISOString().split('T')[0],
      descricao: `Pagamento automático de ${job.detalhes.tipoImposto || 'tributo'}`,
      tipo: job.detalhes.tipoImposto as any || 'DARF'
    });
    
    // Atualizar job com o resultado
    job.detalhes.resultado = response;
    
    if (response.sucesso) {
      job.status = 'concluido';
      toast({
        title: "Pagamento automático realizado",
        description: `${job.detalhes.tipoImposto || 'Tributo'} no valor de R$ ${job.detalhes.valor.toFixed(2)} pago com sucesso.`
      });
    } else {
      // Se falhou e ainda tem tentativas, reagendar
      if (job.tentativas < job.maxTentativas) {
        job.status = 'retry';
        const proximaTentativa = new Date();
        proximaTentativa.setHours(proximaTentativa.getHours() + 1);
        job.proximaTentativa = proximaTentativa.toISOString();
        
        toast({
          title: "Pagamento será reprocessado",
          description: `Tentativa ${job.tentativas} de ${job.maxTentativas} falhou. Nova tentativa agendada.`,
          variant: "destructive"
        });
      } else {
        job.status = 'falha';
        toast({
          title: "Falha no pagamento automático",
          description: `Todas as ${job.maxTentativas} tentativas falharam.`,
          variant: "destructive"
        });
      }
    }
    
    return response;
    
  } catch (error: any) {
    console.error(`Erro ao executar pagamento ${jobId}:`, error);
    
    // Atualizar job com a falha
    job.status = job.tentativas < job.maxTentativas ? 'retry' : 'falha';
    
    const errorResponse: PagamentoResponse = {
      sucesso: false,
      mensagem: error.message || "Erro desconhecido ao processar pagamento",
      statusProcessamento: 'falha'
    };
    
    job.detalhes.resultado = errorResponse;
    
    // Agendar próxima tentativa se houver tentativas restantes
    if (job.tentativas < job.maxTentativas) {
      const proximaTentativa = new Date();
      proximaTentativa.setHours(proximaTentativa.getHours() + 1);
      job.proximaTentativa = proximaTentativa.toISOString();
    }
    
    return errorResponse;
  }
};

/**
 * Simula um cron job que verifica e executa pagamentos agendados
 */
export const verificarPagamentosAgendados = async (): Promise<number> => {
  console.log("Verificando pagamentos agendados...");
  
  const agora = new Date();
  let processados = 0;
  
  // Encontrar jobs que estão agendados para agora ou no passado
  const jobsParaProcessar = jobsAgendados.filter(job => {
    // Jobs agendados ou em retry que estão no passado
    if (job.status === 'agendado') {
      return new Date(job.scheduledFor) <= agora;
    }
    
    // Jobs em retry com próxima tentativa no passado
    if (job.status === 'retry' && job.proximaTentativa) {
      return new Date(job.proximaTentativa) <= agora;
    }
    
    return false;
  });
  
  if (jobsParaProcessar.length === 0) {
    console.log("Nenhum pagamento agendado para processamento agora.");
    return 0;
  }
  
  console.log(`Processando ${jobsParaProcessar.length} pagamentos agendados...`);
  
  // Processar cada job
  for (const job of jobsParaProcessar) {
    await executarPagamento(job.id);
    processados++;
  }
  
  console.log(`${processados} pagamentos processados.`);
  return processados;
};

/**
 * Inicia o simulador de cron job
 */
export const iniciarCronJob = (intervaloEmMinutos: number = 5): () => void => {
  console.log(`Iniciando cron job de pagamentos a cada ${intervaloEmMinutos} minutos.`);
  
  // Criar intervalo
  const intervalId = setInterval(() => {
    verificarPagamentosAgendados();
  }, intervaloEmMinutos * 60 * 1000);
  
  // Executar uma primeira verificação imediatamente
  verificarPagamentosAgendados();
  
  // Retornar função para parar o cron job
  return () => {
    console.log("Parando cron job de pagamentos.");
    clearInterval(intervalId);
  };
};

/**
 * Obtém todos os jobs de pagamento
 */
export const obterTodosJobs = (): JobPagamento[] => {
  return [...jobsAgendados].sort((a, b) => {
    // Ordenar por data agendada, mais recentes primeiro
    return new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime();
  });
};

/**
 * Endpoint para reprocessar um job manualmente
 */
export const reprocessarJob = async (jobId: string): Promise<PagamentoResponse | null> => {
  const job = jobsAgendados.find(j => j.id === jobId);
  
  if (!job) {
    console.error(`Job de pagamento não encontrado: ${jobId}`);
    return null;
  }
  
  // Resetar contagem de tentativas se já falhou todas
  if (job.status === 'falha') {
    job.tentativas = 0;
  }
  
  return await executarPagamento(jobId);
};

/**
 * Endpoint para remover um job
 */
export const removerJob = (jobId: string): boolean => {
  const indexJob = jobsAgendados.findIndex(j => j.id === jobId);
  
  if (indexJob === -1) {
    return false;
  }
  
  jobsAgendados.splice(indexJob, 1);
  return true;
};
