
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { FileBarChart, Building, Calendar, Download } from 'lucide-react';

export function PayrollReports() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  
  useEffect(() => {
    if (!selectedClientId) return;
    
    // Simular carregamento de relatórios
    const fetchReports = async () => {
      setIsLoading(true);
      
      // Simulando um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Dados simulados de relatórios
      const mockReports = [
        {
          id: '1',
          name: 'Informe de Rendimentos Anual',
          year: selectedYear,
          generated_at: new Date().toISOString(),
          type: 'income_statement'
        },
        {
          id: '2',
          name: 'Relatório de FGTS',
          year: selectedYear,
          generated_at: new Date().toISOString(),
          type: 'fgts_report'
        },
        {
          id: '3',
          name: 'Relatório de INSS',
          year: selectedYear,
          generated_at: new Date().toISOString(),
          type: 'inss_report'
        },
        {
          id: '4',
          name: 'GFIP',
          year: selectedYear,
          generated_at: new Date().toISOString(),
          type: 'gfip'
        },
        {
          id: '5',
          name: 'RAIS',
          year: selectedYear,
          generated_at: new Date().toISOString(),
          type: 'rais'
        },
        {
          id: '6',
          name: 'DIRF',
          year: selectedYear,
          generated_at: new Date().toISOString(),
          type: 'dirf'
        }
      ];
      
      setReports(mockReports);
      setIsLoading(false);
    };
    
    fetchReports();
  }, [selectedClientId, selectedYear]);
  
  const handleClientSelect = (client: { id: string, name: string }) => {
    setSelectedClientId(client.id);
  };
  
  const generateReportCard = (report: any) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    const getReportIcon = (type: string) => {
      switch (type) {
        default:
          return <FileBarChart className="h-10 w-10 text-muted-foreground" />;
      }
    };
    
    return (
      <Card key={report.id} className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <CardTitle className="text-lg">{report.name}</CardTitle>
              <CardDescription>Ano: {report.year}</CardDescription>
            </div>
            <div>{getReportIcon(report.type)}</div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-4">
            Gerado em: {formatDate(report.generated_at)}
          </div>
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Relatórios da Folha</h3>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <ClientSelector onClientSelect={handleClientSelect} />
        </div>
        
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>
        </div>
      </div>
      
      {!selectedClientId ? (
        <Card className="bg-muted/40">
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Building className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cliente selecionado</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Selecione um cliente para visualizar os relatórios disponíveis
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="py-8 text-center">Carregando relatórios...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map(report => generateReportCard(report))}
        </div>
      )}
    </div>
  );
}

export default PayrollReports;
