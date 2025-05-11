
import React from "react";

export const CalendarLegend: React.FC = () => {
  return (
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
  );
};
