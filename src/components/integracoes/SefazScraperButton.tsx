
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle2 } from "lucide-react";
import { triggerSefazScrape, verificarDisponibilidadeProcuracaoSefaz, consultarSefazAutomatico } from "@/services/governamental/sefazScraperService";
import { UF } from "@/services/governamental/estadualIntegration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
  
  // Verificar disponibilidade de procuração ao montar o componente
  useEffect(() => {
    const verificarProcuracao = async () => {
      try {
        const { possui } = await verificarDisponibilidadeProcuracaoSefaz(clientId, uf);
        setTemProcuracao(possui);
      } catch (error) {
        console.error("Erro ao verificar procuração:", error);
        setTemProcuracao(false);
      }
    };
    
    if (clientId && uf) {
      verificarProcuracao();
    }
  }, [clientId, uf]);

  const handleScrape = async () => {
    setIsLoading(true);
    try {
      // Se tem procuração, usa o método automático
      if (temProcuracao) {
        const result = await consultarSefazAutomatico(clientId, uf, 'scrape_dados');
        
        if (result.success && onSuccess) {
          onSuccess(result.data);
        }
      } else {
        // Caso contrário, usa o método tradicional
        const result = await triggerSefazScrape(clientId, uf);
        
        if (result.success && onSuccess) {
          onSuccess(result.data);
        }
      }
    } catch (error) {
      console.error("Erro ao coletar dados da SEFAZ:", error);
    } finally {
      setIsLoading(false);
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
                  Coletando dados...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Coletar dados SEFAZ-{uf}
                </>
              )}
            </Button>
            
            {temProcuracao && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Procuração disponível
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {temProcuracao 
              ? `Usando procuração eletrônica para acessar SEFAZ-${uf}` 
              : `Colete dados manualmente ou aguarde a atualização automática diária (3:00 UTC)`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
