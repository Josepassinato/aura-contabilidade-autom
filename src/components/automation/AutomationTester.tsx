import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { AutomationRule } from '@/types/automation';

interface AutomationTesterProps {
  rules: AutomationRule[];
}

export const AutomationTester: React.FC<AutomationTesterProps> = ({ rules }) => {
  const { toast } = useToast();
  const [testingRules, setTestingRules] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({});

  const testRule = async (rule: AutomationRule) => {
    setTestingRules(prev => new Set(prev).add(rule.id));
    setTestResults(prev => ({ ...prev, [rule.id]: 'pending' }));

    try {
      // Test by calling the automation worker edge function
      const { data, error } = await supabase.functions.invoke('automation-worker', {
        body: {
          action: 'test_rule',
          ruleId: rule.id,
          testMode: true
        }
      });

      if (error) {
        throw error;
      }

      setTestResults(prev => ({ ...prev, [rule.id]: 'success' }));
      
      toast({
        title: "Teste Concluído",
        description: `Regra "${rule.name}" executada com sucesso em modo de teste`,
      });

    } catch (error) {
      console.error('Erro ao testar regra:', error);
      setTestResults(prev => ({ ...prev, [rule.id]: 'error' }));
      
      toast({
        title: "Erro no Teste",
        description: `Falha ao executar a regra "${rule.name}": ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTestingRules(prev => {
        const newSet = new Set(prev);
        newSet.delete(rule.id);
        return newSet;
      });
    }
  };

  const getStatusIcon = (ruleId: string) => {
    const result = testResults[ruleId];
    if (testingRules.has(ruleId)) {
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    
    switch (result) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (rule: AutomationRule) => {
    const result = testResults[rule.id];
    if (testingRules.has(rule.id)) {
      return <Badge variant="secondary">Testando...</Badge>;
    }
    
    switch (result) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Teste OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Teste Falhou</Badge>;
      default:
        return rule.enabled ? 
          <Badge variant="default">Ativa</Badge> : 
          <Badge variant="secondary">Inativa</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Automações</CardTitle>
        <CardDescription>
          Execute testes nas regras de automação para verificar seu funcionamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma regra de automação encontrada.
            </p>
          ) : (
            rules.map((rule) => (
              <div 
                key={rule.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{rule.name}</h4>
                    {getStatusIcon(rule.id)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rule.description || 'Sem descrição'}
                  </p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(rule)}
                    <Badge variant="outline">{rule.type}</Badge>
                    <Badge variant="outline">{rule.trigger_type}</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => testRule(rule)}
                  disabled={testingRules.has(rule.id) || !rule.enabled}
                  className="ml-4"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Testar
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};