
/**
 * Integração com fontes de dados para cálculos fiscais
 * Implementa funções para obtenção de dados de diversas fontes como
 * sistemas de NFe, ERP, contabilidade e outros
 */

import { toast } from "@/hooks/use-toast";
import { TipoImposto } from "./calculoFiscal";
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoEstadualStatus } from "@/components/integracoes/IntegracaoStatus";
import { getDefaultIntegracoes } from "@/components/integracoes/constants";

// Interface para metadados de notas fiscais
export interface NotaFiscalMetadata {
  numero: string;
  serie: string;
  dataEmissao: string;
  valorTotal: number;
  chaveAcesso?: string;
  cliente: {
    nome: string;
    cnpj: string;
    uf: UF;
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    cfop: string;
    ncm: string;
  }>;
  impostos: Record<string, number>;
}

// Interface para dados de faturamento
export interface DadosFaturamento {
  periodo: string; // formato YYYY-MM
  receitas: Record<string, number>; // categoria: valor
  despesas: Record<string, number>; // categoria: valor
  notasFiscais: NotaFiscalMetadata[];
  totalReceitas: number;
  totalDespesas: number;
}

// Interface para configuração de fonte de dados
export interface FonteDadosConfig {
  tipo: 'erp' | 'contabilidade' | 'nfe' | 'manual';
  credenciais?: Record<string, string>;
  endpointUrl?: string;
  periodoInicial?: string;
  periodoFinal?: string;
  cnpj?: string;
}

/**
 * Verifica se há integrações estaduais configuradas
 * @param cnpj CNPJ da empresa
 * @returns Lista de integrações estaduais configuradas
 */
export const obterIntegracoesConfiguradasPorCNPJ = async (cnpj: string): Promise<IntegracaoEstadualStatus[]> => {
  try {
    // Em uma implementação real, aqui buscaríamos as integrações configuradas
    // para o CNPJ específico em uma base de dados
    
    // Simulação para desenvolvimento
    console.log(`Buscando integrações para CNPJ: ${cnpj}`);
    
    // Para fins de demonstração, se o CNPJ terminar com 0001, consideramos que há integrações
    if (cnpj.endsWith('0001')) {
      // Cliente com integrações simuladas
      return Promise.resolve([
        {
          id: "sefaz_sp",
          nome: "SEFAZ-SP",
          uf: "SP",
          status: 'conectado',
          ultimoAcesso: "10/05/2025 15:30",
          proximaRenovacao: "10/06/2025",
        },
        {
          id: "sefaz_rj",
          nome: "SEFAZ-RJ",
          uf: "RJ",
          status: 'conectado',
          ultimoAcesso: "11/05/2025 16:45",
          proximaRenovacao: "11/06/2025",
        }
      ]);
    }
    
    // Caso contrário, retorna integrações padrão desconectadas
    return Promise.resolve(getDefaultIntegracoes());
    
  } catch (error) {
    console.error('Erro ao obter integrações configuradas:', error);
    toast({
      title: "Erro na verificação de integrações",
      description: "Não foi possível verificar as integrações estaduais configuradas",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Busca notas fiscais de uma empresa em um período
 * @param cnpj CNPJ da empresa
 * @param periodo Período no formato YYYY-MM
 * @param uf UF opcional para filtrar por estado
 * @returns Lista de metadados de notas fiscais
 */
export const buscarNotasFiscais = async (
  cnpj: string,
  periodo: string,
  uf?: UF
): Promise<NotaFiscalMetadata[]> => {
  try {
    console.log(`Buscando NFs para CNPJ ${cnpj} no período ${periodo}${uf ? ` e UF ${uf}` : ''}`);
    
    // Verificar integrações disponíveis
    const integracoes = await obterIntegracoesConfiguradasPorCNPJ(cnpj);
    
    if (!integracoes.some(i => i.status === 'conectado')) {
      throw new Error("Não há integrações ativas com SEFAZs para buscar notas fiscais");
    }
    
    // Em uma implementação real, aqui faríamos requisições para as APIs
    // das SEFAZs ou sistemas integrados usando as credenciais armazenadas
    
    // Simulação para desenvolvimento
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulando delay de rede
    
    // Simulação de notas fiscais (entre 5 e 15 notas para o período)
    const quantidade = Math.floor(Math.random() * 10) + 5;
    const notas: NotaFiscalMetadata[] = [];
    
    const [ano, mes] = periodo.split('-');
    const diasNoMes = new Date(Number(ano), Number(mes), 0).getDate();
    
    for (let i = 0; i < quantidade; i++) {
      // Gerar data aleatória dentro do período
      const dia = Math.floor(Math.random() * diasNoMes) + 1;
      const dataEmissao = `${ano}-${mes}-${String(dia).padStart(2, '0')}`;
      
      // Valor aleatório entre R$ 100 e R$ 10.000
      const valorTotal = Math.random() * 9900 + 100;
      
      const nota: NotaFiscalMetadata = {
        numero: `${Math.floor(Math.random() * 100000) + 1000}`,
        serie: `${Math.floor(Math.random() * 3) + 1}`,
        dataEmissao,
        valorTotal,
        chaveAcesso: `${Math.floor(Math.random() * 10**44)}`,
        cliente: {
          nome: `Cliente ${i + 1}`,
          cnpj: `${Math.floor(Math.random() * 10**14)}`.padStart(14, '0'),
          uf: uf || (["SP", "RJ", "MG", "PR", "RS"] as UF[])[Math.floor(Math.random() * 5)]
        },
        itens: Array(Math.floor(Math.random() * 5) + 1).fill(0).map((_, j) => {
          const valorUnitario = Math.random() * 1000 + 50;
          const quantidade = Math.floor(Math.random() * 10) + 1;
          return {
            codigo: `PROD${j + 1}`,
            descricao: `Produto ${j + 1}`,
            quantidade,
            valorUnitario,
            valorTotal: valorUnitario * quantidade,
            cfop: `5${Math.floor(Math.random() * 900) + 100}`,
            ncm: `${Math.floor(Math.random() * 10**8)}`.padStart(8, '0')
          };
        }),
        impostos: {
          ICMS: valorTotal * 0.18,
          PIS: valorTotal * 0.0165,
          COFINS: valorTotal * 0.076,
          IPI: valorTotal * 0.05
        }
      };
      
      notas.push(nota);
    }
    
    return notas;
    
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    toast({
      title: "Erro na busca de notas fiscais",
      description: error instanceof Error ? error.message : "Não foi possível obter os dados de notas fiscais",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Busca dados contábeis de uma empresa em um período
 * @param cnpj CNPJ da empresa
 * @param periodo Período no formato YYYY-MM
 * @returns Dados de faturamento para o período
 */
export const buscarDadosContabeis = async (
  cnpj: string,
  periodo: string
): Promise<DadosFaturamento> => {
  try {
    console.log(`Buscando dados contábeis para CNPJ ${cnpj} no período ${periodo}`);
    
    // Em uma implementação real, aqui buscaríamos os dados de um sistema contábil integrado
    
    // Simulação para desenvolvimento
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulando delay de rede
    
    // Buscar notas fiscais para o período
    const notasFiscais = await buscarNotasFiscais(cnpj, periodo);
    
    // Calcular total de receitas a partir das notas
    const totalReceitas = notasFiscais.reduce((sum, nota) => sum + nota.valorTotal, 0);
    
    // Simular categorias de receitas
    const receitas: Record<string, number> = {
      "Venda de Produtos": totalReceitas * 0.7,
      "Prestação de Serviços": totalReceitas * 0.25,
      "Outras Receitas": totalReceitas * 0.05
    };
    
    // Simular despesas como percentual das receitas
    const totalDespesas = totalReceitas * (Math.random() * 0.4 + 0.3); // 30% a 70% das receitas
    
    const despesas: Record<string, number> = {
      "Folha de Pagamento": totalDespesas * 0.4,
      "Insumos": totalDespesas * 0.3,
      "Despesas Administrativas": totalDespesas * 0.15,
      "Despesas Comerciais": totalDespesas * 0.1,
      "Despesas Financeiras": totalDespesas * 0.05
    };
    
    return {
      periodo,
      receitas,
      despesas,
      notasFiscais,
      totalReceitas,
      totalDespesas
    };
    
  } catch (error) {
    console.error('Erro ao buscar dados contábeis:', error);
    toast({
      title: "Erro na busca de dados contábeis",
      description: error instanceof Error ? error.message : "Não foi possível obter os dados contábeis",
      variant: "destructive",
    });
    
    // Retornar estrutura vazia em caso de erro
    return {
      periodo,
      receitas: {},
      despesas: {},
      notasFiscais: [],
      totalReceitas: 0,
      totalDespesas: 0
    };
  }
};

/**
 * Configura fonte de dados para integração
 * @param config Configuração da fonte de dados
 * @returns Sucesso ou falha na configuração
 */
export const configurarFonteDados = async (config: FonteDadosConfig): Promise<boolean> => {
  try {
    console.log('Configurando fonte de dados:', config);
    
    // Em uma implementação real, aqui salvaríamos as configurações de integração
    // e testaríamos a conexão com a fonte de dados
    
    // Simulação para desenvolvimento
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulando delay de rede
    
    // Validações simuladas
    if (config.tipo === 'erp' && !config.endpointUrl) {
      throw new Error("URL do endpoint é obrigatória para integração com ERP");
    }
    
    if ((config.tipo === 'erp' || config.tipo === 'nfe') && !config.credenciais) {
      throw new Error(`Credenciais são obrigatórias para integração com ${config.tipo.toUpperCase()}`);
    }
    
    // Salvando configuração no localStorage para simulação
    localStorage.setItem(`fonte-dados-${config.tipo}`, JSON.stringify(config));
    
    toast({
      title: "Configuração salva",
      description: `Fonte de dados do tipo ${config.tipo} configurada com sucesso`
    });
    
    return true;
    
  } catch (error) {
    console.error('Erro ao configurar fonte de dados:', error);
    toast({
      title: "Erro na configuração da fonte de dados",
      description: error instanceof Error ? error.message : "Não foi possível configurar a fonte de dados",
      variant: "destructive",
    });
    return false;
  }
};
