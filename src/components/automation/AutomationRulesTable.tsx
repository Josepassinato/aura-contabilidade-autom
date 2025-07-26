import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play } from 'lucide-react';
import {
  BarChart3,
  FileText,
  Database,
  Mail,
  Cog
} from 'lucide-react';
import { AutomationRule } from '@/types/automation';


interface AutomationRulesTableProps {
  rules: AutomationRule[];
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onExecuteRule: (ruleId: string) => void;
}

export const AutomationRulesTable: React.FC<AutomationRulesTableProps> = ({
  rules,
  onToggleRule,
  onExecuteRule
}) => {
  const getStatusBadge = (enabled: boolean, successCount: number, errorCount: number) => {
    if (!enabled) {
      return <Badge variant="outline">Inativo</Badge>;
    }
    
    const errorRate = (errorCount / Math.max(successCount + errorCount, 1)) * 100;
    
    if (errorRate > 20) {
      return <Badge variant="destructive">Com Problemas</Badge>;
    } else if (errorRate > 10) {
      return <Badge variant="secondary">Atenção</Badge>;
    } else {
      return <Badge variant="default">Ativo</Badge>;
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle>Regras Configuradas</CardTitle>
        <CardDescription>
          Gerencie suas regras de automação e monitore sua performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Execução</TableHead>
              <TableHead>Sucessos/Erros</TableHead>
              <TableHead>Taxa de Sucesso</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => {
              const successRate = ((rule.success_count / Math.max(rule.success_count + rule.error_count, 1)) * 100);
              const firstAction = rule.actions?.[0];
              const actionType = firstAction?.type || 'unknown';
              
              return (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {getProcessTypeIcon(actionType)}
                        {rule.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{rule.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(rule.enabled, rule.success_count, rule.error_count)}
                  </TableCell>
                  <TableCell>
                    {rule.last_run 
                      ? new Date(rule.last_run).toLocaleString('pt-BR')
                      : 'Nunca executada'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-green-600">{rule.success_count}</span>
                      {' / '}
                      <span className="text-red-600">{rule.error_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={successRate} className="w-16" />
                      <span className="text-sm">{successRate.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => onToggleRule(rule.id, enabled)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onExecuteRule(rule.id)}
                        disabled={!rule.enabled}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};