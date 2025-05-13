
import React, { useState, useEffect } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { ClientHeader } from "@/components/client-portal/ClientHeader";
import { Documents } from "@/components/client-portal/Documents";
import { FinancialSummary } from "@/components/client-portal/FinancialSummary";
import { TaxObligations } from "@/components/client-portal/TaxObligations";
import { ClientPortalTabs } from "@/components/client-portal/ClientPortalTabs";
import { VoiceAssistant } from "@/components/dashboard/VoiceAssistant";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

const ClientPortal = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<{ id: string; name: string; cnpj: string } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const { enhancedLogout } = useAuth();

  useEffect(() => {
    // Verificar se o cliente está autenticado
    setIsLoading(true);
    const storedClientId = sessionStorage.getItem('client_id');
    const storedClientName = sessionStorage.getItem('client_name');
    const storedClientCnpj = sessionStorage.getItem('client_cnpj');
    
    if (storedClientId && storedClientName && storedClientCnpj) {
      setClientInfo({ 
        id: clientId || storedClientId, 
        name: storedClientName, 
        cnpj: storedClientCnpj 
      });
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [clientId]);

  const handleLogout = () => {
    // Use enhancedLogout para limpar o estado de autenticação
    enhancedLogout();
    
    // Limpar dados da sessão do cliente
    sessionStorage.removeItem('client_id');
    sessionStorage.removeItem('client_name');
    sessionStorage.removeItem('client_cnpj');
    
    // Redirecionar para a página de login de cliente
    navigate("/client-access");
    
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

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
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
          
          <ClientPortalTabs />
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
