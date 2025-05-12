
import { toast } from "@/hooks/use-toast";
import { DadosFaturamento } from "./types";
import { buscarNotasFiscais } from "./notasFiscaisService";

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
    console.log(`Iniciando busca de dados contábeis para CNPJ ${cnpj} no período ${periodo}`);
    
    // Em uma implementação real, aqui buscaríamos os dados de um sistema contábil integrado
    
    // Buscar notas fiscais para o período
    const notasFiscais = await buscarNotasFiscais(cnpj, periodo);
    
    // Retornar estrutura básica com os dados disponíveis
    return {
      periodo,
      receitas: {},
      despesas: {},
      notasFiscais,
      totalReceitas: 0,
      totalDespesas: 0
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
