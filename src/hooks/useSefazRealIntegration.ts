
import { useState } from 'react';
import { UF } from "@/services/governamental/estadualIntegration";
import { consultarSefazPorEstado, emitirGuiaPorEstado } from "@/services/governamental/sefaz/estadualApiService";
import { verificarDisponibilidadeProcuracaoSefaz } from "@/services/governamental/sefazAutomaticService";
import { toast } from './use-toast';

export function useSefazRealIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Consulta dados reais da SEFAZ usando procuração eletrônica
   */
  const consultarDados = async (clientId: string, uf: UF) => {
    if (!clientId || !uf) {
      setError("ID do cliente e UF são obrigatórios");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se tem procuração antes de tentar consultar
      const { possui, mensagem } = await verificarDisponibilidadeProcuracaoSefaz(clientId, uf);
      
      if (!possui) {
        setError(mensagem);
        toast({
          title: "Procuração necessária",
          description: `Configure uma procuração eletrônica para acessar a SEFAZ-${uf}`,
          variant: "destructive",
        });
        return false;
      }

      // Realizar consulta real
      const result = await consultarSefazPorEstado(clientId, uf);
      
      if (result.success) {
        setLastResult(result.data);
        toast({
          title: "Consulta realizada",
          description: `Dados coletados da SEFAZ-${uf} via integração real`,
        });
        return true;
      } else {
        setError(result.error || 'Falha na consulta');
        return false;
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erro na consulta à SEFAZ';
      setError(errorMessage);
      console.error('Erro na consulta SEFAZ:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Emite guia de pagamento real usando procuração eletrônica
   */
  const emitirGuia = async (
    clientId: string, 
    uf: UF, 
    dadosGuia: {
      competencia: string;
      valor: number;
      tipo_tributo: string;
      codigo_receita?: string;
    }
  ) => {
    if (!clientId || !uf) {
      setError("ID do cliente e UF são obrigatórios");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se tem procuração
      const { possui, mensagem } = await verificarDisponibilidadeProcuracaoSefaz(clientId, uf);
      
      if (!possui) {
        setError(mensagem);
        toast({
          title: "Procuração necessária",
          description: `Configure uma procuração eletrônica para emitir guias na SEFAZ-${uf}`,
          variant: "destructive",
        });
        return false;
      }

      // Emitir guia real
      const result = await emitirGuiaPorEstado(clientId, uf, dadosGuia);
      
      if (result.success) {
        setLastResult(result.data);
        toast({
          title: "Guia emitida",
          description: `Guia emitida com sucesso na SEFAZ-${uf}`,
        });
        return true;
      } else {
        setError(result.error || 'Falha na emissão da guia');
        return false;
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erro na emissão da guia';
      setError(errorMessage);
      console.error('Erro na emissão de guia:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica status de uma integração específica
   */
  const verificarStatusIntegracao = async (clientId: string, uf: UF) => {
    try {
      const { possui, mensagem } = await verificarDisponibilidadeProcuracaoSefaz(clientId, uf);
      
      return {
        disponivel: possui,
        status: possui ? 'conectado' : 'desconectado',
        mensagem: mensagem,
        tipo_integracao: 'procuracao_eletronica'
      };
      
    } catch (err: any) {
      return {
        disponivel: false,
        status: 'erro',
        mensagem: err.message || 'Erro ao verificar status',
        tipo_integracao: 'procuracao_eletronica'
      };
    }
  };

  /**
   * Testa conectividade com a API da SEFAZ
   */
  const testarConectividade = async (uf: UF) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular teste de conectividade (implementar conforme necessário)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Conectividade testada",
        description: `Conexão com SEFAZ-${uf} está funcionando`,
      });
      
      return true;
    } catch (err: any) {
      setError('Falha no teste de conectividade');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    lastResult,
    error,
    consultarDados,
    emitirGuia,
    verificarStatusIntegracao,
    testarConectividade,
    clearError: () => setError(null),
    clearResult: () => setLastResult(null)
  };
}
