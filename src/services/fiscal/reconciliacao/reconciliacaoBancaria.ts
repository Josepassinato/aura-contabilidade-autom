
/**
 * Serviço de reconciliação bancária
 * Realiza o cruzamento entre transações bancárias e lançamentos classificados
 */

import { toast } from "@/hooks/use-toast";
import { Lancamento } from "../classificacao/classificacaoML";
import { TransacaoBancaria } from "../../bancario/openBankingService";

// Resultados da reconciliação
export interface ResultadoReconciliacao {
  transacoesConciliadas: ReconciliacaoItem[];
  transacoesNaoConciliadas: TransacaoBancaria[];
  lancamentosNaoConciliados: Lancamento[];
  totalConciliado: number;
  totalNaoConciliado: {
    transacoes: number;
    lancamentos: number;
  };
}

// Item de reconciliação
export interface ReconciliacaoItem {
  transacao: TransacaoBancaria;
  lancamento: Lancamento;
  score: number;
  conciliacaoAutomatica: boolean;
  dataReconciliacao: string;
}

// Configuração de reconciliação
export interface ConfiguracaoReconciliacao {
  limiarScoreAutomatico: number;
  toleranciaData: number; // em dias
  toleranciaValor: number; // porcentagem
  considerarContraparte: boolean;
  estrategia: 'conservadora' | 'moderada' | 'agressiva';
}

// Configuração padrão
const configPadrao: ConfiguracaoReconciliacao = {
  limiarScoreAutomatico: 0.85,
  toleranciaData: 3,
  toleranciaValor: 0.01, // 1%
  considerarContraparte: true,
  estrategia: 'moderada'
};

// Estado do serviço
let configuracao: ConfiguracaoReconciliacao = {...configPadrao};

/**
 * Configura o serviço de reconciliação
 */
export const configurarReconciliacao = (config: Partial<ConfiguracaoReconciliacao>): void => {
  configuracao = { ...configuracao, ...config };
  console.log("Configuração de reconciliação atualizada:", configuracao);
};

/**
 * Calcula a data como timestamp para comparação
 */
const calcularDataTimestamp = (data: string): number => {
  return new Date(data).getTime();
};

/**
 * Calcula a diferença de dias entre duas datas
 */
const calcularDiferencaDias = (data1: string, data2: string): number => {
  const timestamp1 = calcularDataTimestamp(data1);
  const timestamp2 = calcularDataTimestamp(data2);
  const diferencaMs = Math.abs(timestamp1 - timestamp2);
  return Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
};

/**
 * Calcula o score de reconciliação entre uma transação e um lançamento
 */
const calcularScoreReconciliacao = (
  transacao: TransacaoBancaria, 
  lancamento: Lancamento
): number => {
  let score = 0;
  
  // Correspondência de valor (50% do score)
  if (transacao.valor === lancamento.valor) {
    score += 0.5;
  } else {
    // Diferença percentual (tolera pequenas diferenças)
    const diferencaPerc = Math.abs(transacao.valor - lancamento.valor) / Math.max(transacao.valor, lancamento.valor);
    if (diferencaPerc <= configuracao.toleranciaValor) {
      score += 0.5 * (1 - diferencaPerc / configuracao.toleranciaValor);
    }
  }
  
  // Correspondência de data (30% do score)
  const diferencaDias = calcularDiferencaDias(transacao.data, lancamento.data);
  if (diferencaDias === 0) {
    score += 0.3;
  } else if (diferencaDias <= configuracao.toleranciaData) {
    score += 0.3 * (1 - diferencaDias / configuracao.toleranciaData);
  }
  
  // Correspondência de descrição (20% do score)
  const descricaoTransacao = transacao.descricao.toLowerCase();
  const descricaoLancamento = lancamento.descricao.toLowerCase();
  
  if (descricaoTransacao === descricaoLancamento) {
    score += 0.2;
  } else if (descricaoTransacao.includes(descricaoLancamento) || descricaoLancamento.includes(descricaoTransacao)) {
    score += 0.15;
  } else {
    // Correspondência parcial por palavras
    const palavrasTransacao = descricaoTransacao.split(' ').filter(p => p.length > 3);
    const palavrasLancamento = descricaoLancamento.split(' ').filter(p => p.length > 3);
    
    const palavrasComuns = palavrasTransacao.filter(p => palavrasLancamento.includes(p));
    if (palavrasComuns.length > 0) {
      const scorePalavras = Math.min(0.1, palavrasComuns.length * 0.03);
      score += scorePalavras;
    }
  }
  
  // Bônus para contraparte se configurado
  if (configuracao.considerarContraparte && transacao.contraparte && lancamento.contraparte) {
    if (transacao.contraparte === lancamento.contraparte) {
      score += 0.1;
    }
  }
  
  // Normaliza o score para máximo de 1.0
  return Math.min(1, score);
};

/**
 * Reconcilia transações bancárias com lançamentos classificados
 */
export const reconciliarTransacoes = (
  transacoes: TransacaoBancaria[], 
  lancamentos: Lancamento[]
): ResultadoReconciliacao => {
  console.log(`Reconciliando ${transacoes.length} transações com ${lancamentos.length} lançamentos...`);
  
  // Copia dos arrays para não modificar os originais
  const transacoesRestantes = [...transacoes];
  const lancamentosRestantes = [...lancamentos];
  
  // Array para armazenar os itens reconciliados
  const reconciliacoes: ReconciliacaoItem[] = [];
  
  // Estratégia de reconciliação
  const estrategias = {
    conservadora: {
      limiarScore: 0.9,
      scoreRejeicao: 0.7
    },
    moderada: {
      limiarScore: 0.8,
      scoreRejeicao: 0.5
    },
    agressiva: {
      limiarScore: 0.7,
      scoreRejeicao: 0.3
    }
  };
  
  const estrategia = estrategias[configuracao.estrategia];
  
  // Primeira passagem: reconciliação com score alto
  for (let i = transacoesRestantes.length - 1; i >= 0; i--) {
    const transacao = transacoesRestantes[i];
    
    let melhorMatch: { lancamento: Lancamento, score: number, indice: number } | null = null;
    
    // Encontra o melhor match para esta transação
    lancamentosRestantes.forEach((lancamento, indice) => {
      // Verifica compatibilidade básica
      const tipoCompativel = 
        (transacao.tipo === 'credito' && lancamento.tipo === 'receita') || 
        (transacao.tipo === 'debito' && lancamento.tipo === 'despesa');
      
      if (tipoCompativel) {
        const score = calcularScoreReconciliacao(transacao, lancamento);
        
        if (score > (melhorMatch?.score || 0)) {
          melhorMatch = { lancamento, score, indice };
        }
      }
    });
    
    // Se encontrou match com score acima do limiar, reconcilia
    if (melhorMatch && melhorMatch.score >= estrategia.limiarScore) {
      const conciliacaoAutomatica = melhorMatch.score >= configuracao.limiarScoreAutomatico;
      
      reconciliacoes.push({
        transacao,
        lancamento: melhorMatch.lancamento,
        score: melhorMatch.score,
        conciliacaoAutomatica,
        dataReconciliacao: new Date().toISOString()
      });
      
      // Remove os itens conciliados das listas restantes
      transacoesRestantes.splice(i, 1);
      lancamentosRestantes.splice(melhorMatch.indice, 1);
    }
  }
  
  // Segunda passagem: tenta reconciliar transações restantes com critérios mais relaxados
  // (apenas para estratégia agressiva ou moderada)
  if (configuracao.estrategia !== 'conservadora') {
    for (let i = transacoesRestantes.length - 1; i >= 0; i--) {
      const transacao = transacoesRestantes[i];
      
      let melhorMatch: { lancamento: Lancamento, score: number, indice: number } | null = null;
      
      // Encontra o melhor match para esta transação
      lancamentosRestantes.forEach((lancamento, indice) => {
        // Verifica apenas por valor aproximado e data
        if (Math.abs(transacao.valor - lancamento.valor) / Math.max(transacao.valor, lancamento.valor) <= configuracao.toleranciaValor * 2) {
          const score = calcularScoreReconciliacao(transacao, lancamento);
          
          if (score > (melhorMatch?.score || 0)) {
            melhorMatch = { lancamento, score, indice };
          }
        }
      });
      
      // Para estratégia agressiva, aceita scores mais baixos
      if (melhorMatch && melhorMatch.score >= estrategia.scoreRejeicao) {
        reconciliacoes.push({
          transacao,
          lancamento: melhorMatch.lancamento,
          score: melhorMatch.score,
          conciliacaoAutomatica: false, // Reconciliação de segunda passagem sempre requer revisão
          dataReconciliacao: new Date().toISOString()
        });
        
        // Remove os itens conciliados das listas restantes
        transacoesRestantes.splice(i, 1);
        lancamentosRestantes.splice(melhorMatch.indice, 1);
      }
    }
  }
  
  // Resultados da reconciliação
  const resultado: ResultadoReconciliacao = {
    transacoesConciliadas: reconciliacoes,
    transacoesNaoConciliadas: transacoesRestantes,
    lancamentosNaoConciliados: lancamentosRestantes,
    totalConciliado: reconciliacoes.length,
    totalNaoConciliado: {
      transacoes: transacoesRestantes.length,
      lancamentos: lancamentosRestantes.length
    }
  };
  
  // Notificar resultado
  toast({
    title: "Reconciliação concluída",
    description: `${reconciliacoes.length} itens reconciliados, ${transacoesRestantes.length} transações e ${lancamentosRestantes.length} lançamentos não conciliados.`,
  });
  
  console.log("Resultado da reconciliação:", resultado);
  
  return resultado;
};

/**
 * Reconcilia manualmente uma transação e um lançamento
 */
export const reconciliarManualmente = (
  transacao: TransacaoBancaria, 
  lancamento: Lancamento
): ReconciliacaoItem => {
  // Calcula o score para referência, mesmo sendo reconciliação manual
  const score = calcularScoreReconciliacao(transacao, lancamento);
  
  const reconciliacao: ReconciliacaoItem = {
    transacao,
    lancamento,
    score,
    conciliacaoAutomatica: false,
    dataReconciliacao: new Date().toISOString()
  };
  
  console.log("Reconciliação manual realizada:", reconciliacao);
  
  toast({
    title: "Reconciliação manual",
    description: `Lançamento reconciliado manualmente com score de ${(score * 100).toFixed(0)}%`,
  });
  
  return reconciliacao;
};

/**
 * Desfaz uma reconciliação
 */
export const desfazerReconciliacao = (reconciliacao: ReconciliacaoItem) => {
  console.log("Reconciliação desfeita:", reconciliacao);
  
  toast({
    title: "Reconciliação desfeita",
    description: `Lançamento e transação separados com sucesso`,
  });
  
  return {
    transacao: reconciliacao.transacao,
    lancamento: reconciliacao.lancamento
  };
};
