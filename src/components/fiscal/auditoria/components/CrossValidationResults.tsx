
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidationResult, Discrepancy } from "@/services/fiscal/validation/crossValidationService";
import { AlertTriangle, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

interface CrossValidationResultsProps {
  results: ValidationResult[];
  isLoading?: boolean;
}

export function CrossValidationResults({ results, isLoading = false }: CrossValidationResultsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validação Cruzada</CardTitle>
          <CardDescription>Verificando correspondência entre fontes de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
              <p className="text-muted-foreground">Processando validação entre fontes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validação Cruzada</CardTitle>
          <CardDescription>Verificando correspondência entre fontes de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">Não há resultados de validação para exibir</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get source name from type
  const getSourceName = (type: string): string => {
    switch (type) {
      case 'ocr': return 'OCR Documentos';
      case 'api_fiscal': return 'API Fiscal';
      case 'erp': return 'Sistema ERP';
      case 'openbanking': return 'Open Banking';
      default: return type.toUpperCase();
    }
  };

  // Helper function to get status icon and color
  const getStatusIndicator = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return { icon: <CheckCircle className="h-5 w-5 text-green-500" />, color: 'bg-green-500' };
      case 'warning':
        return { icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />, color: 'bg-yellow-500' };
      case 'error':
        return { icon: <XCircle className="h-5 w-5 text-red-500" />, color: 'bg-red-500' };
    }
  };

  // Helper function to format severity badge
  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return <Badge variant="outline" className="bg-slate-100">Baixa</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100">Média</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-100">Alta</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validação Cruzada</CardTitle>
        <CardDescription>Verificando correspondência entre fontes de dados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => {
          const { icon, color } = getStatusIndicator(result.status);
          const matchPercentage = Math.round(result.matchRate * 100);
          
          return (
            <Accordion type="single" collapsible key={index} className="w-full">
              <AccordionItem value={`item-${index}`} className="border rounded-md">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {icon}
                      <div>
                        <p className="font-medium text-left">
                          {getSourceName(result.source)} ↔ {getSourceName(result.targetSource)}
                        </p>
                        <p className="text-sm text-muted-foreground text-left">
                          {result.discrepancies.length} discrepâncias detectadas
                        </p>
                      </div>
                    </div>
                    <Badge className={result.status === 'success' ? "bg-green-500" : 
                                      result.status === 'warning' ? "bg-yellow-500" : "bg-red-500"}>
                      {matchPercentage}% compatível
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {result.discrepancies.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      Sem discrepâncias detectadas entre as fontes
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm mb-2">Discrepâncias encontradas:</p>
                      
                      {result.discrepancies.map((discrepancy, idx) => (
                        <div key={idx} className="p-2 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium">{discrepancy.field}</p>
                            {getSeverityBadge(discrepancy.severity)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-1 bg-muted/30 rounded">
                              <p className="text-xs text-muted-foreground">Fonte: {getSourceName(result.source)}</p>
                              <p className="truncate">{String(discrepancy.sourceValue || 'N/A')}</p>
                            </div>
                            <div className="p-1 bg-muted/30 rounded">
                              <p className="text-xs text-muted-foreground">Fonte: {getSourceName(result.targetSource)}</p>
                              <p className="truncate">{String(discrepancy.targetValue || 'N/A')}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {discrepancy.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </CardContent>
    </Card>
  );
}
