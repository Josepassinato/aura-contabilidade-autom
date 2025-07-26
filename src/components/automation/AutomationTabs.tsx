import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutomationRuleBuilder } from './AutomationRuleBuilder';
import AutomationMonitoringDashboard from './AutomationMonitoringDashboard';
import AutomationScheduler from './AutomationScheduler';
import RealTimeMonitoringDashboard from '@/components/monitoring/RealTimeMonitoringDashboard';
import { AutomationRulesTable } from './AutomationRulesTable';
import { AutomationAnalytics } from './AutomationAnalytics';
import { AutomationRule } from '@/types/automation';

interface AutomationTabsProps {
  rules: AutomationRule[];
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onExecuteRule: (ruleId: string) => void;
  onCreateRule: (ruleData: any) => Promise<AutomationRule>;
}

export const AutomationTabs: React.FC<AutomationTabsProps> = ({
  rules,
  onToggleRule,
  onExecuteRule,
  onCreateRule
}) => {
  return (
    <Tabs defaultValue="rules" className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="rules">Regras</TabsTrigger>
        <TabsTrigger value="create">Criar Regra</TabsTrigger>
        <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        <TabsTrigger value="scheduler">Agendador</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="rules" className="space-y-4">
        <AutomationRulesTable
          rules={rules}
          onToggleRule={onToggleRule}
          onExecuteRule={onExecuteRule}
        />
      </TabsContent>

      <TabsContent value="create" className="space-y-4">
        <AutomationRuleBuilder
          onRuleCreate={async (ruleData) => {
            try {
              const newRule = await onCreateRule(ruleData);
              // Reset to rules tab after successful creation
              const tabsTrigger = document.querySelector('[value="rules"]') as HTMLElement;
              if (tabsTrigger) tabsTrigger.click();
            } catch (error) {
              console.error('Error creating rule:', error);
            }
          }}
        />
      </TabsContent>

      <TabsContent value="monitoring" className="space-y-4">
        <AutomationMonitoringDashboard />
      </TabsContent>

      <TabsContent value="realtime" className="space-y-4">
        <RealTimeMonitoringDashboard />
      </TabsContent>

      <TabsContent value="scheduler" className="space-y-4">
        <AutomationScheduler />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <AutomationAnalytics rules={rules} />
      </TabsContent>
    </Tabs>
  );
};