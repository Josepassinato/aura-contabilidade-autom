import { useEffect, useRef, useCallback } from 'react';

interface TimerRef {
  timeoutId?: NodeJS.Timeout;
  intervalId?: NodeJS.Timeout;
}

/**
 * Hook personalizado para gerenciar timers com limpeza automática
 * Previne vazamentos de memória garantindo que todos os timers sejam limpos
 */
export function useCleanupTimer() {
  const timersRef = useRef<TimerRef>({});

  const clearAllTimers = useCallback(() => {
    if (timersRef.current.timeoutId) {
      clearTimeout(timersRef.current.timeoutId);
      timersRef.current.timeoutId = undefined;
    }
    if (timersRef.current.intervalId) {
      clearInterval(timersRef.current.intervalId);
      timersRef.current.intervalId = undefined;
    }
  }, []);

  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    clearAllTimers();
    timersRef.current.timeoutId = setTimeout(callback, delay);
    return timersRef.current.timeoutId;
  }, [clearAllTimers]);

  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    if (timersRef.current.intervalId) {
      clearInterval(timersRef.current.intervalId);
    }
    timersRef.current.intervalId = setInterval(callback, delay);
    return timersRef.current.intervalId;
  }, []);

  const clearSafeTimeout = useCallback(() => {
    if (timersRef.current.timeoutId) {
      clearTimeout(timersRef.current.timeoutId);
      timersRef.current.timeoutId = undefined;
    }
  }, []);

  const clearSafeInterval = useCallback(() => {
    if (timersRef.current.intervalId) {
      clearInterval(timersRef.current.intervalId);
      timersRef.current.intervalId = undefined;
    }
  }, []);

  // Limpeza automática no unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    safeSetTimeout,
    safeSetInterval,
    clearSafeTimeout,
    clearSafeInterval,
    clearAllTimers
  };
}