import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para acesso seguro ao localStorage/sessionStorage
 * Inclui verificações de SSR e tratamento de erros
 */
export function useSafeStorage(type: 'localStorage' | 'sessionStorage' = 'localStorage') {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  const getStorage = useCallback(() => {
    if (!isClient) return null;
    try {
      return type === 'localStorage' ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }, [isClient, type]);

  const getItem = useCallback((key: string): string | null => {
    const storage = getStorage();
    if (!storage) return null;
    
    try {
      return storage.getItem(key);
    } catch (error) {
      console.warn(`Erro ao acessar ${type}:`, error);
      return null;
    }
  }, [getStorage, type]);

  const setItem = useCallback((key: string, value: string): boolean => {
    const storage = getStorage();
    if (!storage) return false;
    
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Erro ao salvar no ${type}:`, error);
      return false;
    }
  }, [getStorage, type]);

  const removeItem = useCallback((key: string): boolean => {
    const storage = getStorage();
    if (!storage) return false;
    
    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Erro ao remover do ${type}:`, error);
      return false;
    }
  }, [getStorage, type]);

  const clear = useCallback((): boolean => {
    const storage = getStorage();
    if (!storage) return false;
    
    try {
      storage.clear();
      return true;
    } catch (error) {
      console.warn(`Erro ao limpar ${type}:`, error);
      return false;
    }
  }, [getStorage, type]);

  return {
    isClient,
    getItem,
    setItem,
    removeItem,
    clear,
    isAvailable: !!getStorage()
  };
}