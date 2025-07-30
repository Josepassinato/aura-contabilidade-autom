/**
 * Secure Edge Function utilities for Supabase
 * Provides authentication, validation, and security helpers
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface SecureRequest {
  method: string;
  headers: Headers;
  json: () => Promise<any>;
  user?: any;
  clientId?: string;
}

export interface SecurityOptions {
  requireAuth?: boolean;
  allowedMethods?: string[];
  maxRequestSize?: number;
  rateLimitKey?: string;
  validateInput?: (data: any) => boolean | string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Rate limiting store (in-memory for edge functions)
const rateLimitStore = new Map<string, number[]>();

/**
 * CORS headers for secure API responses - restricted to production domains
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://e70f8038-29c2-4a71-9941-5c0ea55d7369.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

/**
 * CORS headers for internal functions (cron jobs) - no CORS needed
 */
export const internalHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, no-cache, must-revalidate'
};

/**
 * Input sanitization utilities
 */
export const sanitize = {
  string: (input: string, maxLength = 1000): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .slice(0, maxLength)
      .trim();
  },

  number: (input: any, min = 0, max = Number.MAX_SAFE_INTEGER): number | null => {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    if (isNaN(num) || num < min || num > max) return null;
    return num;
  },

  email: (input: string): string => {
    return sanitize.string(input.toLowerCase(), 254);
  },

  json: <T>(input: string, maxSize = 100000): T | null => {
    try {
      if (!input || input.length > maxSize) return null;
      const parsed = JSON.parse(input);
      
      // Prevent prototype pollution
      if (parsed && typeof parsed === 'object' && (parsed.__proto__ || parsed.constructor !== Object)) {
        throw new Error('Prototype pollution detected');
      }
      
      return parsed;
    } catch {
      return null;
    }
  }
};

/**
 * Rate limiting implementation
 */
export const rateLimit = {
  check: (key: string, maxRequests = 100, windowMs = 60000): boolean => {
    const now = Date.now();
    const requests = rateLimitStore.get(key) || [];
    
    // Remove old requests outside window
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    recentRequests.push(now);
    rateLimitStore.set(key, recentRequests);
    return true;
  },

  clear: (key: string): void => {
    rateLimitStore.delete(key);
  }
};

/**
 * Authentication utilities
 */
export const auth = {
  /**
   * Extract and validate JWT token from Authorization header
   */
  validateToken: async (req: Request): Promise<{ user: any; error?: string }> => {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null, error: 'Token de autorização ausente' };
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Initialize Supabase client with ANON key for JWT validation
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return { user: null, error: 'Token inválido ou expirado' };
      }

      return { user };
    } catch (error) {
      return { user: null, error: 'Erro na validação do token' };
    }
  },

  /**
   * Validate JWT token and return 401 if invalid
   */
  requireAuth: async (req: Request): Promise<Response | null> => {
    const { user, error } = await auth.validateToken(req);
    
    if (!user || error) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: error || 'Token inválido' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return null; // Success - continue processing
  },

  /**
   * Check if user has required permissions
   */
  hasPermission: (user: any, requiredRole: string): boolean => {
    if (!user || !user.user_metadata) return false;
    const userRole = user.user_metadata.role || 'user';
    
    const roleHierarchy = ['user', 'admin', 'super_admin'];
    const userLevel = roleHierarchy.indexOf(userRole);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);
    
    return userLevel >= requiredLevel;
  }
};

/**
 * Secure API wrapper for Edge Functions
 */
export class SecureAPI {
  private supabase: any;

  constructor(useServiceRole = false) {
    // Use SERVICE_ROLE_KEY only for internal functions, ANON_KEY for public functions
    const key = useServiceRole 
      ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      : Deno.env.get('SUPABASE_ANON_KEY') ?? '';
      
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      key
    );
  }

  /**
   * Create a secure API handler
   */
  handler(
    handler: (req: SecureRequest) => Promise<ApiResponse>,
    options: SecurityOptions = {}
  ) {
    return async (req: Request): Promise<Response> => {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        return new Response(null, { 
          headers: corsHeaders,
          status: 200
        });
      }

      const {
        requireAuth = true,
        allowedMethods = ['POST', 'GET'],
        maxRequestSize = 1024 * 1024, // 1MB
        rateLimitKey,
        validateInput
      } = options;

      try {
        // Method validation
        if (!allowedMethods.includes(req.method)) {
          return this.errorResponse('Método não permitido', 405);
        }

        // Rate limiting
        if (rateLimitKey) {
          const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
          const limitKey = `${rateLimitKey}:${clientIP}`;
          
          if (!rateLimit.check(limitKey)) {
            return this.errorResponse('Rate limit exceeded', 429);
          }
        }

        // Size validation
        const contentLength = req.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > maxRequestSize) {
          return this.errorResponse('Request too large', 413);
        }

        // Authentication
        let user = null;
        let clientId = null;

        if (requireAuth) {
          const authResult = await auth.validateToken(req);
          if (authResult.error) {
            return this.errorResponse(authResult.error, 401);
          }
          user = authResult.user;
          clientId = user?.user_metadata?.client_id;
        }

        // Parse and validate JSON
        let jsonData = {};
        if (req.method === 'POST' || req.method === 'PUT') {
          try {
            const body = await req.text();
            jsonData = sanitize.json(body) || {};
            
            if (validateInput) {
              const validationResult = validateInput(jsonData);
              if (typeof validationResult === 'string') {
                return this.errorResponse(validationResult, 400);
              } else if (!validationResult) {
                return this.errorResponse('Dados de entrada inválidos', 400);
              }
            }
          } catch (error) {
            return this.errorResponse('JSON inválido', 400);
          }
        }

        // Create secure request object
        const secureReq: SecureRequest = {
          method: req.method,
          headers: req.headers,
          json: () => Promise.resolve(jsonData),
          user,
          clientId
        };

        // Call handler
        const result = await handler(secureReq);

        return this.successResponse(result.data, result);

      } catch (error) {
        console.error('API Error:', error);
        return this.errorResponse('Erro interno do servidor', 500);
      }
    };
  }

  /**
   * Create success response
   */
  successResponse<T>(data: T, meta?: any): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...meta
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create error response
   */
  errorResponse(message: string, status = 400, code?: string): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
      code
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: any;
    user_id?: string;
    client_ip?: string;
  }): Promise<void> {
    try {
      await this.supabase
        .from('security_events')
        .insert({
          event_type: event.type,
          severity: event.severity,
          event_details: event.details,
          user_id: event.user_id,
          client_ip: event.client_ip,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

/**
 * Input validation schemas
 */
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  cnpj: (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.length === 14 && !/^(\d)\1{13}$/.test(numbers);
  },

  uuid: (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  nonEmpty: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },

  positiveNumber: (value: any): boolean => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }
};

// Export singleton instance
export const secureAPI = new SecureAPI();