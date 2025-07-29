import React, { useState, useEffect } from 'react';
import { ClientSummaryCard } from './ClientSummaryCard';
import { FiscalCalendar } from './FiscalCalendar';
import { DocumentsTable } from './DocumentsTable';
import { AccountingDashboard } from './AccountingDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, HelpCircle, Calendar, FileText } from 'lucide-react';
import { BackButton } from '@/components/navigation/BackButton';
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome';
import { EmptyState } from './EmptyState';
import { LoadingOverlay, FeedbackMessage } from '@/components/ui/feedback';
import { successToast, actionToasts, loadingToast, errorToast } from '@/lib/toast';
import { logger } from "@/utils/logger";
import { AIStatusChecker } from '@/components/ai/AIStatusChecker';
import { supabase } from '@/integrations/supabase/client';

export const DashboardView = () => {
  const { enhancedLogout, isAccountant, isAdmin, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDocumentsPending: 0,
    totalUpcomingDeadlines: 0,
    fiscalSavings: 0
  });
  
  // Verificar se é primeira visita
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('contaflix_onboarding_completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Carregar dados reais da base de dados
  useEffect(() => {
    const loadRealData = async () => {
      if (!user?.id) return;

      try {
        // Buscar clientes reais
        const { data: clientsData, error: clientsError } = await supabase
          .from('accounting_clients')
          .select('*')
          .eq('accountant_id', user.id);

        if (!clientsError && clientsData) {
          setClients(clientsData);
          setStats(prev => ({
            ...prev,
            totalClients: clientsData.length
          }));
        }

        // Buscar documentos reais
        const { data: documentsData, error: documentsError } = await supabase
          .from('generated_reports')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!documentsError && documentsData) {
          setDocuments(documentsData);
        }

        // Buscar eventos fiscais reais
        const { data: eventsData, error: eventsError } = await supabase
          .from('obrigacoes_fiscais')
          .select('*')
          .gte('prazo', new Date().toISOString())
          .order('prazo', { ascending: true })
          .limit(10);

        if (!eventsError && eventsData) {
          setEvents(eventsData);
          setStats(prev => ({
            ...prev,
            totalUpcomingDeadlines: eventsData.length
          }));
        }

      } catch (error) {
        logger.error('Erro ao carregar dados:', error, 'DashboardView');
      }
    };

    loadRealData();
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('contaflix_onboarding_completed', 'true');
    setShowOnboarding(false);
    successToast('Onboarding concluído!', 'Você pode acessar a ajuda novamente pelo menu.');
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('contaflix_onboarding_completed');
    setShowOnboarding(true);
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

  // Para admins, mostra o dashboard administrativo
  if (isAdmin) {
    return (
      <>
        <AdminDashboard />
        
        {/* Componentes de Onboarding */}
        {showOnboarding && (
           <OnboardingWelcome
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
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-brand text-4xl font-brand tracking-tighter bg-gradient-primary bg-clip-text text-transparent">Dashboard</h1>
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

        {/* Testador de IA */}
        <AIStatusChecker />

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
              {events.length === 0 ? (
                <EmptyState type="events" />
              ) : (
                <FiscalCalendar events={events} />
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
                     Últimos documentos gerados
                   </CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <EmptyState type="documents" />
              ) : (
                <DocumentsTable documents={documents} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Componentes de Onboarding */}
      {showOnboarding && (
        <OnboardingWelcome
          onSkip={handleOnboardingComplete}
        />
      )}

    </>
  );
};