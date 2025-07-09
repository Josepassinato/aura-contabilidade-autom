import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useLoadingState } from '@/hooks/useLoadingState';
import { cn } from '@/lib/utils';

export function GlobalLoadingIndicator() {
  const { isAnyLoading, loadingStates } = useLoadingState();

  if (!isAnyLoading()) return null;

  // Calcular progresso baseado no número de operações ativas
  const activeLoadings = Object.values(loadingStates).filter(Boolean).length;
  const progress = Math.min(activeLoadings * 25, 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress 
        value={progress} 
        className={cn(
          "h-1 rounded-none border-none transition-opacity duration-300",
          "bg-transparent"
        )}
      />
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 animate-pulse" />
    </div>
  );
}