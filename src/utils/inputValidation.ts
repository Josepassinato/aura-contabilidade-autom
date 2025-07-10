/**
 * Comprehensive input validation and sanitization utilities
 * Prevents XSS, injection attacks, and data corruption
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * HTML/XSS sanitization utilities
 */
export const sanitizeHTML = {
  /**
   * Remove all HTML tags and dangerous characters
   */
  stripTags: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim();
  },

  /**
   * Escape HTML entities to prevent XSS
   */
  escapeHTML: (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Sanitize text for safe display
   */
  sanitizeText: (input: string): string => {
    if (typeof input !== 'string') return '';
    return sanitizeHTML.escapeHTML(sanitizeHTML.stripTags(input));
  }
};

/**
 * SQL Injection prevention utilities
 */
export const sanitizeSQL = {
  /**
   * Remove SQL injection patterns
   */
  removeSQLInjection: (input: string): string => {
    return input
      .replace(/['";\\]/g, '') // Remove quotes and backslashes
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b/gi, '') // Remove SQL keywords
      .trim();
  },

  /**
   * Validate that input doesn't contain SQL injection patterns
   */
  validateNoSQLInjection: (input: string): boolean => {
    const sqlPatterns = [
      /['";\\]/,
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b/i,
      /--/,
      /\/\*/,
      /\*\//
    ];
    
    return !sqlPatterns.some(pattern => pattern.test(input));
  }
};

/**
 * Safe JSON parsing utilities
 */
export const safeJSON = {
  /**
   * Safely parse JSON with validation
   */
  parse: <T>(input: string, validator?: (obj: any) => obj is T): T | null => {
    try {
      // Basic validation
      if (!input || typeof input !== 'string') return null;
      if (input.length > 100000) return null; // Prevent DoS
      
      const parsed = JSON.parse(input);
      
      // Prevent prototype pollution
      if (parsed && typeof parsed === 'object') {
        if (parsed.__proto__ || parsed.constructor !== Object) {
          throw new Error('Prototype pollution detected');
        }
      }
      
      if (validator && !validator(parsed)) {
        throw new Error('Validation failed');
      }
      
      return parsed;
    } catch (error) {
      console.warn('Safe JSON parse failed:', error);
      return null;
    }
  },

  /**
   * Safely stringify with size limits
   */
  stringify: (obj: any, maxSize = 50000): string | null => {
    try {
      const result = JSON.stringify(obj);
      if (result.length > maxSize) {
        throw new Error('Object too large');
      }
      return result;
    } catch (error) {
      console.warn('Safe JSON stringify failed:', error);
      return null;
    }
  }
};

/**
 * Input field validators
 */
export const validators = {
  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  /**
   * Validate CNPJ format
   */
  cnpj: (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.length === 14 && !/^(\d)\1{13}$/.test(numbers);
  },

  /**
   * Validate CPF format
   */
  cpf: (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11 && !/^(\d)\1{10}$/.test(numbers);
  },

  /**
   * Validate date format (YYYY-MM-DD)
   */
  date: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  },

  /**
   * Validate monetary value
   */
  money: (value: string | number): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= 0 && num <= 999999999.99;
  },

  /**
   * Validate phone number (Brazilian format)
   */
  phone: (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  }
};

/**
 * Safe input processing utilities
 */
export const sanitizeInput = {
  /**
   * Safely process user text input
   */
  text: (input: string, maxLength = 1000): string => {
    if (typeof input !== 'string') return '';
    
    let sanitized = sanitizeHTML.sanitizeText(input);
    sanitized = sanitizeSQL.removeSQLInjection(sanitized);
    
    return sanitized.slice(0, maxLength).trim();
  },

  /**
   * Safely process numeric input
   */
  number: (input: string | number, min = 0, max = Number.MAX_SAFE_INTEGER): number | null => {
    const num = typeof input === 'string' ? parseFloat(input.replace(/[^0-9.-]/g, '')) : input;
    
    if (isNaN(num) || num < min || num > max) {
      return null;
    }
    
    return num;
  },

  /**
   * Safely process CNPJ input
   */
  cnpj: (input: string): string => {
    const numbers = input.replace(/\D/g, '');
    return numbers.slice(0, 14);
  },

  /**
   * Safely process email input
   */
  email: (input: string): string => {
    return sanitizeHTML.sanitizeText(input.toLowerCase()).slice(0, 254);
  },

  /**
   * Safely process file upload data
   */
  fileData: (data: any): { isValid: boolean; error?: string } => {
    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'Dados de arquivo inválidos' };
    }

    // Check file size (10MB limit)
    if (data.size && data.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'Arquivo muito grande (máximo 10MB)' };
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/xml',
      'application/xml',
      'text/csv'
    ];

    if (data.type && !allowedTypes.includes(data.type)) {
      return { isValid: false, error: 'Tipo de arquivo não permitido' };
    }

    return { isValid: true };
  }
};

/**
 * Form validation helper
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => boolean | string>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(rules)) {
    const result = rule(data[field]);
    
    if (typeof result === 'string') {
      errors[field as keyof T] = result;
      isValid = false;
    } else if (!result) {
      errors[field as keyof T] = 'Campo inválido';
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Rate limiting utility to prevent abuse
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}

  /**
   * Check if action is allowed for given key
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Record new attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  /**
   * Clear attempts for a key
   */
  clear(key: string): void {
    this.attempts.delete(key);
  }
}

// Export singleton rate limiter instances
export const loginRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute