
import React from "react";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Obrigacao } from "@/types/obrigacoes";

interface CalendarDayProps {
  dia: number | null;
  obrigacoes: Obrigacao[];
  mes: number;
  ano: number;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ dia, obrigacoes, mes, ano }) => {
  const temObrigacoes = obrigacoes.length > 0;

  const marcarComoConcluida = (id: number) => {
    toast({
      title: "Obrigação concluída",
      description: "A obrigação foi marcada como concluída com sucesso."
    });
  };

  if (!dia) {
    return (
      <div className="min-h-[100px] border rounded-md p-1 bg-gray-50"></div>
    );
  }

  return (
    <div className="min-h-[100px] border rounded-md p-1 hover:bg-gray-50">
      <div className="text-right p-1 font-medium">
        {dia}
      </div>
      <div className="space-y-1">
        {temObrigacoes ? (
          obrigacoes.map((obrigacao) => (
            <div 
              key={obrigacao.id}
              className={`
                p-1 rounded text-xs cursor-pointer
                ${obrigacao.status === 'concluido' ? 'bg-green-100' : 
                  obrigacao.status === 'atrasado' ? 'bg-red-100' : 'bg-yellow-100'}
              `}
              onClick={() => marcarComoConcluida(obrigacao.id)}
            >
              <div className="flex items-center">
                {obrigacao.status === 'concluido' ? (
                  <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                ) : obrigacao.status === 'atrasado' ? (
                  <AlertTriangle className="h-3 w-3 text-red-600 mr-1" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                )}
                <span className="truncate">{obrigacao.nome}</span>
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {obrigacao.empresa}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full"></div>
        )}
      </div>
    </div>
  );
};
