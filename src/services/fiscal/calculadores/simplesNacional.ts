
/**
 * Funções para cálculo do Simples Nacional
 */

import { ParametrosCalculo, ResultadoCalculo } from "../types";

export const calcularSimples = (params: ParametrosCalculo): ResultadoCalculo => {
  // Implementação simplificada do cálculo do Simples Nacional
  const { valor, cnpj } = params;
  
  // Em uma implementação real, buscaríamos a faixa e anexo do Simples
  // com base no CNPJ e faturamento acumulado
  const aliquota = 0.06; // Exemplo: 6% (varia conforme anexo e faixa)
  const deducao = 0;     // Valor de dedução conforme faixa
  
  const valorImposto = valor * aliquota - deducao;

  // Data de vencimento (dia 20 do mês seguinte)
  const dataPeriodo = new Date(params.periodo + '-01');
  const dataVencimento = new Date(dataPeriodo.getFullYear(), dataPeriodo.getMonth() + 1, 20);
  
  return {
    valorBase: valor,
    valorImposto,
    aliquotaEfetiva: valorImposto / valor,
    deducoes: deducao,
    valorFinal: valorImposto,
    dataVencimento: dataVencimento.toISOString().split('T')[0],
    codigoReceita: 'DAS'
  };
};
