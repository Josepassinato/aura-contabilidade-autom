import { useEffect, useRef, useCallback } from 'react';
import { log } from '@/utils/logger';

/**
 * Hook for safe async operations with cleanup and error handling
 */
export function useSafeAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList,
  componentName?: string
) {
  const isMountedRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    const executeAsync = async () => {
      try {
        if (isMountedRef.current) {
          await asyncFn();
        }
      } catch (error) {
        if (isMountedRef.current) {
          log.error('Error in async operation', error, componentName || 'useSafeAsync');
        }
      }
    };

    executeAsync();

    return () => {
      isMountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, deps);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current = cleanup;
  }, []);

  return { isMounted: () => isMountedRef.current, setCleanup };
}

/**
 * Hook for safe intervals with automatic cleanup
 */
export function useSafeInterval(
  callback: () => void | Promise<void>,
  delay: number | null,
  componentName?: string
) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<number>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const tick = async () => {
      try {
        await savedCallback.current();
      } catch (error) {
        log.error('Error in interval callback', error, componentName || 'useSafeInterval');
      }
    };

    intervalRef.current = window.setInterval(tick, delay);
    log.debug(`Interval started with delay ${delay}ms`, undefined, componentName);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        log.debug('Interval cleaned up', undefined, componentName);
      }
    };
  }, [delay, componentName]);
}

/**
 * Hook for safe timeouts with automatic cleanup
 */
export function useSafeTimeout(
  callback: () => void | Promise<void>,
  delay: number | null,
  componentName?: string
) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<number>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    if (delay === null) return;

    const execute = async () => {
      try {
        await savedCallback.current();
      } catch (error) {
        log.error('Error in timeout callback', error, componentName || 'useSafeTimeout');
      }
    };

    timeoutRef.current = window.setTimeout(execute, delay);
    log.debug(`Timeout set for ${delay}ms`, undefined, componentName);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        log.debug('Timeout cleaned up', undefined, componentName);
      }
    };
  }, [delay, componentName]);
}

/**
 * Hook for safe event listeners with automatic cleanup
 */
export function useSafeEventListener<T extends keyof WindowEventMap>(
  event: T,
  handler: (event: WindowEventMap[T]) => void,
  componentName?: string
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: WindowEventMap[T]) => {
      try {
        savedHandler.current(event);
      } catch (error) {
        log.error(`Error in ${event} event handler`, error, componentName || 'useSafeEventListener');
      }
    };

    window.addEventListener(event, eventListener);
    log.debug(`Event listener added for ${event}`, undefined, componentName);

    return () => {
      window.removeEventListener(event, eventListener);
      log.debug(`Event listener removed for ${event}`, undefined, componentName);
    };
  }, [event, componentName]);
}