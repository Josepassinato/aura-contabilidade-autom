
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Radio, RadioGroup, RadioIndicator, RadioItem } from "@/components/ui/radio-group";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UF } from '@/services/governamental/estadualIntegration';

export interface IntegracaoEstadualStatus {
  id: string;
  uf: UF;
  nome: string;
  status: 'conectado' | 'pendente' | 'erro';
  ultimoAcesso?: string;
  proximaRenovacao?: string;
  mensagemErro?: string;
}

interface IntegracaoStatusProps {
  integracao: IntegracaoEstadualStatus;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function IntegracaoStatus({ integracao, onSelect, isSelected = false }: IntegracaoStatusProps) {
  const getStatusIcon = () => {
    switch (integracao.status) {
      case 'conectado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'erro':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (integracao.status) {
      case 'conectado':
        return 'Conectado';
      case 'pendente':
        return 'Pendente';
      case 'erro':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (integracao.status) {
      case 'conectado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendente':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className={`cursor-pointer hover:border-primary ${isSelected ? 'border-primary border-2' : ''}`} onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <RadioItem value={integracao.id} className="mt-1" checked={isSelected} />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold">{integracao.uf} - {integracao.nome}</h3>
              <Badge variant="outline" className={getStatusColor()}>
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                  <span>{getStatusText()}</span>
                </div>
              </Badge>
            </div>
            
            {integracao.status === 'conectado' && (
              <div className="text-xs text-muted-foreground mt-2">
                <p>Último acesso: {integracao.ultimoAcesso || 'N/A'}</p>
                <p>Renovação: {integracao.proximaRenovacao || 'N/A'}</p>
              </div>
            )}
            
            {integracao.status === 'erro' && integracao.mensagemErro && (
              <p className="text-xs text-destructive mt-2">{integracao.mensagemErro}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
