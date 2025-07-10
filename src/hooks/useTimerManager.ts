/**
 * Safe timer utilities with automatic cleanup to prevent memory leaks
 */

export interface TimerManager {
  setTimeout: (callback: () => void, delay: number) => number;
  setInterval: (callback: () => void, delay: number) => number;
  clearAll: () => void;
  clearTimeout: (id: number) => void;
  clearInterval: (id: number) => void;
}

/**
 * Creates a timer manager that tracks all timers and provides cleanup
 */
export function createTimerManager(): TimerManager {
  const timeouts = new Set<number>();
  const intervals = new Set<number>();

  return {
    setTimeout: (callback: () => void, delay: number): number => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        callback();
      }, delay);
      timeouts.add(id);
      return id;
    },

    setInterval: (callback: () => void, delay: number): number => {
      const id = window.setInterval(callback, delay);
      intervals.add(id);
      return id;
    },

    clearTimeout: (id: number): void => {
      window.clearTimeout(id);
      timeouts.delete(id);
    },

    clearInterval: (id: number): void => {
      window.clearInterval(id);
      intervals.delete(id);
    },

    clearAll: (): void => {
      timeouts.forEach(id => window.clearTimeout(id));
      intervals.forEach(id => window.clearInterval(id));
      timeouts.clear();
      intervals.clear();
    }
  };
}

/**
 * React hook for safe timer management with automatic cleanup
 */
import { useEffect, useRef } from 'react';

export function useTimerManager(): TimerManager {
  const managerRef = useRef<TimerManager>();
  
  if (!managerRef.current) {
    managerRef.current = createTimerManager();
  }

  useEffect(() => {
    const manager = managerRef.current!;
    
    // Cleanup all timers on unmount
    return () => {
      manager.clearAll();
    };
  }, []);

  return managerRef.current;
}

/**
 * Safe setTimeout hook with automatic cleanup
 */
export function useSafeTimeout(callback: () => void, delay: number | null): void {
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (delay !== null) {
      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current();
      }, delay);

      return () => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [delay]);
}

/**
 * Safe setInterval hook with automatic cleanup
 */
export function useSafeInterval(callback: () => void, delay: number | null): void {
  const intervalRef = useRef<number>();
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (delay !== null) {
      intervalRef.current = window.setInterval(() => {
        callbackRef.current();
      }, delay);

      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      };
    }
  }, [delay]);
}

/**
 * Debounced callback hook with automatic cleanup
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }) as T;
}