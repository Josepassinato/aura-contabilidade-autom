import { supabase } from "@/integrations/supabase/client";

export interface AnomalyDetectionConfig {
  client_id: string;
  analysis_type: 'financial' | 'documents' | 'patterns';
  period?: string;
  threshold?: number;
  include_predictions?: boolean;
}

export interface DetectedAnomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  current_value?: number;
  expected_value?: number;
  expected_range?: [number, number];
  period?: string;
  client_id: string;
  detected_at: string;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  metadata?: any;
}

export interface AnomalyAnalysisResult {
  success: boolean;
  anomalies: DetectedAnomaly[];
  analysis_summary: {
    total_anomalies: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
    analysis_date: string;
    data_points_analyzed: number;
  };
  recommendations?: string[];
  error?: string;
}

class AnomalyService {
  /**
   * Executa detecção de anomalias usando IA
   */
  async detectAnomalies(config: AnomalyDetectionConfig): Promise<AnomalyAnalysisResult> {
    try {
      const { data, error } = await supabase.functions.invoke('advanced-anomaly-detection', {
        body: config
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      return {
        success: false,
        anomalies: [],
        analysis_summary: {
          total_anomalies: 0,
          high_severity: 0,
          medium_severity: 0,
          low_severity: 0,
          analysis_date: new Date().toISOString(),
          data_points_analyzed: 0
        },
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Salva uma anomalia detectada no banco de dados
   */
  async saveAnomaly(anomaly: Omit<DetectedAnomaly, 'id' | 'detected_at'>): Promise<DetectedAnomaly | null> {
    try {
      // Em um sistema real, isso seria salvo em uma tabela de anomalias
      // Por enquanto, vamos simular salvando nos logs de automação
      const { data, error } = await supabase
        .from('automation_logs')
        .insert({
          process_type: 'anomaly_detection',
          client_id: anomaly.client_id,
          status: 'completed',
          records_processed: 1,
          metadata: {
            anomaly_type: anomaly.type,
            severity: anomaly.severity,
            description: anomaly.description,
            confidence: anomaly.confidence,
            current_value: anomaly.current_value,
            expected_value: anomaly.expected_value,
            expected_range: anomaly.expected_range,
            period: anomaly.period,
            anomaly_status: anomaly.status,
            additional_metadata: anomaly.metadata
          }
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        detected_at: data.created_at,
        ...anomaly
      };
    } catch (error) {
      console.error('Error saving anomaly:', error);
      return null;
    }
  }

  /**
   * Busca anomalias salvas por cliente
   */
  async getAnomaliesByClient(clientId: string, filters?: {
    severity?: string;
    status?: string;
    period?: string;
  }): Promise<DetectedAnomaly[]> {
    try {
      let query = supabase
        .from('automation_logs')
        .select('*')
        .eq('process_type', 'anomaly_detection')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Converter logs para formato de anomalias
      return data.map(log => {
        const metadata = log.metadata as any;
        return {
          id: log.id,
          type: metadata?.anomaly_type || 'unknown',
          severity: metadata?.severity || 'medium',
          description: metadata?.description || 'Anomalia detectada',
          confidence: metadata?.confidence || 0.5,
          current_value: metadata?.current_value,
          expected_value: metadata?.expected_value,
          expected_range: metadata?.expected_range,
          period: metadata?.period,
          client_id: log.client_id || '',
          detected_at: log.created_at,
          status: metadata?.anomaly_status || 'pending',
          metadata: metadata?.additional_metadata
        };
      });
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  }

  /**
   * Atualiza o status de uma anomalia
   */
  async updateAnomalyStatus(
    anomalyId: string, 
    status: 'pending' | 'investigating' | 'resolved' | 'false_positive',
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('automation_logs')
        .update({
          metadata: {
            anomaly_status: status,
            status_notes: notes,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', anomalyId);

      return !error;
    } catch (error) {
      console.error('Error updating anomaly status:', error);
      return false;
    }
  }

  /**
   * Executa análise de padrões comportamentais
   */
  async analyzePatterns(clientId: string, period: string): Promise<{
    patterns: any[];
    anomalies: DetectedAnomaly[];
    insights: string[];
  }> {
    try {
      // Buscar dados processados para análise
      const { data: processedData, error } = await supabase
        .from('processed_accounting_data')
        .select('*')
        .eq('client_id', clientId)
        .order('period', { ascending: true });

      if (error) throw error;

      if (!processedData || processedData.length < 3) {
        return {
          patterns: [],
          anomalies: [],
          insights: ['Dados insuficientes para análise de padrões (mínimo 3 períodos)']
        };
      }

      // Análise estatística básica
      const revenues = processedData.map(d => parseFloat(d.revenue?.toString() || '0'));
      const expenses = processedData.map(d => parseFloat(d.expenses?.toString() || '0'));
      
      const patterns = this.identifyPatterns(revenues, expenses, processedData);
      const anomalies = this.detectPatternAnomalies(patterns, processedData);
      const insights = this.generateInsights(patterns, anomalies);

      return { patterns, anomalies, insights };
    } catch (error) {
      console.error('Error in pattern analysis:', error);
      return {
        patterns: [],
        anomalies: [],
        insights: ['Erro na análise de padrões']
      };
    }
  }

  /**
   * Identifica padrões nos dados financeiros
   */
  private identifyPatterns(revenues: number[], expenses: number[], data: any[]) {
    const patterns = [];

    // Tendência de crescimento
    const revenueGrowth = this.calculateGrowthTrend(revenues);
    const expenseGrowth = this.calculateGrowthTrend(expenses);

    patterns.push({
      type: 'growth_trend',
      metric: 'revenue',
      trend: revenueGrowth > 0 ? 'growing' : 'declining',
      rate: revenueGrowth,
      confidence: Math.abs(revenueGrowth) > 0.05 ? 0.8 : 0.5
    });

    patterns.push({
      type: 'growth_trend',
      metric: 'expenses',
      trend: expenseGrowth > 0 ? 'increasing' : 'decreasing',
      rate: expenseGrowth,
      confidence: Math.abs(expenseGrowth) > 0.05 ? 0.8 : 0.5
    });

    // Sazonalidade (se houver dados suficientes)
    if (data.length >= 12) {
      const seasonality = this.detectSeasonality(revenues);
      if (seasonality.detected) {
        patterns.push({
          type: 'seasonality',
          metric: 'revenue',
          pattern: seasonality.pattern,
          confidence: seasonality.confidence
        });
      }
    }

    return patterns;
  }

  /**
   * Detecta anomalias baseadas em padrões
   */
  private detectPatternAnomalies(patterns: any[], data: any[]): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const latestData = data[data.length - 1];

    if (!latestData) return anomalies;

    // Verificar quebras de tendência
    const revenueTrend = patterns.find(p => p.type === 'growth_trend' && p.metric === 'revenue');
    if (revenueTrend && revenueTrend.confidence > 0.7) {
      const currentRevenue = parseFloat(latestData.revenue?.toString() || '0');
      const previousRevenue = data.length > 1 ? parseFloat(data[data.length - 2].revenue?.toString() || '0') : 0;
      
      if (previousRevenue > 0) {
        const actualGrowth = (currentRevenue - previousRevenue) / previousRevenue;
        const expectedGrowth = revenueTrend.rate;
        
        if (Math.abs(actualGrowth - expectedGrowth) > 0.2) { // Diferença > 20%
          anomalies.push({
            id: `pattern_${Date.now()}_1`,
            type: 'pattern_break',
            severity: Math.abs(actualGrowth - expectedGrowth) > 0.4 ? 'high' : 'medium',
            description: `Quebra no padrão de crescimento de receita detectada`,
            confidence: 0.8,
            current_value: currentRevenue,
            expected_value: previousRevenue * (1 + expectedGrowth),
            period: latestData.period,
            client_id: latestData.client_id,
            detected_at: new Date().toISOString(),
            status: 'pending',
            metadata: {
              actual_growth: actualGrowth,
              expected_growth: expectedGrowth,
              pattern_type: 'revenue_trend'
            }
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Gera insights baseados nos padrões e anomalias
   */
  private generateInsights(patterns: any[], anomalies: DetectedAnomaly[]): string[] {
    const insights: string[] = [];

    // Insights sobre tendências
    const revenueTrend = patterns.find(p => p.type === 'growth_trend' && p.metric === 'revenue');
    if (revenueTrend) {
      if (revenueTrend.trend === 'growing' && revenueTrend.rate > 0.1) {
        insights.push(`Crescimento consistente de receita detectado (${(revenueTrend.rate * 100).toFixed(1)}% ao período)`);
      } else if (revenueTrend.trend === 'declining' && revenueTrend.rate < -0.05) {
        insights.push(`Tendência de declínio na receita requer atenção (${(Math.abs(revenueTrend.rate) * 100).toFixed(1)}% de queda ao período)`);
      }
    }

    // Insights sobre anomalias
    if (anomalies.length > 0) {
      const highSeverity = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical').length;
      if (highSeverity > 0) {
        insights.push(`${highSeverity} anomalia(s) de alta severidade detectada(s) - revisão imediata recomendada`);
      }
    }

    // Insights sobre sazonalidade
    const seasonality = patterns.find(p => p.type === 'seasonality');
    if (seasonality) {
      insights.push('Padrão sazonal detectado - considerar ajustes nos orçamentos e previsões');
    }

    return insights;
  }

  /**
   * Calcula tendência de crescimento
   */
  private calculateGrowthTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const validValues = values.filter(v => v > 0);
    if (validValues.length < 2) return 0;

    let totalGrowth = 0;
    let periods = 0;

    for (let i = 1; i < validValues.length; i++) {
      const growth = (validValues[i] - validValues[i-1]) / validValues[i-1];
      totalGrowth += growth;
      periods++;
    }

    return periods > 0 ? totalGrowth / periods : 0;
  }

  /**
   * Detecta sazonalidade básica
   */
  private detectSeasonality(values: number[]): {
    detected: boolean;
    pattern: any;
    confidence: number;
  } {
    if (values.length < 12) {
      return { detected: false, pattern: null, confidence: 0 };
    }

    // Análise básica de sazonalidade (implementação simplificada)
    // Em produção, usaria FFT ou métodos mais sofisticados
    const quarters = [
      values.filter((_, i) => i % 12 < 3),  // Q1
      values.filter((_, i) => i % 12 >= 3 && i % 12 < 6),  // Q2
      values.filter((_, i) => i % 12 >= 6 && i % 12 < 9),  // Q3
      values.filter((_, i) => i % 12 >= 9)  // Q4
    ];

    const quarterlyAvgs = quarters.map(q => 
      q.length > 0 ? q.reduce((a, b) => a + b, 0) / q.length : 0
    );

    const overallAvg = quarterlyAvgs.reduce((a, b) => a + b, 0) / 4;
    const variance = quarterlyAvgs.reduce((sum, avg) => sum + Math.pow(avg - overallAvg, 2), 0) / 4;
    const stdDev = Math.sqrt(variance);
    const coefficient = overallAvg > 0 ? stdDev / overallAvg : 0;

    return {
      detected: coefficient > 0.15, // 15% de variação considera sazonal
      pattern: {
        quarterly_averages: quarterlyAvgs,
        coefficient_of_variation: coefficient
      },
      confidence: Math.min(coefficient * 5, 1) // Máximo 1.0
    };
  }

  /**
   * Configurações padrão para diferentes tipos de análise
   */
  getDefaultConfig(analysisType: 'financial' | 'documents' | 'patterns'): Partial<AnomalyDetectionConfig> {
    const configs = {
      financial: {
        analysis_type: 'financial' as const,
        threshold: 0.7,
        include_predictions: true
      },
      documents: {
        analysis_type: 'documents' as const,
        threshold: 0.8,
        include_predictions: false
      },
      patterns: {
        analysis_type: 'patterns' as const,
        threshold: 0.6,
        include_predictions: true
      }
    };

    return configs[analysisType];
  }
}

export const anomalyService = new AnomalyService();