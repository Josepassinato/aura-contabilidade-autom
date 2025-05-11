
import React from "react";
import { getPrioridadeBadgeColor, formatPrioridadeName } from "@/utils/statusUtils";

interface ObrigacaoPrioridadeBadgeProps {
  prioridade: "baixa" | "media" | "alta";
}

export const ObrigacaoPrioridadeBadge: React.FC<ObrigacaoPrioridadeBadgeProps> = ({ prioridade }) => {
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPrioridadeBadgeColor(prioridade)}`}>
      {formatPrioridadeName(prioridade)}
    </div>
  );
};
