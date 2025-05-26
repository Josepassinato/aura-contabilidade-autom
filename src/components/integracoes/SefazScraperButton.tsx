
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { triggerSefazScrape, verificarDisponibilidadeProcuracaoSefaz } from "@/services/governamental/sefazScraperService";
import { UF } from "@/services/governamental/estadualIntegration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useSefazRealIntegration } from "@/hooks/useSefazRealIntegration";

interface SefazScraperButtonProps {
  clientId: string;
  clientName?: string;
  uf: UF;
  onSuccess?: (data: any) => void;
}

export function SefazScraperButton({ 
  clientId, 
  clientName = "cliente", 
  uf, 
  onSuccess 
}: SefazScraperButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [temProcuracao, setTemProcuracao] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [statusIntegracao, setStatusIntegracao] = useState<{
    disponivel: boolean;
    status: string;
    mensagem: string;
    tipo_integracao: string;
  } | null>(null);
  
  const { consultarDados, verificarStatusIntegracao } = useSefazRealIntegration();
  
  // Verificar disponibilidade de procuração ao montar o componente
  useEffect(() => {
    const verificarProcuracao = async () => {
      try {
        console.log(`Verificando procuração para cliente ${clientId} - UF: ${uf}`);
        const status = await verificarStatusIntegracao(clientId, uf);
        console.log('Status da integração:', status);
        
        setStatusIntegracao(status);
        setTemProcuracao(status.disponivel);
        setStatusChecked(true);
      } catch (error) {
        console.error("Erro ao verificar procuração:", error);
        setTemProcuracao(false);
        setStatusIntegracao({
          disponivel: false,
          status: 'erro',
          mensagem: 'Erro ao verificar status',
          tipo_integracao: 'procuracao_eletronica'
        });
        setStatusChecked(true);
      }
    };
    
    if (clientId && uf) {
      verificarProcuracao();
    }
  }, [clientId, uf, verificarStatusIntegracao]);

  const handleScrape = async () => {
    if (!temProcuracao) {
      return; // Não permite coleta sem procuração
    }

    setIsLoading(true);
    try {
      console.log(`Usando integração REAL para SEFAZ-${uf}`);
      const success = await consultarDados(clientId, uf);
      
      if (success && onSuccess) {
        onSuccess({ 
          metodo: 'integracao_real', 
          uf, 
          procuracao: true 
        });
      }
    } catch (error) {
      console.error("Erro ao coletar dados da SEFAZ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!statusChecked) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Verificando...
        </Badge>
      );
    }

    if (!statusIntegracao) return null;

    if (statusIntegracao.disponivel) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Conectado
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Desconectado
        </Badge>
      );
    }
  };

  const getTooltipContent = () => {
    if (!statusChecked) return "Verificando status da integração...";
    if (!statusIntegracao) return "Erro ao verificar status";

    if (statusIntegracao.disponivel) {
      return `Integração real ativa com SEFAZ-${uf} via procuração eletrônica. Os dados coletados serão reais e atualizados.`;
    } else {
      return `Não há procuração eletrônica válida para SEFAZ-${uf}. Configure uma procuração eletrônica para acessar dados reais.`;
    }
  };

  // Se não tem procuração, mostra botão desabilitado
  if (statusChecked && !temProcuracao) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="flex items-center gap-2 opacity-50"
              >
                <AlertTriangle className="h-4 w-4" />
                Procuração necessária
              </Button>
              
              {getStatusBadge()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-medium text-red-600">
                Procuração Eletrônica Necessária
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Configure uma procuração eletrônica válida para acessar dados reais da SEFAZ-{uf}.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleScrape} 
              disabled={isLoading || !temProcuracao || !statusChecked}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Coletando dados reais...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Coletar SEFAZ-{uf} (Real)
                </>
              )}
            </Button>
            
            {getStatusBadge()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">
              {temProcuracao ? 'Integração Real Ativa' : 'Integração Não Configurada'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getTooltipContent()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
