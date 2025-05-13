
import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { OpenAIManagement } from '@/components/admin/openai/OpenAIManagement';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OpenAIManagementPage = () => {
  const { isAdmin } = useAuth();
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
      <OpenAIManagement />
    </DashboardLayout>
  );
};

export default OpenAIManagementPage;
