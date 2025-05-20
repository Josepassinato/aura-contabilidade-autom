
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface CertificadoDigital {
  id?: string;
  client_id: string;
  nome: string;
  tipo: 'e-CNPJ' | 'e-CPF' | 'NF-e';
  arquivo: string; // Base64 do arquivo
  senha: string;
  valido_ate?: string | null;
}

export interface CertificadoDigitalResponse {
  success: boolean;
  data?: CertificadoDigital[];
  error?: string;
}

/**
 * Busca os certificados digitais de um cliente
 * @param clientId ID do cliente
 * @returns Promise com a resposta contendo os certificados
 */
export async function fetchCertificadosDigitais(clientId: string): Promise<CertificadoDigitalResponse> {
  try {
    if (!clientId) {
      throw new Error("ID do cliente não informado");
    }

    const { data, error } = await supabase
      .from('certificados_digitais')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      console.error('Erro ao buscar certificados digitais:', error);
      throw error;
    }

    return {
      success: true,
      data: data as CertificadoDigital[]
    };
  } catch (error: any) {
    console.error('Erro ao buscar certificados digitais:', error);
    return {
      success: false,
      error: error.message || "Não foi possível buscar os certificados digitais"
    };
  }
}

/**
 * Salva um certificado digital para um cliente
 * @param certificado Dados do certificado digital
 * @returns Promise indicando sucesso ou falha
 */
export async function saveCertificadoDigital(certificado: CertificadoDigital): Promise<boolean> {
  try {
    if (!certificado.client_id) {
      throw new Error("ID do cliente não informado");
    }

    if (!certificado.arquivo || !certificado.senha) {
      throw new Error("Arquivo do certificado e senha são obrigatórios");
    }

    let result;

    // Se tiver ID, atualiza, senão insere
    if (certificado.id) {
      const { id, ...certificadoData } = certificado;
      result = await supabase
        .from('certificados_digitais')
        .update(certificadoData)
        .eq('id', id);
    } else {
      result = await supabase
        .from('certificados_digitais')
        .insert([certificado]);
    }

    if (result.error) {
      throw result.error;
    }

    toast({
      title: "Certificado salvo",
      description: "O certificado digital foi salvo com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao salvar certificado digital:', error);
    
    toast({
      title: "Erro ao salvar certificado",
      description: error.message || "Não foi possível salvar o certificado digital",
      variant: "destructive"
    });
    
    return false;
  }
}

/**
 * Exclui um certificado digital
 * @param certificadoId ID do certificado a ser excluído
 * @returns Promise indicando sucesso ou falha
 */
export async function deleteCertificadoDigital(certificadoId: string): Promise<boolean> {
  try {
    if (!certificadoId) {
      throw new Error("ID do certificado não informado");
    }

    const { error } = await supabase
      .from('certificados_digitais')
      .delete()
      .eq('id', certificadoId);

    if (error) {
      throw error;
    }

    toast({
      title: "Certificado excluído",
      description: "O certificado digital foi excluído com sucesso",
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao excluir certificado digital:', error);
    
    toast({
      title: "Erro ao excluir certificado",
      description: error.message || "Não foi possível excluir o certificado digital",
      variant: "destructive"
    });
    
    return false;
  }
}
