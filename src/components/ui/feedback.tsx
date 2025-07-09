import React from 'react';
import { Loader2, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Carregando...',
  children
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg shadow-lg border">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  lines = 1 
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 bg-muted animate-pulse rounded',
            index === lines - 1 && lines > 1 && 'w-3/4',
            className
          )}
        />
      ))}
    </div>
  );
};

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  loadingText
}) => {
  if (isLoading) {
    return (
      <>
        <LoadingSpinner size="sm" className="mr-2" />
        {loadingText || 'Carregando...'}
      </>
    );
  }
  
  return <>{children}</>;
};

interface FeedbackMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  type,
  title,
  message,
  className
}) => {
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      textColor: 'text-green-700'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      textColor: 'text-red-700'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700'
    }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <div 
      className={cn(
        'p-4 rounded-lg border-l-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={cn('h-5 w-5 mt-0.5', config.iconColor)} />
        <div className="flex-1">
          {title && (
            <h4 className={cn('text-sm font-medium mb-1', config.titleColor)}>
              {title}
            </h4>
          )}
          <p className={cn('text-sm', config.textColor)}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};