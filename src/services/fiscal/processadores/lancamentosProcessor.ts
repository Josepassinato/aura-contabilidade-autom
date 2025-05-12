
/**
 * Processador de lançamentos contábeis para cálculo de impostos
 */

import { toast } from "@/hooks/use-toast";
import { buscarDadosContabeis, DadosFaturamento } from "../dataSourcesIntegration";
import { TipoImposto, ResultadoCalculo } from "../types";
import { calcularImposto } from "../calculoFiscal";

/**
 * Calcula base de cálculo a partir de dados contábeis
 * @param dados Dados contábeis do período
 * @param tipoImposto Tipo de imposto para cálculo
 * @param regimeTributario Regime tributário da empresa
 * @returns Base de cálculo para o imposto específico
 */
export const calcularBaseContabil = (
  dados: DadosFaturamento, 
  tipoImposto: TipoImposto,
  regimeTributario: 'Simples' | 'LucroPresumido' | 'LucroReal'
): number => {
  const { totalReceitas, totalDespesas } = dados;
  
  // Base de cálculo específica para cada imposto e regime
  switch (tipoImposto) {
    case 'IRPJ':
      if (regimeTributario === 'LucroPresumido') {
        return totalReceitas * 0.32; // 32% de presunção para serviços em geral
      } else if (regimeTributario === 'LucroReal') {
        return Math.max(0, totalReceitas - totalDespesas);
      }
      return 0;
      
    case 'CSLL':
      if (regimeTributario === 'LucroPresumido') {
        return totalReceitas * 0.32; // 32% para CSLL em serviços
      } else if (regimeTributario === 'LucroReal') {
        return Math.max(0, totalReceitas - totalDespesas);
      }
      return 0;
      
    case 'PIS':
    case 'COFINS':
      if (regimeTributario === 'LucroPresumido') {
        return totalReceitas; // Base cheia no regime cumulativo
      } else if (regimeTributario === 'LucroReal') {
        // No regime não-cumulativo, poderia haver deduções específicas
        return totalReceitas;
      }
      return totalReceitas;
      
    default:
      return totalReceitas;
  }
};

/**
 * Calcula impostos de uma empresa com base em dados contábeis
 * @param cnpj CNPJ da empresa
 * @param periodo Período de apuração (YYYY-MM)
 * @param tipoImposto Tipo de imposto a ser calculado
 * @param regimeTributario Regime tributário da empresa
 * @returns Resultado do cálculo do imposto
 */
export const calcularImpostoPorDadosContabeis = async (
  cnpj: string,
  periodo: string,
  tipoImposto: TipoImposto,
  regimeTributario: 'Simples' | 'LucroPresumido' | 'LucroReal'
): Promise<ResultadoCalculo> => {
  try {
    // Buscar dados contábeis do período
    const dadosContabeis = await buscarDadosContabeis(cnpj, periodo);
    
    if (dadosContabeis.totalReceitas === 0) {
      throw new Error("Nenhum dado contábil encontrado para o período selecionado");
    }
    
    // Calcular base de acordo com o tipo de imposto e regime tributário
    const baseCalculo = calcularBaseContabil(dadosContabeis, tipoImposto, regimeTributario);
    
    // Configurar parâmetros para o cálculo
    const params = {
      valor: baseCalculo,
      periodo,
      cnpj,
      regimeTributario,
      // Informações adicionais dos dados contábeis
      receitaBruta: dadosContabeis.totalReceitas,
      despesasTotais: dadosContabeis.totalDespesas
    };
    
    // Realizar o cálculo do imposto
    const resultado = await calcularImposto(tipoImposto, params);
    
    // Adicionar informações sobre a origem dos dados
    return {
      ...resultado,
      dadosOrigem: {
        fonte: 'contabilidade',
        documentos: dadosContabeis.notasFiscais.length,
        consolidado: true
      }
    };
    
  } catch (error) {
    console.error(`Erro ao calcular ${tipoImposto} por dados contábeis:`, error);
    toast({
      title: `Erro no cálculo de ${tipoImposto}`,
      description: error instanceof Error ? error.message : "Ocorreu um erro no processamento dos dados contábeis",
      variant: "destructive",
    });
    throw error;
  }
};

/**
 * Função para integrar com lançamentos contábeis
 */
export const calcularImpostosPorLancamentos = async (
  cnpj: string,
  periodo: string,
  regimeTributario: 'Simples' | 'LucroPresumido' | 'LucroReal'
): Promise<Record<TipoImposto, ResultadoCalculo>> => {
  try {
    // Em uma implementação real, aqui buscaríamos os lançamentos contábeis do período
    // e calcularíamos os impostos baseados nos dados reais
    
    // Simulando lançamentos para demonstração
    const receitasBrutas = Math.random() * 500000 + 100000;
    const custos = receitasBrutas * (Math.random() * 0.4 + 0.1); // 10% a 50% da receita
    const despesasOperacionais = receitasBrutas * (Math.random() * 0.3 + 0.1); // 10% a 40% da receita
    const baseCalculo = regimeTributario === 'LucroReal' ? 
                       receitasBrutas - custos - despesasOperacionais : 
                       receitasBrutas;
    
    // Parâmetros base para os cálculos
    const parametrosBase = {
      valor: baseCalculo,
      periodo,
      cnpj,
      regimeTributario,
      receitasBrutas,
      custos,
      despesasOperacionais
    };
    
    // Calculando todos os impostos aplicáveis conforme regime tributário
    const resultados: Partial<Record<TipoImposto, ResultadoCalculo>> = {};
    
    if (regimeTributario === 'Simples') {
      resultados['Simples'] = await calcularImposto('Simples', { ...parametrosBase, valor: receitasBrutas });
    } else {
      // Para Lucro Presumido ou Real
      const impostos: TipoImposto[] = ['IRPJ', 'CSLL', 'PIS', 'COFINS'];
      
      for (const imposto of impostos) {
        resultados[imposto] = await calcularImposto(imposto, parametrosBase);
      }
    }
    
    // Se tiver folha de pagamento, calcula INSS e FGTS
    if (Math.random() > 0.3) { // Simulando que tem folha de pagamento
      const valorFolha = receitasBrutas * (Math.random() * 0.2 + 0.05); // 5% a 25% da receita
      
      resultados['INSS'] = await calcularImposto('INSS', { 
        ...parametrosBase, 
        valor: valorFolha
      });
      
      resultados['FGTS'] = await calcularImposto('FGTS', { 
        ...parametrosBase, 
        valor: valorFolha
      });
    }
    
    return resultados as Record<TipoImposto, ResultadoCalculo>;
    
  } catch (error) {
    console.error(`Erro ao calcular impostos por lançamentos:`, error);
    toast({
      title: "Erro no cálculo por lançamentos",
      description: error instanceof Error ? error.message : "Ocorreu um erro no processamento dos lançamentos",
      variant: "destructive",
    });
    throw error;
  }
};
