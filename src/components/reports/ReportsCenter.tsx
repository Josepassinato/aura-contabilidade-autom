import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Download, FileText, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState, ErrorState } from '@/components/ui/empty-state';

interface ReportFilter {
  reportType: string;
  format: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  clientId?: string;
}

interface GeneratedReport {
  id: string;
  title: string;
  description: string;
  report_type: string;
  file_format: string;
  generation_status: string;
  file_size: number;
  download_count: number;
  created_at: string;
  expires_at: string;
}

export const ReportsCenter = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [filter, setFilter] = useState<ReportFilter>({
    reportType: '',
    format: '',
    startDate: undefined,
    endDate: undefined
  });

  // Carregar relatórios existentes
  React.useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setReports(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro ao carregar relatórios",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!filter.reportType || !filter.format || !filter.startDate || !filter.endDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para gerar o relatório",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          clientId: filter.clientId || 'default-client',
          reportType: filter.reportType,
          format: filter.format,
          period: {
            start: format(filter.startDate, 'yyyy-MM-dd'),
            end: format(filter.endDate, 'yyyy-MM-dd')
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Relatório gerado com sucesso",
        description: "O relatório está disponível para download"
      });

      // Recarregar lista de relatórios
      await loadReports();
      
      // Limpar filtros
      setFilter({
        reportType: '',
        format: '',
        startDate: undefined,
        endDate: undefined
      });

    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err);
      toast({
        title: "Erro ao gerar relatório",
        description: err.message || "Tente novamente em alguns minutos",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (reportId: string, fileName: string) => {
    try {
      const response = await fetch(
        `/functions/v1/download-report?id=${reportId}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg'}`
          }
        }
      );

      if (!response.ok) throw new Error('Erro no download');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado"
      });

    } catch (err: any) {
      toast({
        title: "Erro no download",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'generating':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'generating':
        return 'Gerando...';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar relatórios"
        description={error}
        onRetry={loadReports}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Geração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Novo Relatório
          </CardTitle>
          <CardDescription>
            Configure os parâmetros e gere relatórios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de Relatório */}
            <div className="space-y-2">
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={filter.reportType} onValueChange={(value) => setFilter(prev => ({ ...prev, reportType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="compliance">Conformidade</SelectItem>
                  <SelectItem value="tax">Tributário</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formato */}
            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select value={filter.format} onValueChange={(value) => setFilter(prev => ({ ...prev, format: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Início */}
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filter.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.startDate ? format(filter.startDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filter.startDate}
                    onSelect={(date) => setFilter(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filter.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.endDate ? format(filter.endDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filter.endDate}
                    onSelect={(date) => setFilter(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={generateReport}
              disabled={isGenerating}
              className="min-w-[120px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Relatórios Gerados
          </CardTitle>
          <CardDescription>
            Histórico de relatórios disponíveis para download
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton variant="list" count={5} />
          ) : reports.length === 0 ? (
            <EmptyState
              title="Nenhum relatório encontrado"
              description="Gere seu primeiro relatório usando o formulário acima"
              illustration={<FileText className="h-12 w-12 text-muted-foreground/50" />}
            />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{report.title}</h4>
                      <Badge variant={getStatusColor(report.generation_status)}>
                        {getStatusLabel(report.generation_status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Formato: {report.file_format.toUpperCase()}</span>
                      <span>Tamanho: {formatFileSize(report.file_size || 0)}</span>
                      <span>Downloads: {report.download_count || 0}</span>
                      <span>Criado: {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm")}</span>
                    </div>
                  </div>
                  
                  {report.generation_status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadReport(report.id, `${report.title}.${report.file_format}`)}
                      className="ml-4"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};