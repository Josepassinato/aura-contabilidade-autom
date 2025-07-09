import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key: string) => {
    return loadingStates[key] || false;
  };

  const isAnyLoading = () => {
    return Object.values(loadingStates).some(loading => loading);
  };

  const clearAllLoading = () => {
    setLoadingStates({});
  };

  return (
    <LoadingContext.Provider value={{
      loadingStates,
      setLoading,
      isLoading,
      isAnyLoading,
      clearAllLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoadingState() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoadingState must be used within a LoadingProvider');
  }
  return context;
}

// Hook específico para operações comuns
export function useAsyncOperation() {
  const { setLoading } = useLoadingState();

  const executeWithLoading = async <T,>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(key, true);
      const result = await operation();
      return result;
    } catch (error) {
      console.error(`Error in operation ${key}:`, error);
      return null;
    } finally {
      setLoading(key, false);
    }
  };

  return { executeWithLoading };
}