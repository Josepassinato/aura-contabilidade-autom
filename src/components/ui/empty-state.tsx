import { FileX, Search, Database, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  variant?: 'no-data' | 'search' | 'error' | 'offline' | 'loading';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline';
  };
  illustration?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  variant = 'no-data',
  title,
  description,
  action,
  illustration,
  className = ''
}: EmptyStateProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'search':
        return <Search className="h-12 w-12 text-muted-foreground/50" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-destructive/50" />;
      case 'offline':
        return <Wifi className="h-12 w-12 text-muted-foreground/50" />;
      case 'loading':
        return <RefreshCw className="h-12 w-12 text-muted-foreground/50 animate-spin" />;
      default:
        return <FileX className="h-12 w-12 text-muted-foreground/50" />;
    }
  };

  const getColorScheme = () => {
    switch (variant) {
      case 'error':
        return 'text-destructive';
      case 'offline':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4">
        {illustration || getIcon()}
      </div>
      
      <h3 className={`text-lg font-semibold mb-2 ${getColorScheme()}`}>
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Componentes específicos para casos comuns
export const NoDataState = ({ 
  title = "Nenhum dado encontrado",
  description = "Não há informações para exibir no momento.",
  onRefresh
}: {
  title?: string;
  description?: string;
  onRefresh?: () => void;
}) => (
  <EmptyState
    variant="no-data"
    title={title}
    description={description}
    action={onRefresh ? {
      label: "Atualizar",
      onClick: onRefresh,
      variant: "outline"
    } : undefined}
  />
);

export const SearchEmptyState = ({
  searchTerm,
  onClearSearch
}: {
  searchTerm: string;
  onClearSearch: () => void;
}) => (
  <EmptyState
    variant="search"
    title="Nenhum resultado encontrado"
    description={`Não encontramos resultados para "${searchTerm}". Tente ajustar os filtros ou termos de busca.`}
    action={{
      label: "Limpar busca",
      onClick: onClearSearch,
      variant: "outline"
    }}
  />
);

export const ErrorState = ({
  title = "Algo deu errado",
  description = "Ocorreu um erro inesperado. Tente novamente.",
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) => (
  <EmptyState
    variant="error"
    title={title}
    description={description}
    action={onRetry ? {
      label: "Tentar novamente",
      onClick: onRetry,
      variant: "default"
    } : undefined}
  />
);

export const OfflineState = ({
  onRetry
}: {
  onRetry?: () => void;
}) => (
  <EmptyState
    variant="offline"
    title="Sem conexão"
    description="Verifique sua conexão com a internet e tente novamente."
    action={onRetry ? {
      label: "Tentar novamente",
      onClick: onRetry,
      variant: "outline"
    } : undefined}
  />
);

export const LoadingState = () => (
  <EmptyState
    variant="loading"
    title="Carregando..."
    description="Aguarde enquanto buscamos as informações."
  />
);