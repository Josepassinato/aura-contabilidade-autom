import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingOverlay({ isLoading, children, text, size = 'lg' }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <LoadingSpinner size={size} text={text} />
        </div>
      )}
    </div>
  );
}

interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = 'Carregando...' }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}

interface CardLoadingProps {
  className?: string;
}

export function CardLoading({ className }: CardLoadingProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-3">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
      </div>
    </div>
  );
}

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

export function TableLoading({ rows = 5, columns = 4 }: TableLoadingProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-muted animate-pulse rounded flex-1"
              style={{ animationDelay: `${(i + j) * 100}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}