
import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientSelector } from "@/components/layout/ClientSelector";
import { Calendar, PieChart, BarChart as BarChartIcon, Download, Filter } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export function PayrollReports() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>(getCurrentPeriod());
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>({
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
    employeeCount: 0,
    averageSalary: 0,
  });
  const [deductionsData, setDeductionsData] = useState<any[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<any[]>([]);
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  
  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  useEffect(() => {
    if (!supabase || !selectedClientId) return;
    
    const fetchReportData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch payroll entries for the client in the period
        const { data: payrollData, error: payrollError } = await supabase
          .from('payroll_entries')
          .select('*')
          .eq('client_id', selectedClientId)
          .eq('period', period);
          
        if (payrollError) throw payrollError;
        
        if (payrollData && payrollData.length > 0) {
          // Calculate summary data
          const totalGross = payrollData.reduce((sum, entry) => sum + entry.gross_salary, 0);
          const totalDeductions = payrollData.reduce((sum, entry) => sum + entry.deductions, 0);
          const totalNet = payrollData.reduce((sum, entry) => sum + entry.net_salary, 0);
          const employeeCount = payrollData.length;
          const averageSalary = totalNet / employeeCount;
          
          setSummaryData({
            totalGross,
            totalDeductions,
            totalNet,
            employeeCount,
            averageSalary,
          });
          
          // Fetch deductions breakdown
          const deductionsPromises = payrollData.map(entry => 
            supabase
              .from('payroll_deductions')
              .select('*')
              .eq('payroll_entry_id', entry.id)
          );
          
          const deductionsResults = await Promise.all(deductionsPromises);
          const allDeductions = deductionsResults
            .flatMap(result => result.data || [])
            .reduce((acc: any, curr: any) => {
              const existingType = acc.find((item: any) => item.type === curr.type);
              if (existingType) {
                existingType.amount += curr.amount;
              } else {
                acc.push({
                  type: curr.type,
                  description: curr.description,
                  amount: curr.amount
                });
              }
              return acc;
            }, []);
          
          setDeductionsData(allDeductions);
          
          // Fetch monthly trend data (simplified, would need multiple queries in real app)
          // For demo purposes, generating some mock trend data
          generateMockTrendData(totalNet);
        }
      } catch (error: any) {
        console.error('Error fetching report data:', error);
        toast({
          title: "Erro ao gerar relatórios",
          description: error.message || "Não foi possível carregar os dados para relatórios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReportData();
  }, [supabase, selectedClientId, period, toast]);
  
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };
  
  const generateMockTrendData = (currentValue: number) => {
    const data = [];
    const [year, month] = period.split('-');
    const currentMonth = parseInt(month);
    const currentYear = parseInt(year);
    
    // Generate data for past 6 months
    for (let i = 5; i >= 0; i--) {
      let monthIdx = currentMonth - i;
      let yearValue = currentYear;
      
      if (monthIdx <= 0) {
        monthIdx += 12;
        yearValue -= 1;
      }
      
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      
      // Some random variation from the current value
      const variation = (Math.random() * 0.2) - 0.1; // -10% to +10%
      const variationFactor = 1 + variation;
      
      const value = i === 0 ? currentValue : currentValue * variationFactor;
      
      data.push({
        name: `${monthNames[monthIdx - 1]}/${yearValue}`,
        valor: Math.round(value)
      });
    }
    
    setMonthlyTrendData(data);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };
  
  // Generate period options for the select
  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Generate options for the current year and the previous year
    for (let year = currentYear; year >= currentYear - 1; year--) {
      const maxMonth = year === currentYear ? currentMonth : 12;
      
      for (let month = maxMonth; month >= 1; month--) {
        const monthStr = String(month).padStart(2, '0');
        const periodValue = `${year}-${monthStr}`;
        const periodLabel = formatPeriod(periodValue);
        
        options.push(
          <option key={periodValue} value={periodValue}>
            {periodLabel}
          </option>
        );
      }
    }
    
    return options;
  };
  
  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Relatórios de Folha de Pagamento</h3>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <ClientSelector onSelectClient={handleClientChange} />
        </div>
        
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatePeriodOptions()}
            </select>
          </div>
        </div>
        
        <div className="w-full md:w-1/6">
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>
      
      {!selectedClientId ? (
        <div className="py-8 text-center border rounded-md">
          Selecione um cliente para visualizar os relatórios.
        </div>
      ) : isLoading ? (
        <div className="py-8 text-center border rounded-md">
          Carregando relatórios...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total da Folha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.totalNet)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summaryData.employeeCount} funcionários
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Salário Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.averageSalary)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPeriod(period)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Descontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.totalDeductions)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((summaryData.totalDeductions / summaryData.totalGross) * 100).toFixed(1)}% do bruto
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Composição dos Descontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deductionsData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={deductionsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                          nameKey="description"
                        >
                          {deductionsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), 'Valor']}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Sem dados de descontos disponíveis
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChartIcon className="h-5 w-5 mr-2" />
                  Evolução da Folha nos Últimos 6 Meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyTrendData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyTrendData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                        <Legend />
                        <Bar dataKey="valor" name="Valor Líquido" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    Sem dados históricos disponíveis
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
