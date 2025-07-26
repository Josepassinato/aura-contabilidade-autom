import React from 'react';
import { useTaskAutomation } from '@/hooks/useTaskAutomation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AutomationHeader } from '@/components/automation/AutomationHeader';
import { AutomationMetrics } from '@/components/automation/AutomationMetrics';
import { AutomationTabs } from '@/components/automation/AutomationTabs';

const TaskAutomationEngine = () => {
  const { 
    rules, 
    metrics, 
    isLoading, 
    executeRule, 
    toggleRule, 
    createRule, 
    loadAutomationData 
  } = useTaskAutomation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AutomationHeader 
          isLoading={isLoading}
          onRefresh={loadAutomationData}
        />
        
        <AutomationMetrics metrics={metrics} />
        
        <AutomationTabs
          rules={rules}
          onToggleRule={toggleRule}
          onExecuteRule={executeRule}
          onCreateRule={createRule}
        />
      </div>
    </DashboardLayout>
  );
};

export default TaskAutomationEngine;