/**
 * Serviço para apuração contábil inteligente
 * Integra com processador NLP para interpretação avançada de dados contábeis
 */
import { NLPIntent, NLPResult } from "@/hooks/nlp/types";
import { trackTokenUsage } from "@/hooks/nlp/tokenUsageService";
import { toast } from "@/hooks/use-toast";

// Tipos específicos para apuração contábil
export interface LancamentoContabil {
  id: string;
  data: string;
  valor: number;
  descricao: string;
  tipo: 'debito' | 'credito';
  conta: string;
  centroCusto?: string;
  documento?: string;
  anomalia?: boolean;
  inconsistencia?: string;
  categorizado: boolean;
}

export interface ResultadoApuracao {
  periodo: string;
  cliente: {
    id: string;
    nome: string;
    cnpj: string;
  };
  lancamentos: {
    total: number;
    debitos: number;
    creditos: number;
    valorTotal: number;
    categorizados: number;
    pendentes: number;
    anomalias: number;
  };
  contas: {
    [conta: string]: {
      debitos: number;
      creditos: number;
      saldo: number;
    }
  };
  impostos: {
    [tipoImposto: string]: {
      baseCalculo: number;
      valorImposto: number;
      aliquotaEfetiva: number;
    }
  };
  resumoFinanceiro: {
    receitas: number;
    despesas: number;
    resultado: number;
  };
  status: 'processado' | 'em_processamento' | 'com_inconsistencias' | 'pendente';
  regimeTributario: string;
  origemDados?: string;
  processamento_automatico?: boolean;
  detalhesProcessamento?: {
    processador: string;
    data: string;
    tempoProcessamento: number;
    [key: string]: any;
  };
}

// Interface para configuração da apuração
export interface ConfiguracaoApuracao {
  integrarNFe: boolean;
  integrarBancos: boolean;
  analisarInconsistencias: boolean;
  calcularImpostos: boolean;
  categorizacaoAutomatica: boolean;
  alertarAnomalia: boolean;
  limiteValorAnomalia?: number;
  regrasNegocio: Record<string, any>;
  usarFontesAutomaticas?: boolean;
}

// Parâmetros para apuração
export interface ParametrosApuracao {
  clienteId: string;
  periodo: string;
  regimeTributario?: string;
  configuracao?: Partial<ConfiguracaoApuracao>;
}

// Estado do processamento de apuração
export interface EstadoProcessamentoApuracao {
  clientesProcessados: number;
  totalClientes: number;
  progresso: number;
  iniciado: Date;
  estimativaFinalizacao?: Date;
  clienteAtual?: string;
  status: 'processando' | 'finalizado' | 'erro';
  erros: string[];
}

// Configuração padrão de apuração
const configuracaoPadrao: ConfiguracaoApuracao = {
  integrarNFe: true,
  integrarBancos: true,
  analisarInconsistencias: true,
  calcularImpostos: true,
  categorizacaoAutomatica: true,
  alertarAnomalia: true,
  limiteValorAnomalia: 5000,
  regrasNegocio: {
    ignorarValoresAbaixo: 10,
    considerarReceitasComplementares: true,
    metodoConciliacaoBancaria: 'avancado'
  },
  usarFontesAutomaticas: true
};

/**
 * Processa apuração contábil para um cliente específico
 * @param params Parâmetros de apuração
 * @returns Resultado da apuração
 */
export const processarApuracao = async (
  params: ParametrosApuracao
): Promise<ResultadoApuracao> => {
  try {
    const { clienteId, periodo, regimeTributario = 'Simples Nacional' } = params;
    const config = { ...configuracaoPadrao, ...params.configuracao };
    
    // Log de início do processamento
    console.log(`Iniciando apuração contábil para cliente ${clienteId} no período ${periodo}`);

    // Em produção, aqui buscaríamos dados reais do banco de dados
    // Simulando processamento com dados mock para demonstração
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Registrar tokens para monitoramento de uso
    trackTokenUsage(100, 'apuracao-contabil', 'processamento');

    // Gerar dados simulados para demonstração
    const resultado: ResultadoApuracao = await gerarDadosApuracaoSimulados(clienteId, periodo, regimeTributario);
    
    // Analisar inconsistências se a configuração permitir
    if (config.analisarInconsistencias) {
      resultado.lancamentos.anomalias = detectarAnomalias(resultado, config);
    }
    
    // Ajustar status com base nas anomalias encontradas
    resultado.status = resultado.lancamentos.anomalias > 0 ? 
      'com_inconsistencias' : 'processado';
    
    return resultado;
  } catch (error) {
    console.error("Erro ao processar apuração contábil:", error);
    toast({
      title: "Erro na apuração contábil",
      description: error instanceof Error ? error.message : "Ocorreu um erro inesperado no processamento.",
      variant: "destructive"
    });
    
    throw error;
  }
};

/**
 * Processa apuração contábil para múltiplos clientes
 * @param clienteIds IDs dos clientes
 * @param periodo Período de apuração
 * @returns Status do processamento e resultados
 */
export const processarApuracaoEmLote = async (
  clienteIds: string[],
  periodo: string,
  configuracao?: Partial<ConfiguracaoApuracao>
): Promise<{
  estadoProcessamento: EstadoProcessamentoApuracao,
  resultados: ResultadoApuracao[]
}> => {
  // Estado inicial do processamento
  const estadoProcessamento: EstadoProcessamentoApuracao = {
    clientesProcessados: 0,
    totalClientes: clienteIds.length,
    progresso: 0,
    iniciado: new Date(),
    status: 'processando',
    erros: []
  };
  
  const resultados: ResultadoApuracao[] = [];
  
  // Processar cliente por cliente
  for (const clienteId of clienteIds) {
    try {
      estadoProcessamento.clienteAtual = clienteId;
      
      // Processar apuração para este cliente
      const resultado = await processarApuracao({
        clienteId,
        periodo,
        configuracao
      });
      
      resultados.push(resultado);
      
      // Atualizar estado
      estadoProcessamento.clientesProcessados++;
      estadoProcessamento.progresso = Math.round(
        (estadoProcessamento.clientesProcessados / estadoProcessamento.totalClientes) * 100
      );
      
      // Estimar tempo de finalização
      if (estadoProcessamento.clientesProcessados > 0) {
        const tempoDecorrido = new Date().getTime() - estadoProcessamento.iniciado.getTime();
        const tempoMedioPorCliente = tempoDecorrido / estadoProcessamento.clientesProcessados;
        const clientesRestantes = estadoProcessamento.totalClientes - estadoProcessamento.clientesProcessados;
        const tempoRestante = tempoMedioPorCliente * clientesRestantes;
        
        estadoProcessamento.estimativaFinalizacao = new Date(new Date().getTime() + tempoRestante);
      }
      
    } catch (error) {
      console.error(`Erro ao processar cliente ${clienteId}:`, error);
      estadoProcessamento.erros.push(
        `Cliente ${clienteId}: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }
  
  estadoProcessamento.status = 'finalizado';
  
  return {
    estadoProcessamento,
    resultados
  };
};

/**
 * Analisa o texto de um comando natural para extrair parâmetros de apuração
 * Integra com nosso processador NLP avançado para comandos de voz/texto
 * @param resultado Resultado do processamento NLP
 * @returns Parâmetros de apuração extraídos
 */
export const extrairParametrosApuracaoDeNLP = (resultado: NLPResult): Partial<ParametrosApuracao> => {
  const parametros: Partial<ParametrosApuracao> = {};
  
  // Extrair período
  if (resultado.entities.dateTime && resultado.entities.dateTime.length > 0) {
    const dateEntity = resultado.entities.dateTime[0];
    
    if (dateEntity.parsedDate) {
      const date = new Date(dateEntity.parsedDate);
      parametros.periodo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (dateEntity.period) {
      const date = new Date();
      if (dateEntity.relative === 'previous') {
        date.setMonth(date.getMonth() - 1);
      } else if (dateEntity.relative === 'next') {
        date.setMonth(date.getMonth() + 1);
      }
      
      parametros.periodo = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }
  
  // Extrair regime tributário
  if (resultado.entities.taxType && resultado.entities.taxType.length > 0) {
    const taxTypeValue = resultado.entities.taxType[0].value.toLowerCase();
    
    if (taxTypeValue.includes('simples')) {
      parametros.regimeTributario = 'Simples Nacional';
    } else if (taxTypeValue.includes('lucro real') || taxTypeValue === 'lucro_real') {
      parametros.regimeTributario = 'Lucro Real';
    } else if (taxTypeValue.includes('presumido') || taxTypeValue === 'lucro_presumido') {
      parametros.regimeTributario = 'Lucro Presumido';
    }
  }
  
  return parametros;
};

/**
 * Gera resposta contextual sobre apuração contábil para interação com usuário
 * @param resultado Resultado da apuração
 * @returns Resposta em linguagem natural
 */
export const gerarRespostaApuracao = (resultado: ResultadoApuracao): string => {
  // Formatador de moeda
  const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
  
  // Construir resposta em linguagem natural
  let resposta = `A apuração contábil para ${resultado.cliente.nome} (${resultado.cliente.cnpj}) do período ${resultado.periodo} foi ${resultado.status === 'processado' ? 'concluída com sucesso' : 'processada com inconsistências'}.\n\n`;
  
  resposta += `Foram processados ${resultado.lancamentos.total} lançamentos, sendo ${resultado.lancamentos.debitos} a débito e ${resultado.lancamentos.creditos} a crédito, totalizando ${formatarMoeda(resultado.lancamentos.valorTotal)}.\n\n`;
  
  resposta += `Resumo financeiro: Receitas ${formatarMoeda(resultado.resumoFinanceiro.receitas)}, Despesas ${formatarMoeda(resultado.resumoFinanceiro.despesas)}, Resultado ${formatarMoeda(resultado.resumoFinanceiro.resultado)}.\n\n`;
  
  // Adicionar informações sobre impostos
  if (Object.keys(resultado.impostos).length > 0) {
    resposta += "Resumo de impostos:\n";
    
    for (const [imposto, dados] of Object.entries(resultado.impostos)) {
      resposta += `- ${imposto}: Base de cálculo ${formatarMoeda(dados.baseCalculo)}, Valor ${formatarMoeda(dados.valorImposto)} (Alíquota efetiva: ${(dados.aliquotaEfetiva * 100).toFixed(2)}%)\n`;
    }
    
    resposta += "\n";
  }
  
  // Adicionar alerta sobre anomalias, se houver
  if (resultado.lancamentos.anomalias > 0) {
    resposta += `⚠️ ATENÇÃO: Foram detectadas ${resultado.lancamentos.anomalias} anomalias nos lançamentos. Recomendamos revisar esses registros antes de confirmar a apuração.\n`;
  }
  
  return resposta;
};

/**
 * Função auxiliar para gerar dados simulados de apuração contábil para exemplo
 */
const gerarDadosApuracaoSimulados = async (
  clienteId: string, 
  periodo: string,
  regimeTributario: string
): Promise<ResultadoApuracao> => {
  // Gerar valores aleatórios para simulação
  const receitaBruta = Math.floor(Math.random() * 900000) + 100000;
  const custos = receitaBruta * (Math.random() * 0.3 + 0.2); // 20% a 50% da receita
  const despesas = receitaBruta * (Math.random() * 0.2 + 0.1); // 10% a 30% da receita
  const totalDebitos = Math.floor(Math.random() * 200) + 100;
  const totalCreditos = Math.floor(Math.random() * 100) + 50;
  const totalLancamentos = totalDebitos + totalCreditos;
  
  // Simular cliente com base no ID
  const nomeCliente = `Empresa ${clienteId.substring(0, 4).toUpperCase()}`;
  const cnpjBase = clienteId.replace(/\D/g, '').substring(0, 8).padEnd(8, '0');
  const cnpjCliente = `${cnpjBase.substring(0, 2)}.${cnpjBase.substring(2, 5)}.${cnpjBase.substring(5, 8)}/0001-00`;
  
  // Calcular impostos simulados com base no regime tributário
  const impostos: Record<string, any> = {};
  
  if (regimeTributario === 'Simples Nacional') {
    const aliquotaSimples = 0.06;
    impostos['Simples Nacional'] = {
      baseCalculo: receitaBruta,
      valorImposto: receitaBruta * aliquotaSimples,
      aliquotaEfetiva: aliquotaSimples
    };
  } else if (regimeTributario === 'Lucro Presumido') {
    const basePresumida = receitaBruta * 0.32;
    
    impostos['IRPJ'] = {
      baseCalculo: basePresumida,
      valorImposto: basePresumida * 0.15,
      aliquotaEfetiva: 0.15
    };
    
    impostos['CSLL'] = {
      baseCalculo: basePresumida,
      valorImposto: basePresumida * 0.09,
      aliquotaEfetiva: 0.09
    };
    
    impostos['PIS'] = {
      baseCalculo: receitaBruta,
      valorImposto: receitaBruta * 0.0065,
      aliquotaEfetiva: 0.0065
    };
    
    impostos['COFINS'] = {
      baseCalculo: receitaBruta,
      valorImposto: receitaBruta * 0.03,
      aliquotaEfetiva: 0.03
    };
  } else {
    // Lucro Real
    const lucroReal = receitaBruta - custos - despesas;
    
    impostos['IRPJ'] = {
      baseCalculo: lucroReal,
      valorImposto: lucroReal > 0 ? lucroReal * 0.15 : 0,
      aliquotaEfetiva: lucroReal > 0 ? 0.15 : 0
    };
    
    impostos['CSLL'] = {
      baseCalculo: lucroReal,
      valorImposto: lucroReal > 0 ? lucroReal * 0.09 : 0,
      aliquotaEfetiva: lucroReal > 0 ? 0.09 : 0
    };
    
    impostos['PIS'] = {
      baseCalculo: receitaBruta,
      valorImposto: receitaBruta * 0.0165,
      aliquotaEfetiva: 0.0165
    };
    
    impostos['COFINS'] = {
      baseCalculo: receitaBruta,
      valorImposto: receitaBruta * 0.076,
      aliquotaEfetiva: 0.076
    };
  }

  // Gerar resultado simulado
  return {
    periodo,
    cliente: {
      id: clienteId,
      nome: nomeCliente,
      cnpj: cnpjCliente
    },
    lancamentos: {
      total: totalLancamentos,
      debitos: totalDebitos,
      creditos: totalCreditos,
      valorTotal: receitaBruta,
      categorizados: Math.floor(totalLancamentos * 0.95), // 95% categorizados
      pendentes: Math.floor(totalLancamentos * 0.05),     // 5% pendentes
      anomalias: 0 // Será definido pelo detector de anomalias
    },
    contas: {
      'Receita Operacional': {
        debitos: 0,
        creditos: receitaBruta,
        saldo: receitaBruta
      },
      'Custos': {
        debitos: custos,
        creditos: 0,
        saldo: -custos
      },
      'Despesas Administrativas': {
        debitos: despesas * 0.6,
        creditos: 0,
        saldo: -(despesas * 0.6)
      },
      'Despesas Financeiras': {
        debitos: despesas * 0.4,
        creditos: 0,
        saldo: -(despesas * 0.4)
      }
    },
    impostos,
    resumoFinanceiro: {
      receitas: receitaBruta,
      despesas: custos + despesas,
      resultado: receitaBruta - custos - despesas
    },
    status: 'processado',
    regimeTributario,
    origemDados: 'simulacao',
    processamento_automatico: true,
    detalhesProcessamento: {
      processador: 'NLP',
      data: new Date().toISOString(),
      tempoProcessamento: 1500
    }
  };
};

/**
 * Detecta anomalias em uma apuração contábil
 * @param resultado Resultado da apuração contábil
 * @param configuracao Configuração de apuração
 * @returns Número de anomalias detectadas
 */
const detectarAnomalias = (
  resultado: ResultadoApuracao, 
  configuracao: ConfiguracaoApuracao
): number => {
  let anomalias = 0;
  
  // Simulamos detecção de anomalias
  // Em produção, usaríamos algoritmos estatísticos e regras complexas
  
  // Simulação: detecção baseada em limite de valor
  const limiteAnomalia = configuracao.limiteValorAnomalia || 5000;
  const valorMedioLancamento = resultado.lancamentos.valorTotal / resultado.lancamentos.total;
  
  if (valorMedioLancamento > limiteAnomalia) {
    anomalias += Math.floor(resultado.lancamentos.total * 0.03); // 3% dos lançamentos
  }
  
  // Simulação: inconsistência entre débitos e créditos
  const totalDebitos = Object.values(resultado.contas).reduce((sum, conta) => sum + conta.debitos, 0);
  const totalCreditos = Object.values(resultado.contas).reduce((sum, conta) => sum + conta.creditos, 0);
  
  if (Math.abs(totalDebitos - totalCreditos) > 0.01) {
    anomalias += 1; // Inconsistência de balanceamento
  }
  
  // Simulação: probabilidade aleatória de anomalias adicionais
  if (Math.random() < 0.2) { // 20% de chance
    anomalias += Math.floor(resultado.lancamentos.total * 0.01); // 1% dos lançamentos
  }
  
  return anomalias;
};
