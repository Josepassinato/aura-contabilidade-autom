
import { useState } from 'react';
import { ProcuracaoEletronica } from '@/services/governamental/procuracaoService/types';
import { 
  verificarProcuracaoParaSefaz,
  consultarSefazComProcuracao,
  emitirGuiaSefazComProcuracao
} from '@/services/governamental/sefazScraperService';
import { UF } from '@/services/governamental/estadualIntegration';
import { toast } from './use-toast';

export function useProcuracaoSefaz() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procuracaoAtiva, setProcuracaoAtiva] = useState<ProcuracaoEletronica | null>(null);
  
  /**
   * Verifica se uma procuração está válida para uso na SEFAZ
   */
  const verificarProcuracao = async (procuracaoId: string, uf: UF) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await verificarProcuracaoParaSefaz(procuracaoId, uf);
      
      if (resultado.success) {
        setProcuracaoAtiva(resultado.data.procuracao as ProcuracaoEletronica);
        toast({
          title: "Procuração validada",
          description: `A procuração está válida para uso na SEFAZ-${uf}`,
        });
        return true;
      } else {
        setError(resultado.error || "Erro ao validar procuração");
        setProcuracaoAtiva(null);
        return false;
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao validar a procuração");
      setProcuracaoAtiva(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Consulta dados na SEFAZ usando uma procuração
   */
  const consultarSefaz = async (procuracaoId: string, uf: UF, operacao: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await consultarSefazComProcuracao(procuracaoId, uf, operacao);
      
      if (!resultado.success) {
        setError(resultado.error || "Erro ao consultar SEFAZ");
      }
      
      return resultado;
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao consultar a SEFAZ");
      return {
        success: false,
        error: err.message || "Erro na consulta à SEFAZ"
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Emite guias de pagamento na SEFAZ usando uma procuração
   */
  const emitirGuia = async (procuracaoId: string, uf: UF, dadosGuia: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resultado = await emitirGuiaSefazComProcuracao(procuracaoId, uf, dadosGuia);
      
      if (!resultado.success) {
        setError(resultado.error || "Erro ao emitir guia na SEFAZ");
      }
      
      return resultado;
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao emitir a guia na SEFAZ");
      return {
        success: false,
        error: err.message || "Erro na emissão da guia"
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    procuracaoAtiva,
    verificarProcuracao,
    consultarSefaz,
    emitirGuia,
    limparErro: () => setError(null)
  };
}
