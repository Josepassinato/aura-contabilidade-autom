import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Calculator,
  Building2,
  PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface MonthlyTask {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  type: 'closing' | 'tax' | 'compliance' | 'report';
}

interface ClientSummary {
  id: string;
  name: string;
  regime: string;
  documentsStatus: 'complete' | 'missing' | 'pending';
  closingStatus: 'open' | 'in_progress' | 'closed';
  nextDeadline: string;
}

export const AccountingDashboard = () => {
  const { user, isAccountant } = useAuth();
  const [tasks, setTasks] = useState<MonthlyTask[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().substring(0, 7));
  
  // Mock data para demonstração
  useEffect(() => {
    // Tarefas do mês
    setTasks([
      {
        id: '1',
        title: 'Fechamento Mensal',
        client: 'Empresa ABC Ltda',
        dueDate: '2024-01-15',
        status: 'pending',
        priority: 'high',
        type: 'closing'
      },
      {
        id: '2',
        title: 'DAS - Simples Nacional',
        client: 'Loja XYZ ME',
        dueDate: '2024-01-20',
        status: 'completed',
        priority: 'medium',
        type: 'tax'
      },
      {
        id: '3',
        title: 'DCTF-Web',
        client: 'Empresa ABC Ltda',
        dueDate: '2024-01-25',
        status: 'in_progress',
        priority: 'high',
        type: 'compliance'
      }
    ]);

    // Resumo de clientes
    setClients([
      {
        id: '1',
        name: 'Empresa ABC Ltda',
        regime: 'Lucro Presumido',
        documentsStatus: 'missing',
        closingStatus: 'in_progress',
        nextDeadline: '2024-01-15'
      },
      {
        id: '2',
        name: 'Loja XYZ ME',
        regime: 'Simples Nacional',
        documentsStatus: 'complete',
        closingStatus: 'closed',
        nextDeadline: '2024-01-20'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Contábil</h1>
          <p className="text-muted-foreground">
            Visão centralizada das tarefas contábeis e status dos clientes
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="month" 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Link to="/relatorios">
            <Button variant="outline">
              <PieChart className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs do Mês */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas do Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={completionRate} className="flex-1 h-2" />
              <span className="text-sm text-muted-foreground">{Math.round(completionRate)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.closingStatus === 'open').length} fechamentos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prazos Próximos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'pending' && t.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Próximos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.documentsStatus === 'missing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Precisam de atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tarefas Prioritárias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tarefas Prioritárias
            </CardTitle>
            <CardDescription>
              Atividades que precisam de atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks
              .filter(task => task.status !== 'completed')
              .sort((a, b) => a.priority === 'high' ? -1 : 1)
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.client}</p>
                    <p className="text-xs text-muted-foreground">Vence em {task.dueDate}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {task.status === 'pending' ? 'Iniciar' : 'Continuar'}
                  </Button>
                </div>
              ))}
            
            <Link to="/obrigacoes-fiscais">
              <Button variant="outline" className="w-full">
                Ver Todas as Obrigações
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Status dos Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Status dos Clientes
            </CardTitle>
            <CardDescription>
              Situação atual dos principais clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{client.name}</h4>
                  <Badge variant="secondary">{client.regime}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Documentos:</span>
                    <div className="flex items-center gap-1 mt-1">
                      {client.documentsStatus === 'complete' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-xs">
                        {client.documentsStatus === 'complete' ? 'Completos' : 'Pendentes'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Fechamento:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(client.closingStatus)}`} />
                      <span className="text-xs capitalize">{client.closingStatus}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Próximo prazo: {client.nextDeadline}
                  </span>
                </div>
              </div>
            ))}
            
            <Link to="/clientes">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Clientes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Link to="/apuracao-automatica">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <Calculator className="h-6 w-6" />
                <span className="text-sm">Apuração</span>
              </Button>
            </Link>
            
            <Link to="/documentos">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Documentos</span>
              </Button>
            </Link>
            
            <Link to="/guias-fiscais">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Guias</span>
              </Button>
            </Link>
            
            <Link to="/folha-pagamento">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <Users className="h-6 w-6" />
                <span className="text-sm">Folha</span>
              </Button>
            </Link>
            
            <Link to="/relatorios">
              <Button variant="outline" className="w-full flex flex-col gap-2 h-20">
                <PieChart className="h-6 w-6" />
                <span className="text-sm">Relatórios</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};