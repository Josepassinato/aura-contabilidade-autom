
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { triggerSefazScrape } from "@/services/governamental/sefazScraperService";
import { UF } from "@/services/governamental/estadualIntegration";

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

  const handleScrape = async () => {
    setIsLoading(true);
    try {
      const result = await triggerSefazScrape(clientId, uf);
      
      if (result.success && onSuccess) {
        onSuccess(result.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleScrape} 
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Coletando dados...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Coletar dados SEFAZ-{uf}
        </>
      )}
    </Button>
  );
}
