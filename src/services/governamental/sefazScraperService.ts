
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UF } from "./estadualIntegration";

interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
}

/**
 * Trigger the SEFAZ scraper for a specific client
 * @param clientId The ID of the client to scrape data for
 * @param uf The state code (UF) to scrape data from
 * @returns Promise with the scrape result
 */
export async function triggerSefazScrape(
  clientId: string,
  uf: UF = "SP"
): Promise<ScrapeResult> {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    console.log(`Triggering SEFAZ-${uf} scrape for client: ${clientId}`);

    const { data, error } = await supabase.functions.invoke("scrape-sefaz", {
      body: { clientId, uf },
    });

    if (error) {
      console.error("Error invoking scrape-sefaz function:", error);
      throw new Error(error.message || "Failed to start SEFAZ data scraping");
    }

    toast({
      title: "Coleta de dados iniciada",
      description: `O processo de coleta de dados da SEFAZ-${uf} foi iniciado com sucesso`,
    });

    return { 
      success: true, 
      data, 
      count: data?.count || 0 
    };
  } catch (error: any) {
    console.error("Error triggering SEFAZ scrape:", error);
    
    toast({
      title: "Erro ao iniciar coleta",
      description: error.message || `Não foi possível iniciar a coleta de dados da SEFAZ-${uf}`,
      variant: "destructive",
    });
    
    return { 
      success: false, 
      error: error.message || "Failed to trigger SEFAZ scrape"
    };
  }
}

/**
 * Interface for the SEFAZ scraped data structure
 */
export interface SefazScrapedData {
  id: string;
  client_id: string;
  competencia: string;
  numero_guia: string;
  valor: string;
  data_vencimento: string;
  status: string;
  scraped_at: string;
  uf?: string;
}

/**
 * Interface for the result returned by getSefazScrapedData function
 */
export interface SefazScrapedResult {
  success: boolean;
  data?: SefazScrapedData[];
  error?: string;
  count?: number;
}

/**
 * Get scraped SEFAZ data for a specific client
 * @param clientId The ID of the client to get data for
 * @param uf The state code (UF) to filter data by
 * @returns Promise with the scraped data
 */
export async function getSefazScrapedData(
  clientId: string, 
  uf: UF = "SP"
): Promise<SefazScrapedResult> {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    console.log(`Fetching SEFAZ-${uf} data for client: ${clientId}`);

    let query = supabase
      .from("sefaz_sp_scrapes")
      .select("*")
      .eq("client_id", clientId)
      .order("scraped_at", { ascending: false });
      
    // Se tiver o campo UF na tabela, filtra por ele
    // Como estamos usando uma tabela única para todos os estados por enquanto
    if (uf) {
      query = query.eq("uf", uf);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching SEFAZ scraped data:", error);
      throw error;
    }

    return { 
      success: true, 
      data: data as SefazScrapedData[]
    };
  } catch (error: any) {
    console.error("Error fetching SEFAZ scraped data:", error);
    return { 
      success: false, 
      error: error.message || `Failed to fetch SEFAZ-${uf} scraped data`
    };
  }
}

/**
 * Integração específica para o SEFAZ de Santa Catarina (SC)
 * Integra com o serviço Integra Contador do Serpro
 */
export interface SerproIntegraContadorConfig {
  certificadoDigital: string;
  senhaCertificado: string;
  procuracaoEletronica: boolean;
}

/**
 * Configuração para emissão de NFC-e em Santa Catarina
 */
export interface NfceScConfig {
  dtecUsuario: string;
  dtecSenha: string;
  tipoTTD: '706' | '707'; // Tipo de TTD (Tratamento Tributário Diferenciado)
  cscCodigo?: string;     // Código de Segurança do Contribuinte
  cscToken?: string;      // Token do CSC
}

/**
 * Verifica e configura integração com Integra Contador do Serpro para SC
 * @param clientId ID do cliente
 * @param config Configuração para integração com Serpro
 */
export async function configurarIntegraContadorSC(
  clientId: string,
  config: SerproIntegraContadorConfig
): Promise<ScrapeResult> {
  try {
    console.log(`Configurando Integra Contador para cliente ${clientId}`);
    
    // Verificar se o certificado digital é válido
    if (!config.certificadoDigital) {
      throw new Error("Certificado digital é obrigatório para integração com o Serpro");
    }
    
    // Validar se a procuração eletrônica está configurada
    if (!config.procuracaoEletronica) {
      toast({
        title: "Atenção",
        description: "É necessário obter a procuração eletrônica no portal e-CAC da Receita Federal",
        variant: "destructive",
      });
    }
    
    // Definir tipo de informação a ser armazenada para evitar recursão de tipos
    type CertificadoInfo = {
      integraContador: boolean;
      certificadoPresente: boolean;
      procuracaoConfigurada: boolean;
    };
    
    // Salvar configuração na tabela de integrações estaduais
    const { error } = await supabase
      .from('integracoes_estaduais')
      .upsert({
        client_id: clientId,
        uf: 'SC',
        nome: 'SEFAZ Santa Catarina',
        status: 'conectado',
        ultimo_acesso: new Date().toISOString(),
        certificado_info: {
          integraContador: true,
          certificadoPresente: !!config.certificadoDigital,
          procuracaoConfigurada: config.procuracaoEletronica
        } as CertificadoInfo
      });
      
    if (error) {
      throw new Error(`Erro ao salvar configuração: ${error.message}`);
    }
    
    toast({
      title: "Integração configurada",
      description: "Integração com Serpro Integra Contador configurada com sucesso",
    });
    
    return {
      success: true,
      data: {
        message: "Integração com Serpro Integra Contador configurada",
        integraContador: true
      }
    };
    
  } catch (error: any) {
    console.error("Erro ao configurar Integra Contador:", error);
    
    toast({
      title: "Erro na configuração",
      description: error.message || "Não foi possível configurar a integração com o Serpro",
      variant: "destructive",
    });
    
    return {
      success: false,
      error: error.message || "Falha ao configurar integração com Serpro"
    };
  }
}

/**
 * Configura acesso à NFC-e em Santa Catarina
 * @param clientId ID do cliente
 * @param config Configuração para NFC-e
 */
export async function configurarNfceSC(
  clientId: string,
  config: NfceScConfig
): Promise<ScrapeResult> {
  try {
    console.log(`Configurando acesso à NFC-e para cliente ${clientId}`);
    
    // Verificar configurações obrigatórias
    if (!config.dtecUsuario || !config.dtecSenha) {
      throw new Error("Usuário e senha do DTEC são obrigatórios para acesso à NFC-e");
    }
    
    if (!config.tipoTTD) {
      throw new Error("É necessário informar o tipo de TTD (706 ou 707)");
    }
    
    // Definir tipo de informação a ser armazenada para evitar recursão de tipos
    type NfceInfo = {
      nfce: boolean;
      dtecConfigurado: boolean;
      tipoTTD: string;
      cscConfigurado: boolean;
    };
    
    // Salvar configuração na base de dados
    const { error } = await supabase
      .from('integracoes_estaduais')
      .upsert({
        client_id: clientId,
        uf: 'SC',
        nome: 'SEFAZ Santa Catarina - NFC-e',
        status: 'conectado',
        ultimo_acesso: new Date().toISOString(),
        certificado_info: {
          nfce: true,
          dtecConfigurado: true,
          tipoTTD: config.tipoTTD,
          cscConfigurado: !!config.cscCodigo
        } as NfceInfo
      });
      
    if (error) {
      throw new Error(`Erro ao salvar configuração NFC-e: ${error.message}`);
    }
    
    toast({
      title: "NFC-e configurada",
      description: "Acesso à NFC-e de Santa Catarina configurado com sucesso",
    });
    
    return {
      success: true,
      data: {
        message: "Configuração de NFC-e realizada com sucesso",
        tipoTTD: config.tipoTTD
      }
    };
    
  } catch (error: any) {
    console.error("Erro ao configurar NFC-e em SC:", error);
    
    toast({
      title: "Erro na configuração de NFC-e",
      description: error.message || "Não foi possível configurar o acesso à NFC-e",
      variant: "destructive",
    });
    
    return {
      success: false,
      error: error.message || "Falha ao configurar NFC-e"
    };
  }
}
