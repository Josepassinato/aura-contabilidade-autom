import { supabase } from "@/integrations/supabase/client";
import { reportsService } from "@/services/relatorios/reportsService";

export interface ProcessedAccountingData {
  clientId: string;
  period: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  taxableIncome: number;
  taxes: {
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    iss?: number;
    simples?: number;
  };
  documents: {
    nfe: number;
    invoices: number;
    receipts: number;
  };
}

export const dataProcessingService = {
  /**
   * Processa dados contábeis de um cliente para um período específico
   */
  async processClientAccountingData(clientId: string, period: string): Promise<ProcessedAccountingData> {
    console.log(`Processando dados contábeis do cliente ${clientId} para o período ${period}`);
    
    try {
      // 1. Buscar documentos do cliente
      const { data: documents, error: docError } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .gte('created_at', `${period}-01`)
        .lt('created_at', this.getNextPeriod(period));

      if (docError) throw docError;

      // 2. Buscar dados do cliente
      const { data: client, error: clientError } = await supabase
        .from('accounting_clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // 3. Simular processamento de dados contábeis (em uma implementação real, isso viria de XML/API)
      const processedData = this.simulateAccountingProcessing(client, documents || [], period);

      // 4. Salvar dados processados
      await this.saveProcessedData(processedData);

      // 5. Gerar relatórios automáticos
      await this.generateAutomaticReports(processedData);

      return processedData;
    } catch (error) {
      console.error('Erro ao processar dados contábeis:', error);
      throw error;
    }
  },

  /**
   * Simula o processamento de dados contábeis (substitui integração real)
   */
  simulateAccountingProcessing(client: any, documents: any[], period: string): ProcessedAccountingData {
    // Simular dados baseados no regime tributário e porte da empresa
    const baseRevenue = this.getBaseRevenueByRegime(client.regime);
    const monthlyVariation = Math.random() * 0.3 + 0.85; // Variação de 85% a 115%
    
    const revenue = baseRevenue * monthlyVariation;
    const expenses = revenue * 0.7; // 70% da receita em despesas
    const netIncome = revenue - expenses;
    const taxableIncome = netIncome * 0.9; // 90% do lucro líquido é tributável

    return {
      clientId: client.id,
      period,
      revenue,
      expenses,
      netIncome,
      taxableIncome,
      taxes: this.calculateTaxes(client.regime, revenue, taxableIncome),
      documents: {
        nfe: documents.filter(d => d.type.includes('nfe')).length || 15,
        invoices: documents.filter(d => d.type.includes('invoice')).length || 8,
        receipts: documents.filter(d => d.type.includes('receipt')).length || 25
      }
    };
  },

  /**
   * Calcula impostos baseado no regime tributário
   */
  calculateTaxes(regime: string, revenue: number, taxableIncome: number) {
    switch (regime.toLowerCase()) {
      case 'simples nacional':
        return {
          irpj: 0,
          csll: 0,
          pis: 0,
          cofins: 0,
          simples: revenue * 0.06 // 6% sobre a receita
        };
      case 'lucro presumido':
        return {
          irpj: taxableIncome * 0.15,
          csll: taxableIncome * 0.09,
          pis: revenue * 0.0165,
          cofins: revenue * 0.076
        };
      case 'lucro real':
        return {
          irpj: taxableIncome * 0.15,
          csll: taxableIncome * 0.09,
          pis: revenue * 0.0165,
          cofins: revenue * 0.076
        };
      default:
        return {
          irpj: 0,
          csll: 0,
          pis: 0,
          cofins: 0
        };
    }
  },

  /**
   * Define receita base por regime (valores mensais)
   */
  getBaseRevenueByRegime(regime: string): number {
    switch (regime.toLowerCase()) {
      case 'simples nacional':
        return 50000; // R$ 50.000/mês
      case 'lucro presumido':
        return 150000; // R$ 150.000/mês
      case 'lucro real':
        return 500000; // R$ 500.000/mês
      default:
        return 100000;
    }
  },

  /**
   * Salva dados processados no banco
   */
  async saveProcessedData(data: ProcessedAccountingData) {
    try {
      // Salvar no histórico de processamento (você pode criar uma tabela específica)
      console.log('Dados contábeis processados:', data);
      
      // Aqui você salvaria em uma tabela como 'processed_accounting_data'
      // Por enquanto apenas log para demonstração
    } catch (error) {
      console.error('Erro ao salvar dados processados:', error);
    }
  },

  /**
   * Gera relatórios automáticos baseados nos dados processados
   */
  async generateAutomaticReports(data: ProcessedAccountingData) {
    try {
      // 1. Relatório de Apuração de Impostos
      await reportsService.generateReport({
        title: `Apuração de Impostos - ${data.period}`,
        description: `Relatório automático de impostos calculados para o período ${data.period}`,
        report_type: 'Apuração Fiscal',
        client_id: data.clientId,
        content: this.generateTaxReport(data),
        tags: ['automático', 'impostos', data.period]
      });

      // 2. Relatório de DRE Simplificado
      await reportsService.generateReport({
        title: `DRE Simplificado - ${data.period}`,
        description: `Demonstrativo de Resultado do Exercício para ${data.period}`,
        report_type: 'DRE',
        client_id: data.clientId,
        content: this.generateDREReport(data),
        tags: ['automático', 'dre', data.period]
      });

      // 3. Relatório de Movimentação
      await reportsService.generateReport({
        title: `Relatório de Movimentação - ${data.period}`,
        description: `Resumo da movimentação contábil do período ${data.period}`,
        report_type: 'Movimentação',
        client_id: data.clientId,
        content: this.generateMovementReport(data),
        tags: ['automático', 'movimentação', data.period]
      });

      console.log(`Relatórios automáticos gerados para o cliente ${data.clientId}`);
    } catch (error) {
      console.error('Erro ao gerar relatórios automáticos:', error);
    }
  },

  /**
   * Gera conteúdo do relatório de impostos
   */
  generateTaxReport(data: ProcessedAccountingData): string {
    const totalTaxes = Object.values(data.taxes).reduce((sum, tax) => sum + tax, 0);
    
    return `
RELATÓRIO DE APURAÇÃO DE IMPOSTOS
Período: ${data.period}

RESUMO TRIBUTÁRIO:
- Receita Bruta: R$ ${data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Base de Cálculo: R$ ${data.taxableIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

IMPOSTOS CALCULADOS:
${Object.entries(data.taxes).map(([tax, value]) => 
  `- ${tax.toUpperCase()}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
).join('\n')}

TOTAL DE IMPOSTOS: R$ ${totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
    `.trim();
  },

  /**
   * Gera conteúdo do relatório DRE
   */
  generateDREReport(data: ProcessedAccountingData): string {
    return `
DEMONSTRATIVO DE RESULTADO DO EXERCÍCIO (DRE)
Período: ${data.period}

RECEITAS:
- Receita Bruta: R$ ${data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

DESPESAS:
- Total de Despesas: R$ ${data.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

RESULTADO:
- Lucro Líquido: R$ ${data.netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Margem de Lucro: ${((data.netIncome / data.revenue) * 100).toFixed(2)}%

Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
    `.trim();
  },

  /**
   * Gera conteúdo do relatório de movimentação
   */
  generateMovementReport(data: ProcessedAccountingData): string {
    return `
RELATÓRIO DE MOVIMENTAÇÃO CONTÁBIL
Período: ${data.period}

DOCUMENTOS PROCESSADOS:
- Notas Fiscais Eletrônicas: ${data.documents.nfe}
- Faturas: ${data.documents.invoices}
- Recibos: ${data.documents.receipts}
- Total de Documentos: ${data.documents.nfe + data.documents.invoices + data.documents.receipts}

RESUMO FINANCEIRO:
- Receitas: R$ ${data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Despesas: R$ ${data.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Resultado: R$ ${data.netIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
    `.trim();
  },

  /**
   * Calcula o próximo período para consultas de data
   */
  getNextPeriod(period: string): string {
    const [year, month] = period.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return `${nextYear}-${nextMonth.toString().padStart(2, '0')}`;
  },

  /**
   * Processa dados para todos os clientes ativos
   */
  async processAllActiveClients(period: string) {
    try {
      const { data: clients, error } = await supabase
        .from('accounting_clients')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const results = [];
      for (const client of clients || []) {
        try {
          const result = await this.processClientAccountingData(client.id, period);
          results.push(result);
        } catch (error) {
          console.error(`Erro ao processar cliente ${client.id}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Erro ao processar todos os clientes:', error);
      throw error;
    }
  }
};