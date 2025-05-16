
/**
 * Serviço de resolução autônoma de discrepâncias
 * Complementa o processo de reconciliação bancária, resolvendo automaticamente casos não reconciliados
 */

import { toast } from "@/hooks/use-toast";
import {
  ResultadoReconciliacao,
  ReconciliacaoItem
} from "./reconciliacaoBancaria";
import { Lancamento } from "../classificacao/classificacaoML";
import { TransacaoBancaria } from "../../bancario/openBankingService";
import { aplicarMapeamentos } from "./detecaoPadroes";

// Configuração para resolução autônoma
export interface ConfiguracaoResolucao {
  toleranciaDivergencia: number;
  resolverLancamentosDuplicados: boolean;
  corrigirDivergenciasValor: boolean;
  ignorarTransacoesInternas: boolean;
  criarLancamentosParaTransacoesNaoConciliadas: boolean;
  minimumConfidenceToResolve: number;
  maxDiasRetroativos: number;
}

// Configuração padrão
export const configPadraoResolucao: ConfiguracaoResolucao = {
  toleranciaDivergencia: 0.02, // 2%
  resolverLancamentosDuplicados: true,
  corrigirDivergenciasValor: true,
  ignorarTransacoesInternas: true,
  criarLancamentosParaTransacoesNaoConciliadas: false,
  minimumConfidenceToResolve: 0.8,
  maxDiasRetroativos: 90
};

// Resultado da resolução autônoma
export interface ResultadoResolucaoAutonoma {
  reconciliacaoAtualizada: ResultadoReconciliacao;
  duplicacoesResolvidas: number;
  divergenciasCorrigidas: number;
  transacoesIgnoradas: TransacaoBancaria[];
  lancamentosCriados: Lancamento[];
  padroesAplicados: number;
}

/**
 * Resolve discrepâncias automaticamente com base na configuração fornecida
 */
export const resolverDiscrepanciasAutomaticamente = async (
  resultado: ResultadoReconciliacao,
  config: ConfiguracaoResolucao
): Promise<ResultadoResolucaoAutonoma> => {
  console.log("Iniciando resolução autônoma de discrepâncias...");
  
  // Cópia do resultado original para não modificar diretamente
  const resultadoAtualizado: ResultadoReconciliacao = {
    ...resultado,
    transacoesConciliadas: [...resultado.transacoesConciliadas],
    transacoesNaoConciliadas: [...resultado.transacoesNaoConciliadas],
    lancamentosNaoConciliados: [...resultado.lancamentosNaoConciliados]
  };
  
  // Estatísticas da resolução
  let duplicacoesResolvidas = 0;
  let divergenciasCorrigidas = 0;
  let padroesAplicados = 0;
  const transacoesIgnoradas: TransacaoBancaria[] = [];
  const lancamentosCriados: Lancamento[] = [];
  
  // Etapa 1: Resolver lançamentos duplicados
  if (config.resolverLancamentosDuplicados) {
    const resultadoDuplicacoes = resolverLancamentosDuplicados(
      resultadoAtualizado.lancamentosNaoConciliados,
      resultadoAtualizado.transacoesNaoConciliadas,
      config
    );
    
    // Adicionar novas reconciliações de duplicados
    resultadoAtualizado.transacoesConciliadas.push(...resultadoDuplicacoes.reconciliacoes);
    
    // Remover itens conciliados das listas não conciliadas
    resultadoAtualizado.lancamentosNaoConciliados = resultadoDuplicacoes.lancamentosRestantes;
    resultadoAtualizado.transacoesNaoConciliadas = resultadoDuplicacoes.transacoesRestantes;
    
    duplicacoesResolvidas = resultadoDuplicacoes.reconciliacoes.length;
    console.log(`${duplicacoesResolvidas} lançamentos duplicados resolvidos`);
  }
  
  // Etapa 2: Corrigir divergências de valor dentro da tolerância
  if (config.corrigirDivergenciasValor) {
    const resultadoDivergencias = corrigirDivergenciasDeValor(
      resultadoAtualizado.lancamentosNaoConciliados,
      resultadoAtualizado.transacoesNaoConciliadas,
      config
    );
    
    // Adicionar novas reconciliações com divergências ajustadas
    resultadoAtualizado.transacoesConciliadas.push(...resultadoDivergencias.reconciliacoes);
    
    // Remover itens conciliados das listas não conciliadas
    resultadoAtualizado.lancamentosNaoConciliados = resultadoDivergencias.lancamentosRestantes;
    resultadoAtualizado.transacoesNaoConciliadas = resultadoDivergencias.transacoesRestantes;
    
    divergenciasCorrigidas = resultadoDivergencias.reconciliacoes.length;
    console.log(`${divergenciasCorrigidas} divergências de valor corrigidas`);
  }

  // Etapa 3: Aplicar padrões detectados para resolução avançada
  // Esta funcionalidade usa o novo serviço de detecção de padrões
  try {
    const sugestoesReconciliacao = aplicarMapeamentos(
      resultadoAtualizado.transacoesNaoConciliadas,
      resultadoAtualizado.lancamentosNaoConciliados
    );
    
    if (sugestoesReconciliacao.length > 0) {
      // Filtrar apenas sugestões com confiança acima do limiar configurado
      const sugestoesValidas = sugestoesReconciliacao.filter(
        sugestao => sugestao.score >= config.minimumConfidenceToResolve
      );
      
      // Adicionar à lista de reconciliações
      resultadoAtualizado.transacoesConciliadas.push(...sugestoesValidas);
      
      // Remover itens conciliados das listas não conciliadas
      const idsSugeridos = new Set();
      sugestoesValidas.forEach(sugestao => {
        idsSugeridos.add(sugestao.transacao.id);
      });
      
      resultadoAtualizado.transacoesNaoConciliadas = resultadoAtualizado.transacoesNaoConciliadas.filter(
        transacao => !idsSugeridos.has(transacao.id)
      );
      
      const idsLancamentosSugeridos = new Set();
      sugestoesValidas.forEach(sugestao => {
        idsLancamentosSugeridos.add(sugestao.lancamento.id);
      });
      
      resultadoAtualizado.lancamentosNaoConciliados = resultadoAtualizado.lancamentosNaoConciliados.filter(
        lancamento => !idsLancamentosSugeridos.has(lancamento.id)
      );
      
      padroesAplicados = sugestoesValidas.length;
      console.log(`${padroesAplicados} reconciliações realizadas com base em padrões detectados`);
    }
  } catch (error) {
    console.error("Erro ao aplicar padrões detectados:", error);
  }
  
  // Etapa 4: Ignorar transações internas
  if (config.ignorarTransacoesInternas) {
    const { ignoradas, restantes } = identificarTransacoesInternas(
      resultadoAtualizado.transacoesNaoConciliadas
    );
    
    resultadoAtualizado.transacoesNaoConciliadas = restantes;
    transacoesIgnoradas.push(...ignoradas);
    
    console.log(`${ignoradas.length} transações internas ignoradas`);
  }
  
  // Etapa 5: Criar lançamentos para transações não conciliadas
  if (config.criarLancamentosParaTransacoesNaoConciliadas) {
    const resultado = criarLancamentosParaTransacoes(
      resultadoAtualizado.transacoesNaoConciliadas
    );
    
    // Adicionar à lista de reconciliações
    resultadoAtualizado.transacoesConciliadas.push(...resultado.reconciliacoes);
    resultadoAtualizado.transacoesNaoConciliadas = resultado.transacoesRestantes;
    lancamentosCriados.push(...resultado.lancamentosCriados);
    
    console.log(`${resultado.lancamentosCriados.length} lançamentos criados automaticamente`);
  }
  
  // Atualizar contadores
  resultadoAtualizado.totalConciliado = resultadoAtualizado.transacoesConciliadas.length;
  resultadoAtualizado.totalNaoConciliado = {
    transacoes: resultadoAtualizado.transacoesNaoConciliadas.length,
    lancamentos: resultadoAtualizado.lancamentosNaoConciliados.length
  };
  
  // Resultado final
  const resultadoFinal: ResultadoResolucaoAutonoma = {
    reconciliacaoAtualizada: resultadoAtualizado,
    duplicacoesResolvidas,
    divergenciasCorrigidas,
    transacoesIgnoradas,
    lancamentosCriados,
    padroesAplicados
  };
  
  // Notificação de conclusão
  const totalResolvidos = duplicacoesResolvidas + divergenciasCorrigidas + 
      lancamentosCriados.length + transacoesIgnoradas.length + padroesAplicados;
      
  toast({
    title: "Resolução automática concluída",
    description: `${totalResolvidos} discrepâncias resolvidas com sucesso de forma autônoma`
  });
  
  console.log("Resolução autônoma concluída", resultadoFinal);
  
  return resultadoFinal;
};

/**
 * Resolve lançamentos duplicados
 */
function resolverLancamentosDuplicados(
  lancamentosNaoConciliados: Lancamento[],
  transacoesNaoConciliadas: TransacaoBancaria[],
  config: ConfiguracaoResolucao
) {
  const reconciliacoes: ReconciliacaoItem[] = [];
  const lancamentosRestantes = [...lancamentosNaoConciliados];
  const transacoesRestantes = [...transacoesNaoConciliadas];
  
  // Agrupar lançamentos potencialmente duplicados
  const grupos = agruparLancamentosPotencialmenteDuplicados(lancamentosNaoConciliados);
  
  // Para cada grupo de duplicados, tentar encontrar transações correspondentes
  for (const grupo of Object.values(grupos)) {
    if (grupo.length > 1) { // Temos duplicados
      for (let i = 0; i < transacoesRestantes.length; i++) {
        const transacao = transacoesRestantes[i];
        
        // Verificar se algum lançamento no grupo corresponde à transação
        const matches = grupo.map(lancamento => ({
          lancamento,
          score: calcularScoreCorrespondencia(transacao, lancamento, config)
        }));
        
        // Encontrar o melhor match
        matches.sort((a, b) => b.score - a.score);
        
        if (matches[0].score > config.minimumConfidenceToResolve) {
          // Criar reconciliação com o melhor match
          const melhorMatch = matches[0].lancamento;
          
          reconciliacoes.push({
            transacao,
            lancamento: melhorMatch,
            score: matches[0].score,
            conciliacaoAutomatica: true,
            dataReconciliacao: new Date().toISOString()
          });
          
          // Remover a transação e o lançamento das listas
          transacoesRestantes.splice(i, 1);
          const idxLancamento = lancamentosRestantes.findIndex(l => l.id === melhorMatch.id);
          if (idxLancamento !== -1) {
            lancamentosRestantes.splice(idxLancamento, 1);
          }
          
          // Retroceder índice para compensar remoção
          i--;
          break;
        }
      }
    }
  }
  
  return {
    reconciliacoes,
    lancamentosRestantes,
    transacoesRestantes
  };
}

/**
 * Agrupa lançamentos potencialmente duplicados
 */
function agruparLancamentosPotencialmenteDuplicados(
  lancamentos: Lancamento[]
): Record<string, Lancamento[]> {
  const grupos: Record<string, Lancamento[]> = {};
  
  // Agrupar por características semelhantes
  lancamentos.forEach(lancamento => {
    // Criar chave de agrupamento (data aproximada + valor + tipo)
    const data = new Date(lancamento.data);
    const mesAno = `${data.getMonth() + 1}-${data.getFullYear()}`;
    const valorArredondado = Math.round(lancamento.valor * 100) / 100;
    const chave = `${mesAno}_${valorArredondado}_${lancamento.tipo}`;
    
    if (!grupos[chave]) {
      grupos[chave] = [];
    }
    
    grupos[chave].push(lancamento);
  });
  
  // Filtrar apenas grupos com potenciais duplicações
  return Object.fromEntries(
    Object.entries(grupos).filter(([_, lancamentos]) => lancamentos.length > 1)
  );
}

/**
 * Corrige divergências de valor dentro da tolerância configurada
 */
function corrigirDivergenciasDeValor(
  lancamentosNaoConciliados: Lancamento[],
  transacoesNaoConciliadas: TransacaoBancaria[],
  config: ConfiguracaoResolucao
) {
  const reconciliacoes: ReconciliacaoItem[] = [];
  const lancamentosRestantes = [...lancamentosNaoConciliados];
  const transacoesRestantes = [...transacoesNaoConciliadas];
  
  // Para cada transação, procurar um lançamento com valor aproximado
  for (let i = 0; i < transacoesRestantes.length; i++) {
    const transacao = transacoesRestantes[i];
    
    // Verificar restrição de data
    const dataTransacao = new Date(transacao.data);
    const minDate = new Date(dataTransacao);
    minDate.setDate(minDate.getDate() - config.maxDiasRetroativos);
    
    // Procurar lançamentos compatíveis
    const lancamentosCompativeis = lancamentosRestantes.filter(lancamento => {
      // Verificar compatibilidade de tipo
      const tipoCompativel = 
        (transacao.tipo === 'credito' && lancamento.tipo === 'receita') || 
        (transacao.tipo === 'debito' && lancamento.tipo === 'despesa');
      
      if (!tipoCompativel) return false;
      
      // Verificar data dentro do limite
      const dataLancamento = new Date(lancamento.data);
      if (dataLancamento < minDate) return false;
      
      // Verificar divergência de valor dentro da tolerância
      const divergenciaRelativa = Math.abs(transacao.valor - lancamento.valor) / Math.max(transacao.valor, lancamento.valor);
      return divergenciaRelativa <= config.toleranciaDivergencia;
    });
    
    if (lancamentosCompativeis.length > 0) {
      // Encontrar o lançamento com maior score
      let melhorLancamento: Lancamento | null = null;
      let melhorScore = -1;
      
      for (const lancamento of lancamentosCompativeis) {
        const score = calcularScoreCorrespondencia(transacao, lancamento, config);
        if (score > melhorScore) {
          melhorScore = score;
          melhorLancamento = lancamento;
        }
      }
      
      // Se o score for suficiente, criar reconciliação
      if (melhorLancamento && melhorScore >= config.minimumConfidenceToResolve) {
        reconciliacoes.push({
          transacao,
          lancamento: melhorLancamento,
          score: melhorScore,
          conciliacaoAutomatica: true,
          dataReconciliacao: new Date().toISOString()
        });
        
        // Remover a transação e o lançamento das listas
        transacoesRestantes.splice(i, 1);
        const idxLancamento = lancamentosRestantes.findIndex(l => l.id === melhorLancamento!.id);
        if (idxLancamento !== -1) {
          lancamentosRestantes.splice(idxLancamento, 1);
        }
        
        // Retroceder índice para compensar remoção
        i--;
      }
    }
  }
  
  return {
    reconciliacoes,
    lancamentosRestantes,
    transacoesRestantes
  };
}

/**
 * Calcula o score de correspondência entre uma transação e um lançamento
 */
function calcularScoreCorrespondencia(
  transacao: TransacaoBancaria,
  lancamento: Lancamento,
  config: ConfiguracaoResolucao
): number {
  let score = 0;
  
  // Score por valor (50%)
  const divergenciaRelativa = Math.abs(transacao.valor - lancamento.valor) / Math.max(transacao.valor, lancamento.valor);
  if (divergenciaRelativa === 0) {
    score += 0.5; // Match perfeito
  } else if (divergenciaRelativa <= config.toleranciaDivergencia) {
    // Score proporcional à divergência dentro da tolerância
    score += 0.5 * (1 - divergenciaRelativa / config.toleranciaDivergencia);
  }
  
  // Score por data (30%)
  const dataTransacao = new Date(transacao.data);
  const dataLancamento = new Date(lancamento.data);
  const diferencaDias = Math.abs(dataTransacao.getTime() - dataLancamento.getTime()) / (1000 * 60 * 60 * 24);
  
  if (diferencaDias === 0) {
    score += 0.3; // Match perfeito
  } else if (diferencaDias <= 5) {
    score += 0.3 * (1 - diferencaDias / 5);
  }
  
  // Score por descrição (20%)
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

/**
 * Identifica transações internas que podem ser ignoradas
 */
function identificarTransacoesInternas(
  transacoes: TransacaoBancaria[]
): { ignoradas: TransacaoBancaria[], restantes: TransacaoBancaria[] } {
  const ignoradas: TransacaoBancaria[] = [];
  const restantes: TransacaoBancaria[] = [];
  
  // Palavras-chave que indicam transações internas
  const palavrasChaveInternas = [
    "transferência entre contas", "transferência entre conta", 
    "transf. entre contas", "transf entre", "transferência própria",
    "ted própria", "doc próprio", "saldo anterior", "saldo inicial"
  ];
  
  transacoes.forEach(transacao => {
    const descricao = transacao.descricao.toLowerCase();
    
    // Verificar se a descrição contém alguma palavra-chave
    const ehInterna = palavrasChaveInternas.some(palavra => 
      descricao.includes(palavra.toLowerCase())
    );
    
    if (ehInterna) {
      ignoradas.push(transacao);
    } else {
      restantes.push(transacao);
    }
  });
  
  return { ignoradas, restantes };
}

/**
 * Cria lançamentos automaticamente para transações não conciliadas
 */
function criarLancamentosParaTransacoes(
  transacoes: TransacaoBancaria[]
) {
  const lancamentosCriados: Lancamento[] = [];
  const reconciliacoes: ReconciliacaoItem[] = [];
  const transacoesRestantes: TransacaoBancaria[] = [];
  
  // Criar um lançamento para cada transação, se possível
  transacoes.forEach(transacao => {
    // Verificar se podemos classificar esta transação
    const classificacaoAutomatica = classificarTransacaoAutomaticamente(transacao);
    
    if (classificacaoAutomatica.confianca >= 0.7) {
      // Criar o lançamento
      const novoLancamento: Lancamento = {
        id: `lancamento_auto_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        data: transacao.data,
        valor: transacao.valor,
        descricao: transacao.descricao,
        tipo: transacao.tipo === 'credito' ? 'receita' : 'despesa',
        categoria: classificacaoAutomatica.categoria,
        contraparte: transacao.contraparte,
        status: 'classificado',
        confianca: classificacaoAutomatica.confianca,
        observacoes: 'Criado automaticamente pelo sistema de reconciliação autônoma'
      };
      
      lancamentosCriados.push(novoLancamento);
      
      // Criar a reconciliação
      reconciliacoes.push({
        transacao,
        lancamento: novoLancamento,
        score: 0.9, // Alta confiança para lançamentos criados automaticamente
        conciliacaoAutomatica: true,
        dataReconciliacao: new Date().toISOString()
      });
    } else {
      // Não foi possível classificar automaticamente
      transacoesRestantes.push(transacao);
    }
  });
  
  return {
    lancamentosCriados,
    reconciliacoes,
    transacoesRestantes
  };
}

/**
 * Classifica uma transação automaticamente para criação de lançamento
 */
function classificarTransacaoAutomaticamente(
  transacao: TransacaoBancaria
): { categoria: string; confianca: number } {
  // Regras simplificadas para classificação
  const descricao = transacao.descricao.toLowerCase();
  
  // Regras para receitas (créditos)
  if (transacao.tipo === 'credito') {
    if (descricao.includes("cliente") || descricao.includes("pagamento") || descricao.includes("venda")) {
      return { categoria: "Vendas", confianca: 0.8 };
    }
    
    if (descricao.includes("juros") || descricao.includes("rendimento")) {
      return { categoria: "Rendimentos", confianca: 0.85 };
    }
    
    if (descricao.includes("serviço") || descricao.includes("servico") || descricao.includes("consultoria")) {
      return { categoria: "Prestação de Serviços", confianca: 0.8 };
    }
    
    // Categoria genérica para receitas
    return { categoria: "Outras Receitas", confianca: 0.7 };
  }
  
  // Regras para despesas (débitos)
  else {
    if (descricao.includes("energia") || descricao.includes("água") || descricao.includes("luz") || descricao.includes("telefone")) {
      return { categoria: "Utilidades", confianca: 0.85 };
    }
    
    if (descricao.includes("imposto") || descricao.includes("tributo") || descricao.includes("inss") || descricao.includes("fgts")) {
      return { categoria: "Impostos e Tributos", confianca: 0.85 };
    }
    
    if (descricao.includes("salário") || descricao.includes("folha") || descricao.includes("funcionário")) {
      return { categoria: "Folha de Pagamento", confianca: 0.85 };
    }
    
    if (descricao.includes("fornecedor") || descricao.includes("compra") || descricao.includes("material")) {
      return { categoria: "Fornecedores", confianca: 0.8 };
    }
    
    if (descricao.includes("aluguel") || descricao.includes("locação")) {
      return { categoria: "Aluguel", confianca: 0.85 };
    }
    
    if (descricao.includes("tarifa") || descricao.includes("taxa") || descricao.includes("banco")) {
      return { categoria: "Despesas Financeiras", confianca: 0.85 };
    }
    
    // Categoria genérica para despesas
    return { categoria: "Outras Despesas", confianca: 0.6 };
  }
}
