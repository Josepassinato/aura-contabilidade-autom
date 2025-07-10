import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  Plus,
  Download,
  Bell,
  Target
} from "lucide-react";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { Obrigacao } from "@/types/obrigacoes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EnhancedObrigacoesFiscaisProps {
  obrigacoes: Obrigacao[];
  onObrigacaoUpdate: (id: string, status: string) => void;
  clienteId: string | null;
  onClientSelect: (client: { id: string; name: string }) => void;
}

export const EnhancedObrigacoesFiscais: React.FC<EnhancedObrigacoesFiscaisProps> = ({
  obrigacoes,
  onObrigacaoUpdate,
  clienteId,
  onClientSelect
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filtros aplicados
  const filteredObrigacoes = obrigacoes.filter(obrigacao => {
    const matchesSearch = obrigacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obrigacao.empresa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || obrigacao.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || obrigacao.prioridade === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Estatísticas
  const stats = {
    total: obrigacoes.length,
    pendentes: obrigacoes.filter(o => o.status === "pendente").length,
    atrasadas: obrigacoes.filter(o => o.status === "atrasado").length,
    concluidas: obrigacoes.filter(o => o.status === "concluido").length,
    alta_prioridade: obrigacoes.filter(o => o.prioridade === "alta").length
  };

  const completionRate = stats.total > 0 ? (stats.concluidas / stats.total) * 100 : 0;

  // Obrigações próximas (próximos 7 dias)
  const hoje = new Date();
  const proximaSemana = new Date();
  proximaSemana.setDate(hoje.getDate() + 7);

  const obrigacoesProximas = obrigacoes.filter(o => {
    if (o.status === "concluido") return false;
    const [dia, mes, ano] = o.prazo.split('/').map(Number);
    const dataPrazo = new Date(ano, mes - 1, dia);
    return dataPrazo >= hoje && dataPrazo <= proximaSemana;
  }).sort((a, b) => {
    const [diaA, mesA, anoA] = a.prazo.split('/').map(Number);
    const [diaB, mesB, anoB] = b.prazo.split('/').map(Number);
    const dataA = new Date(anoA, mesA - 1, diaA);
    const dataB = new Date(anoB, mesB - 1, diaB);
    return dataA.getTime() - dataB.getTime();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "atrasado": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido": return "bg-green-500";
      case "atrasado": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "destructive";
      case "media": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Obrigações Fiscais</h1>
          <p className="text-muted-foreground">
            Gestão inteligente de obrigações e acessórias
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <ClientSelector onClientSelect={onClientSelect} />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Obrigação
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs de conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="lista">Lista Completa</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Obrigações Próximas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Próximos Vencimentos (7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {obrigacoesProximas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma obrigação próxima do vencimento
                  </p>
                ) : (
                  obrigacoesProximas.slice(0, 5).map((obrigacao) => (
                    <div key={obrigacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(obrigacao.status)}
                          <h4 className="font-medium">{obrigacao.nome}</h4>
                          <Badge variant={getPriorityColor(obrigacao.prioridade)}>
                            {obrigacao.prioridade}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{obrigacao.empresa}</p>
                        <p className="text-xs text-muted-foreground">Vence em {obrigacao.prazo}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => onObrigacaoUpdate(obrigacao.id.toString(), "concluido")}
                        disabled={obrigacao.status === "concluido"}
                      >
                        {obrigacao.status === "concluido" ? "Concluída" : "Marcar como Concluída"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Alta Prioridade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alta Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {obrigacoes
                  .filter(o => o.prioridade === "alta" && o.status !== "concluido")
                  .slice(0, 5)
                  .map((obrigacao) => (
                    <div key={obrigacao.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(obrigacao.status)}
                          <h4 className="font-medium">{obrigacao.nome}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{obrigacao.empresa}</p>
                        <p className="text-xs text-muted-foreground">Vence em {obrigacao.prazo}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => onObrigacaoUpdate(obrigacao.id.toString(), "concluido")}
                      >
                        Resolver
                      </Button>
                    </div>
                  ))
                }
                {obrigacoes.filter(o => o.prioridade === "alta" && o.status !== "concluido").length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Todas as obrigações de alta prioridade foram concluídas! 🎉
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lista Tab */}
        <TabsContent value="lista" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar obrigações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Obrigações */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {filteredObrigacoes.map((obrigacao) => (
                  <div key={obrigacao.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(obrigacao.status)}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{obrigacao.nome}</h4>
                          <Badge variant={getPriorityColor(obrigacao.prioridade)} className="text-xs">
                            {obrigacao.prioridade}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {obrigacao.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{obrigacao.empresa}</p>
                        <p className="text-xs text-muted-foreground">
                          Vencimento: {obrigacao.prazo}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {obrigacao.status === "concluido" ? (
                        <Badge variant="default" className="bg-green-500">Concluída</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => onObrigacaoUpdate(obrigacao.id.toString(), "concluido")}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredObrigacoes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhuma obrigação encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendário Tab */}
        <TabsContent value="calendario">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Obrigações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Calendário fiscal integrado será implementado aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};