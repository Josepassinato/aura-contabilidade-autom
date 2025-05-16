
import { toast } from "@/hooks/use-toast";
import { 
  ReconciliacaoItem, 
  ResultadoReconciliacao,
  configurarReconciliacao
} from "./reconciliacaoBancaria";
import { TransacaoBancaria } from "../../bancario/openBankingService";
import { Lancamento } from "../classificacao/classificacaoML";
import { processarLancamentosAvancados } from "../classificacao/processamentoAvancado";

// Configuração para resolução autônoma
export interface ConfiguracaoResolucao {
  resolverLancamentosDuplicados: boolean;
  corrigirDivergenciasValor: boolean;
  toleranciaDivergencia: number; // percentual de tolerância
  criarLancamentosParaTransacoesNaoConciliadas: boolean;
  minimumConfidenceToResolve: number; // confiança mínima para resolver
  ignorarTransacoesInternas: boolean;
  maxDiasRetroativos: number;
}

// Configuração padrão
export const configPadraoResolucao: ConfiguracaoResolucao = {
  resolverLancamentosDuplicados: true,
  corrigirDivergenciasValor: true,
  toleranciaDivergencia: 0.02, // 2% de tolerância
  criarLancamentosParaTransacoesNaoConciliadas: true,
  minimumConfidenceToResolve: 0.75,
  ignorarTransacoesInternas: true,
  maxDiasRetroativos: 90
};

// Interface para resultados da resolução
export interface ResultadoResolucaoAutonoma {
  reconciliacaoAtualizada: ResultadoReconciliacao;
  lancamentosCorrigidos: Lancamento[];
  lancamentosCriados: Lancamento[];
  transacoesIgnoradas: TransacaoBancaria[];
  duplicacoesResolvidas: number;
  divergenciasCorrigidas: number;
  totalResolucoes: number;
}

/**
 * Aplica resolução autônoma em resultados de reconciliação
 */
export async function resolverDiscrepanciasAutomaticamente(
  resultado: ResultadoReconciliacao,
  config: Partial<ConfiguracaoResolucao> = {}
): Promise<ResultadoResolucaoAutonoma> {
  const configuracao: ConfiguracaoResolucao = { ...configPadraoResolucao, ...config };
  console.log("Iniciando resolução autônoma com configuração:", configuracao);
  
  // Resultados que vamos retornar
  const lancamentosCorrigidos: Lancamento[] = [];
  const lancamentosCriados: Lancamento[] = [];
  const transacoesIgnoradas: TransacaoBancaria[] = [];
  let duplicacoesResolvidas = 0;
  let divergenciasCorrigidas = 0;
  
  // Cópia dos objetos para não modificar os originais
  const transacoesNaoConciliadas = [...resultado.transacoesNaoConciliadas];
  const lancamentosNaoConciliados = [...resultado.lancamentosNaoConciliados];
  const transacoesConciliadas = [...resultado.transacoesConciliadas];
  
  // 1. Resolver lançamentos duplicados
  if (configuracao.resolverLancamentosDuplicados) {
    const { 
      lancamentosRestantes,
      transacoesRestantes,
      conciliacoes,
      duplicacoesResolvidas: duplicacoes
    } = resolverLancamentosDuplicados(
      lancamentosNaoConciliados,
      transacoesNaoConciliadas,
      configuracao
    );
    
    // Atualizar listas e métricas
    transacoesConciliadas.push(...conciliacoes);
    duplicacoesResolvidas = duplicacoes;
    
    // Substituir arrays originais com os resultados processados
    transacoesNaoConciliadas.length = 0;
    lancamentosNaoConciliados.length = 0;
    transacoesNaoConciliadas.push(...transacoesRestantes);
    lancamentosNaoConciliados.push(...lancamentosRestantes);
  }
  
  // 2. Corrigir divergências de valores
  if (configuracao.corrigirDivergenciasValor) {
    const { 
      lancamentosRestantes,
      lancamentosCorrigidos: corrigidos,
      transacoesRestantes,
      conciliacoes,
      divergenciasCorrigidas: divergencias
    } = corrigirDivergenciasDeValor(
      lancamentosNaoConciliados,
      transacoesNaoConciliadas,
      configuracao
    );
    
    // Atualizar listas e métricas
    transacoesConciliadas.push(...conciliacoes);
    lancamentosCorrigidos.push(...corrigidos);
    divergenciasCorrigidas = divergencias;
    
    // Substituir arrays originais com os resultados processados
    transacoesNaoConciliadas.length = 0;
    lancamentosNaoConciliados.length = 0;
    transacoesNaoConciliadas.push(...transacoesRestantes);
    lancamentosNaoConciliados.push(...lancamentosRestantes);
  }
  
  // 3. Ignorar transações internas se configurado
  if (configuracao.ignorarTransacoesInternas) {
    const { transacoesRestantes, transacoesIgnoradas: ignoradas } = filtrarTransacoesInternas(
      transacoesNaoConciliadas,
      configuracao
    );
    
    transacoesIgnoradas.push(...ignoradas);
    transacoesNaoConciliadas.length = 0;
    transacoesNaoConciliadas.push(...transacoesRestantes);
  }
  
  // 4. Criar lançamentos para transações não conciliadas
  if (configuracao.criarLancamentosParaTransacoesNaoConciliadas && transacoesNaoConciliadas.length > 0) {
    const { lancamentosCriados: criados, transacoesProcessadas } = await criarLancamentosAutomaticamente(
      transacoesNaoConciliadas,
      configuracao
    );
    
    lancamentosCriados.push(...criados);
    
    // Conciliar os novos lançamentos com as transações correspondentes
    const novasConciliacoes = criarConciliacoesPara(criados, transacoesProcessadas);
    transacoesConciliadas.push(...novasConciliacoes);
    
    // Remover transações processadas da lista não conciliada
    const idsProcessados = new Set(transacoesProcessadas.map(t => t.id));
    const transacoesRestantes = transacoesNaoConciliadas.filter(t => !idsProcessados.has(t.id));
    
    transacoesNaoConciliadas.length = 0;
    transacoesNaoConciliadas.push(...transacoesRestantes);
  }
  
  // Montar resultado atualizado da reconciliação
  const reconciliacaoAtualizada: ResultadoReconciliacao = {
    transacoesConciliadas,
    transacoesNaoConciliadas,
    lancamentosNaoConciliados,
    totalConciliado: transacoesConciliadas.length,
    totalNaoConciliado: {
      transacoes: transacoesNaoConciliadas.length,
      lancamentos: lancamentosNaoConciliados.length
    }
  };
  
  const totalResolucoes = duplicacoesResolvidas + divergenciasCorrigidas + lancamentosCriados.length;
  
  // Notificar resultado
  const mensagem = `Resolução autônoma concluída: ${totalResolucoes} problemas resolvidos (${duplicacoesResolvidas} duplicações, ${divergenciasCorrigidas} divergências, ${lancamentosCriados.length} lançamentos criados)`;
  
  toast({
    title: "Resolução autônoma concluída",
    description: mensagem,
  });
  
  console.log("Resultado da resolução autônoma:", {
    reconciliacaoAtualizada,
    lancamentosCorrigidos,
    lancamentosCriados,
    transacoesIgnoradas,
    duplicacoesResolvidas,
    divergenciasCorrigidas,
    totalResolucoes
  });
  
  return {
    reconciliacaoAtualizada,
    lancamentosCorrigidos,
    lancamentosCriados,
    transacoesIgnoradas,
    duplicacoesResolvidas,
    divergenciasCorrigidas,
    totalResolucoes
  };
}

/**
 * Resolve lançamentos duplicados encontrando melhores matches
 */
function resolverLancamentosDuplicados(
  lancamentosNaoConciliados: Lancamento[],
  transacoesNaoConciliadas: TransacaoBancaria[],
  config: ConfiguracaoResolucao
): {
  lancamentosRestantes: Lancamento[];
  transacoesRestantes: TransacaoBancaria[];
  conciliacoes: ReconciliacaoItem[];
  duplicacoesResolvidas: number;
} {
  const lancamentosRestantes = [...lancamentosNaoConciliados];
  const transacoesRestantes = [...transacoesNaoConciliadas];
  const conciliacoes: ReconciliacaoItem[] = [];
  let duplicacoesResolvidas = 0;
  
  // Agrupar lançamentos por características similares (data, valor, descrição parcial)
  const lancamentosAgrupados = agruparLancamentosSimilares(lancamentosNaoConciliados);
  
  // Para cada grupo de lançamentos similares, tentar encontrar transações correspondentes
  Object.values(lancamentosAgrupados).forEach(grupo => {
    if (grupo.length <= 1) return; // Ignorar grupos sem duplicatas
    
    // Ordenar por confiança e relevância
    grupo.sort((a, b) => (b.confianca || 0) - (a.confianca || 0));
    
    // Manter apenas o primeiro (mais confiável) e marcar os outros como duplicatas
    const lancamentoPrincipal = grupo[0];
    const duplicatas = grupo.slice(1);
    
    // Tentar encontrar uma transação correspondente para o lançamento principal
    const transacaoIndex = transacoesRestantes.findIndex(transacao => 
      verificarCorrespondencia(transacao, lancamentoPrincipal, config)
    );
    
    if (transacaoIndex >= 0) {
      const transacao = transacoesRestantes[transacaoIndex];
      
      // Criar reconciliação
      conciliacoes.push({
        transacao,
        lancamento: lancamentoPrincipal,
        score: calcularScoreCorrespondencia(transacao, lancamentoPrincipal),
        conciliacaoAutomatica: true,
        dataReconciliacao: new Date().toISOString()
      });
      
      // Remover a transação e lançamentos processados
      transacoesRestantes.splice(transacaoIndex, 1);
      removerLancamentos(lancamentosRestantes, [lancamentoPrincipal, ...duplicatas]);
      
      duplicacoesResolvidas += duplicatas.length;
    }
  });
  
  return {
    lancamentosRestantes,
    transacoesRestantes,
    conciliacoes,
    duplicacoesResolvidas
  };
}

/**
 * Corrige divergências de valores entre lançamentos e transações
 */
function corrigirDivergenciasDeValor(
  lancamentosNaoConciliados: Lancamento[],
  transacoesNaoConciliadas: TransacaoBancaria[],
  config: ConfiguracaoResolucao
): {
  lancamentosRestantes: Lancamento[];
  lancamentosCorrigidos: Lancamento[];
  transacoesRestantes: TransacaoBancaria[];
  conciliacoes: ReconciliacaoItem[];
  divergenciasCorrigidas: number;
} {
  const lancamentosRestantes = [...lancamentosNaoConciliados];
  const transacoesRestantes = [...transacoesNaoConciliadas];
  const conciliacoes: ReconciliacaoItem[] = [];
  const lancamentosCorrigidos: Lancamento[] = [];
  let divergenciasCorrigidas = 0;
  
  // Para cada transação, procurar por lançamentos com divergência tolerável
  for (let i = transacoesRestantes.length - 1; i >= 0; i--) {
    const transacao = transacoesRestantes[i];
    
    // Encontrar lançamento com data e descrição similar, mas valor divergente
    const lancamentoIndex = lancamentosRestantes.findIndex(lancamento => {
      // Verificar correspondência em data e descrição
      const dataCorresponde = Math.abs(
        new Date(transacao.data).getTime() - new Date(lancamento.data).getTime()
      ) <= config.maxDiasRetroativos * 24 * 60 * 60 * 1000;
      
      const descricaoCorresponde = verificarCorrespondenciaDescricao(
        transacao.descricao,
        lancamento.descricao
      );
      
      // Verificar diferença de valor dentro da tolerância
      const diferencaValor = Math.abs(transacao.valor - lancamento.valor) / Math.max(transacao.valor, lancamento.valor);
      const valorDentroTolerancia = diferencaValor <= config.toleranciaDivergencia;
      
      // Tipos compatíveis
      const tipoCompativel = 
        (transacao.tipo === 'credito' && lancamento.tipo === 'receita') || 
        (transacao.tipo === 'debito' && lancamento.tipo === 'despesa');
      
      return dataCorresponde && descricaoCorresponde && valorDentroTolerancia && tipoCompativel;
    });
    
    if (lancamentoIndex >= 0) {
      const lancamento = lancamentosRestantes[lancamentoIndex];
      
      // Corrigir o valor do lançamento para corresponder à transação
      const lancamentoCorrigido: Lancamento = {
        ...lancamento,
        valor: transacao.valor,
        // Adicionar marcação de que foi corrigido automaticamente
        observacoes: `${lancamento.observacoes || ''} [Valor corrigido automaticamente de ${lancamento.valor} para ${transacao.valor}]`.trim()
      };
      
      // Adicionar aos resultados
      lancamentosCorrigidos.push(lancamentoCorrigido);
      
      conciliacoes.push({
        transacao,
        lancamento: lancamentoCorrigido,
        score: 0.9, // Score alto pois foi reconciliado após correção
        conciliacaoAutomatica: true,
        dataReconciliacao: new Date().toISOString()
      });
      
      // Remover itens processados
      transacoesRestantes.splice(i, 1);
      lancamentosRestantes.splice(lancamentoIndex, 1);
      divergenciasCorrigidas++;
    }
  }
  
  return {
    lancamentosRestantes,
    lancamentosCorrigidos,
    transacoesRestantes,
    conciliacoes,
    divergenciasCorrigidas
  };
}

/**
 * Filtra transações internas que não devem ser reconciliadas
 */
function filtrarTransacoesInternas(
  transacoes: TransacaoBancaria[],
  config: ConfiguracaoResolucao
): {
  transacoesRestantes: TransacaoBancaria[];
  transacoesIgnoradas: TransacaoBancaria[];
} {
  const transacoesIgnoradas: TransacaoBancaria[] = [];
  const transacoesRestantes: TransacaoBancaria[] = [];
  
  // Expressões regulares para identificar transações internas
  const expressoesTipoInterno = [
    /transf(.|erencia|erir) entre contas/i,
    /transferencia\s+propria/i,
    /transferencia\s+mesma\s+titularidade/i,
    /tarifa\s+bancaria/i,
    /tarifa\s+pacote/i,
    /taxa\s+manutencao/i,
    /rendimento/i,
    /saque\s+proprio/i,
  ];
  
  transacoes.forEach(transacao => {
    const descricao = transacao.descricao.toLowerCase();
    
    // Verificar se a descrição corresponde a alguma das expressões de transações internas
    const ehTransacaoInterna = expressoesTipoInterno.some(regex => regex.test(descricao));
    
    if (ehTransacaoInterna) {
      transacoesIgnoradas.push(transacao);
    } else {
      transacoesRestantes.push(transacao);
    }
  });
  
  return { transacoesRestantes, transacoesIgnoradas };
}

/**
 * Cria lançamentos automaticamente para transações não conciliadas
 */
async function criarLancamentosAutomaticamente(
  transacoes: TransacaoBancaria[],
  config: ConfiguracaoResolucao
): Promise<{
  lancamentosCriados: Lancamento[];
  transacoesProcessadas: TransacaoBancaria[];
}> {
  const lancamentosCriados: Lancamento[] = [];
  const transacoesProcessadas: TransacaoBancaria[] = [];
  
  // Criar lançamentos com base nas transações
  for (const transacao of transacoes) {
    // Criar um lançamento básico
    const novoLancamento: Lancamento = {
      id: `auto_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      data: transacao.data,
      valor: transacao.valor,
      descricao: transacao.descricao,
      tipo: transacao.tipo === 'credito' ? 'receita' : 'despesa',
      categoria: transacao.categoria || (transacao.tipo === 'credito' ? 'Receitas Diversas' : 'Despesas Diversas'),
      contraparte: transacao.contraparte || "",
      status: 'classificado',
      confianca: 0.7,
      observacoes: 'Lançamento criado automaticamente pela reconciliação bancária'
    };
    
    // Tentar classificar melhor o lançamento usando o processamento avançado
    try {
      const resultado = await processarLancamentosAvancados([novoLancamento]);
      
      if (resultado.lancamentosProcessados.length > 0) {
        // Usar o lançamento processado com categoria e classificação melhoradas
        const lancamentoProcessado = resultado.lancamentosProcessados[0];
        
        // Verificar se a confiança é suficiente para usar a classificação automática
        if (lancamentoProcessado.confianca && 
            lancamentoProcessado.confianca >= config.minimumConfidenceToResolve) {
          lancamentosCriados.push(lancamentoProcessado);
          transacoesProcessadas.push(transacao);
        } else {
          // Usar o lançamento original se a confiança for baixa
          lancamentosCriados.push(novoLancamento);
          transacoesProcessadas.push(transacao);
        }
      } else {
        // Fallback para o lançamento original
        lancamentosCriados.push(novoLancamento);
        transacoesProcessadas.push(transacao);
      }
    } catch (error) {
      console.error("Erro ao processar lançamento automático:", error);
      
      // Em caso de erro, usar o lançamento básico
      lancamentosCriados.push(novoLancamento);
      transacoesProcessadas.push(transacao);
    }
  }
  
  return { lancamentosCriados, transacoesProcessadas };
}

/**
 * Funções auxiliares
 */

// Verifica correspondência entre transação e lançamento
function verificarCorrespondencia(
  transacao: TransacaoBancaria,
  lancamento: Lancamento,
  config: ConfiguracaoResolucao
): boolean {
  // Verificar tipo (débito/crédito vs despesa/receita)
  const tipoCompativel = 
    (transacao.tipo === 'credito' && lancamento.tipo === 'receita') || 
    (transacao.tipo === 'debito' && lancamento.tipo === 'despesa');
  
  if (!tipoCompativel) return false;
  
  // Verificar data dentro do período retroativo configurado
  const diferencaDias = Math.abs(
    new Date(transacao.data).getTime() - new Date(lancamento.data).getTime()
  ) / (24 * 60 * 60 * 1000);
  
  if (diferencaDias > config.maxDiasRetroativos) return false;
  
  // Verificar valores iguais ou dentro da tolerância
  const diferencaValor = Math.abs(transacao.valor - lancamento.valor) / Math.max(transacao.valor, lancamento.valor);
  if (diferencaValor > config.toleranciaDivergencia) return false;
  
  // Verificar correspondência na descrição
  return verificarCorrespondenciaDescricao(transacao.descricao, lancamento.descricao);
}

// Verifica correspondência entre descrições
function verificarCorrespondenciaDescricao(descricao1: string, descricao2: string): boolean {
  const desc1 = descricao1.toLowerCase();
  const desc2 = descricao2.toLowerCase();
  
  // Verificar correspondência exata
  if (desc1 === desc2) return true;
  
  // Verificar se uma contém a outra
  if (desc1.includes(desc2) || desc2.includes(desc1)) return true;
  
  // Extrair palavras significativas (mais de 3 caracteres)
  const palavras1 = desc1.split(/\s+/).filter(p => p.length > 3);
  const palavras2 = desc2.split(/\s+/).filter(p => p.length > 3);
  
  // Verificar se há pelo menos 2 palavras em comum
  let palavrasComuns = 0;
  palavras1.forEach(p1 => {
    if (palavras2.some(p2 => p2.includes(p1) || p1.includes(p2))) {
      palavrasComuns++;
    }
  });
  
  return palavrasComuns >= 2;
}

// Calcula score de correspondência entre transação e lançamento
function calcularScoreCorrespondencia(
  transacao: TransacaoBancaria, 
  lancamento: Lancamento
): number {
  let score = 0;
  
  // Pontuação por correspondência de valor
  if (transacao.valor === lancamento.valor) {
    score += 0.4;
  } else {
    const diferencaPercent = Math.abs(transacao.valor - lancamento.valor) / Math.max(transacao.valor, lancamento.valor);
    if (diferencaPercent <= 0.01) { // 1% de diferença
      score += 0.35;
    } else if (diferencaPercent <= 0.05) { // 5% de diferença
      score += 0.25;
    }
  }
  
  // Pontuação por correspondência de data
  const diferencaDias = Math.abs(
    new Date(transacao.data).getTime() - new Date(lancamento.data).getTime()
  ) / (24 * 60 * 60 * 1000);
  
  if (diferencaDias === 0) {
    score += 0.3;
  } else if (diferencaDias <= 1) {
    score += 0.25;
  } else if (diferencaDias <= 3) {
    score += 0.15;
  } else if (diferencaDias <= 7) {
    score += 0.05;
  }
  
  // Pontuação por correspondência de descrição
  const desc1 = transacao.descricao.toLowerCase();
  const desc2 = lancamento.descricao.toLowerCase();
  
  if (desc1 === desc2) {
    score += 0.3;
  } else if (desc1.includes(desc2) || desc2.includes(desc1)) {
    score += 0.2;
  } else {
    // Verificar palavras em comum
    const palavras1 = desc1.split(/\s+/).filter(p => p.length > 3);
    const palavras2 = desc2.split(/\s+/).filter(p => p.length > 3);
    
    let palavrasComuns = 0;
    palavras1.forEach(p1 => {
      if (palavras2.some(p2 => p2.includes(p1) || p1.includes(p2))) {
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

// Agrupa lançamentos por características similares
function agruparLancamentosSimilares(lancamentos: Lancamento[]): Record<string, Lancamento[]> {
  const grupos: Record<string, Lancamento[]> = {};
  
  lancamentos.forEach(lancamento => {
    // Criar uma chave baseada nas características do lançamento
    // Formato: tipo_data_valorArredondado
    const data = lancamento.data;
    const valorArredondado = Math.round(lancamento.valor * 100) / 100;
    const chave = `${lancamento.tipo}_${data}_${valorArredondado}`;
    
    if (!grupos[chave]) {
      grupos[chave] = [];
    }
    
    grupos[chave].push(lancamento);
  });
  
  // Filtrar apenas grupos com mais de um lançamento (possíveis duplicatas)
  return Object.fromEntries(
    Object.entries(grupos).filter(([_, grupo]) => grupo.length > 1)
  );
}

// Remove lançamentos da lista
function removerLancamentos(lista: Lancamento[], lancamentosRemover: Lancamento[]): void {
  const idsRemover = new Set(lancamentosRemover.map(l => l.id));
  
  for (let i = lista.length - 1; i >= 0; i--) {
    if (idsRemover.has(lista[i].id)) {
      lista.splice(i, 1);
    }
  }
}

// Cria conciliações para lançamentos e transações correspondentes
function criarConciliacoesPara(
  lancamentos: Lancamento[], 
  transacoes: TransacaoBancaria[]
): ReconciliacaoItem[] {
  const conciliacoes: ReconciliacaoItem[] = [];
  
  // Assumindo que os arrays têm o mesmo tamanho e ordem correspondente
  const tamanho = Math.min(lancamentos.length, transacoes.length);
  
  for (let i = 0; i < tamanho; i++) {
    conciliacoes.push({
      lancamento: lancamentos[i],
      transacao: transacoes[i],
      score: calcularScoreCorrespondencia(transacoes[i], lancamentos[i]),
      conciliacaoAutomatica: true,
      dataReconciliacao: new Date().toISOString()
    });
  }
  
  return conciliacoes;
}
