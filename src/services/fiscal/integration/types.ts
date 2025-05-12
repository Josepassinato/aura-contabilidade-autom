
import { UF } from "@/services/governamental/estadualIntegration";
import { IntegracaoEstadualStatus } from "@/components/integracoes/IntegracaoStatus";

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
