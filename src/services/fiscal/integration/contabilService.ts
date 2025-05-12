
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
