
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FluxoCaixaProps {
  clientId?: string;
  periodo?: string;
}

export const FluxoCaixa: React.FC<FluxoCaixaProps> = ({ clientId, periodo }) => {
  const [loading, setLoading] = useState(false);
  const [dadosFluxoCaixa, setDadosFluxoCaixa] = useState<any>(null);

  useEffect(() => {
    const loadFluxoCaixaData = async () => {
      if (!clientId) {
        return;
      }
      
      setLoading(true);
      try {
        // Em produção, aqui seria feita a chamada para o serviço que retorna os dados do fluxo de caixa
        console.log(`Carregando Fluxo de Caixa para cliente ${clientId} no período ${periodo || 'atual'}`);
        
        // Sem dados simulados - apenas estrutura para dados reais
        setDadosFluxoCaixa(null);
      } catch (error) {
        console.error("Erro ao carregar Fluxo de Caixa:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFluxoCaixaData();
  }, [clientId, periodo]);

  if (loading) {
    return (
      <div className="space-y-6 p-4 text-center">
        <p>Carregando dados do Fluxo de Caixa...</p>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="space-y-6 p-4 text-center">
        <p>Selecione um cliente para visualizar o Fluxo de Caixa</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demonstração de Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p>Não há dados disponíveis para exibição do Fluxo de Caixa.</p>
            <p className="text-sm text-muted-foreground">Os dados serão exibidos quando a integração com o sistema contábil estiver configurada.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
