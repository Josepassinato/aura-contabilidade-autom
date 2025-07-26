import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export const useTaskAutomationSecurity = () => {
  const { toast } = useToast();

  const validateRuleInput = useCallback((ruleData: any): SecurityValidationResult => {
    const errors: string[] = [];
    const sanitizedData = { ...ruleData };

    // Validate required fields
    if (!ruleData.name || typeof ruleData.name !== 'string') {
      errors.push('Nome da regra é obrigatório e deve ser texto');
    } else if (ruleData.name.length > 100) {
      errors.push('Nome da regra deve ter no máximo 100 caracteres');
      sanitizedData.name = ruleData.name.substring(0, 100);
    }

    if (!ruleData.description || typeof ruleData.description !== 'string') {
      errors.push('Descrição é obrigatória');
    } else if (ruleData.description.length > 500) {
      errors.push('Descrição deve ter no máximo 500 caracteres');
      sanitizedData.description = ruleData.description.substring(0, 500);
    }

    // Validate trigger type
    const allowedTriggerTypes = ['time', 'database', 'webhook', 'interval'];
    if (!allowedTriggerTypes.includes(ruleData.trigger_type)) {
      errors.push('Tipo de trigger inválido');
    }

    // Validate actions
    if (!Array.isArray(ruleData.actions) || ruleData.actions.length === 0) {
      errors.push('Pelo menos uma ação deve ser configurada');
    } else {
      const allowedActionTypes = ['daily_accounting', 'monthly_reports', 'data_backup', 'send_emails'];
      ruleData.actions.forEach((action: any, index: number) => {
        if (!action.type || !allowedActionTypes.includes(action.type)) {
          errors.push(`Ação ${index + 1}: Tipo de ação inválido`);
        }
      });
    }

    // Sanitize cron expressions
    if (ruleData.trigger_conditions?.schedule) {
      const schedule = ruleData.trigger_conditions.schedule;
      const allowedSchedules = [
        '*/5 * * * *',  // Every 5 minutes
        '0 * * * *',    // Every hour
        '0 2 * * *',    // Daily at 2 AM
        '0 6 * * *',    // Daily at 6 AM
        '0 0 * * 0',    // Weekly on Sunday
        '0 0 1 * *'     // Monthly on 1st
      ];
      
      if (!allowedSchedules.includes(schedule)) {
        errors.push('Expressão cron não permitida por motivos de segurança');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    };
  }, []);

  const validateExecutionPermissions = useCallback(async (ruleId: string): Promise<boolean> => {
    try {
      // Add permission validation logic here
      // This would typically check user roles, rate limits, etc.
      
      // For now, return true - implement actual permission checks
      return true;
    } catch (error) {
      console.error('Permission validation error:', error);
      toast({
        title: "Erro de Permissão",
        description: "Não foi possível validar permissões",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const sanitizeParameters = useCallback((parameters: any): any => {
    if (!parameters || typeof parameters !== 'object') {
      return {};
    }

    const sanitized = { ...parameters };

    // Remove potentially dangerous properties
    delete sanitized.__proto__;
    delete sanitized.constructor;
    delete sanitized.eval;
    delete sanitized.function;

    // Sanitize string values
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        // Remove script tags and dangerous patterns
        sanitized[key] = sanitized[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
    });

    return sanitized;
  }, []);

  const checkRateLimit = useCallback(async (operation: string): Promise<boolean> => {
    // Implement rate limiting logic
    // This would typically check against a rate limiting service or database
    
    const rateLimits = {
      'rule_execution': { max: 10, window: 60000 }, // 10 per minute
      'rule_creation': { max: 5, window: 60000 },   // 5 per minute
      'rule_update': { max: 20, window: 60000 }     // 20 per minute
    };

    const limit = rateLimits[operation as keyof typeof rateLimits];
    if (!limit) return true;

    // Implement actual rate limiting check here
    // For now, return true
    return true;
  }, []);

  const logSecurityEvent = useCallback((event: string, details: any) => {
    console.log(`Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      event,
      details: sanitizeParameters(details)
    });

    // In production, send to security monitoring service
  }, [sanitizeParameters]);

  return {
    validateRuleInput,
    validateExecutionPermissions,
    sanitizeParameters,
    checkRateLimit,
    logSecurityEvent
  };
};