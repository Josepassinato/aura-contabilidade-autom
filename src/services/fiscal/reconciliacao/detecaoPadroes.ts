
/**
 * Serviço de Detecção de Padrões em Transações e Lançamentos
 * Identifica padrões recorrentes para melhorar a precisão da reconciliação
 */

import { toast } from "@/hooks/use-toast";
import { TransacaoBancaria } from "../../bancario/openBankingService";
import { Lancamento } from "../classificacao/classificacaoML";
import { ReconciliacaoItem } from "./reconciliacaoBancaria";

// Interface para padrões detectados
export interface PadraoTransacao {
  id: string;
  tipo: 'recorrente' | 'sazonal' | 'periódico' | 'singular';
  descricao: string;
  confianca: number;
  ocorrencias: number;
  ultimaDeteccao: string;
  regexDescricao?: string;
  condicoesAdicionais?: Record<string, any>;
  exemplos: {
    transacao?: TransacaoBancaria;
    lancamento?: Lancamento;
  }[];
}

// Interface para mapeamento de transações
export interface MapeamentoTransacao {
  transacaoRegex: string;
  lancamentoRegex?: string;
  confianca: number;
  ultimoUso: string;
  sucessos: number;
  falhas: number;
  aplicacao: 'manual' | 'automatica' | 'sugerida';
}

// Interface para resultados de análise de padrões
export interface ResultadoAnalise {
  padroesDetectados: PadraoTransacao[];
  mapeamentosGerados: MapeamentoTransacao[];
  potencialMelhoria: number;
}

// Estado de padrões e mapeamentos persistentes
const padroesDetectados: PadraoTransacao[] = [];
const mapeamentosTransacoes: MapeamentoTransacao[] = [];

// Configurações de análise
export interface ConfiguracaoDeteccaoPadroes {
  minOcorrenciasDeteccao: number;
  periodoAnalise: number; // em dias
  limiarSimilaridade: number; // 0-1
  ativarDeteccaoAutomatica: boolean;
  usarAnaliseAvancadaTexto: boolean;
  minConfiancaAplicacao: number;
}

// Configuração padrão
const configPadrao: ConfiguracaoDeteccaoPadroes = {
  minOcorrenciasDeteccao: 3,
  periodoAnalise: 90,
  limiarSimilaridade: 0.7,
  ativarDeteccaoAutomatica: true,
  usarAnaliseAvancadaTexto: true,
  minConfiancaAplicacao: 0.8
};

let configuracao: ConfiguracaoDeteccaoPadroes = {...configPadrao};

/**
 * Configura o sistema de detecção de padrões
 */
export const configurarDeteccaoPadroes = (
  config: Partial<ConfiguracaoDeteccaoPadroes>
): ConfiguracaoDeteccaoPadroes => {
  configuracao = { ...configuracao, ...config };
  return configuracao;
};

/**
 * Analisa transações e lançamentos para detectar padrões recorrentes
 */
export const analisarPadroes = (
  transacoes: TransacaoBancaria[],
  lancamentos: Lancamento[],
  itensReconciliados?: ReconciliacaoItem[]
): ResultadoAnalise => {
  console.log(`Iniciando análise de padrões em ${transacoes.length} transações e ${lancamentos.length} lançamentos...`);
  
  const novosMapas: MapeamentoTransacao[] = [];
  const novosPadroes: PadraoTransacao[] = [];
  
  // Agrupar transações por características similares
  const gruposTransacoes = agruparTransacoesSimilares(transacoes);
  
  // Para cada grupo, tentar identificar um padrão consistente
  Object.entries(gruposTransacoes).forEach(([chaveGrupo, grupo]) => {
    if (grupo.length >= configuracao.minOcorrenciasDeteccao) {
      // Analisar padrão nas descrições das transações
      const padraoTexto = extrairPadraoTexto(grupo.map(t => t.descricao));
      if (padraoTexto) {
        // Verifica se este padrão já foi detectado anteriormente
        const padraoExistente = padroesDetectados.find(p => p.regexDescricao === padraoTexto);
        
        if (padraoExistente) {
          // Atualiza o padrão existente
          padraoExistente.ocorrencias += grupo.length;
          padraoExistente.ultimaDeteccao = new Date().toISOString();
          padraoExistente.exemplos = [...padraoExistente.exemplos, { transacao: grupo[0] }].slice(0, 5);
          padraoExistente.confianca = Math.min(padraoExistente.confianca + 0.05, 1.0);
        } else {
          // Cria um novo padrão detectado
          const novoPadrao: PadraoTransacao = {
            id: `padrao_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            tipo: determinarTipoPadrao(grupo),
            descricao: `Padrão em transações: ${grupo[0].descricao.substring(0, 30)}...`,
            confianca: 0.6 + Math.min(0.3, grupo.length / 20),
            ocorrencias: grupo.length,
            ultimaDeteccao: new Date().toISOString(),
            regexDescricao: padraoTexto,
            exemplos: [{ transacao: grupo[0] }]
          };
          
          novosPadroes.push(novoPadrao);
        }
        
        // Se temos reconciliações, tentar criar um mapeamento automático
        if (itensReconciliados && itensReconciliados.length > 0) {
          const reconciliacoesPadrao = itensReconciliados.filter(
            item => item.transacao && new RegExp(padraoTexto, 'i').test(item.transacao.descricao)
          );
          
          if (reconciliacoesPadrao.length >= 2) {
            const lancamentos = reconciliacoesPadrao.map(r => r.lancamento);
            const padraoLancamento = lancamentos.length > 0 ? 
              extrairPadraoTexto(lancamentos.map(l => l.descricao)) : undefined;
            
            if (padraoLancamento) {
              // Criar um novo mapeamento
              const novoMapeamento: MapeamentoTransacao = {
                transacaoRegex: padraoTexto,
                lancamentoRegex: padraoLancamento,
                confianca: 0.7 + Math.min(0.2, reconciliacoesPadrao.length / 10),
                ultimoUso: new Date().toISOString(),
                sucessos: reconciliacoesPadrao.length,
                falhas: 0,
                aplicacao: 'sugerida'
              };
              
              novosMapas.push(novoMapeamento);
            }
          }
        }
      }
    }
  });
  
  // Analisar padrões temporais (ex: transações que ocorrem regularmente no mesmo dia do mês)
  const padroesTemporal = detectarPadroesTemporal(transacoes);
  novosPadroes.push(...padroesTemporal);
  
  // Atualizar padrões e mapeamentos detectados
  padroesDetectados.push(...novosPadroes);
  mapeamentosTransacoes.push(...novosMapas);
  
  // Calcular potencial de melhoria
  const potencialMelhoria = calcularPotencialMelhoria(
    transacoes.length,
    lancamentos.length,
    padroesDetectados,
    mapeamentosTransacoes
  );
  
  // Notificar resultados importantes
  if (novosPadroes.length > 0 || novosMapas.length > 0) {
    toast({
      title: "Novos padrões detectados",
      description: `${novosPadroes.length} padrões e ${novosMapas.length} mapeamentos identificados`,
    });
  }
  
  return {
    padroesDetectados,
    mapeamentosGerados: mapeamentosTransacoes,
    potencialMelhoria
  };
};

/**
 * Aplica mapeamentos conhecidos para sugerir reconciliações
 */
export const aplicarMapeamentos = (
  transacoesNaoConciliadas: TransacaoBancaria[],
  lancamentosNaoConciliados: Lancamento[]
): ReconciliacaoItem[] => {
  const sugestoes: ReconciliacaoItem[] = [];
  
  // Filtrar apenas mapeamentos com confiança suficiente
  const mapeamentosValidos = mapeamentosTransacoes.filter(
    m => m.confianca >= configuracao.minConfiancaAplicacao
  );
  
  // Para cada transação não conciliada, tentar aplicar um mapeamento
  transacoesNaoConciliadas.forEach(transacao => {
    for (const mapeamento of mapeamentosValidos) {
      // Verifica se a transação corresponde ao padrão
      if (new RegExp(mapeamento.transacaoRegex, 'i').test(transacao.descricao)) {
        // Se temos um padrão de lançamento, procurar correspondências
        if (mapeamento.lancamentoRegex) {
          const lancamentosCorrespondentes = lancamentosNaoConciliados.filter(
            lancamento => new RegExp(mapeamento.lancamentoRegex!, 'i').test(lancamento.descricao)
          );
          
          // Encontrar o melhor lançamento correspondente (por proximidade de valor e data)
          if (lancamentosCorrespondentes.length > 0) {
            const melhorMatch = encontrarMelhorCorrespondencia(transacao, lancamentosCorrespondentes);
            
            if (melhorMatch) {
              sugestoes.push({
                transacao,
                lancamento: melhorMatch,
                score: mapeamento.confianca,
                conciliacaoAutomatica: mapeamento.aplicacao === 'automatica',
                dataReconciliacao: new Date().toISOString()
              });
              
              // Atualizar estatísticas do mapeamento
              mapeamento.sucessos++;
              mapeamento.ultimoUso = new Date().toISOString();
              mapeamento.confianca = calcularNovaConfianca(mapeamento);
              
              // Sair do loop de mapeamentos, já encontramos um match para esta transação
              break;
            }
          }
        }
      }
    }
  });
  
  console.log(`Análise de padrões sugeriu ${sugestoes.length} reconciliações`);
  return sugestoes;
};

/**
 * Registra resultados de reconciliação para melhorar padrões futuros
 */
export const registrarResultadosReconciliacao = (
  reconciliacoesSucesso: ReconciliacaoItem[],
  reconcilacoesDesfeitas: ReconciliacaoItem[]
): void => {
  // Atualizar estatísticas de mapeamentos
  reconciliacoesSucesso.forEach(item => {
    // Encontrar mapeamento relacionado
    mapeamentosTransacoes.forEach(mapeamento => {
      if (new RegExp(mapeamento.transacaoRegex, 'i').test(item.transacao.descricao)) {
        mapeamento.sucessos++;
        mapeamento.ultimoUso = new Date().toISOString();
        mapeamento.confianca = calcularNovaConfianca(mapeamento);
      }
    });
  });
  
  // Atualizar falhas de mapeamentos
  reconcilacoesDesfeitas.forEach(item => {
    mapeamentosTransacoes.forEach(mapeamento => {
      if (new RegExp(mapeamento.transacaoRegex, 'i').test(item.transacao.descricao)) {
        mapeamento.falhas++;
        mapeamento.ultimoUso = new Date().toISOString();
        mapeamento.confianca = calcularNovaConfianca(mapeamento);
      }
    });
  });
  
  // Aprender com reconciliações bem-sucedidas sem mapeamento prévio
  const potenciaisNovosMapeamentos = reconciliacoesSucesso.filter(item => {
    // Verificar se esta reconciliação não corresponde a nenhum mapeamento existente
    return !mapeamentosTransacoes.some(mapeamento => 
      new RegExp(mapeamento.transacaoRegex, 'i').test(item.transacao.descricao)
    );
  });
  
  // Agrupar por padrões similares antes de criar mapeamentos
  if (potenciaisNovosMapeamentos.length >= configuracao.minOcorrenciasDeteccao) {
    const grupos = agruparReconciliacoesSimilares(potenciaisNovosMapeamentos);
    
    Object.values(grupos).forEach(grupo => {
      if (grupo.length >= configuracao.minOcorrenciasDeteccao) {
        const padraoTransacao = extrairPadraoTexto(grupo.map(r => r.transacao.descricao));
        const padraoLancamento = extrairPadraoTexto(grupo.map(r => r.lancamento.descricao));
        
        if (padraoTransacao && padraoLancamento) {
          // Criar novo mapeamento
          mapeamentosTransacoes.push({
            transacaoRegex: padraoTransacao,
            lancamentoRegex: padraoLancamento,
            confianca: 0.7 + Math.min(0.2, grupo.length / 10),
            ultimoUso: new Date().toISOString(),
            sucessos: grupo.length,
            falhas: 0,
            aplicacao: 'sugerida'
          });
          
          console.log(`Novo mapeamento aprendido: ${padraoTransacao} -> ${padraoLancamento}`);
        }
      }
    });
  }
};

/**
 * Limpa todos os padrões e mapeamentos detectados
 */
export const resetarPadroesDetectados = (): void => {
  padroesDetectados.length = 0;
  mapeamentosTransacoes.length = 0;
  
  toast({
    title: "Padrões resetados",
    description: "Todos os padrões e mapeamentos foram removidos"
  });
};

/**
 * Obtém estatísticas sobre padrões e mapeamentos
 */
export const obterEstatisticasPadroes = () => {
  return {
    totalPadroes: padroesDetectados.length,
    totalMapeamentos: mapeamentosTransacoes.length,
    padroesPorTipo: contarPadroesPorTipo(padroesDetectados),
    mapeamentosAtivos: mapeamentosTransacoes.filter(
      m => m.confianca >= configuracao.minConfiancaAplicacao
    ).length,
    configuracaoAtual: configuracao,
    potencialAutomacao: calcularPotencialMelhoria(
      100, // valor estimado
      100, // valor estimado
      padroesDetectados,
      mapeamentosTransacoes
    )
  };
};

// Funções auxiliares internas

/**
 * Agrupa transações com características similares
 */
function agruparTransacoesSimilares(transacoes: TransacaoBancaria[]): Record<string, TransacaoBancaria[]> {
  const grupos: Record<string, TransacaoBancaria[]> = {};
  
  transacoes.forEach(transacao => {
    // Criar uma chave de agrupamento baseada em características da transação
    // Por exemplo: primeiro contraparte, depois palavras-chave da descrição
    let chaveGrupo = '';
    
    if (transacao.contraparte) {
      chaveGrupo = `contraparte:${transacao.contraparte}`;
    } else {
      // Extrair palavras-chave da descrição (palavras com mais de 4 caracteres)
      const palavrasChave = transacao.descricao
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(palavra => palavra.length > 4)
        .sort()
        .join('_');
      
      chaveGrupo = `desc:${palavrasChave}`;
    }
    
    // Adicionar ao grupo
    if (!grupos[chaveGrupo]) {
      grupos[chaveGrupo] = [];
    }
    grupos[chaveGrupo].push(transacao);
  });
  
  return grupos;
}

/**
 * Agrupa reconciliações com características similares
 */
function agruparReconciliacoesSimilares(reconciliacoes: ReconciliacaoItem[]): Record<string, ReconciliacaoItem[]> {
  const grupos: Record<string, ReconciliacaoItem[]> = {};
  
  reconciliacoes.forEach(reconciliacao => {
    // Extrair palavras-chave da descrição da transação
    const palavrasChaveTransacao = extrairPalavrasChave(reconciliacao.transacao.descricao);
    const chaveGrupo = `trans:${palavrasChaveTransacao}`;
    
    // Adicionar ao grupo
    if (!grupos[chaveGrupo]) {
      grupos[chaveGrupo] = [];
    }
    grupos[chaveGrupo].push(reconciliacao);
  });
  
  return grupos;
}

/**
 * Extrai palavras-chave de um texto
 */
function extrairPalavrasChave(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(palavra => palavra.length > 4)
    .sort()
    .join('_');
}

/**
 * Tenta extrair um padrão de texto a partir de uma lista de descrições
 */
function extrairPadraoTexto(descricoes: string[]): string | undefined {
  if (descricoes.length < 2) return undefined;
  
  // Para simplificar, vamos usar uma abordagem baseada em partes comuns
  // Em uma implementação real, usaríamos algoritmos mais sofisticados
  
  // Encontrar palavras comuns em todas as descrições
  const palavrasComuns: Set<string> = new Set();
  let primeiraVez = true;
  
  descricoes.forEach(descricao => {
    const palavras = descricao
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter(palavra => palavra.length > 3);
    
    if (primeiraVez) {
      palavras.forEach(palavra => palavrasComuns.add(palavra));
      primeiraVez = false;
    } else {
      // Manter apenas palavras que existem em ambos os conjuntos
      const palavrasAtuais = new Set(palavras);
      for (const palavra of palavrasComuns) {
        if (!palavrasAtuais.has(palavra)) {
          palavrasComuns.delete(palavra);
        }
      }
    }
  });
  
  // Se encontramos palavras comuns, criar uma expressão regular
  if (palavrasComuns.size > 0) {
    const termos = Array.from(palavrasComuns).join('|');
    return `(${termos})`;
  }
  
  return undefined;
}

/**
 * Determina o tipo de padrão com base nas transações do grupo
 */
function determinarTipoPadrao(
  transacoes: TransacaoBancaria[]
): 'recorrente' | 'sazonal' | 'periódico' | 'singular' {
  // Analisar datas das transações
  const datas = transacoes.map(t => new Date(t.data));
  datas.sort((a, b) => a.getTime() - b.getTime());
  
  // Verificar intervalo médio entre transações
  const intervalos: number[] = [];
  for (let i = 1; i < datas.length; i++) {
    intervalos.push(datas[i].getTime() - datas[i-1].getTime());
  }
  
  if (intervalos.length === 0) return 'singular';
  
  const intervaloMedio = intervalos.reduce((sum, val) => sum + val, 0) / intervalos.length;
  const diasMedio = intervaloMedio / (1000 * 60 * 60 * 24);
  
  // Calcular desvio padrão dos intervalos
  const desvio = Math.sqrt(
    intervalos.reduce((sum, val) => sum + Math.pow(val - intervaloMedio, 2), 0) / intervalos.length
  ) / (1000 * 60 * 60 * 24);
  
  // Classificar o padrão
  if (diasMedio >= 25 && diasMedio <= 35 && desvio < 5) {
    return 'recorrente'; // Mensal
  } else if (diasMedio >= 85 && diasMedio <= 95 && desvio < 10) {
    return 'recorrente'; // Trimestral
  } else if (diasMedio >= 350 && diasMedio <= 380) {
    return 'sazonal'; // Anual
  } else if (desvio < diasMedio * 0.3) {
    return 'periódico'; // Regular com outro intervalo
  } else {
    return 'singular';
  }
}

/**
 * Detecta padrões temporais nas transações
 */
function detectarPadroesTemporal(transacoes: TransacaoBancaria[]): PadraoTransacao[] {
  const padroes: PadraoTransacao[] = [];
  
  // Agrupar por dia do mês
  const porDiaDoMes: Record<number, TransacaoBancaria[]> = {};
  
  transacoes.forEach(transacao => {
    const data = new Date(transacao.data);
    const diaDoMes = data.getDate();
    
    if (!porDiaDoMes[diaDoMes]) {
      porDiaDoMes[diaDoMes] = [];
    }
    
    porDiaDoMes[diaDoMes].push(transacao);
  });
  
  // Analisar padrões de dia do mês
  Object.entries(porDiaDoMes).forEach(([diaDoMes, grupo]) => {
    if (grupo.length >= configuracao.minOcorrenciasDeteccao) {
      // Verificar se há contrapartes recorrentes neste dia do mês
      const contrapartes = grupo.map(t => t.contraparte).filter(Boolean);
      const contraparteFreq: Record<string, number> = {};
      
      contrapartes.forEach(contraparte => {
        if (contraparte) {
          contraparteFreq[contraparte] = (contraparteFreq[contraparte] || 0) + 1;
        }
      });
      
      Object.entries(contraparteFreq).forEach(([contraparte, freq]) => {
        if (freq >= configuracao.minOcorrenciasDeteccao) {
          // Padrão temporal detectado
          padroes.push({
            id: `padrao_temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            tipo: 'recorrente',
            descricao: `Transações de ${contraparte} no dia ${diaDoMes} de cada mês`,
            confianca: 0.7 + Math.min(0.2, freq / 10),
            ocorrencias: freq,
            ultimaDeteccao: new Date().toISOString(),
            condicoesAdicionais: {
              diaDoMes: parseInt(diaDoMes),
              contraparte
            },
            exemplos: [{ transacao: grupo.find(t => t.contraparte === contraparte)! }]
          });
        }
      });
    }
  });
  
  return padroes;
}

/**
 * Encontra o melhor lançamento correspondente para uma transação
 */
function encontrarMelhorCorrespondencia(
  transacao: TransacaoBancaria,
  lancamentos: Lancamento[]
): Lancamento | undefined {
  let melhorScore = -1;
  let melhorLancamento: Lancamento | undefined;
  
  for (const lancamento of lancamentos) {
    // Calcular score baseado em data e valor
    let score = 0;
    
    // Correspondência de valor (50% do score)
    const diferencaValor = Math.abs(transacao.valor - lancamento.valor) / Math.max(transacao.valor, lancamento.valor);
    if (diferencaValor <= 0.01) { // diferença até 1%
      score += 0.5 * (1 - diferencaValor / 0.01);
    }
    
    // Correspondência de data (50% do score)
    const dataTransacao = new Date(transacao.data);
    const dataLancamento = new Date(lancamento.data);
    const diferencaDias = Math.abs(dataTransacao.getTime() - dataLancamento.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diferencaDias <= 5) { // diferença até 5 dias
      score += 0.5 * (1 - diferencaDias / 5);
    }
    
    if (score > melhorScore) {
      melhorScore = score;
      melhorLancamento = lancamento;
    }
  }
  
  // Retornar apenas se o score for suficientemente bom
  return melhorScore >= 0.6 ? melhorLancamento : undefined;
}

/**
 * Calcula a nova confiança de um mapeamento com base em sua performance
 */
function calcularNovaConfianca(mapeamento: MapeamentoTransacao): number {
  const total = mapeamento.sucessos + mapeamento.falhas;
  if (total === 0) return mapeamento.confianca;
  
  const taxaSucesso = mapeamento.sucessos / total;
  const fatorExperiencia = Math.min(1, total / 20); // Mais confiança com mais amostras
  
  // Confiança baseada em desempenho e experiência
  return 0.5 + (taxaSucesso * 0.5 * fatorExperiencia);
}

/**
 * Calcula o potencial de melhoria na reconciliação
 */
function calcularPotencialMelhoria(
  totalTransacoes: number,
  totalLancamentos: number,
  padroes: PadraoTransacao[],
  mapeamentos: MapeamentoTransacao[]
): number {
  // Número de transações que provavelmente seriam beneficiadas por padrões
  const transacoesComPadroes = padroes.reduce((sum, padrao) => sum + padrao.ocorrencias, 0);
  
  // Número de transações que podem ser mapeadas automaticamente
  const transacoesMapeadas = mapeamentos
    .filter(m => m.confianca >= configuracao.minConfiancaAplicacao)
    .reduce((sum, m) => sum + m.sucessos, 0);
  
  // Calcular percentual de potencial melhoria
  const totalItens = totalTransacoes + totalLancamentos;
  if (totalItens === 0) return 0;
  
  const potencialBruto = (transacoesComPadroes + transacoesMapeadas) / totalItens;
  
  // Limitar a um valor razoável
  return Math.min(0.95, potencialBruto);
}

/**
 * Conta padrões por tipo
 */
function contarPadroesPorTipo(padroes: PadraoTransacao[]): Record<string, number> {
  const contagem: Record<string, number> = {
    recorrente: 0,
    sazonal: 0,
    periódico: 0,
    singular: 0
  };
  
  padroes.forEach(padrao => {
    contagem[padrao.tipo]++;
  });
  
  return contagem;
}
