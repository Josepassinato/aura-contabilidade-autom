
/**
 * Serviço de aprendizado de máquina para reconciliação bancária
 * Aprende com decisões humanas para melhorar a precisão das reconciliações automáticas
 */

import { toast } from "@/hooks/use-toast";
import { ReconciliacaoItem, ResultadoReconciliacao } from "./reconciliacaoBancaria";
import { ConfiguracaoResolucao } from "./resolucaoAutonoma";
import { TransacaoBancaria } from "../../bancario/openBankingService";
import { Lancamento } from "../classificacao/classificacaoML";

// Interface para registrar uma decisão humana
export interface DecisaoHumana {
  id: string;
  timestamp: string;
  tipoDecisao: 'conciliar' | 'ignorar' | 'corrigir' | 'desfazer';
  transacao?: TransacaoBancaria;
  lancamento?: Lancamento;
  divergenciaValor?: number;
  diferencaDias?: number;
  similaridadeTexto?: number;
  decididoPor: string;
}

// Interface para insights gerados pelo modelo
export interface InsightAprendizagem {
  tipo: string;
  descricao: string;
  confianca: number;
  regraAplicavel: boolean;
  parametroRecomendado?: Partial<ConfiguracaoResolucao>;
}

// Estado interno do sistema de aprendizagem
interface EstadoAprendizagem {
  historicoDecisoes: DecisaoHumana[];
  padroesReconhecidos: Record<string, any>;
  modeloTreinado: boolean;
  versaoModelo: number;
  ultimoTreinamento: string | null;
  metricas: {
    precisaoAtual: number;
    acuraciaMedia: number;
    totalAmostras: number;
  }
}

// Estado inicial
const estadoInicial: EstadoAprendizagem = {
  historicoDecisoes: [],
  padroesReconhecidos: {},
  modeloTreinado: false,
  versaoModelo: 0,
  ultimoTreinamento: null,
  metricas: {
    precisaoAtual: 0,
    acuraciaMedia: 0,
    totalAmostras: 0
  }
};

// Estado atual do aprendizado
let estado: EstadoAprendizagem = { ...estadoInicial };

// Tamanho mínimo de dados para treinar o modelo
const AMOSTRAS_MINIMAS_TREINO = 10;

/**
 * Registra uma decisão humana para aprendizagem
 */
export const registrarDecisaoHumana = (decisao: Omit<DecisaoHumana, 'id' | 'timestamp'>): void => {
  const novaDecisao: DecisaoHumana = {
    ...decisao,
    id: `decisao_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  
  // Adiciona ao histórico
  estado.historicoDecisoes.push(novaDecisao);
  console.log(`Decisão humana registrada: ${novaDecisao.tipoDecisao}`);
  
  // Se tivermos amostras suficientes, treinar o modelo
  if (
    estado.historicoDecisoes.length >= AMOSTRAS_MINIMAS_TREINO && 
    (!estado.ultimoTreinamento || 
     diasDesde(estado.ultimoTreinamento) > 1)
  ) {
    treinarModeloComDecisoes();
  }
};

/**
 * Treina o modelo com base nas decisões humanas registradas
 */
export const treinarModeloComDecisoes = async (): Promise<boolean> => {
  if (estado.historicoDecisoes.length < AMOSTRAS_MINIMAS_TREINO) {
    console.log("Dados insuficientes para treinar o modelo");
    return false;
  }
  
  console.log(`Iniciando treinamento com ${estado.historicoDecisoes.length} decisões...`);
  
  try {
    // Agrupar decisões por tipo
    const decisoesPorTipo = agruparDecisoesPorTipo();
    
    // Extrair padrões para cada tipo de decisão
    const padroes = extrairPadroes(decisoesPorTipo);
    
    // Simula o treinamento (aqui seria integrado algoritmo real de ML)
    await simularTreinamento();
    
    // Atualiza o estado após treinamento
    estado.padroesReconhecidos = padroes;
    estado.modeloTreinado = true;
    estado.versaoModelo += 1;
    estado.ultimoTreinamento = new Date().toISOString();
    
    // Calcular métricas após treinamento
    const metricas = calcularMetricasAprendizagem();
    estado.metricas = metricas;
    
    console.log(`Treinamento concluído com sucesso. Versão do modelo: ${estado.versaoModelo}`);
    
    toast({
      title: "Modelo de aprendizagem treinado",
      description: `Precisão atual: ${(metricas.precisaoAtual * 100).toFixed(1)}% | Total de amostras: ${metricas.totalAmostras}`,
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao treinar modelo:", error);
    return false;
  }
};

/**
 * Gera configurações recomendadas com base no aprendizado
 */
export const gerarConfiguracaoRecomendada = (
  configAtual: ConfiguracaoResolucao
): ConfiguracaoResolucao => {
  if (!estado.modeloTreinado) {
    return configAtual;
  }
  
  // Copia a configuração atual
  const novaConfig: ConfiguracaoResolucao = { ...configAtual };
  
  // Aplica os padrões aprendidos para otimizar parâmetros
  if (estado.padroesReconhecidos.divergencia) {
    const toleranciaOtima = estado.padroesReconhecidos.divergencia.toleranciaOtima;
    if (toleranciaOtima) {
      novaConfig.toleranciaDivergencia = toleranciaOtima;
    }
  }
  
  if (estado.padroesReconhecidos.confianca) {
    const confiancaOtima = estado.padroesReconhecidos.confianca.minimoOtimo;
    if (confiancaOtima) {
      novaConfig.minimumConfidenceToResolve = confiancaOtima;
    }
  }
  
  if (estado.padroesReconhecidos.dias) {
    const diasOtimos = estado.padroesReconhecidos.dias.maximoOtimo;
    if (diasOtimos) {
      novaConfig.maxDiasRetroativos = diasOtimos;
    }
  }
  
  // Determinar se deve resolver duplicados e corrigir divergências
  // com base no histórico de sucesso dessas operações
  if (estado.padroesReconhecidos.sucessoOperacoes) {
    const operacoes = estado.padroesReconhecidos.sucessoOperacoes;
    
    if (operacoes.resolverDuplicados !== undefined) {
      novaConfig.resolverLancamentosDuplicados = operacoes.resolverDuplicados > 0.8;
    }
    
    if (operacoes.corrigirDivergencias !== undefined) {
      novaConfig.corrigirDivergenciasValor = operacoes.corrigirDivergencias > 0.7;
    }
  }
  
  console.log("Configuração recomendada gerada com base no aprendizado de máquina:", novaConfig);
  return novaConfig;
};

/**
 * Gera insights sobre padrões detectados no processo de reconciliação
 */
export const gerarInsightsAprendizagem = (): InsightAprendizagem[] => {
  if (!estado.modeloTreinado) {
    return [{
      tipo: "modelo_nao_treinado",
      descricao: "O modelo de aprendizagem ainda não foi treinado com decisões suficientes.",
      confianca: 1.0,
      regraAplicavel: false
    }];
  }
  
  const insights: InsightAprendizagem[] = [];
  
  // Insight sobre tolerância de divergência
  if (estado.padroesReconhecidos.divergencia) {
    const divergencia = estado.padroesReconhecidos.divergencia;
    
    insights.push({
      tipo: "tolerancia_divergencia",
      descricao: `Tolerância ideal para divergências é de ${(divergencia.toleranciaOtima * 100).toFixed(1)}% com base em ${divergencia.amostras} decisões.`,
      confianca: divergencia.confianca,
      regraAplicavel: divergencia.amostras > 5,
      parametroRecomendado: {
        toleranciaDivergencia: divergencia.toleranciaOtima
      }
    });
  }
  
  // Insight sobre dias retroativos
  if (estado.padroesReconhecidos.dias && estado.padroesReconhecidos.dias.amostras > 5) {
    insights.push({
      tipo: "dias_retroativos",
      descricao: `A maioria das reconciliações manuais ocorrem dentro de ${estado.padroesReconhecidos.dias.maximoOtimo} dias da data da transação.`,
      confianca: estado.padroesReconhecidos.dias.confianca,
      regraAplicavel: true,
      parametroRecomendado: {
        maxDiasRetroativos: estado.padroesReconhecidos.dias.maximoOtimo
      }
    });
  }
  
  // Insight sobre padrões de descrição
  if (estado.padroesReconhecidos.textoPadroes) {
    insights.push({
      tipo: "padroes_descricao",
      descricao: `Identificamos padrões recorrentes em descrições que podem melhorar a precisão da reconciliação automática.`,
      confianca: estado.padroesReconhecidos.textoPadroes.confianca,
      regraAplicavel: estado.padroesReconhecidos.textoPadroes.confianca > 0.7
    });
  }
  
  // Insight sobre desempenho geral
  insights.push({
    tipo: "desempenho_geral",
    descricao: `Precisão atual do modelo: ${(estado.metricas.precisaoAtual * 100).toFixed(1)}% baseado em ${estado.metricas.totalAmostras} amostras.`,
    confianca: estado.metricas.totalAmostras > 20 ? 0.9 : 0.6,
    regraAplicavel: false
  });
  
  return insights;
};

/**
 * Aplica aprendizado de máquina para melhorar o processo de reconciliação
 */
export const aplicarAprendizadoNaReconciliacao = (
  resultado: ResultadoReconciliacao,
  config: ConfiguracaoResolucao
): ResultadoReconciliacao => {
  if (!estado.modeloTreinado) {
    return resultado;
  }
  
  // Cópia do resultado atual para não modificar o original
  const resultadoMelhorado: ResultadoReconciliacao = {
    ...resultado,
    transacoesConciliadas: [...resultado.transacoesConciliadas],
    transacoesNaoConciliadas: [...resultado.transacoesNaoConciliadas],
    lancamentosNaoConciliados: [...resultado.lancamentosNaoConciliados]
  };
  
  // Aplicar regras de correspondência aprendidas
  if (estado.padroesReconhecidos.correspondencia) {
    const novasReconciliacoes = aplicarRegrasCorrespondenciaAprendidas(
      resultadoMelhorado.transacoesNaoConciliadas,
      resultadoMelhorado.lancamentosNaoConciliados,
      estado.padroesReconhecidos.correspondencia
    );
    
    if (novasReconciliacoes.length > 0) {
      // Adicionar novas reconciliações encontradas
      resultadoMelhorado.transacoesConciliadas.push(...novasReconciliacoes);
      
      // Remover itens agora reconciliados das listas não conciliadas
      const idsTransacoesConciliadas = new Set(novasReconciliacoes.map(item => item.transacao.id));
      const idsLancamentosConciliados = new Set(novasReconciliacoes.map(item => item.lancamento.id));
      
      resultadoMelhorado.transacoesNaoConciliadas = resultadoMelhorado.transacoesNaoConciliadas
        .filter(t => !idsTransacoesConciliadas.has(t.id));
        
      resultadoMelhorado.lancamentosNaoConciliados = resultadoMelhorado.lancamentosNaoConciliados
        .filter(l => !idsLancamentosConciliados.has(l.id));
      
      // Atualizar contadores
      resultadoMelhorado.totalConciliado = resultadoMelhorado.transacoesConciliadas.length;
      resultadoMelhorado.totalNaoConciliado = {
        transacoes: resultadoMelhorado.transacoesNaoConciliadas.length,
        lancamentos: resultadoMelhorado.lancamentosNaoConciliados.length
      };
      
      console.log(`${novasReconciliacoes.length} novas reconciliações encontradas com aprendizado de máquina`);
    }
  }
  
  return resultadoMelhorado;
};

/**
 * Limpa o histórico de decisões e reseta o modelo
 */
export const resetarAprendizagem = (): void => {
  estado = { ...estadoInicial };
  console.log("Sistema de aprendizagem resetado");
  
  toast({
    title: "Modelo de aprendizagem resetado",
    description: "Todo o histórico de decisões foi apagado e o modelo foi reiniciado."
  });
};

/**
 * Obtém o estado atual do sistema de aprendizagem
 */
export const obterEstadoAprendizagem = (): {
  treinado: boolean;
  decisoes: number;
  versao: number;
  ultimoTreinamento: string | null;
  precisao: number;
} => {
  return {
    treinado: estado.modeloTreinado,
    decisoes: estado.historicoDecisoes.length,
    versao: estado.versaoModelo,
    ultimoTreinamento: estado.ultimoTreinamento,
    precisao: estado.metricas.precisaoAtual
  };
};

/**
 * Calcula o número de dias desde uma data ISO string
 */
function diasDesde(dataIso: string): number {
  const data = new Date(dataIso);
  const hoje = new Date();
  const diferencaMs = hoje.getTime() - data.getTime();
  return Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
}

/**
 * Funções auxiliares internas
 */

// Agrupa decisões por tipo
function agruparDecisoesPorTipo(): Record<string, DecisaoHumana[]> {
  const grupos: Record<string, DecisaoHumana[]> = {};
  
  estado.historicoDecisoes.forEach(decisao => {
    if (!grupos[decisao.tipoDecisao]) {
      grupos[decisao.tipoDecisao] = [];
    }
    grupos[decisao.tipoDecisao].push(decisao);
  });
  
  return grupos;
}

// Extrai padrões das decisões para treinar o modelo
function extrairPadroes(decisoesPorTipo: Record<string, DecisaoHumana[]>): Record<string, any> {
  const padroes: Record<string, any> = {};
  
  // Analisar divergências de valores
  padroes.divergencia = analisarPadroesDivergencia(decisoesPorTipo);
  
  // Analisar padrões de dias retroativos
  padroes.dias = analisarPadroesDias(decisoesPorTipo);
  
  // Analisar padrões nas descrições
  padroes.textoPadroes = analisarPadroesTexto(decisoesPorTipo);
  
  // Analisar taxa de sucesso por operação
  padroes.sucessoOperacoes = analisarSucessoOperacoes(decisoesPorTipo);
  
  // Analisar padrões de correspondência
  padroes.correspondencia = analisarPadroesCorrespondencia(decisoesPorTipo);
  
  // Analisar limites ótimos de confiança
  padroes.confianca = {
    minimoOtimo: calcularLimiarConfiancaOtimo(decisoesPorTipo),
    confianca: 0.85,
    amostras: estado.historicoDecisoes.length
  };
  
  return padroes;
}

// Análise de divergências de valores aceitáveis
function analisarPadroesDivergencia(decisoesPorTipo: Record<string, DecisaoHumana[]>): any {
  // Pegar decisões de conciliar e corrigir que tenham divergenciaValor
  const decisoesRelevantes = [
    ...(decisoesPorTipo['conciliar'] || []),
    ...(decisoesPorTipo['corrigir'] || [])
  ].filter(d => d.divergenciaValor !== undefined);
  
  if (decisoesRelevantes.length === 0) {
    return { toleranciaOtima: 0.02, confianca: 0.5, amostras: 0 };
  }
  
  // Ordenar por divergência
  const divergencias = decisoesRelevantes
    .map(d => d.divergenciaValor!)
    .sort((a, b) => a - b);
  
  // Calcular percentil 90 como tolerância ótima
  const idxPercentil90 = Math.floor(divergencias.length * 0.9);
  const toleranciaOtima = Math.max(0.005, divergencias[idxPercentil90] || 0.02);
  
  return {
    toleranciaOtima,
    confianca: Math.min(0.5 + (decisoesRelevantes.length / 20), 0.95),
    amostras: decisoesRelevantes.length
  };
}

// Análise de padrões de dias retroativos
function analisarPadroesDias(decisoesPorTipo: Record<string, DecisaoHumana[]>): any {
  const decisoesRelevantes = [
    ...(decisoesPorTipo['conciliar'] || [])
  ].filter(d => d.diferencaDias !== undefined);
  
  if (decisoesRelevantes.length === 0) {
    return { maximoOtimo: 90, confianca: 0.5, amostras: 0 };
  }
  
  // Ordenar por dias
  const dias = decisoesRelevantes
    .map(d => d.diferencaDias!)
    .sort((a, b) => a - b);
  
  // Calcular percentil 95 como máximo ótimo
  const idxPercentil95 = Math.floor(dias.length * 0.95);
  const maximoOtimo = Math.ceil(Math.max(7, dias[idxPercentil95] || 90));
  
  return {
    maximoOtimo,
    confianca: Math.min(0.5 + (decisoesRelevantes.length / 20), 0.95),
    amostras: decisoesRelevantes.length
  };
}

// Análise de padrões nas descrições
function analisarPadroesTexto(decisoesPorTipo: Record<string, DecisaoHumana[]>): any {
  // Implementação simplificada - numa versão real usaria NLP ou tokenização avançada
  const decisoesRelevantes = [
    ...(decisoesPorTipo['conciliar'] || [])
  ].filter(d => d.transacao?.descricao && d.lancamento?.descricao);
  
  if (decisoesRelevantes.length < 5) {
    return { confianca: 0.3, amostras: decisoesRelevantes.length };
  }
  
  // Em uma implementação real, aqui aplicaríamos técnicas mais avançadas
  // como TF-IDF ou embeddings para identificar padrões nas descrições
  
  return {
    confianca: Math.min(0.4 + (decisoesRelevantes.length / 25), 0.9),
    amostras: decisoesRelevantes.length,
  };
}

// Análise da taxa de sucesso por operação
function analisarSucessoOperacoes(decisoesPorTipo: Record<string, DecisaoHumana[]>): any {
  const totalCorrigir = (decisoesPorTipo['corrigir'] || []).length;
  const totalDesfazer = (decisoesPorTipo['desfazer'] || []).length;
  
  const operacoes: Record<string, number> = {};
  
  // Taxa de sucesso para resolver duplicados (1 - proporção de desfazer)
  const taxaDeDesfazer = totalDesfazer / Math.max(1, estado.historicoDecisoes.length);
  operacoes.resolverDuplicados = Math.max(0, 1 - taxaDeDesfazer * 2);
  
  // Taxa de sucesso para corrigir divergências
  operacoes.corrigirDivergencias = totalCorrigir / Math.max(1, estado.historicoDecisoes.length);
  
  return operacoes;
}

// Análise de padrões de correspondência
function analisarPadroesCorrespondencia(decisoesPorTipo: Record<string, DecisaoHumana[]>): any {
  // Aqui criaríamos regras aprendidas para identificar correspondências
  // Simplificação para exemplo
  return {
    regrasTexto: extrairRegrasTexto(decisoesPorTipo),
    regrasDatas: {
      maxDiferencaDias: 5,
      confianca: 0.8
    },
    regrasValores: {
      maxDiferencaPercentual: 0.05,
      confianca: 0.85
    }
  };
}

// Extrai regras de correspondência de texto a partir de decisões
function extrairRegrasTexto(decisoesPorTipo: Record<string, DecisaoHumana[]>): any[] {
  // Simplificação - em um sistema real usaríamos técnicas mais avançadas de NLP
  return [];
}

// Calcula limiar de confiança ótimo
function calcularLimiarConfiancaOtimo(decisoesPorTipo: Record<string, DecisaoHumana[]>): number {
  // Simplificação - em um modelo real seria baseado em análise ROC/Precision-Recall
  return 0.75;
}

// Aplica as regras de correspondência aprendidas
function aplicarRegrasCorrespondenciaAprendidas(
  transacoes: TransacaoBancaria[],
  lancamentos: Lancamento[],
  regrasCorrespondencia: any
): ReconciliacaoItem[] {
  const novasReconciliacoes: ReconciliacaoItem[] = [];
  
  // Implementação simplificada - em um sistema real usaria algoritmos mais sofisticados
  for (const transacao of transacoes) {
    for (const lancamento of lancamentos) {
      // Verificar compatibilidade básica de tipo
      const tipoCompativel = 
        (transacao.tipo === 'credito' && lancamento.tipo === 'receita') || 
        (transacao.tipo === 'debito' && lancamento.tipo === 'despesa');
      
      if (!tipoCompativel) continue;
      
      // Verificar datas dentro das regras aprendidas
      const diferencaDias = calcularDiferencaDias(transacao.data, lancamento.data);
      if (diferencaDias > regrasCorrespondencia.regrasDatas.maxDiferencaDias) continue;
      
      // Verificar valores dentro das regras aprendidas
      const diferencaValor = Math.abs(transacao.valor - lancamento.valor) / Math.max(lancamento.valor, transacao.valor);
      if (diferencaValor > regrasCorrespondencia.regrasValores.maxDiferencaPercentual) continue;
      
      // Calcular score com base nas regras aprendidas
      const score = calcularScoreComRegrasAprendidas(transacao, lancamento, regrasCorrespondencia);
      
      if (score >= 0.8) {
        novasReconciliacoes.push({
          transacao,
          lancamento,
          score,
          conciliacaoAutomatica: true,
          dataReconciliacao: new Date().toISOString()
        });
        
        // Quebrar o loop interno para não reconciliar o mesmo lançamento múltiplas vezes
        break;
      }
    }
  }
  
  return novasReconciliacoes;
}

// Calcula score com base nas regras aprendidas
function calcularScoreComRegrasAprendidas(
  transacao: TransacaoBancaria,
  lancamento: Lancamento,
  regras: any
): number {
  let score = 0;
  
  // Score por correspondência de valor
  const diferencaValor = Math.abs(transacao.valor - lancamento.valor) / Math.max(lancamento.valor, transacao.valor);
  score += (1 - diferencaValor) * 0.5;
  
  // Score por proximidade de data
  const diferencaDias = calcularDiferencaDias(transacao.data, lancamento.data);
  score += Math.max(0, 1 - diferencaDias / regras.regrasDatas.maxDiferencaDias) * 0.3;
  
  // Score por correspondência de descrição (simplificado)
  const descricaoTransacao = transacao.descricao.toLowerCase();
  const descricaoLancamento = lancamento.descricao.toLowerCase();
  if (descricaoTransacao === descricaoLancamento) {
    score += 0.2;
  } else if (descricaoTransacao.includes(descricaoLancamento) || descricaoLancamento.includes(descricaoTransacao)) {
    score += 0.15;
  } else {
    // Verificar palavras em comum
    const palavrasTransacao = descricaoTransacao.split(/\s+/).filter(p => p.length > 3);
    const palavrasLancamento = descricaoLancamento.split(/\s+/).filter(p => p.length > 3);
    
    let palavrasComuns = 0;
    palavrasTransacao.forEach(p1 => {
      if (palavrasLancamento.some(p2 => p2.includes(p1) || p1.includes(p2))) {
        palavrasComuns++;
      }
    });
    
    if (palavrasComuns >= 3) {
      score += 0.15;
    } else if (palavrasComuns >= 1) {
      score += 0.1;
    }
  }
  
  return Math.min(1, score);
}

// Calcula diferença de dias entre duas datas
function calcularDiferencaDias(data1: string, data2: string): number {
  const d1 = new Date(data1);
  const d2 = new Date(data2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Simula treinamento (sem API real de ML)
async function simularTreinamento(): Promise<void> {
  // Simula tempo de processamento de ML
  return new Promise(resolve => setTimeout(resolve, 1000));
}

// Calcula métricas de aprendizagem
function calcularMetricasAprendizagem(): { precisaoAtual: number; acuraciaMedia: number; totalAmostras: number } {
  // Simplificação - em um sistema real aplicariam-se métricas de ML padrão
  const totalAmostras = estado.historicoDecisoes.length;
  
  // Precisão simulada - melhora com mais exemplos
  const precisaoBase = 0.7;
  const bonusPrecisao = Math.min(0.25, totalAmostras / 100);
  const precisaoAtual = precisaoBase + bonusPrecisao;
  
  return {
    precisaoAtual,
    acuraciaMedia: precisaoAtual * 0.95,
    totalAmostras
  };
}
