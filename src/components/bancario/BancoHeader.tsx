
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { consultarSaldoBancario, obterConfiguracaoBancaria } from "@/services/bancario/automacaoBancaria";
import { toast } from "@/hooks/use-toast";

interface BancoHeaderProps {
  bancoSelecionado: string;
}

export function BancoHeader({ bancoSelecionado }: BancoHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [saldo, setSaldo] = useState<number | null>(null);

  const verificarConfiguracao = () => {
    const config = obterConfiguracaoBancaria(bancoSelecionado);
    if (!config) {
      toast({
        title: "Configuração bancária ausente",
        description: "Configure as credenciais bancárias nas configurações antes de utilizar esta funcionalidade.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleConsultarSaldo = async () => {
    if (!verificarConfiguracao()) return;
    
    try {
      setIsLoading(true);
      const valorSaldo = await consultarSaldoBancario(bancoSelecionado);
      setSaldo(valorSaldo);
      toast({
        title: "Saldo consultado",
        description: `Saldo atual: R$ ${valorSaldo.toFixed(2)}`,
      });
    } catch (error) {
      logger.error("Erro ao consultar saldo bancário", error, "BancoHeader");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="col-span-3">
        <CardHeader className="pb-2">
          <CardTitle>Banco Conectado</CardTitle>
          <CardDescription>
            {bancoSelecionado ? bancoSelecionado : "Nenhum banco configurado"}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <div>
              {saldo !== null && (
                <div className="text-lg font-medium">
                  Saldo: <span className="text-green-600">R$ {saldo.toFixed(2)}</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleConsultarSaldo}
              disabled={!bancoSelecionado || isLoading}
            >
              {isLoading ? "Consultando..." : "Consultar Saldo"}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Configuração</CardTitle>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              window.location.href = "/settings";
            }}
          >
            Configurar Bancos
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
