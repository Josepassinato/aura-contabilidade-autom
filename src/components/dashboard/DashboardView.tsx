
import React, { useState, useEffect } from 'react';
import { ClientSummaryCard } from './ClientSummaryCard';
import { FiscalCalendar } from './FiscalCalendar';
import { DocumentsTable } from './DocumentsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles, Plus, HelpCircle, Calendar, FileText } from 'lucide-react';
import { BackButton } from '@/components/navigation/BackButton';
import { Link } from 'react-router-dom';
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { EmptyState } from './EmptyState';
import { getDemoData, clearDemoData } from '@/data/demoData';

export const DashboardView = () => {
  const { enhancedLogout } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [demoData, setDemoData] = useState(getDemoData());
  
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
    setShowTour(false);
  };

  const handleStartTour = () => {
    setShowOnboarding(false);
    setShowTour(true);
  };

  const handleLoadDemo = () => {
    setDemoData(getDemoData());
    setShowOnboarding(false);
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('contaflix_onboarding_completed');
    setShowOnboarding(true);
  };

  const handleClearDemo = () => {
    clearDemoData();
    setDemoData(getDemoData());
  };

  const isDemoMode = localStorage.getItem('contaflix_demo_mode') === 'true';
  const mockEvents = demoData.events || [];
  const mockDocuments = demoData.documents || [];
  
  const stats = demoData.stats || { totalClients: 0, totalDocumentsPending: 0, totalUpcomingDeadlines: 0, fiscalSavings: 0 };

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
                onClick={enhancedLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              {isDemoMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={handleClearDemo}
                >
                  Limpar Demo
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              {isDemoMode && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Modo Demo
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
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
              <Button variant="outline" className="flex items-center gap-2">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4" data-tour="fiscal-calendar">
            <CardHeader>
              <CardTitle>Calendário Fiscal</CardTitle>
              <CardDescription>
                Próximas obrigações e eventos fiscais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockEvents.length === 0 ? (
                <EmptyState type="events" onLoadDemo={handleLoadDemo} />
              ) : (
                <FiscalCalendar events={mockEvents} />
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-3" data-tour="recent-documents">
            <CardHeader>
              <CardTitle>Documentos Recentes</CardTitle>
              <CardDescription>
                Últimos documentos enviados pelos clientes
              </CardDescription>
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
          onStartTour={handleStartTour}
          onLoadDemo={handleLoadDemo}
          onSkip={handleOnboardingComplete}
        />
      )}

      {showTour && (
        <OnboardingTour
          isOpen={showTour}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
    </>
  );
};
