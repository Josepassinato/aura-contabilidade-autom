
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClientHeader } from "@/components/client-portal/ClientHeader";
import { ClientPortalTabs } from "@/components/client-portal/ClientPortalTabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

const ClientPortal = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientName, setClientName] = useState<string>("");
  const [clientCNPJ, setClientCNPJ] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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
      setLoading(false);
    };
    
    checkClientAccess();
  }, [clientId, navigate, toast]);
  
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
  
  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container flex items-center justify-between py-3">
          <ClientHeader clientName={clientName} clientCNPJ={clientCNPJ} />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <ClientPortalTabs />
      </main>
      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Portal do Cliente © {new Date().getFullYear()} - ContaFlix</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientPortal;
