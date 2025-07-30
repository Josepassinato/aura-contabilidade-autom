/**
 * Production-safe logging system
 * Automatically disables console logging in production builds
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') return false;
    return true;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, component?: string): LogEntry {
    return {
      level,
      message,
      data,
      component,
      timestamp: new Date().toISOString()
    };
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  debug(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry('debug', message, data, component);
    this.addToHistory(entry);
    
    if (this.shouldLog('debug')) {
      console.debug(`[${component || 'APP'}] ${message}`, data || '');
    }
  }

  info(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry('info', message, data, component);
    this.addToHistory(entry);
    
    if (this.shouldLog('info')) {
      console.info(`[${component || 'APP'}] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry('warn', message, data, component);
    this.addToHistory(entry);
    
    if (this.shouldLog('warn')) {
      console.warn(`[${component || 'APP'}] ${message}`, data || '');
    }
  }

  error(message: string, error?: Error | any, component?: string): void {
    const entry = this.createLogEntry('error', message, error, component);
    this.addToHistory(entry);
    
    if (this.shouldLog('error')) {
      console.error(`[${component || 'APP'}] ${message}`, error || '');
    }

    // In production, send errors to monitoring service
    if (!this.isDevelopment && error instanceof Error) {
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    try {
      // Send critical logs to Supabase metrics
      if (entry.level === 'error') {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          'https://watophocqlcyimirzrpe.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg'
        );

        // Log crítico na auditoria
        await supabase.rpc('log_critical_event', {
          p_event_type: 'application_error',
          p_message: entry.message,
          p_metadata: {
            component: entry.component,
            data: entry.data,
            stack: entry.data?.stack
          },
          p_severity: 'error'
        });
      }
    } catch (e) {
      // Silently fail to avoid infinite loops
    }
  }

  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter(entry => entry.level === level);
    }
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for easy migration from console.* calls
export const log = {
  debug: (message: string, data?: any, component?: string) => logger.debug(message, data, component),
  info: (message: string, data?: any, component?: string) => logger.info(message, data, component),
  warn: (message: string, data?: any, component?: string) => logger.warn(message, data, component),
  error: (message: string, error?: Error | any, component?: string) => logger.error(message, error, component),
};