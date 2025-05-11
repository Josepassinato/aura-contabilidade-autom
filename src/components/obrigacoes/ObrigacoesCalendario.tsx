
import React from "react";
import { Card } from "@/components/ui/card";
import { Obrigacao } from "@/types/obrigacoes";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDay } from "./CalendarDay";
import { CalendarLegend } from "./CalendarLegend";
import { generateCalendarDays, getMonthName } from "@/utils/calendarUtils";
import { getObrigacoesDoDia } from "@/utils/obrigacoesCalendarUtils";

interface ObrigacoesCalendarioProps {
  mes: number;
  ano: number;
  obrigacoes: Obrigacao[];
}

export function ObrigacoesCalendario({ mes, ano, obrigacoes }: ObrigacoesCalendarioProps) {
  // Generate calendar days
  const todosDias = generateCalendarDays(ano, mes);
  
  // Get month name
  const nomeMes = getMonthName(ano, mes);

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold capitalize">{nomeMes} {ano}</h3>
      </div>
      
      <CalendarHeader />
      
      <div className="grid grid-cols-7 gap-1 auto-rows-fr">
        {todosDias.map((dia, index) => {
          const obrigacoesDoDia = getObrigacoesDoDia(dia, mes, ano, obrigacoes);
          
          return (
            <CalendarDay 
              key={index}
              dia={dia}
              obrigacoes={obrigacoesDoDia}
              mes={mes}
              ano={ano}
            />
          );
        })}
      </div>
      
      <CalendarLegend />
    </div>
  );
}
