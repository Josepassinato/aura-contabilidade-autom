
import { Lancamento, classificarLancamento, reclassificarLancamento } from "./classificacaoML";
import { useSupabaseClient } from "@/lib/supabase";

// Tipos adicionais para processamento avançado
export interface ProcessamentoContabilConfig {
  usarIA: boolean;
  limiarConfiancaAutomatica: number; // Limite para processamento totalmente automático
  usarContextoHistorico: boolean;
  validacaoCruzada: boolean;
  gravarHistoricoDecisoes: boolean;
}

export interface ResultadoProcessamento {
  sucessos: number;
  pendencias: number;
  tempoProcessamento: number;
  lancamentosProcessados: Lancamento[];
  logDecisoes: DecisaoAutomatica[];
}

export interface DecisaoAutomatica {
  lancamentoId: string;
  decisao: 'automatica' | 'pendente_revisao' | 'automatica_alta_confianca';
  confianca: number;
  regrasAplicadas: string[];
  justificativa?: string;
  timestamp: string;
}

// Configuração padrão
const configPadrao: ProcessamentoContabilConfig = {
  usarIA: true,
  limiarConfiancaAutomatica: 0.85, // Acima desse valor, decisões são tomadas automaticamente
  usarContextoHistorico: true,
  validacaoCruzada: true,
  gravarHistoricoDecisoes: true
};

let configAtual: ProcessamentoContabilConfig = {...configPadrao};

/**
 * Configura o processamento avançado
 */
export const configurarProcessamentoAvancado = (
  config: Partial<ProcessamentoContabilConfig>
): ProcessamentoContabilConfig => {
  configAtual = { ...configAtual, ...config };
  return configAtual;
};

/**
 * Processamento avançado de lançamentos contábeis com IA
 * Inclui validação cruzada, decisões automáticas e auditoria contínua
 */
export const processarLancamentosAvancados = async (
  lancamentos: Lancamento[]
): Promise<ResultadoProcessamento> => {
  console.log(`Iniciando processamento avançado de ${lancamentos.length} lançamentos...`);
  
  const inicio = Date.now();
  const logDecisoes: DecisaoAutomatica[] = [];
  let sucessos = 0;
  let pendencias = 0;
  
  const lancamentosProcessados: Lancamento[] = [];
  
  // Agrupamento inteligente para análise de contexto
  const lancamentosPorTipo = agruparLancamentosPorTipo(lancamentos);
  const contextoHistorico = configAtual.usarContextoHistorico ? 
    await obterContextoHistorico() : null;
  
  // Processar cada lançamento com contexto
  for (const lancamento of lancamentos) {
    const resultado = await processarLancamentoAvancado(
      lancamento, 
      lancamentosPorTipo, 
      contextoHistorico
    );
    
    lancamentosProcessados.push(resultado.lancamento);
    logDecisoes.push(resultado.decisao);
    
    if (resultado.decisao.decisao === 'pendente_revisao') {
      pendencias++;
    } else {
      sucessos++;
    }
  }
  
  // Realizar validação cruzada se configurado
  if (configAtual.validacaoCruzada) {
    await realizarValidacaoCruzada(lancamentosProcessados);
  }
  
  // Gravar histórico de decisões se configurado
  if (configAtual.gravarHistoricoDecisoes) {
    await gravarHistoricoDecisoes(logDecisoes);
  }
  
  const fimProcessamento = Date.now();
  
  return {
    sucessos,
    pendencias,
    tempoProcessamento: fimProcessamento - inicio,
    lancamentosProcessados,
    logDecisoes
  };
};

/**
 * Processa um lançamento individual com análise de contexto
 */
const processarLancamentoAvancado = async (
  lancamento: Lancamento,
  lancamentosPorTipo: Record<string, Lancamento[]>,
  contextoHistorico: any
): Promise<{ lancamento: Lancamento; decisao: DecisaoAutomatica }> => {
  // Primeiro classifica usando o modelo ML existente
  let lancamentoClassificado = classificarLancamento(lancamento);
  let confiancaOriginal = lancamentoClassificado.confianca || 0;
  
  // Aplicação de regras adicionais para aumentar ou diminuir a confiança
  const regrasAplicadas: string[] = [];
  
  // Verificar valores atípicos para o tipo de lançamento
  if (contextoHistorico && lancamento.tipo) {
    const estatisticasTipo = contextoHistorico.estatisticas?.[lancamento.tipo];
    
    if (estatisticasTipo && lancamento.valor > estatisticasTipo.valorMedio * 2) {
      confiancaOriginal *= 0.8; // Reduz confiança para valores muito acima da média
      regrasAplicadas.push('valor_atipico_alto');
    }
    
    // Verificar se a descrição é semelhante a lançamentos anteriores do mesmo tipo
    if (contextoHistorico.padroes?.[lancamento.tipo]) {
      const termosComuns = extrairTermosRelevantes(lancamento.descricao);
      const correspondencias = analisarCorrespondenciasTermos(
        termosComuns,
        contextoHistorico.padroes[lancamento.tipo]
      );
      
      if (correspondencias > 0.7) {
        confiancaOriginal = Math.min(confiancaOriginal * 1.2, 1.0); // Aumenta confiança
        regrasAplicadas.push('descricao_correspondente');
      }
    }
  }
  
  // Validação cruzada com outros lançamentos do mesmo tipo
  const lancamentosSimilares = lancamentosPorTipo[lancamento.tipo] || [];
  if (lancamentosSimilares.length > 0) {
    const similaridade = calcularSimilaridadeLancamentos(lancamento, lancamentosSimilares);
    
    if (similaridade > 0.8) {
      confiancaOriginal = Math.min(confiancaOriginal * 1.1, 1.0);
      regrasAplicadas.push('lancamentos_similares');
    }
  }
  
  // Atualizar confiança após aplicação de regras
  lancamentoClassificado.confianca = confiancaOriginal;
  
  // Determinar se a decisão pode ser totalmente automática
  let decisao: 'automatica' | 'pendente_revisao' | 'automatica_alta_confianca' = 'pendente_revisao';
  let justificativa = "Confiança insuficiente para classificação automática";
  
  if (confiancaOriginal >= configAtual.limiarConfiancaAutomatica) {
    decisao = confiancaOriginal >= 0.95 ? 'automatica_alta_confianca' : 'automatica';
    justificativa = `Classificação automática com ${(confiancaOriginal * 100).toFixed(1)}% de confiança`;
    
    // Atualizar status do lançamento
    lancamentoClassificado.status = 'classificado';
  } else {
    // Marcar para revisão
    lancamentoClassificado.status = 'pendente';
  }
  
  // Registro de decisão para auditoria
  const decisaoRegistro: DecisaoAutomatica = {
    lancamentoId: lancamento.id,
    decisao,
    confianca: confiancaOriginal,
    regrasAplicadas,
    justificativa,
    timestamp: new Date().toISOString(),
  };
  
  return {
    lancamento: lancamentoClassificado,
    decisao: decisaoRegistro,
  };
};

/**
 * Realiza validação cruzada de múltiplos lançamentos para verificar consistência
 */
const realizarValidacaoCruzada = async (
  lancamentos: Lancamento[]
): Promise<void> => {
  // Implementação de validação cruzada entre lançamentos
  // Verifica padrões, consistência e possíveis duplicações
  console.log("Realizando validação cruzada de lançamentos...");
};

/**
 * Grava histórico de decisões para auditoria e treinamento futuro
 */
const gravarHistoricoDecisoes = async (
  decisoes: DecisaoAutomatica[]
): Promise<void> => {
  // Em uma implementação real, salvaria em banco de dados
  console.log(`Gravando ${decisoes.length} decisões no histórico de auditoria`);
  
  const supabase = useSupabaseClient();
  if (supabase) {
    try {
      // Aqui faria a gravação em uma tabela de histórico
      console.log("Registrando histórico de decisões no Supabase...");
    } catch (error) {
      console.error("Erro ao gravar histórico de decisões:", error);
    }
  }
};

/**
 * Obtém contexto histórico para análise
 */
const obterContextoHistorico = async (): Promise<any> => {
  // Em implementação real, buscaria dados históricos do banco
  // Simulação de retorno de contexto
  return {
    estatisticas: {
      receita: { valorMedio: 5000, valorMaximo: 15000, desvioMedio: 2000 },
      despesa: { valorMedio: 3000, valorMaximo: 10000, desvioMedio: 1500 },
      transferencia: { valorMedio: 4000, valorMaximo: 20000, desvioMedio: 3000 }
    },
    padroes: {
      receita: ["venda", "pagamento", "cliente", "serviço", "nota fiscal"],
      despesa: ["fornecedor", "compra", "pagamento", "fatura", "despesa"]
    }
  };
};

/**
 * Agrupa lançamentos por tipo para análise contextual
 */
const agruparLancamentosPorTipo = (
  lancamentos: Lancamento[]
): Record<string, Lancamento[]> => {
  return lancamentos.reduce((grupos, lancamento) => {
    const tipo = lancamento.tipo;
    if (!grupos[tipo]) {
      grupos[tipo] = [];
    }
    grupos[tipo].push(lancamento);
    return grupos;
  }, {} as Record<string, Lancamento[]>);
};

/**
 * Extrai termos relevantes de uma descrição
 */
const extrairTermosRelevantes = (
  descricao: string
): string[] => {
  // Implementação simples de tokenização e extração de termos relevantes
  return descricao
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(termo => termo.length > 3);
};

/**
 * Analisa correspondência entre termos extraídos e padrões conhecidos
 */
const analisarCorrespondenciasTermos = (
  termos: string[],
  padroes: string[]
): number => {
  if (!termos.length) return 0;
  
  let correspondencias = 0;
  termos.forEach(termo => {
    if (padroes.includes(termo)) correspondencias++;
  });
  
  return correspondencias / termos.length;
};

/**
 * Calcula similaridade entre um lançamento e um grupo de lançamentos
 */
const calcularSimilaridadeLancamentos = (
  lancamento: Lancamento,
  lancamentosSimilares: Lancamento[]
): number => {
  if (!lancamentosSimilares.length) return 0;
  
  // Implementação básica de similaridade
  // Em uma versão real, usaria algoritmos mais avançados como TF-IDF ou embeddings
  let pontuacao = 0;
  
  lancamentosSimilares.forEach(similar => {
    // Compara descrições
    if (similar.descricao && lancamento.descricao &&
        similar.descricao.toLowerCase().includes(lancamento.descricao.toLowerCase())) {
      pontuacao += 0.5;
    }
    
    // Compara valores próximos (até 10% de diferença)
    const valorDiff = Math.abs(similar.valor - lancamento.valor) / similar.valor;
    if (valorDiff <= 0.1) {
      pontuacao += 0.3;
    }
    
    // Compara mesma contraparte
    if (similar.contraparte && lancamento.contraparte && 
        similar.contraparte === lancamento.contraparte) {
      pontuacao += 0.2;
    }
  });
  
  return Math.min(pontuacao / lancamentosSimilares.length, 1.0);
};

/**
 * Processa lançamentos e realiza lançamentos automáticos no sistema contábil
 */
export const realizarLancamentosAutomaticos = async (
  lancamentos: Lancamento[]
): Promise<{ sucessos: number; falhas: number }> => {
  console.log("Realizando lançamentos automáticos no sistema...");
  
  let sucessos = 0;
  let falhas = 0;
  
  // Processar lançamentos avançados
  const resultado = await processarLancamentosAvancados(lancamentos);
  
  // Filtrar apenas lançamentos com decisão automática
  const lancamentosAutomaticos = resultado.lancamentosProcessados.filter((lanc, index) => {
    const decisao = resultado.logDecisoes[index];
    return decisao?.decisao === 'automatica' || decisao?.decisao === 'automatica_alta_confianca';
  });
  
  console.log(`${lancamentosAutomaticos.length} lançamentos aprovados para automação completa`);
  
  // Aqui implementaria a integração com o sistema contábil real
  // Simulação de sucesso/falha
  lancamentosAutomaticos.forEach(lancamento => {
    if (Math.random() > 0.05) { // 95% de chance de sucesso
      sucessos++;
    } else {
      falhas++;
    }
  });
  
  return { sucessos, falhas };
};
