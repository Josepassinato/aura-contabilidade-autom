/**
 * Interfaces específicas para substituir tipos 'any' no sistema de tratamento de erros
 */

export type ErrorSource = 'api' | 'database' | 'auth' | 'form' | 'validation' | 'network' | 'unknown';

export interface StandardError {
  message: string;
  code?: string;
  source: ErrorSource;
  details?: ErrorDetails;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: ErrorContext;
}

export interface ErrorDetails {
  stack?: string;
  url?: string;
  statusCode?: number;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  validationErrors?: ValidationError[];
  [key: string]: unknown;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

export interface SupabaseError {
  code: string;
  message?: string;
  error_description?: string;
  details?: string;
  hint?: string;
}

export interface AuthError extends SupabaseError {
  status?: number;
}

export interface NetworkError extends Error {
  status?: number;
  statusText?: string;
  url?: string;
  response?: Response;
}

export interface FormValidationError {
  [fieldName: string]: string | string[];
}

export interface ErrorHandlerOptions {
  shouldNotify?: boolean;
  shouldLog?: boolean;
  context?: string;
  severity?: StandardError['severity'];
}

export interface ToastNotification {
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  duration?: number;
}