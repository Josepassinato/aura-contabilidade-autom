import { toast } from "@/hooks/use-toast";
import { UF } from "@/services/governamental/estadualIntegration";
import { NotaFiscalMetadata } from "./types";
import { obterIntegracoesConfiguradasPorCNPJ } from "./integracoesConfig";

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
    console.log(`Iniciando busca de NFs para CNPJ ${cnpj} no período ${periodo}${uf ? ` e UF ${uf}` : ''}`);
    
    // Verificar integrações disponíveis
    const integracoes = await obterIntegracoesConfiguradasPorCNPJ(cnpj);
    
    if (!integracoes.some(i => i.status === 'conectado')) {
      throw new Error("Não há integrações ativas com SEFAZs para buscar notas fiscais");
    }
    
    // Em produção, aqui faríamos requisições para as APIs
    // das SEFAZs ou sistemas integrados usando as credenciais armazenadas
    
    console.log('Busca de notas fiscais seria realizada aqui');
    return [];
    
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
