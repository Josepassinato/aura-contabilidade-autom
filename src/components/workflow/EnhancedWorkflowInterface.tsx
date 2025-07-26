import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedWorkflowBuilder } from './AdvancedVisualBuilder';
import { AIWorkflowAssistant } from './AIWorkflowAssistant';
import { WorkflowDashboard } from './WorkflowDashboard';

export function EnhancedWorkflowInterface() {
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);

  const handleWorkflowFromAI = (workflow: any) => {
    setActiveWorkflow(workflow);
  };

  const handleWorkflowSave = (workflow: any) => {
    console.log('Workflow saved:', workflow);
  };

  return (
    <div className="h-screen">
      <Tabs defaultValue="builder" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Construtor Visual</TabsTrigger>
          <TabsTrigger value="assistant">Assistente IA</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="flex-1">
          <AdvancedWorkflowBuilder 
            onSave={handleWorkflowSave}
          />
        </TabsContent>

        <TabsContent value="assistant" className="flex-1 p-6">
          <AIWorkflowAssistant onWorkflowGenerated={handleWorkflowFromAI} />
        </TabsContent>

        <TabsContent value="dashboard" className="flex-1">
          <WorkflowDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}