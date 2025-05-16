
import { Badge } from "@/components/ui/badge";
import React from "react";

export function formatPeriod(period: string) {
  const [year, month] = period.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'draft':
      return <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Rascunho</Badge>;
    case 'processing':
      return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">Processando</Badge>;
    case 'approved':
      return <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Aprovado</Badge>;
    case 'paid':
      return <Badge variant="outline" className="text-purple-500 border-purple-200 bg-purple-50">Pago</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
