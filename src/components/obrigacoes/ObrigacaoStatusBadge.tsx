
import React from "react";
import { getStatusBadgeColor, getStatusIcon, formatStatusName } from "@/utils/statusUtils";

interface ObrigacaoStatusBadgeProps {
  status: "pendente" | "atrasado" | "concluido";
}

export const ObrigacaoStatusBadge: React.FC<ObrigacaoStatusBadgeProps> = ({ status }) => {
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(status)}`}>
      {getStatusIcon(status)}
      <span className="ml-1 capitalize">
        {formatStatusName(status)}
      </span>
    </div>
  );
};
