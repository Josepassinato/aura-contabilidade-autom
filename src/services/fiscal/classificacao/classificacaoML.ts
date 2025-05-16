
/**
 * Serviço de classificação baseado em Machine Learning
 * Simula o comportamento de um modelo ML treinado para classificação de lançamentos
 */

import { toast } from "@/hooks/use-toast";

// Definição de tipos para lançamentos
export interface Lancamento {
  id: string;
  data: string;
  valor: number;
  descricao: string;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria?: string;
  subcategoria?: string;
  contraparte?: string;
  documentoContraparte?: string;
  notaFiscal?: string;
  comprovante?: string;
  status?: 'classificado' | 'nao_classificado' | 'reconciliado' | 'pendente';
  confianca?: number;
}

// Configuração do modelo de ML
export interface ModeloMLConfig {
  limiarConfianca: number;
  usarHistorico: boolean;
  categoriasPadrao: string[];
  modeloAtivo: 'basico' | 'avancado' | 'personalizado';
  versaoModelo: string;
}

// Configuração padrão do modelo
const configPadrao: ModeloMLConfig = {
  limiarConfianca: 0.7,
  usarHistorico: true,
  categoriasPadrao: [
    'Vendas', 'Prestação de Serviços', 'Rendimentos', 
    'Fornecedores', 'Folha de Pagamento', 'Impostos e Tributos',
    'Aluguel', 'Utilidades', 'Despesas Financeiras', 'Outros'
  ],
  modeloAtivo: 'basico',
  versaoModelo: '1.0.0'
};

// Estado do modelo
let modeloConfig: ModeloMLConfig = {...configPadrao};
let historicoTreinamento: Lancamento[] = [];
let modeloTreinado = false;

/**
 * Configura o modelo de classificação
 */
export const configurarModelo = (config: Partial<ModeloMLConfig>): void => {
  modeloConfig = { ...modeloConfig, ...config };
  console.log("Modelo ML configurado:", modeloConfig);
};

/**
 * Adiciona dados ao histórico de treinamento
 */
export const adicionarHistoricoTreinamento = (lancamentos: Lancamento[]): void => {
  const lancamentosClassificados = lancamentos.filter(l => l.categoria);
  historicoTreinamento = [...historicoTreinamento, ...lancamentosClassificados];
  
  console.log(`${lancamentosClassificados.length} lançamentos adicionados ao histórico de treinamento.`);
  
  // Simula retreino do modelo se houver suficientes exemplos
  if (historicoTreinamento.length > 100 && !modeloTreinado) {
    treinarModelo();
  }
};

/**
 * Simula o treinamento do modelo
 */
export const treinarModelo = async (): Promise<boolean> => {
  console.log("Iniciando treinamento do modelo ML...");
  
  try {
    // Simula o tempo de treinamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    modeloTreinado = true;
    
    toast({
      title: "Modelo ML treinado com sucesso",
      description: `Treinado com ${historicoTreinamento.length} exemplos. Precisão estimada: ${Math.min(90, 70 + historicoTreinamento.length/100).toFixed(1)}%`,
    });
    
    return true;
    
  } catch (error) {
    console.error("Erro ao treinar modelo:", error);
    toast({
      title: "Erro ao treinar modelo",
      description: "Ocorreu um erro durante o treinamento do modelo de classificação",
      variant: "destructive",
    });
    
    return false;
  }
};

/**
 * Classifica um lançamento usando o modelo ML simulado
 */
export const classificarLancamento = (lancamento: Lancamento): Lancamento => {
  // Se o modelo não estiver treinado, usa regras básicas
  const isModeloTreinado = modeloTreinado || historicoTreinamento.length > 50;
  
  // Extrai termos da descrição
  const termos = lancamento.descricao.toLowerCase().split(' ');
  
  // Cópia do lançamento para não modificar o original
  const lancamentoClassificado = { ...lancamento };
  
  // Mapeamento de palavras-chave para categorias (regras básicas)
  const regras = {
    'receita': {
      'venda': 'Vendas',
      'vendas': 'Vendas',
      'pagamento': 'Vendas',
      'cliente': 'Vendas',
      'nota fiscal': 'Vendas',
      'nf': 'Vendas',
      'servico': 'Prestação de Serviços',
      'serviços': 'Prestação de Serviços',
      'consulta': 'Prestação de Serviços',
      'consultoria': 'Prestação de Serviços',
      'honorários': 'Prestação de Serviços',
      'rendimento': 'Rendimentos',
      'juros': 'Rendimentos',
      'dividendo': 'Rendimentos',
    },
    'despesa': {
      'fornecedor': 'Fornecedores',
      'compra': 'Fornecedores',
      'material': 'Fornecedores',
      'salario': 'Folha de Pagamento',
      'salário': 'Folha de Pagamento',
      'folha': 'Folha de Pagamento',
      'funcionário': 'Folha de Pagamento',
      'funcionario': 'Folha de Pagamento',
      'imposto': 'Impostos e Tributos',
      'tributo': 'Impostos e Tributos',
      'darf': 'Impostos e Tributos',
      'das': 'Impostos e Tributos',
      'inss': 'Impostos e Tributos',
      'fgts': 'Impostos e Tributos',
      'irpj': 'Impostos e Tributos',
      'pis': 'Impostos e Tributos',
      'cofins': 'Impostos e Tributos',
      'csll': 'Impostos e Tributos',
      'iss': 'Impostos e Tributos',
      'icms': 'Impostos e Tributos',
      'ipi': 'Impostos e Tributos',
      'aluguel': 'Aluguel',
      'locação': 'Aluguel',
      'energia': 'Utilidades',
      'água': 'Utilidades',
      'agua': 'Utilidades',
      'luz': 'Utilidades',
      'telefone': 'Utilidades',
      'internet': 'Utilidades',
      'juros': 'Despesas Financeiras',
      'taxa': 'Despesas Financeiras',
      'tarifa': 'Despesas Financeiras',
      'bancária': 'Despesas Financeiras',
      'bancaria': 'Despesas Financeiras',
      'banco': 'Despesas Financeiras',
    }
  };
  
  let categoria = '';
  let confianca = 0;
  
  // Aplica regras simples 
  const regrasCategoria = regras[lancamento.tipo] || {};
  for (const termo of termos) {
    if (regrasCategoria[termo]) {
      categoria = regrasCategoria[termo];
      confianca = isModeloTreinado ? 0.85 : 0.65;
      break;
    }
  }
  
  // Se não encontrou pela regra básica e tem histórico de treinamento,
  // simula a classificação baseada em histórico com ML
  if (!categoria && historicoTreinamento.length > 0) {
    // Simulação simplificada: busca descrições similares no histórico
    const historicoPorTipo = historicoTreinamento.filter(h => h.tipo === lancamento.tipo);
    
    if (historicoPorTipo.length > 0) {
      // Encontra entrada mais similar por descrição
      const similar = historicoPorTipo.find(h => 
        termos.some(termo => h.descricao.toLowerCase().includes(termo))
      );
      
      if (similar) {
        categoria = similar.categoria || '';
        // Confiança maior se o modelo foi treinado
        confianca = isModeloTreinado ? 0.75 : 0.6;
      }
    }
  }
  
  // Se ainda não classificou, usa categoria genérica
  if (!categoria) {
    categoria = lancamento.tipo === 'receita' ? 'Vendas' : 'Outros';
    confianca = 0.3; // Baixa confiança
  }
  
  // Atualiza o lançamento com a classificação
  lancamentoClassificado.categoria = categoria;
  lancamentoClassificado.confianca = confianca;
  lancamentoClassificado.status = confianca > modeloConfig.limiarConfianca ? 'classificado' : 'pendente';
  
  return lancamentoClassificado;
};

/**
 * Classifica um lote de lançamentos
 */
export const classificarLancamentos = (lancamentos: Lancamento[]): Lancamento[] => {
  console.log(`Classificando lote de ${lancamentos.length} lançamentos...`);
  
  return lancamentos.map(lancamento => classificarLancamento(lancamento));
};

/**
 * Reclassifica manualmente um lançamento e adiciona ao histórico de treinamento
 */
export const reclassificarLancamento = (
  lancamento: Lancamento, 
  novaCategoria: string, 
  adicionarAoHistorico: boolean = true
): Lancamento => {
  const lancamentoAtualizado = { 
    ...lancamento, 
    categoria: novaCategoria,
    confianca: 1, // Confiança máxima para classificação manual
    status: 'classificado'
  };
  
  if (adicionarAoHistorico) {
    adicionarHistoricoTreinamento([lancamentoAtualizado]);
  }
  
  return lancamentoAtualizado;
};

/**
 * Obter estatísticas do modelo de classificação
 */
export const obterEstatisticasModelo = () => {
  const totalHistorico = historicoTreinamento.length;
  
  return {
    modeloTreinado,
    totalExemplos: totalHistorico,
    totalCategorias: new Set(historicoTreinamento.map(l => l.categoria)).size,
    precisaoEstimada: Math.min(95, 70 + totalHistorico/50),
    versaoModelo: modeloConfig.versaoModelo,
    categorias: modeloConfig.categoriasPadrao,
    tipoModelo: modeloConfig.modeloAtivo
  };
};
