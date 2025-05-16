
/**
 * Serviço para geração de DARFs e outros documentos de arrecadação
 */

import { toast } from "@/hooks/use-toast";
import { publicarEvento } from "./mensageria/eventoProcessor";

// Interface para documentos de arrecadação
export interface DocumentoArrecadacao {
  id: string;
  tipoDocumento: 'DARF' | 'DARF SIMPLES' | 'GPS' | 'DAS' | 'GARE' | 'FGTS';
  periodo: string;
  cnpj: string;
  codigoReceita: string;
  valorPrincipal: number;
  valorMulta?: number;
  valorJuros?: number;
  valorTotal: number;
  dataVencimento: string;
  dataEmissao: string;
  status: 'emitido' | 'pago' | 'cancelado' | 'vencido';
  codigoBarras?: string;
  referencia?: string;
}

// Repositório simulado de documentos
const documentosGerados: DocumentoArrecadacao[] = [];

/**
 * Gera um novo documento de arrecadação 
 */
export const gerarDocumentoArrecadacao = async (
  tipo: DocumentoArrecadacao['tipoDocumento'],
  dados: Omit<DocumentoArrecadacao, 'id' | 'tipoDocumento' | 'dataEmissao' | 'status' | 'codigoBarras'>
): Promise<DocumentoArrecadacao> => {
  try {
    const id = `${tipo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Gera código de barras simulado
    const codigoBarras = gerarCodigoBarras(tipo, dados.valorTotal, dados.dataVencimento);
    
    const documento: DocumentoArrecadacao = {
      id,
      tipoDocumento: tipo,
      periodo: dados.periodo,
      cnpj: dados.cnpj,
      codigoReceita: dados.codigoReceita,
      valorPrincipal: dados.valorPrincipal,
      valorMulta: dados.valorMulta,
      valorJuros: dados.valorJuros,
      valorTotal: dados.valorTotal,
      dataVencimento: dados.dataVencimento,
      dataEmissao: new Date().toISOString().split('T')[0],
      status: 'emitido',
      codigoBarras,
      referencia: dados.referencia
    };
    
    // Adicionar ao repositório
    documentosGerados.push(documento);
    
    console.log(`Documento de arrecadação ${tipo} gerado:`, documento);
    
    // Notificar sobre o documento
    toast({
      title: `${tipo} Gerado`,
      description: `Documento de arrecadação no valor de R$ ${dados.valorTotal.toFixed(2)}.`
    });
    
    // Publicar evento fiscal.generated
    publicarEvento('fiscal.generated', {
      tipoImposto: tipo,
      codigoReceita: dados.codigoReceita,
      valor: dados.valorTotal,
      dataVencimento: dados.dataVencimento,
      periodo: dados.periodo,
      cnpj: dados.cnpj,
      codigoBarras: codigoBarras,
      contribuinte: "Empresa " + dados.cnpj
    });
    
    // Publicar evento guia.generated
    publicarEvento('guia.generated', {
      tipoImposto: tipo,
      valor: dados.valorTotal,
      dataVencimento: dados.dataVencimento,
      periodo: dados.periodo,
      cnpj: dados.cnpj,
      codigoBarras: codigoBarras
    });
    
    return documento;
  } catch (error) {
    console.error('Erro ao gerar documento de arrecadação:', error);
    throw error;
  }
};

/**
 * Busca documentos de arrecadação
 */
export const buscarDocumentos = (
  cnpj?: string,
  periodo?: string,
  tipo?: DocumentoArrecadacao['tipoDocumento']
): DocumentoArrecadacao[] => {
  let resultado = [...documentosGerados];
  
  if (cnpj) {
    resultado = resultado.filter(doc => doc.cnpj === cnpj);
  }
  
  if (periodo) {
    resultado = resultado.filter(doc => doc.periodo === periodo);
  }
  
  if (tipo) {
    resultado = resultado.filter(doc => doc.tipoDocumento === tipo);
  }
  
  return resultado;
};

/**
 * Gera código de barras simulado
 */
const gerarCodigoBarras = (
  tipoDocumento: DocumentoArrecadacao['tipoDocumento'],
  valor: number,
  dataVencimento: string
): string => {
  // Simulação de código de barras
  const valorFormatado = Math.floor(valor * 100)
    .toString()
    .padStart(8, '0');
  
  const dataVenc = dataVencimento.replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  
  switch (tipoDocumento) {
    case 'DARF':
    case 'DARF SIMPLES':
      return `85800000000-0 ${valorFormatado}-1 ${dataVenc.slice(0, 8)}-2 ${randomNum}-3`;
    case 'GPS':
      return `85900000000-9 ${valorFormatado}-2 ${dataVenc.slice(0, 8)}-3 ${randomNum}-4`;
    case 'DAS':
      return `85600000000-2 ${valorFormatado}-3 ${dataVenc.slice(0, 8)}-4 ${randomNum}-5`;
    default:
      return `84700000000-5 ${valorFormatado}-6 ${dataVenc.slice(0, 8)}-7 ${randomNum}-8`;
  }
};

/**
 * Atualiza status de um documento
 */
export const atualizarStatusDocumento = (
  documentoId: string,
  novoStatus: DocumentoArrecadacao['status']
): DocumentoArrecadacao | null => {
  const index = documentosGerados.findIndex(doc => doc.id === documentoId);
  
  if (index === -1) {
    return null;
  }
  
  documentosGerados[index].status = novoStatus;
  return documentosGerados[index];
};
