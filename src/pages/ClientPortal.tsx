
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceAssistant } from "@/components/dashboard/VoiceAssistant";
import { LogOut, Building, FileText, Calendar, DollarSign } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";

// Componente para o cabeçalho do portal do cliente
const ClientHeader = ({ clientName, onLogout }: { clientName: string, onLogout: () => void }) => (
  <header className="h-16 px-6 border-b flex items-center justify-between bg-background">
    <div className="flex items-center space-x-2">
      <Building className="h-5 w-5 text-primary" />
      <h1 className="text-lg font-medium">{clientName}</h1>
    </div>
    <Button variant="outline" size="sm" onClick={onLogout}>
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  </header>
);

// Componente para exibir um resumo financeiro
const FinancialSummary = ({ clientId }: { clientId: string }) => {
  const [data, setData] = useState({
    revenue: 'R$ 85.432,18',
    expenses: 'R$ 42.765,90',
    profit: 'R$ 42.666,28',
    taxesDue: 'R$ 12.814,83'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Receita (mês atual)</p>
            <p className="text-xl font-medium">{data.revenue}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesas (mês atual)</p>
            <p className="text-xl font-medium">{data.expenses}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lucro</p>
            <p className="text-xl font-medium text-green-600">{data.profit}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Impostos a pagar</p>
            <p className="text-xl font-medium text-amber-600">{data.taxesDue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para exibir obrigações fiscais
const TaxObligations = ({ clientId }: { clientId: string }) => {
  const [obligations, setObligations] = useState([
    { id: 1, name: 'DARF PIS/COFINS', dueDate: '25/05/2025', amount: 'R$ 4.271,61', status: 'pendente' },
    { id: 2, name: 'DARF IRPJ', dueDate: '30/05/2025', amount: 'R$ 6.814,82', status: 'pendente' },
    { id: 3, name: 'GFIP', dueDate: '20/05/2025', amount: 'R$ 1.728,40', status: 'pendente' }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Obrigações Fiscais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {obligations.map(obligation => (
            <div key={obligation.id} className="flex justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">{obligation.name}</p>
                <p className="text-sm text-muted-foreground">Vencimento: {obligation.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{obligation.amount}</p>
                <p className={`text-xs px-2 py-1 rounded-full inline-block 
                  ${obligation.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                    obligation.status === 'pago' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {obligation.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para exibir documentos
const Documents = ({ clientId }: { clientId: string }) => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Balanço Patrimonial', date: '10/05/2025', type: 'contábil' },
    { id: 2, name: 'DRE', date: '10/05/2025', type: 'contábil' },
    { id: 3, name: 'Notas Fiscais Abril', date: '05/05/2025', type: 'fiscal' }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex justify-between p-2 border-b">
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.date}</p>
              </div>
              <div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {doc.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ClientPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [clientInfo, setClientInfo] = useState<{ id: string; name: string; cnpj: string } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  useEffect(() => {
    // Verificar se o cliente está autenticado
    const clientId = sessionStorage.getItem('client_id');
    const clientName = sessionStorage.getItem('client_name');
    const clientCnpj = sessionStorage.getItem('client_cnpj');
    
    if (clientId && clientName && clientCnpj) {
      setClientInfo({ id: clientId, name: clientName, cnpj: clientCnpj });
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    // Limpar dados da sessão
    sessionStorage.removeItem('client_id');
    sessionStorage.removeItem('client_name');
    sessionStorage.removeItem('client_cnpj');
    
    // Redirecionar para a página de login
    setIsAuthenticated(false);
    
    toast({
      title: "Sessão encerrada",
      description: "Você saiu do portal do cliente",
    });
  };

  const toggleVoiceAssistant = () => {
    setIsVoiceActive(!isVoiceActive);
    
    if (!isVoiceActive) {
      toast({
        title: "Assistente de voz ativado",
        description: "Agora você pode fazer perguntas sobre seus dados contábeis",
      });
    }
  };

  // Se o estado de autenticação ainda não foi determinado, mostrar uma tela de carregamento
  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  // Se não estiver autenticado, redirecionar para a página de acesso
  if (isAuthenticated === false) {
    return <Navigate to="/client-access" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ClientHeader 
        clientName={clientInfo?.name || "Cliente"} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Portal do Cliente</h1>
            <Button 
              onClick={toggleVoiceAssistant}
              className={isVoiceActive ? "bg-primary text-primary-foreground" : ""}
            >
              {isVoiceActive ? "Desativar Assistente" : "Ativar Assistente de IA"}
            </Button>
          </div>
          
          <FinancialSummary clientId={clientInfo?.id || ""} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaxObligations clientId={clientInfo?.id || ""} />
            <Documents clientId={clientInfo?.id || ""} />
          </div>
          
          <Tabs defaultValue="fiscal" className="w-full">
            <TabsList>
              <TabsTrigger value="fiscal">Obrigações Fiscais</TabsTrigger>
              <TabsTrigger value="accounting">Contabilidade</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>
            <div className="p-4 border rounded-lg mt-4">
              <TabsContent value="fiscal">
                <h2 className="text-lg font-medium mb-4">Calendário Fiscal</h2>
                <p className="text-muted-foreground">
                  Aqui você encontra todas as suas obrigações fiscais, prazos e valores.
                  Fale com a assistente de IA para obter detalhes específicos.
                </p>
              </TabsContent>
              <TabsContent value="accounting">
                <h2 className="text-lg font-medium mb-4">Registros Contábeis</h2>
                <p className="text-muted-foreground">
                  Visualize seus demonstrativos contábeis, balancetes e outros documentos.
                  A assistente de IA pode gerar relatórios personalizados conforme sua necessidade.
                </p>
              </TabsContent>
              <TabsContent value="reports">
                <h2 className="text-lg font-medium mb-4">Relatórios Gerenciais</h2>
                <p className="text-muted-foreground">
                  Acompanhe indicadores financeiros e relatórios gerenciais da sua empresa.
                  Pergunte à assistente de IA para analisar tendências e oportunidades.
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      
      {isVoiceActive && (
        <VoiceAssistant 
          isActive={isVoiceActive} 
          onToggle={toggleVoiceAssistant} 
          clientInfo={clientInfo}
        />
      )}
    </div>
  );
};

export default ClientPortal;
