
import React, { useState, useEffect } from 'react';
import { ClientSummaryCard } from './ClientSummaryCard';
import { FiscalCalendar } from './FiscalCalendar';
import { DocumentsTable } from './DocumentsTable';
import { AccountingDashboard } from './AccountingDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles, Plus, HelpCircle, Calendar, FileText } from 'lucide-react';
import { BackButton } from '@/components/navigation/BackButton';
import { Link } from 'react-router-dom';
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome';

import { EmptyState } from './EmptyState';
import { LoadingOverlay, FeedbackMessage } from '@/components/ui/feedback';
import { DeleteConfirmation } from '@/components/ui/confirmation';
import { successToast, actionToasts, loadingToast, errorToast } from '@/lib/toast';
import { getDemoData, clearDemoData } from '@/data/demoData';

export const DashboardView = () => {
  const { enhancedLogout, isAccountant, isAdmin } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [demoData, setDemoData] = useState(getDemoData());
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Verificar se é primeira visita
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('contaflix_onboarding_completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('contaflix_onboarding_completed', 'true');
    setShowOnboarding(false);
    setShowOnboarding(false);
    successToast('Onboarding concluído!', 'Você pode acessar a ajuda novamente pelo menu.');
  };


  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    const toastId = actionToasts.upload.loading();
    
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDemoData(getDemoData());
      setShowOnboarding(false);
      
      successToast('Dados demo carregados!', 'Explore os recursos com dados de exemplo.');
    } catch (error) {
      actionToasts.upload.error();
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('contaflix_onboarding_completed');
    setShowOnboarding(true);
  };

  const handleClearDemo = async () => {
    const toastId = actionToasts.delete.loading();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      clearDemoData();
      setDemoData(getDemoData());
      actionToasts.delete.success('Dados demo');
    } catch (error) {
      actionToasts.delete.error();
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const toastId = loadingToast('Saindo...');
    
    try {
      await enhancedLogout();
    } catch (error) {
      errorToast('Erro ao sair', 'Tente novamente.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isDemoMode = localStorage.getItem('contaflix_demo_mode') === 'true';
  const mockEvents = demoData.events || [];
  const mockDocuments = demoData.documents || [];
  
  const stats = demoData.stats || { totalClients: 0, totalDocumentsPending: 0, totalUpcomingDeadlines: 0, fiscalSavings: 0 };

  // Para admins, mostra o dashboard administrativo
  if (isAdmin) {
    return (
      <>
        <AdminDashboard />
        
        {/* Componentes de Onboarding */}
        {showOnboarding && (
           <OnboardingWelcome
             onLoadDemo={handleLoadDemo}
             onSkip={handleOnboardingComplete}
           />
        )}
        
      </>
    );
  }

  // Para contadores, mostra o dashboard contábil
  if (isAccountant) {
    return (
      <>
        <AccountingDashboard />
        
        {/* Componentes de Onboarding */}
        {showOnboarding && (
          <OnboardingWelcome
            onLoadDemo={handleLoadDemo}
            onSkip={handleOnboardingComplete}
          />
        )}

      </>
    );
  }

  return (
    <>
      <div className="space-y-6" data-tour="dashboard-content">
        {/* Header */}
        <div className="flex justify-between items-center" data-tour="dashboard-header">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BackButton />
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Saindo...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </>
                )}
              </Button>
              {isDemoMode && (
                <DeleteConfirmation
                  trigger={
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                    >
                      Limpar Demo
                    </Button>
                  }
                  itemName="dados de demonstração"
                  onConfirm={handleClearDemo}
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-brand text-4xl font-brand tracking-tighter bg-gradient-primary bg-clip-text text-transparent">Dashboard</h1>
              {isDemoMode && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full shadow-md animate-pulse">
                  ✨ Modo Demo
                </div>
              )}
            </div>
            <p className="text-body text-muted-foreground text-lg font-light">
              Visão geral dos seus clientes e obrigações fiscais
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRestartOnboarding}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Ajuda
            </Button>
            <Link to="/ux-demo">
              <Button variant="gradient" className="flex items-center gap-2 shadow-glow">
                <Sparkles className="h-4 w-4" />
                Demo UX
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="client-summary-cards">
          <ClientSummaryCard
            name="Total de Clientes"
            status="regular"
            documentsPending={stats.totalClients}
            upcomingDeadlines={0}
          />
          <ClientSummaryCard
            name="Documentos Pendentes"
            status={stats.totalDocumentsPending > 0 ? "pendente" : "regular"}
            documentsPending={stats.totalDocumentsPending}
            upcomingDeadlines={0}
          />
          <ClientSummaryCard
            name="Prazos Próximos"
            status={stats.totalUpcomingDeadlines > 2 ? "atrasado" : "regular"}
            documentsPending={0}
            upcomingDeadlines={stats.totalUpcomingDeadlines}
          />
          <ClientSummaryCard
            name="Economia Fiscal"
            status="regular"
            documentsPending={Math.floor(stats.fiscalSavings / 1000)}
            upcomingDeadlines={0}
          />
        </div>

        {/* Calendário e Documentos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 interactive-card bg-gradient-to-br from-primary/5 to-transparent border-primary/10" data-tour="fiscal-calendar">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-primary rounded-lg shadow-sm">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                 <div>
                   <CardTitle className="text-display text-lg font-semibold">Calendário Fiscal</CardTitle>
                   <CardDescription className="text-body">
                     Próximas obrigações e eventos fiscais
                   </CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              {mockEvents.length === 0 ? (
                <EmptyState type="events" onLoadDemo={handleLoadDemo} />
              ) : (
                <FiscalCalendar events={mockEvents} />
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-3 interactive-card bg-gradient-to-br from-secondary/50 to-transparent border-muted" data-tour="recent-documents">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                 <div>
                   <CardTitle className="text-display text-lg font-semibold">Documentos Recentes</CardTitle>
                   <CardDescription className="text-body">
                     Últimos documentos enviados pelos clientes
                   </CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              {mockDocuments.length === 0 ? (
                <EmptyState type="documents" onLoadDemo={handleLoadDemo} />
              ) : (
                <DocumentsTable documents={mockDocuments} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Componentes de Onboarding */}
      {showOnboarding && (
        <OnboardingWelcome
          onLoadDemo={handleLoadDemo}
          onSkip={handleOnboardingComplete}
        />
      )}

    </>
  );
};
