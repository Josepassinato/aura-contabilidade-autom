
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export interface IntegracaoEstadualStatus {
  id: string;
  nome: string;
  uf: string;
  status: 'conectado' | 'desconectado' | 'erro' | 'pendente';
  ultimoAcesso?: string;
  proximaRenovacao?: string;
  mensagem?: string;
}

interface IntegracaoStatusProps {
  integracao: IntegracaoEstadualStatus;
}

export function IntegracaoStatus({ integracao }: IntegracaoStatusProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'conectado':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Conectado</Badge>;
      case 'desconectado':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Desconectado</Badge>;
      case 'erro':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Erro</Badge>;
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{integracao.nome}</h3>
        {getStatusBadge(integracao.status)}
      </div>
      
      <div className="mt-2 space-y-1 text-sm">
        {integracao.ultimoAcesso && (
          <p className="text-muted-foreground">
            Último acesso: {integracao.ultimoAcesso}
          </p>
        )}
        {integracao.proximaRenovacao && (
          <p className="text-muted-foreground">
            Próxima renovação: {integracao.proximaRenovacao}
          </p>
        )}
      </div>
      
      {integracao.status === 'erro' && integracao.mensagem && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>{integracao.mensagem}</AlertDescription>
        </Alert>
      )}
      
      {integracao.status === 'conectado' && (
        <Alert className="mt-2 py-2 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Conectado</AlertTitle>
          <AlertDescription className="text-green-700">
            Integração funcionando corretamente
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
