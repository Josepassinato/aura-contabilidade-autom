
import React from 'react';
import { Badge } from "@/components/ui/badge";

/**
 * Formats a currency value to BRL format
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
  
/**
 * Formats a period string (YYYY-MM) into a readable month and year format
 */
export const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

/**
 * Returns an appropriate Badge component for the given status
 */
export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>;
    case 'processing':
      return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>;
    case 'approved':
      return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
    case 'paid':
      return <Badge variant="default">Pago</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
