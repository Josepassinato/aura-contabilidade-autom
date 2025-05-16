
/**
 * Serviço para geração de DARFs e outros documentos de arrecadação
 */

import { v4 as uuidv4 } from "uuid";
import { publicarEvento } from "./mensageria/eventoProcessor";
import { TipoImposto, ResultadoCalculo, DocumentoArrecadacao } from "./types";

/**
 * Gera um documento de arrecadação (DARF, GPS, DAS, etc)
 */
export const gerarDocumentoArrecadacao = async (
  tipo: "DARF" | "GPS" | "DAS" | "GARE",
  params: {
    cnpj: string;
    periodo: string;
    codigoReceita: string;
    valorPrincipal: number;
    valorJuros?: number;
    valorMulta?: number;
    valorTotal: number;
    dataVencimento: string;
    referencia: string;
  }
): Promise<DocumentoArrecadacao> => {
  try {
    console.log(`Gerando ${tipo} para ${params.cnpj} - período ${params.periodo}`);
    
    // Gerar código de barras simulado
    const randomCode = Math.floor(10000000000 + Math.random() * 90000000000);
    const codigoBarras = `85810000${randomCode}-5 ${randomCode % 1000}0065${randomCode % 1000}-1 ${params.dataVencimento.replace(/-/g, "")}2-6 ${params.cnpj.substring(0,8)}55-9`;
    
    // Linha digitável é uma versão formatada do código de barras
    const linhaDigitavel = codigoBarras.replace(/-/g, '');
    
    const documento: DocumentoArrecadacao = {
      id: uuidv4(),
      tipo,
      cnpj: params.cnpj,
      periodo: params.periodo,
      codigoReceita: params.codigoReceita,
      valorPrincipal: params.valorPrincipal,
      valorJuros: params.valorJuros || 0,
      valorMulta: params.valorMulta || 0,
      valorTotal: params.valorTotal,
      dataVencimento: params.dataVencimento,
      referencia: params.referencia,
      codigoBarras,
      linhaDigitavel,
      geradoEm: new Date().toISOString()
    };
    
    // Publicar evento de guia gerada
    await publicarEvento('guia.generated', {
      tipoDocumento: tipo,
      cnpj: params.cnpj,
      periodo: params.periodo,
      codigoReceita: params.codigoReceita,
      valor: params.valorTotal,
      dataVencimento: params.dataVencimento,
      codigoBarras
    });
    
    return documento;
  } catch (error) {
    console.error(`Erro ao gerar ${tipo}:`, error);
    throw new Error(`Falha ao gerar ${tipo}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

/**
 * Gera um documento DARF a partir de um resultado de cálculo
 */
export const gerarDARF = async (
  tipoImposto: TipoImposto, 
  resultado: ResultadoCalculo,
  cnpj: string
): Promise<string> => {
  try {
    const documento = await gerarDocumentoArrecadacao("DARF", {
      cnpj: cnpj || resultado.cnpj,
      periodo: resultado.periodo,
      codigoReceita: resultado.codigoReceita || "0000",
      valorPrincipal: resultado.valorFinal,
      valorJuros: 0,
      valorMulta: 0,
      valorTotal: resultado.valorFinal,
      dataVencimento: resultado.dataVencimento,
      referencia: `${tipoImposto} - ${resultado.periodo}`
    });
    
    // Retornar o código de barras para pagamento
    return documento.codigoBarras || "";
  } catch (error) {
    console.error("Erro ao gerar DARF:", error);
    throw new Error(`Falha ao gerar DARF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
