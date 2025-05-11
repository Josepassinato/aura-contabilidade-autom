
import React from "react";

export const CalendarHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-7 gap-1 mb-2 text-center font-medium">
      <div className="p-2">Dom</div>
      <div className="p-2">Seg</div>
      <div className="p-2">Ter</div>
      <div className="p-2">Qua</div>
      <div className="p-2">Qui</div>
      <div className="p-2">Sex</div>
      <div className="p-2">Sáb</div>
    </div>
  );
};
