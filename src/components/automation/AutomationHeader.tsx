import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, RotateCcw } from 'lucide-react';

interface AutomationHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const AutomationHeader: React.FC<AutomationHeaderProps> = ({
  isLoading,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          Task Automation Engine
        </h1>
        <p className="text-muted-foreground">
          Configure e monitore tarefas automatizadas para otimizar seus processos
        </p>
      </div>
      <Button onClick={onRefresh} disabled={isLoading}>
        <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  );
};