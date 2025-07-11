
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClientHeader } from "@/components/client-portal/ClientHeader";
import { ClientPortalTabs } from "@/components/client-portal/ClientPortalTabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowLeft } from "lucide-react";
import { VoiceAssistant } from "@/components/dashboard/VoiceAssistant";
import { VoiceAssistantButton } from "@/components/layout/VoiceAssistantButton";
import { ClientDocumentUpload } from "@/components/client-portal/ClientDocumentUpload";
import { ExternalIntegrations } from "@/components/client-portal/ExternalIntegrations";
import { BlingDashboard } from "@/components/integracoes/BlingDashboard";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ClientPortal = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState<string>("");
  const [clientCNPJ, setClientCNPJ] = useState<string>("");
  const [loading, setIsLoading] = useState<boolean>(true);
  const [isAssistantActive, setIsAssistantActive] = useState<boolean>(false);

  useEffect(() => {
    const checkClientAccess = () => {
      // Verificar se existe sessão de cliente
      const storedClientId = sessionStorage.getItem('client_id');
      const storedClientName = sessionStorage.getItem('client_name');
      const storedClientCNPJ = sessionStorage.getItem('client_cnpj');
      const clientAuthenticated = sessionStorage.getItem('client_authenticated') === 'true';
      
      if (!clientAuthenticated || !storedClientId) {
        // Cliente não autenticado, redirecionar para página de acesso
        toast({
          title: "Acesso não autorizado",
          description: "Faça login para acessar o portal do cliente",
          variant: "destructive",
        });
        navigate('/client-access');
        return;
      }
      
      // Se temos ID específico na URL, verificar se corresponde ao cliente autenticado
      if (clientId && clientId !== storedClientId && clientId !== 'test-client-123') {
        // ID da URL não corresponde ao cliente autenticado
        if (storedClientId === 'test-client-123') {
          // Para cliente de teste, permitimos acesso a qualquer ID para demonstração
          toast({
            title: "Modo de demonstração",
            description: "Acesso permitido em modo de teste",
          });
        } else {
          toast({
            title: "Cliente incorreto",
            description: "Você não tem permissão para acessar este cliente",
            variant: "destructive",
          });
          navigate(`/client-portal/${storedClientId}`);
          return;
        }
      }
      
      // Configurar dados do cliente
      setClientName(storedClientName || "Cliente");
      setClientCNPJ(storedClientCNPJ || "");
      setIsLoading(false);
    };
    
    checkClientAccess();
  }, [clientId, navigate, toast]);

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleLogout = () => {
    // Limpar dados da sessão do cliente
    sessionStorage.removeItem('client_id');
    sessionStorage.removeItem('client_name');
    sessionStorage.removeItem('client_cnpj');
    sessionStorage.removeItem('client_access_token');
    sessionStorage.removeItem('client_authenticated');
    
    toast({
      title: "Sessão encerrada",
      description: "Você saiu do portal do cliente",
    });
    
    // Redirecionar para a página de acesso
    navigate('/client-access');
  };

  const toggleAssistant = () => {
    setIsAssistantActive(!isAssistantActive);
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="container flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados do cliente...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Cliente info para o assistente de voz com acesso restrito aos dados deste cliente
  const clientInfo = {
    id: clientId || sessionStorage.getItem('client_id') || '',
    name: clientName,
    cnpj: clientCNPJ,
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Portal do Cliente</h1>
            <p className="text-muted-foreground">
              Acesse suas informações e documentos em um só lugar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VoiceAssistantButton 
              isActive={isAssistantActive}
              onClick={toggleAssistant}
              className="md:flex hidden"
            />
          </div>
        </div>

        {/* Add new document upload component */}
        <div className="mb-6">
          <ClientDocumentUpload clientId={clientId || ''} />
        </div>

        {/* Main content tabs */}
        <ClientPortalTabs toggleAssistant={toggleAssistant} />
        
        {/* External integrations section */}
        <div className="mt-8 space-y-6">
          <ExternalIntegrations clientId={clientId || ''} />
          <BlingDashboard clientId={clientId || ''} />
        </div>

        {/* Voice assistant (now managed by DashboardLayout) */}
        <VoiceAssistant 
          isActive={isAssistantActive}
          onToggle={toggleAssistant}
          clientInfo={clientInfo}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientPortal;
