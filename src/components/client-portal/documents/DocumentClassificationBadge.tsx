
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface DocumentClassificationBadgeProps {
  category?: string;
  confidence?: number;
}

export function DocumentClassificationBadge({ 
  category, 
  confidence = 0 
}: DocumentClassificationBadgeProps) {
  if (!category) return null;
  
  let color: string;
  
  switch (category) {
    case 'Receita':
      color = 'bg-green-100 text-green-800 border-green-200';
      break;
    case 'Despesa':
      color = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'Folha de Pagamento':
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case 'Investimento':
      color = 'bg-purple-100 text-purple-800 border-purple-200';
      break;
    case 'Empréstimo':
      color = 'bg-orange-100 text-orange-800 border-orange-200';
      break;
    case 'Tributária':
      color = 'bg-amber-100 text-amber-800 border-amber-200';
      break;
    default:
      color = 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  // Add a star indicator for confidence level if available
  let confidenceIndicator = '';
  if (confidence > 0) {
    const stars = Math.min(5, Math.max(1, Math.round(confidence * 5)));
    confidenceIndicator = ' • ' + '★'.repeat(stars) + '☆'.repeat(5 - stars);
  }
  
  return (
    <Badge variant="outline" className={`${color} font-normal text-xs`}>
      {category}{confidenceIndicator}
    </Badge>
  );
}
