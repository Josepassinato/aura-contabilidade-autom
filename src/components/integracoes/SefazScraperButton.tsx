
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle2, AlertTriangle } from "lucide-react";
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
        const status = await verificarStatusIntegracao(clientId, uf);
        setStatusIntegracao(status);
        setTemProcuracao(status.disponivel);
      } catch (error) {
        console.error("Erro ao verificar procuração:", error);
        setTemProcuracao(false);
        setStatusIntegracao({
          disponivel: false,
          status: 'erro',
          mensagem: 'Erro ao verificar status',
          tipo_integracao: 'procuracao_eletronica'
        });
      }
    };
    
    if (clientId && uf) {
      verificarProcuracao();
    }
  }, [clientId, uf, verificarStatusIntegracao]);

  const handleScrape = async () => {
    setIsLoading(true);
    try {
      if (temProcuracao) {
        // Usar integração real
        console.log(`Usando integração real para SEFAZ-${uf}`);
        const success = await consultarDados(clientId, uf);
        
        if (success && onSuccess) {
          // Buscar dados atualizados para passar para callback
          onSuccess({ 
            metodo: 'integracao_real', 
            uf, 
            procuracao: true 
          });
        }
      } else {
        // Usar método tradicional (simulado)
        console.log(`Usando método tradicional para SEFAZ-${uf}`);
        const result = await triggerSefazScrape(clientId, uf);
        
        if (result.success && onSuccess) {
          onSuccess({
            metodo: 'simulado',
            uf,
            procuracao: false,
            data: result.data
          });
        }
      }
    } catch (error) {
      console.error("Erro ao coletar dados da SEFAZ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!statusIntegracao) return null;

    if (statusIntegracao.disponivel) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Integração Real
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Modo Simulado
        </Badge>
      );
    }
  };

  const getTooltipContent = () => {
    if (!statusIntegracao) return "Carregando status...";

    if (statusIntegracao.disponivel) {
      return `Usando integração real com SEFAZ-${uf} via procuração eletrônica. Os dados coletados serão reais e atualizados.`;
    } else {
      return `Dados simulados para SEFAZ-${uf}. Configure uma procuração eletrônica para acesso real aos dados.`;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleScrape} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {temProcuracao ? 'Coletando dados reais...' : 'Coletando dados...'}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {temProcuracao ? `Coletar SEFAZ-${uf} (Real)` : `Coletar SEFAZ-${uf} (Simulado)`}
                </>
              )}
            </Button>
            
            {getStatusBadge()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">
              {temProcuracao ? 'Integração Real Ativa' : 'Modo Simulado'}
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
