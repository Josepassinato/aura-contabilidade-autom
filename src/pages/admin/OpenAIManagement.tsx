
import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { OpenAIManagement } from '@/components/admin/openai/OpenAIManagement';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from "@/components/navigation/BackButton";

const OpenAIManagementPage = () => {
  const { isAdmin, enhancedLogout } = useAuth();
  const navigate = useNavigate();
  
  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acesso Restrito</AlertTitle>
            <AlertDescription>
              Esta página está disponível apenas para administradores.
            </AlertDescription>
          </Alert>
          
          <Button onClick={() => navigate('/')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BackButton />
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center"
            onClick={enhancedLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Gerenciamento de OpenAI</h1>
        <p className="text-muted-foreground">
          Configure as integrações e funções de inteligência artificial
        </p>
      </div>
      
      <OpenAIManagement />
    </DashboardLayout>
  );
};

export default OpenAIManagementPage;
