
import React from 'react';
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ReportSectionProps {
  generatedReport: {
    title: string;
    url: string;
    type: string;
  } | null;
}

export function ReportSection({ generatedReport }: ReportSectionProps) {
  if (!generatedReport) return null;
  
  const downloadReport = () => {
    toast({
      title: "Download iniciado",
      description: `O relatório de ${generatedReport.type} está sendo baixado.`,
    });
    
    // Em uma implementação real, aqui seria feito o download de um arquivo real
    setTimeout(() => {
      toast({
        title: "Download concluído",
        description: "O relatório foi baixado com sucesso.",
      });
    }, 1500);
  };

  return (
    <div className="p-3 bg-muted/30 border-t border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium truncate">{generatedReport.title}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-8 px-2 flex items-center gap-1"
        onClick={downloadReport}
      >
        <Download className="h-3 w-3" />
        <span className="text-xs">Baixar</span>
      </Button>
    </div>
  );
}
