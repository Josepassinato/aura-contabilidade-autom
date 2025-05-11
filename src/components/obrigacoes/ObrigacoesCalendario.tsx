
import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Obrigacao {
  id: number;
  nome: string;
  tipo: string;
  prazo: string;
  empresa: string;
  status: "pendente" | "atrasado" | "concluido";
  prioridade: "baixa" | "media" | "alta";
}

interface ObrigacoesCalendarioProps {
  mes: number;
  ano: number;
  obrigacoes: Obrigacao[];
}

export function ObrigacoesCalendario({ mes, ano, obrigacoes }: ObrigacoesCalendarioProps) {
  // Função para obter o último dia do mês
  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Função para obter o dia da semana do primeiro dia do mês (0 = domingo, 1 = segunda, etc.)
  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // Calcular o último dia do mês
  const lastDay = getLastDayOfMonth(ano, mes);
  
  // Calcular o dia da semana do primeiro dia do mês
  const firstDayOfWeek = getFirstDayOfWeek(ano, mes);

  // Criar array com todos os dias do mês
  const dias = Array.from({ length: lastDay }, (_, i) => i + 1);
  
  // Preencher com dias vazios no início para alinhar com o dia da semana
  const diasVaziosInicio = Array.from({ length: firstDayOfWeek }, (_, i) => null);
  
  // Combinar dias vazios e dias do mês
  const todosDias = [...diasVaziosInicio, ...dias];
  
  // Função para verificar obrigações para um dia específico
  const getObrigacoesDoDia = (dia: number) => {
    if (!dia) return [];
    
    const diaFormatado = dia.toString().padStart(2, '0');
    const mesFormatado = mes.toString().padStart(2, '0');
    const dataFormatada = `${diaFormatado}/${mesFormatado}/${ano}`;
    
    return obrigacoes.filter(obrigacao => {
      // Assume que prazo está no formato DD/MM/YYYY
      const [prazoDia, prazoMes] = obrigacao.prazo.split('/');
      return prazoDia === diaFormatado && prazoMes === mesFormatado;
    });
  };

  // Converter dia em nome do mês
  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });

  const marcarComoConcluida = (id: number) => {
    toast({
      title: "Obrigação concluída",
      description: "A obrigação foi marcada como concluída com sucesso."
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold capitalize">{nomeMes} {ano}</h3>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2 text-center font-medium">
        <div className="p-2">Dom</div>
        <div className="p-2">Seg</div>
        <div className="p-2">Ter</div>
        <div className="p-2">Qua</div>
        <div className="p-2">Qui</div>
        <div className="p-2">Sex</div>
        <div className="p-2">Sáb</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 auto-rows-fr">
        {todosDias.map((dia, index) => {
          const obrigacoesDoDia = dia ? getObrigacoesDoDia(dia) : [];
          const temObrigacoes = obrigacoesDoDia.length > 0;
          
          return (
            <div 
              key={index}
              className={`min-h-[100px] border rounded-md p-1 ${!dia ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            >
              {dia && (
                <>
                  <div className="text-right p-1 font-medium">
                    {dia}
                  </div>
                  <div className="space-y-1">
                    {temObrigacoes ? (
                      obrigacoesDoDia.map((obrigacao) => (
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
                </>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-yellow-200 mr-1"></div>
          <span>Pendente</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-red-200 mr-1"></div>
          <span>Atrasado</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-green-200 mr-1"></div>
          <span>Concluído</span>
        </div>
      </div>
    </div>
  );
}
