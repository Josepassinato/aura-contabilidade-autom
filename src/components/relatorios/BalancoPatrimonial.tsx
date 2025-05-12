
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalancoPatrimonialProps {
  clientId?: string;
  periodo?: string;
}

export const BalancoPatrimonial: React.FC<BalancoPatrimonialProps> = ({ clientId, periodo }) => {
  const [loading, setLoading] = useState(false);
  const [dadosBalanco, setDadosBalanco] = useState<any>(null);

  useEffect(() => {
    const loadBalancoData = async () => {
      if (!clientId) {
        return;
      }
      
      setLoading(true);
      try {
        // Em produção, aqui seria feita a chamada para o serviço que retorna os dados do balanço patrimonial
        console.log(`Carregando Balanço Patrimonial para cliente ${clientId} no período ${periodo || 'atual'}`);
        
        // Como não temos dados reais, mostramos apenas uma mensagem indicando isso
        setDadosBalanco(null);
      } catch (error) {
        console.error("Erro ao carregar Balanço Patrimonial:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBalancoData();
  }, [clientId, periodo]);

  const formatValue = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  if (loading) {
    return (
      <div className="space-y-6 p-4 text-center">
        <p>Carregando dados do Balanço Patrimonial...</p>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="space-y-6 p-4 text-center">
        <p>Selecione um cliente para visualizar o Balanço Patrimonial</p>
      </div>
    );
  }
  
  if (!dadosBalanco) {
    return (
      <div className="space-y-6 p-4 text-center">
        <p>Não há dados disponíveis para exibição do Balanço Patrimonial.</p>
        <p className="text-sm text-muted-foreground">Os dados serão exibidos quando a integração com o sistema contábil estiver configurada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ativo */}
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-lg text-green-800">Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            {/* O conteúdo da tabela seria exibido aqui quando houver dados reais */}
            <div className="text-center py-6">
              <p>Dados não disponíveis</p>
            </div>
          </CardContent>
        </Card>

        {/* Passivo */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg text-blue-800">Passivo e Patrimônio Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            {/* O conteúdo da tabela seria exibido aqui quando houver dados reais */}
            <div className="text-center py-6">
              <p>Dados não disponíveis</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
