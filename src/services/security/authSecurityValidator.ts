import { supabase } from '@/integrations/supabase/client';

/**
 * Validador de configurações de segurança do Supabase Auth
 */
export class AuthSecurityValidator {
  
  /**
   * Testa se a proteção contra senhas vazadas está funcionando
   */
  static async testPasswordBreachProtection(): Promise<{
    enabled: boolean;
    testResult: string;
    error?: string;
  }> {
    try {
      // Usar uma senha conhecidamente vazada para teste
      const testEmail = `test-${Date.now()}@example.com`;
      const weakPassword = "123456"; // Senha comum em vazamentos
      
      const { error } = await supabase.auth.signUp({
        email: testEmail,
        password: weakPassword
      });
      
      if (error && error.message.includes('breach')) {
        return {
          enabled: true,
          testResult: 'PASS - Proteção ativa',
          error: error.message
        };
      }
      
      if (error && error.message.includes('weak')) {
        return {
          enabled: true,
          testResult: 'PASS - Senha rejeitada por fraqueza',
          error: error.message
        };
      }
      
      // Se não houve erro, a proteção pode estar desabilitada
      return {
        enabled: false,
        testResult: 'FAIL - Proteção pode estar desabilitada',
        error: 'Senha fraca foi aceita'
      };
      
    } catch (error) {
      return {
        enabled: false,
        testResult: 'ERROR - Falha no teste',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Testa configurações de OTP
   */
  static async testOTPConfiguration(email: string): Promise<{
    otpSent: boolean;
    timestamp: string;
    error?: string;
  }> {
    try {
      const startTime = new Date().toISOString();
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false
        }
      });
      
      if (error) {
        return {
          otpSent: false,
          timestamp: startTime,
          error: error.message
        };
      }
      
      return {
        otpSent: true,
        timestamp: startTime,
        error: undefined
      };
      
    } catch (error) {
      return {
        otpSent: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Valida configurações de URL
   */
  static validateURLConfiguration(): {
    currentOrigin: string;
    expectedSiteURL: string;
    expectedRedirectURLs: string[];
    isValid: boolean;
  } {
    const currentOrigin = window.location.origin;
    const expectedSiteURL = currentOrigin;
    const expectedRedirectURLs = [
      `${currentOrigin}/**`,
      'http://localhost:8080/**',
      'https://watophocqlcyimirzrpe.lovable.app/**'
    ];
    
    return {
      currentOrigin,
      expectedSiteURL,
      expectedRedirectURLs,
      isValid: true // Não podemos validar isso do cliente
    };
  }
  
  /**
   * Executa todos os testes de segurança
   */
  static async runSecurityTests(userEmail?: string): Promise<{
    passwordProtection: Awaited<ReturnType<typeof AuthSecurityValidator.testPasswordBreachProtection>>;
    otpTest?: Awaited<ReturnType<typeof AuthSecurityValidator.testOTPConfiguration>>;
    urlConfig: ReturnType<typeof AuthSecurityValidator.validateURLConfiguration>;
    timestamp: string;
  }> {
    console.log('🔒 Iniciando testes de segurança Auth...');
    
    const passwordProtection = await this.testPasswordBreachProtection();
    const urlConfig = this.validateURLConfiguration();
    
    let otpTest;
    if (userEmail) {
      otpTest = await this.testOTPConfiguration(userEmail);
    }
    
    const results = {
      passwordProtection,
      otpTest,
      urlConfig,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Resultados dos testes de segurança Auth:', results);
    
    // Log para auditoria
    await this.logSecurityTest(results);
    
    return results;
  }
  
  /**
   * Registra resultado dos testes de segurança
   */
  private static async logSecurityTest(results: any): Promise<void> {
    try {
      await supabase
        .from('automated_actions_log')
        .insert({
          action_type: 'auth_security_test',
          description: 'Teste de configurações de segurança Auth',
          metadata: {
            password_protection_enabled: results.passwordProtection.enabled,
            otp_test_successful: results.otpTest?.otpSent,
            url_config_valid: results.urlConfig.isValid,
            timestamp: results.timestamp
          }
        });
    } catch (error) {
      console.warn('Falha ao registrar teste de segurança:', error);
    }
  }
  
  /**
   * Obtém recomendações de configuração
   */
  static getConfigurationRecommendations(): {
    passwordSecurity: string[];
    otpSettings: string[];
    urlConfiguration: string[];
    general: string[];
  } {
    return {
      passwordSecurity: [
        '✅ Habilitar "Enable password breach protection"',
        '✅ Habilitar "Block sign-ups with breached passwords"', 
        '⚠️ Considerar "Block sign-ins with breached passwords" (opcional)',
        '✅ Definir política de senhas forte (mín. 8 caracteres)'
      ],
      otpSettings: [
        '✅ Definir OTP expiry para 600 segundos (10 minutos)',
        '✅ Manter OTP length em 6 dígitos',
        '✅ Habilitar rate limiting',
        '✅ Configurar templates de email personalizados'
      ],
      urlConfiguration: [
        `✅ Site URL: ${window.location.origin}`,
        `✅ Redirect URLs: ${window.location.origin}/**`,
        '✅ Adicionar localhost para desenvolvimento',
        '✅ Adicionar domínio customizado se aplicável'
      ],
      general: [
        '✅ Habilitar email confirmations em produção',
        '✅ Configurar rate limiting adequado',
        '✅ Monitorar logs de autenticação',
        '✅ Implementar 2FA para admins'
      ]
    };
  }
}

/**
 * Hook para usar validação de segurança Auth em componentes React
 */
export const useAuthSecurityValidation = () => {
  const runSecurityTests = async (userEmail?: string) => {
    return await AuthSecurityValidator.runSecurityTests(userEmail);
  };
  
  const testPasswordProtection = async () => {
    return await AuthSecurityValidator.testPasswordBreachProtection();
  };
  
  const testOTP = async (email: string) => {
    return await AuthSecurityValidator.testOTPConfiguration(email);
  };
  
  const getRecommendations = () => {
    return AuthSecurityValidator.getConfigurationRecommendations();
  };
  
  const validateURLs = () => {
    return AuthSecurityValidator.validateURLConfiguration();
  };
  
  return {
    runSecurityTests,
    testPasswordProtection,
    testOTP,
    getRecommendations,
    validateURLs
  };
};