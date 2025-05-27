
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricsOverview } from "@/components/admin/analytics/MetricsOverview";
import { GrowthChart } from "@/components/admin/analytics/GrowthChart";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { PlanDistributionChart } from "@/components/admin/analytics/PlanDistributionChart";
import { RetentionMetrics } from "@/components/admin/analytics/RetentionMetrics";
import { 
  fetchBusinessMetrics, 
  fetchMonthlyGrowth, 
  fetchRevenueTrends, 
  fetchPlanDistribution,
  BusinessMetrics,
  MonthlyGrowth,
  RevenueTrend,
  PlanDistribution
} from "@/services/supabase/businessAnalyticsService";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Download, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { AccessRestriction } from "@/components/settings/AccessRestriction";
import { BackButton } from "@/components/navigation/BackButton";

const BusinessAnalytics = () => {
  const { isAdmin, enhancedLogout } = useAuth();
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [monthlyGrowth, setMonthlyGrowth] = useState<MonthlyGrowth[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    console.log("Carregando dados de análise de negócios...");
    setLoading(true);
    try {
      const [metricsData, growthData, revenueData, planData] = await Promise.all([
        fetchBusinessMetrics(),
        fetchMonthlyGrowth(),
        fetchRevenueTrends(),
        fetchPlanDistribution()
      ]);
      
      console.log("Dados carregados:", { metricsData, growthData, revenueData, planData });
      
      setMetrics(metricsData);
      setMonthlyGrowth(growthData);
      setRevenueTrends(revenueData);
      setPlanDistribution(planData);
    } catch (error) {
      console.error('Erro ao carregar dados de análise de negócios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("BusinessAnalytics montado, carregando dados...");
    loadData();
  }, []);

  const handleRefresh = () => {
    console.log("Atualizando dados...");
    loadData();
  };

  const handleExport = () => {
    console.log("Exportando dados...");
    try {
      // Create CSV content for metrics
      const metricsCSV = metrics ? 
        `Metric,Value\nTotal Firms,${metrics.totalFirms}\nGrowth Rate,${metrics.growthRate.toFixed(2)}%\nMonthly Revenue,R$${metrics.monthlyRevenue.toFixed(2)}\nAnnual Revenue,R$${metrics.annualRevenue.toFixed(2)}\nRetention Rate,${metrics.retentionRate.toFixed(2)}%\nChurn Rate,${metrics.churnRate.toFixed(2)}%\nAverage Revenue Per Firm,R$${metrics.averageRevenuePerFirm.toFixed(2)}\n` : 
        '';
        
      // Create CSV content for monthly growth
      const growthCSV = monthlyGrowth.length ? 
        `Month,Firms\n${monthlyGrowth.map(item => `${item.month},${item.firms}`).join('\n')}\n` : 
        '';
      
      // Create CSV content for revenue trends
      const revenueCSV = revenueTrends.length ? 
        `Month,Revenue\n${revenueTrends.map(item => `${item.month},R$${item.revenue.toFixed(2)}`).join('\n')}\n` : 
        '';
      
      // Create CSV content for plan distribution
      const planCSV = planDistribution.length ? 
        `Plan,Count,Percentage\n${planDistribution.map(item => `${item.plan},${item.count},${item.percentage.toFixed(2)}%`).join('\n')}\n` : 
        '';
      
      // Combine all CSV content
      const fullCSV = `BUSINESS ANALYTICS EXPORT - ${new Date().toISOString()}\n\nMETRICS OVERVIEW\n${metricsCSV}\nMONTHLY GROWTH\n${growthCSV}\nREVENUE TRENDS\n${revenueCSV}\nPLAN DISTRIBUTION\n${planCSV}`;
      
      // Create a blob and download link
      const blob = new Blob([fullCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("Dados exportados com sucesso");
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  };

  console.log("BusinessAnalytics renderizando. isAdmin:", isAdmin, "loading:", loading);

  // Show access restriction if user is not admin
  if (!isAdmin) {
    console.log("Usuário não é admin, mostrando restrição de acesso");
    return (
      <DashboardLayout>
        <AccessRestriction />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Indicadores de Negócio</h1>
            <p className="text-muted-foreground">
              Acompanhe os principais indicadores de desempenho do seu SaaS
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <MetricsOverview metrics={metrics || {} as BusinessMetrics} isLoading={loading} />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GrowthChart data={monthlyGrowth} isLoading={loading} />
          <RevenueChart data={revenueTrends} isLoading={loading} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PlanDistributionChart data={planDistribution} isLoading={loading} />
          <RetentionMetrics metrics={metrics || {} as BusinessMetrics} isLoading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessAnalytics;
