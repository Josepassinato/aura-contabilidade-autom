
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import React from "react";

/**
 * Get the appropriate status icon based on the status.
 */
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "pendente":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "atrasado":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "concluido":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

/**
 * Get the CSS class for status badge based on the status.
 */
export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    case "atrasado":
      return "bg-red-100 text-red-800";
    case "concluido":
      return "bg-green-100 text-green-800";
    default:
      return "";
  }
};

/**
 * Get the CSS class for priority badge based on the priority.
 */
export const getPrioridadeBadgeColor = (prioridade: string) => {
  switch (prioridade) {
    case "baixa":
      return "bg-blue-100 text-blue-800";
    case "media":
      return "bg-yellow-100 text-yellow-800";
    case "alta":
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
};

/**
 * Format status string for display
 */
export const formatStatusName = (status: string): string => {
  switch (status) {
    case "concluido":
      return "Concluído";
    case "atrasado":
      return "Atrasado";
    case "pendente":
      return "Pendente";
    default:
      return status;
  }
};

/**
 * Format priority string for display
 */
export const formatPrioridadeName = (prioridade: string): string => {
  switch (prioridade) {
    case "alta":
      return "Alta";
    case "media":
      return "Média";
    case "baixa":
      return "Baixa";
    default:
      return prioridade;
  }
};
