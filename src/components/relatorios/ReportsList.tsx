import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClientSelector } from "@/components/layout/ClientSelector";
import { useSecureDataAccess } from "@/hooks/useSecureDataAccess";

interface Report {
  id: string;
  title: string;
  description: string | null;
  report_type: string;
  created_at: string;
  file_format: string;
  file_url: string | null;
  file_path: string | null;  // Added missing property
  file_size: number | null;
  tags: string[] | null;
}

export function ReportsList() {
  const { getSecureReportsData, executeSecureOperation, userRole } = useSecureDataAccess();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [selectedClient]);

  const fetchReports = async () => {
    setIsLoading(true);
    
    const result = await executeSecureOperation(async () => {
      const { data, error } = await getSecureReportsData(selectedClient?.id);

      if (error) {
        throw error;
      }

      return data || [];
    }, 'Erro ao carregar relatórios');

    if (result) {
      setReports(result);
    } else {
      setReports([]);
    }
    
    setIsLoading(false);
  };

  const handleDownload = async (report: Report) => {
    try {
      // If we have a direct URL, use it
      if (report.file_url) {
        window.open(report.file_url, '_blank');
        return;
      }

      // Otherwise try to get URL from storage if we have a path
      if (report.file_path) {
        const { data, error } = await supabase.storage
          .from('reports')
          .createSignedUrl(report.file_path, 60); // URL valid for 60 seconds

        if (error) throw error;

        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank');
        }
      }

      useToast().toast({
        title: "Download iniciado",
        description: `O relatório "${report.title}" está sendo baixado.`
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      useToast().toast({
        title: "Erro no download",
        description: "Não foi possível baixar o relatório.",
        variant: "destructive"
      });
    }
  };

  const handleClientChange = (client: { id: string, name: string }) => {
    setSelectedClient(client);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.tags && report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar relatórios..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {userRole !== 'client' && (
          <div className="w-full md:w-72">
            <ClientSelector onClientSelect={handleClientChange} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum relatório encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm 
                ? "Não foram encontrados relatórios correspondentes aos critérios de pesquisa." 
                : selectedClient
                  ? "Não existem relatórios disponíveis para este cliente." 
                  : "Não existem relatórios disponíveis ainda. Gere um novo relatório para visualizá-lo aqui."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                  </div>
                  {report.description && (
                    <p className="text-muted-foreground">{report.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Gerado em: {formatDate(report.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{report.report_type}</Badge>
                    <Badge variant="outline">{report.file_format?.toUpperCase()}</Badge>
                    {report.file_size && (
                      <Badge variant="outline">{formatFileSize(report.file_size)}</Badge>
                    )}
                    {report.tags && report.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
