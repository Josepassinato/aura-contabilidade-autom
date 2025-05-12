
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ResultadoAgendamentoProps {
  resultado: {
    sucessos: number;
    falhas: number;
    detalhes: Array<{ 
      sucesso: boolean; 
      idTransacao?: string; 
      mensagem?: string;
      index: number;
    }>;
  };
  totalPagamentos: number;
}

export function ResultadoAgendamento({ resultado, totalPagamentos }: ResultadoAgendamentoProps) {
  return (
    <Card className="payment-scheduling">
      <CardHeader>
        <CardTitle>Resultado do Agendamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Total de pagamentos</p>
              <p className="text-2xl font-bold">{totalPagamentos}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-600">Sucesso</p>
              <p className="text-2xl font-bold text-green-600">{resultado.sucessos}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-red-600">Falhas</p>
              <p className="text-2xl font-bold text-red-600">{resultado.falhas}</p>
            </div>
          </div>
          
          {resultado.sucessos === totalPagamentos ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-100 text-green-800 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">Todos os pagamentos foram agendados com sucesso!</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 p-4 bg-amber-100 text-amber-800 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Alguns pagamentos não puderam ser agendados. Verifique os detalhes acima.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
