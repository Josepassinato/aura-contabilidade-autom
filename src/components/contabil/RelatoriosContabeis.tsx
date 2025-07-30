import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  Building2,
  DollarSign,
  Printer,
  Mail,
  Settings,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RelatorioConfig {
  tipo: string;
  periodo_inicio: string;
  periodo_fim: string;
  cliente_id?: string;
  formato: 'pdf' | 'excel' | 'csv';
  detalhamento: 'sintetico' | 'analitico';
}

interface RelatorioGerado {
  id: string;
  tipo: string;
  titulo: string;
  data_geracao: string;
  status: 'pendente' | 'processando' | 'concluido' | 'erro';
  arquivo_url?: string;
  tamanho_arquivo?: number;
  cliente_nome?: string;
}

export function RelatoriosContabeis() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [relatoriosGerados, setRelatoriosGerados] = useState<RelatorioGerado[]>([]);
  const [config, setConfig] = useState<RelatorioConfig>({
    tipo: '',
    periodo_inicio: '',
    periodo_fim: '',
    formato: 'pdf',
    detalhamento: 'sintetico'
  });

  useEffect(() => {
    loadRelatoriosGerados();
  }, []);

  const loadRelatoriosGerados = async () => {
    try {
      // Em produção, buscar relatórios reais do Supabase
      setRelatoriosGerados([]);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    }
  };

  const handleGerarRelatorio = async () => {
    if (!config.tipo || !config.periodo_inicio || !config.periodo_fim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));

      const novoRelatorio: RelatorioGerado = {
        id: Date.now().toString(),
        tipo: config.tipo,
        titulo: `${getTipoLabel(config.tipo)} - ${formatPeriod(config.periodo_inicio, config.periodo_fim)}`,
        data_geracao: new Date().toISOString(),
        status: 'processando',
        cliente_nome: 'Empresa Selecionada'
      };

      setRelatoriosGerados(prev => [novoRelatorio, ...prev]);

      toast({
        title: "Relatório solicitado",
        description: "O relatório está sendo gerado e será disponibilizado em breve."
      });

      // Simular conclusão após alguns segundos
      setTimeout(() => {
        setRelatoriosGerados(prev => 
          prev.map(rel => 
            rel.id === novoRelatorio.id 
              ? { ...rel, status: 'concluido' as const, arquivo_url: '/relatorio-sample.pdf', tamanho_arquivo: 180000 }
              : rel
          )
        );
      }, 5000);

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      'dre': 'DRE - Demonstração do Resultado do Exercício',
      'balanco_patrimonial': 'Balanço Patrimonial',
      'fluxo_caixa': 'Demonstração do Fluxo de Caixa',
      'dfc': 'Demonstração dos Fluxos de Caixa',
      'dmpl': 'Demonstração das Mutações do Patrimônio Líquido',
      'notas_explicativas': 'Notas Explicativas',
      'balancete_verificacao': 'Balancete de Verificação',
      'razao_analitico': 'Razão Analítico'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const formatPeriod = (inicio: string, fim: string) => {
    const startDate = new Date(inicio).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const endDate = new Date(fim).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { variant: 'outline' as const, label: 'Pendente' },
      'processando': { variant: 'default' as const, label: 'Processando' },
      'concluido': { variant: 'secondary' as const, label: 'Concluído' },
      'erro': { variant: 'destructive' as const, label: 'Erro' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pendente'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Contábeis</h2>
          <p className="text-muted-foreground">
            Gere relatórios contábeis padronizados e personalizados
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
                <p className="text-2xl font-bold">{relatoriosGerados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {relatoriosGerados.filter(r => r.status === 'concluido').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Processamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {relatoriosGerados.filter(r => r.status === 'processando').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">
                  {relatoriosGerados.filter(r => 
                    new Date(r.data_geracao).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gerar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gerar">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="modelos">Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="gerar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Novo Relatório</CardTitle>
              <CardDescription>
                Configure os parâmetros para geração do relatório contábil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Relatório</Label>
                  <Select
                    value={config.tipo}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de relatório" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dre">DRE - Demonstração do Resultado</SelectItem>
                      <SelectItem value="balanco_patrimonial">Balanço Patrimonial</SelectItem>
                      <SelectItem value="fluxo_caixa">Demonstração do Fluxo de Caixa</SelectItem>
                      <SelectItem value="dfc">Demonstração dos Fluxos de Caixa</SelectItem>
                      <SelectItem value="dmpl">Demonstração das Mutações do PL</SelectItem>
                      <SelectItem value="balancete_verificacao">Balancete de Verificação</SelectItem>
                      <SelectItem value="razao_analitico">Razão Analítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detalhamento">Nível de Detalhamento</Label>
                  <Select
                    value={config.detalhamento}
                    onValueChange={(value: 'sintetico' | 'analitico') => 
                      setConfig(prev => ({ ...prev, detalhamento: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sintetico">Sintético</SelectItem>
                      <SelectItem value="analitico">Analítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodo_inicio">Data Início</Label>
                  <Input
                    id="periodo_inicio"
                    type="date"
                    value={config.periodo_inicio}
                    onChange={(e) => setConfig(prev => ({ ...prev, periodo_inicio: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodo_fim">Data Fim</Label>
                  <Input
                    id="periodo_fim"
                    type="date"
                    value={config.periodo_fim}
                    onChange={(e) => setConfig(prev => ({ ...prev, periodo_fim: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formato">Formato de Saída</Label>
                  <Select
                    value={config.formato}
                    onValueChange={(value: 'pdf' | 'excel' | 'csv') => 
                      setConfig(prev => ({ ...prev, formato: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleGerarRelatorio} 
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Relatórios</CardTitle>
              <CardDescription>
                Lista de relatórios gerados recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatoriosGerados.map((relatorio) => (
                  <div key={relatorio.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{relatorio.titulo}</h3>
                          {getStatusBadge(relatorio.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Tipo:</span>
                            <div>{getTipoLabel(relatorio.tipo)}</div>
                          </div>
                          <div>
                            <span className="font-medium">Cliente:</span>
                            <div>{relatorio.cliente_nome}</div>
                          </div>
                          <div>
                            <span className="font-medium">Gerado em:</span>
                            <div>{formatDate(relatorio.data_geracao)}</div>
                          </div>
                          <div>
                            <span className="font-medium">Tamanho:</span>
                            <div>{relatorio.tamanho_arquivo ? formatFileSize(relatorio.tamanho_arquivo) : '-'}</div>
                          </div>
                        </div>
                        
                        {relatorio.status === 'processando' && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">Processando...</span>
                              <span className="text-sm text-muted-foreground">45%</span>
                            </div>
                            <Progress value={45} className="w-full" />
                          </div>
                        )}
                      </div>

                      {relatorio.status === 'concluido' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {relatoriosGerados.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum relatório gerado ainda.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modelos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Relatórios</CardTitle>
              <CardDescription>
                Configure modelos personalizados para geração automática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Funcionalidade de modelos personalizados em desenvolvimento.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Em breve você poderá criar e salvar modelos de relatórios para uso recorrente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}