
import React from 'react';
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

interface ReportSectionProps {
  generatedReport: {
    title: string;
    url: string;
    type: string;
    id: string;  // Já está corretamente definido na interface
  } | null;
}

export function ReportSection({ generatedReport }: ReportSectionProps) {
  if (!generatedReport) return null;
  
  const downloadReport = () => {
    // Se a URL existir, abra-a em uma nova aba
    if (generatedReport.url && generatedReport.url !== '#') {
      window.open(generatedReport.url, '_blank');
      
      toast({
        title: "Download iniciado",
        description: `O relatório de ${generatedReport.type} está sendo baixado.`,
      });
      
      return;
    }
    
    // Caso contrário, exiba uma mensagem
    toast({
      title: "Relatório disponível",
      description: "O relatório está disponível na seção de relatórios salvos.",
    });
  };

  return (
    <div className="p-3 bg-muted/30 border-t border-b flex flex-col sm:flex-row gap-2 items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium truncate">{generatedReport.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 flex items-center gap-1"
          onClick={downloadReport}
        >
          <Download className="h-3 w-3" />
          <span className="text-xs">Baixar</span>
        </Button>
        
        <Link to="/relatorios-ia?tab=relatorios-salvos">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs">Ver na lista</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
