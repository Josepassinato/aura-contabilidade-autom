
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ScrapeResult, SerproIntegraContadorConfig, NfceScConfig } from "./types";
import { uploadProcuracaoDocument } from "../procuracaoService/procuracaoStorage";

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
    
    // Verificar dados da procuração quando informada
    if (config.procuracaoEletronica && !config.procuracaoNumero) {
      toast({
        title: "Atenção",
        description: "É necessário informar o número da procuração eletrônica",
        variant: "destructive",
      });
    }
    
    // Preparar dados para armazenamento
    const certificadoInfo = {
      integraContador: true,
      certificadoPresente: !!config.certificadoDigital,
      procuracaoConfigurada: config.procuracaoEletronica,
      procuracaoNumero: config.procuracaoNumero || null,
      procuracaoValidade: config.procuracaoValidade || null
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
        certificado_info: JSON.stringify(certificadoInfo)
      });
      
    if (error) {
      throw new Error(`Erro ao salvar configuração: ${error.message}`);
    }
    
    // Processar arquivo de procuração quando fornecido
    let procuracaoUrl = null;
    
    if (config.procuracaoArquivo) {
      console.log(`Salvando comprovante de procuração para cliente ${clientId}`);
      
      // Gerar ID único para a procuração
      const procuracaoId = `proc-${Date.now()}`;
      
      // Fazer upload do arquivo para o storage
      procuracaoUrl = await uploadProcuracaoDocument(
        clientId,
        procuracaoId,
        config.procuracaoArquivo
      );
      
      if (procuracaoUrl) {
        // Se tiver validade da procuração, calcular data de expiração
        let dataValidade = null;
        if (config.procuracaoValidade) {
          const hoje = new Date();
          dataValidade = new Date();
          dataValidade.setMonth(hoje.getMonth() + parseInt(config.procuracaoValidade));
        }
        
        // Salvar na tabela de procurações
        await supabase.from('procuracoes_eletronicas').insert({
          client_id: clientId,
          procurador_cpf: "00000000000", // Simulado, na implementação real viria do certificado
          procurador_nome: "Serpro Integra Contador",
          data_validade: dataValidade || new Date(Date.now() + 365*24*60*60*1000), // Default 1 ano
          status: 'emitida',
          servicos_autorizados: ['CONSULTAR_NFE', 'CONSULTAR_CERTIDOES'],
          comprovante_url: procuracaoUrl,
          log_processamento: [JSON.stringify({
            timestamp: new Date().toISOString(),
            acao: 'UPLOAD',
            resultado: 'Comprovante de procuração salvo com sucesso'
          })]
        });
      }
    }
    
    toast({
      title: "Integração configurada",
      description: "Integração com Serpro Integra Contador configurada com sucesso",
    });
    
    return {
      success: true,
      data: {
        message: "Integração com Serpro Integra Contador configurada",
        integraContador: true,
        procuracaoNumero: config.procuracaoNumero || null,
        procuracaoUrl: procuracaoUrl
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
    
    // Preparar dados para armazenamento
    const nfceInfo = {
      nfce: true,
      dtecConfigurado: true,
      tipoTTD: config.tipoTTD,
      cscConfigurado: !!config.cscCodigo
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
        certificado_info: JSON.stringify(nfceInfo)
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
