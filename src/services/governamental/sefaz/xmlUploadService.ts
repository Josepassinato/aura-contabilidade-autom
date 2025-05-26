import { supabase } from "@/lib/supabase/client";

export interface UploadXmlParams {
  clientId: string;
  file: File;
  uf: string;
  tipoDocumento: string;
  descricao?: string;
}

export interface XmlUploadResult {
  success: boolean;
  data?: {
    id: string;
    fileName: string;
    processedData?: any;
  };
  error?: string;
}

/**
 * Faz upload e processamento manual de arquivo XML da SEFAZ
 */
export async function uploadSefazXmlManual(params: UploadXmlParams): Promise<XmlUploadResult> {
  try {
    console.log('Iniciando upload manual de XML:', params);

    // Validar se o cliente existe
    const { data: client, error: clientError } = await supabase
      .from('accounting_clients')
      .select('id, name, cnpj')
      .eq('id', params.clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Cliente não encontrado');
    }

    // Ler conteúdo do arquivo XML
    const xmlContent = await readFileContent(params.file);
    
    // Processar XML e extrair dados
    const processedData = await processXmlContent(xmlContent, params.uf, params.tipoDocumento);

    // Salvar registro do upload no banco
    const { data: uploadRecord, error: insertError } = await supabase
      .from('sefaz_xml_uploads')
      .insert({
        client_id: params.clientId,
        uf: params.uf,
        tipo_documento: params.tipoDocumento,
        nome_arquivo: params.file.name,
        tamanho_arquivo: params.file.size,
        conteudo_xml: xmlContent,
        dados_processados: processedData,
        descricao: params.descricao || null,
        status: 'processado',
        upload_manual: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao salvar upload:', insertError);
      throw new Error(`Erro ao salvar registro: ${insertError.message}`);
    }

    // Se for uma consulta de débitos, salvar na tabela específica
    if (params.tipoDocumento === 'consulta_debitos' && processedData.debitos) {
      await salvarDadosDebitos(params.clientId, params.uf, processedData.debitos);
    }

    // Se for guia de pagamento, salvar na tabela específica
    if (params.tipoDocumento === 'guia_pagamento' && processedData.guias) {
      await salvarDadosGuias(params.clientId, params.uf, processedData.guias);
    }

    console.log('Upload XML processado com sucesso:', uploadRecord);

    return {
      success: true,
      data: {
        id: uploadRecord.id,
        fileName: params.file.name,
        processedData
      }
    };

  } catch (error: any) {
    console.error('Erro no upload XML:', error);
    return {
      success: false,
      error: error.message || 'Erro no processamento do arquivo XML'
    };
  }
}

/**
 * Lê o conteúdo do arquivo como texto
 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Processa o conteúdo XML e extrai dados relevantes
 */
async function processXmlContent(
  xmlContent: string, 
  uf: string, 
  tipoDocumento: string
): Promise<any> {
  try {
    // Parse básico do XML (em produção usar uma biblioteca específica)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Verificar se houve erro no parse
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Arquivo XML inválido');
    }

    const processedData: any = {
      uf,
      tipoDocumento,
      dataProcessamento: new Date().toISOString()
    };

    // Processar conforme tipo de documento
    switch (tipoDocumento) {
      case 'consulta_debitos':
        processedData.debitos = extrairDadosDebitos(xmlDoc);
        break;
      
      case 'guia_pagamento':
        processedData.guias = extrairDadosGuias(xmlDoc);
        break;
      
      case 'declaracao':
        processedData.declaracao = extrairDadosDeclaracao(xmlDoc);
        break;
      
      case 'certidao_negativa':
        processedData.certidao = extrairDadosCertidao(xmlDoc);
        break;

      default:
        processedData.dados_genericos = extrairDadosGenericos(xmlDoc);
    }

    return processedData;
  } catch (error: any) {
    console.error('Erro ao processar XML:', error);
    throw new Error(`Erro no processamento: ${error.message}`);
  }
}

/**
 * Extrai dados de débitos do XML
 */
function extrairDadosDebitos(xmlDoc: Document): any[] {
  const debitos = [];
  
  // Procurar por elementos comuns de débitos
  const debitoElements = xmlDoc.querySelectorAll('debito, divida, obrigacao');
  
  debitoElements.forEach(element => {
    const debito = {
      numero: element.querySelector('numero, codigo')?.textContent || '',
      competencia: element.querySelector('competencia, periodo')?.textContent || '',
      valor: element.querySelector('valor, valorOriginal')?.textContent || '',
      vencimento: element.querySelector('vencimento, dataVencimento')?.textContent || '',
      situacao: element.querySelector('situacao, status')?.textContent || 'Pendente'
    };
    
    if (debito.numero || debito.valor) {
      debitos.push(debito);
    }
  });

  return debitos;
}

/**
 * Extrai dados de guias do XML
 */
function extrairDadosGuias(xmlDoc: Document): any[] {
  const guias = [];
  
  const guiaElements = xmlDoc.querySelectorAll('guia, documento');
  
  guiaElements.forEach(element => {
    const guia = {
      numero: element.querySelector('numero, numeroDocumento')?.textContent || '',
      competencia: element.querySelector('competencia, periodo')?.textContent || '',
      valor: element.querySelector('valor, valorPrincipal')?.textContent || '',
      vencimento: element.querySelector('vencimento, dataVencimento')?.textContent || '',
      codigoReceita: element.querySelector('codigoReceita, receita')?.textContent || ''
    };
    
    if (guia.numero || guia.valor) {
      guias.push(guia);
    }
  });

  return guias;
}

/**
 * Extrai dados de declaração do XML
 */
function extrairDadosDeclaracao(xmlDoc: Document): any {
  return {
    numero: xmlDoc.querySelector('numeroDeclaracao, numero')?.textContent || '',
    periodo: xmlDoc.querySelector('periodo, competencia')?.textContent || '',
    situacao: xmlDoc.querySelector('situacao, status')?.textContent || '',
    dataEntrega: xmlDoc.querySelector('dataEntrega, dataTransmissao')?.textContent || ''
  };
}

/**
 * Extrai dados de certidão do XML
 */
function extrairDadosCertidao(xmlDoc: Document): any {
  return {
    numero: xmlDoc.querySelector('numeroCertidao, numero')?.textContent || '',
    validade: xmlDoc.querySelector('validade, dataValidade')?.textContent || '',
    situacao: xmlDoc.querySelector('situacao, status')?.textContent || '',
    dataEmissao: xmlDoc.querySelector('dataEmissao, emissao')?.textContent || ''
  };
}

/**
 * Extrai dados genéricos do XML
 */
function extrairDadosGenericos(xmlDoc: Document): any {
  const dados: any = {};
  
  // Extrair elementos comuns
  const elementos = ['numero', 'data', 'valor', 'status', 'competencia', 'periodo'];
  
  elementos.forEach(elemento => {
    const value = xmlDoc.querySelector(elemento)?.textContent;
    if (value) {
      dados[elemento] = value;
    }
  });

  return dados;
}

/**
 * Salva dados de débitos na tabela específica
 */
async function salvarDadosDebitos(clientId: string, uf: string, debitos: any[]) {
  const dadosParaSalvar = debitos.map(debito => ({
    client_id: clientId,
    uf: uf,
    competencia: debito.competencia,
    numero_guia: debito.numero,
    valor: debito.valor,
    data_vencimento: debito.vencimento,
    status: debito.situacao || 'Pendente'
  }));

  const { error } = await supabase
    .from('sefaz_sp_scrapes')
    .insert(dadosParaSalvar);

  if (error) {
    console.error('Erro ao salvar débitos:', error);
  }
}

/**
 * Salva dados de guias na tabela específica
 */
async function salvarDadosGuias(clientId: string, uf: string, guias: any[]) {
  // Implementar conforme necessário
  console.log('Salvando guias:', { clientId, uf, guias });
}
