import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Pause } from 'lucide-react';
import {
  BarChart3,
  FileText,
  Database,
  Mail,
  Cog
} from 'lucide-react';
import { AutomationRule } from '@/types/automation';


interface AutomationAnalyticsProps {
  rules: AutomationRule[];
}

export const AutomationAnalytics: React.FC<AutomationAnalyticsProps> = ({ rules }) => {
  const getProcessTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_accounting': return <BarChart3 className="h-4 w-4" />;
      case 'monthly_reports': return <FileText className="h-4 w-4" />;
      case 'data_backup': return <Database className="h-4 w-4" />;
      case 'send_emails': return <Mail className="h-4 w-4" />;
      default: return <Cog className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Performance das Regras</CardTitle>
          <CardDescription>
            Acompanhe a performance de cada regra ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.slice(0, 5).map((rule) => {
              const successRate = ((rule.success_count / Math.max(rule.success_count + rule.error_count, 1)) * 100);
              const firstAction = rule.actions?.[0];
              const actionType = firstAction?.type || 'unknown';
              
              return (
                <div key={rule.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getProcessTypeIcon(actionType)}
                    <span className="font-medium">{rule.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={successRate} className="w-16" />
                    <span className="text-sm text-muted-foreground">
                      {successRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas execuções de regras automatizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules
              .filter(rule => rule.last_run)
              .sort((a, b) => new Date(b.last_run!).getTime() - new Date(a.last_run!).getTime())
              .slice(0, 5)
              .map((rule) => (
                <div key={rule.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(rule.last_run!).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {rule.enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Pause className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};