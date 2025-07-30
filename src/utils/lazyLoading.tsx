/**
 * Factory de lazy loading otimizado para componentes React
 * Com preloading inteligente e fallbacks personalizados
 */

import React, { Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { logAuditEvent } from '@/services/auditService';
import { logger } from '@/utils/logger';

interface LazyComponentOptions {
  fallback?: React.ReactNode;
  preload?: boolean;
  chunkName?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Cria componente lazy com loading otimizado
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): React.LazyExoticComponent<T> {
  const {
    fallback = <PageLoadingFallback />,
    preload = false,
    chunkName,
    onLoad,
    onError
  } = options;

  // Log do lazy loading
  logger.info(
    `Creating lazy component${chunkName ? ` [${chunkName}]` : ''}`,
    { preload },
    'LazyLoader'
  );

  const LazyComponent = React.lazy(async () => {
    try {
      const startTime = performance.now();
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      
      // Log de performance
      logger.info(
        `Lazy component loaded${chunkName ? ` [${chunkName}]` : ''} in ${loadTime.toFixed(2)}ms`,
        { loadTime, chunkName },
        'LazyLoader'
      );

      // Auditoria de carregamento
      await logAuditEvent({
        eventType: 'lazy_component_loaded',
        message: `Componente carregado: ${chunkName || 'unknown'}`,
        metadata: {
          load_time_ms: loadTime,
          chunk_name: chunkName,
          timestamp: new Date().toISOString()
        },
        severity: 'info'
      });

      onLoad?.();
      return module;
    } catch (error) {
      logger.error(
        `Failed to load lazy component${chunkName ? ` [${chunkName}]` : ''}`,
        error,
        'LazyLoader'
      );

      // Log crítico de falha
      await logAuditEvent({
        eventType: 'lazy_component_failed',
        message: `Falha ao carregar componente: ${chunkName || 'unknown'}`,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          chunk_name: chunkName,
          timestamp: new Date().toISOString()
        },
        severity: 'error'
      });

      onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  });

  // Preload se solicitado
  if (preload) {
    // Preload após 2 segundos para não impactar carregamento inicial
    setTimeout(() => {
      importFn().catch(error => {
        logger.warn(`Preload failed for ${chunkName}`, error, 'LazyLoader');
      });
    }, 2000);
  }

  return LazyComponent;
}

/**
 * HOC para adicionar Suspense automaticamente
 */
export function withLazyLoading<P extends Record<string, any>>(
  LazyComponent: React.LazyExoticComponent<ComponentType<P>>,
  fallback?: React.ReactNode
): ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallback || <PageLoadingFallback />}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  );

  const componentName = (LazyComponent as any)._payload?._result?.displayName || 'Component';
  WrappedComponent.displayName = `LazyLoaded(${componentName})`;
  return WrappedComponent;
}

/**
 * Fallback padrão para carregamento de páginas
 */
export const PageLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          Carregando...
        </h3>
        <p className="text-sm text-muted-foreground">
          Preparando a interface para você
        </p>
      </div>
    </div>
  </div>
);

/**
 * Fallback para componentes menores
 */
export const ComponentLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="md" />
  </div>
);

/**
 * Exemplo de uso para criar lazy loading de páginas
 * Use este padrão nas suas rotas:
 * 
 * const LazyDashboard = createLazyComponent(
 *   () => import('@/pages/Dashboard'),
 *   { chunkName: 'dashboard', preload: true }
 * );
 */

/**
 * Hook para preload dinâmico de componentes
 */
export function usePreloadComponent(
  importFn: () => Promise<any>,
  condition: boolean = true
) {
  React.useEffect(() => {
    if (condition) {
      const timer = setTimeout(() => {
        importFn().catch(error => {
          logger.warn('Dynamic preload failed', error, 'LazyLoader');
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [importFn, condition]);
}

/**
 * Performance monitor para lazy loading
 */
export const useLazyLoadingMetrics = () => {
  const [metrics, setMetrics] = React.useState({
    totalLoaded: 0,
    totalFailed: 0,
    averageLoadTime: 0,
    lastLoadTime: 0
  });

  const recordLoad = React.useCallback((loadTime: number) => {
    setMetrics(prev => ({
      totalLoaded: prev.totalLoaded + 1,
      totalFailed: prev.totalFailed,
      averageLoadTime: (prev.averageLoadTime * prev.totalLoaded + loadTime) / (prev.totalLoaded + 1),
      lastLoadTime: loadTime
    }));
  }, []);

  const recordFailure = React.useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      totalFailed: prev.totalFailed + 1
    }));
  }, []);

  return {
    metrics,
    recordLoad,
    recordFailure
  };
};