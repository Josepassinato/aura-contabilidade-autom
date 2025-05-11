
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obter do localStorage pelo key
      const item = window.localStorage.getItem(key);
      // Parse o JSON armazenado ou se não existente retorna initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se ocorrer erro, retorne initialValue
      console.error('Erro ao obter valor do localStorage:', error);
      return initialValue;
    }
  });

  // Retorna uma função de atualização que persiste o novo valor para localStorage
  const setValue = (value: T) => {
    try {
      // Permite o valor ser uma função, similar ao useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Salva no estado
      setStoredValue(valueToStore);
      // Salva no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Erro ao salvar valor no localStorage:', error);
    }
  };

  // Sincronizar com mudanças de localStorage em outras abas/janelas
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error('Erro ao sincronizar com localStorage:', error);
        }
      }
    }

    // Adiciona o event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Remove o event listener no cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}
