import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
  type: 'fiscal_compliance' | 'data_integrity' | 'security_audit';
  client_id?: string;
  parameters?: Record<string, any>;
}

interface ValidationResult {
  validation_id: string;
  type: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: Record<string, any>;
  recommendations: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const validationRequest: ValidationRequest = await req.json()
    const results: ValidationResult[] = []

    // Get fiscal parameters for validation
    const { data: fiscalParams, error: paramsError } = await supabase
      .from('parametros_fiscais')
      .select('*')
      .eq('ativo', true)

    if (paramsError) {
      throw new Error(`Failed to get fiscal parameters: ${paramsError.message}`)
    }

    if (validationRequest.type === 'fiscal_compliance') {
      // Validate fiscal compliance
      const complianceResult = await validateFiscalCompliance(supabase, validationRequest.client_id, fiscalParams)
      results.push(complianceResult)
    }

    if (validationRequest.type === 'data_integrity') {
      // Validate data integrity
      const integrityResult = await validateDataIntegrity(supabase, validationRequest.client_id)
      results.push(integrityResult)
    }

    if (validationRequest.type === 'security_audit') {
      // Perform security audit
      const securityResult = await performSecurityAudit(supabase)
      results.push(securityResult)
    }

    // Store validation results
    for (const result of results) {
      await supabase
        .from('automated_actions_log')
        .insert({
          action_type: 'validation_service',
          client_id: validationRequest.client_id || null,
          description: `Validation ${result.type} completed with status: ${result.status}`,
          success: result.status === 'passed',
          metadata: {
            validation_result: result,
            validation_request: validationRequest
          },
          created_at: new Date().toISOString()
        })
    }

    console.log(`Validation service completed. ${results.length} validations performed.`)

    return new Response(
      JSON.stringify({
        success: true,
        validation_results: results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in validation service:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function validateFiscalCompliance(supabase: any, clientId?: string, fiscalParams?: any[]): Promise<ValidationResult> {
  const validationId = crypto.randomUUID()
  let score = 100
  const recommendations: string[] = []
  const details: Record<string, any> = {}

  try {
    // Check if fiscal parameters are configured
    if (!fiscalParams || fiscalParams.length === 0) {
      score -= 50
      recommendations.push('Configure parâmetros fiscais básicos')
      details.fiscal_params_configured = false
    } else {
      details.fiscal_params_configured = true
      details.fiscal_params_count = fiscalParams.length
    }

    // Check client's fiscal obligations if client_id provided
    if (clientId) {
      const { data: obligations } = await supabase
        .from('obrigacoes_fiscais')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'pendente')

      const pendingCount = obligations?.length || 0
      details.pending_obligations = pendingCount

      if (pendingCount > 5) {
        score -= 30
        recommendations.push('Resolver obrigações fiscais pendentes')
      } else if (pendingCount > 0) {
        score -= 10
        recommendations.push('Monitorar obrigações fiscais pendentes')
      }
    }

    // Check for recent compliance violations
    const { data: violations } = await supabase
      .from('automated_actions_log')
      .select('*')
      .eq('action_type', 'compliance_violation')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const violationCount = violations?.length || 0
    details.recent_violations = violationCount

    if (violationCount > 0) {
      score -= violationCount * 10
      recommendations.push('Investigar e corrigir violações de compliance recentes')
    }

    const status = score >= 80 ? 'passed' : score >= 60 ? 'warning' : 'failed'

    return {
      validation_id: validationId,
      type: 'fiscal_compliance',
      status,
      score,
      details,
      recommendations
    }

  } catch (error) {
    return {
      validation_id: validationId,
      type: 'fiscal_compliance',
      status: 'failed',
      score: 0,
      details: { error: error.message },
      recommendations: ['Verificar configuração do sistema fiscal']
    }
  }
}

async function validateDataIntegrity(supabase: any, clientId?: string): Promise<ValidationResult> {
  const validationId = crypto.randomUUID()
  let score = 100
  const recommendations: string[] = []
  const details: Record<string, any> = {}

  try {
    // Check for missing required data
    const { data: clients, error: clientsError } = await supabase
      .from('accounting_clients')
      .select('id, name, cnpj, email')
      .is('cnpj', null)

    if (!clientsError) {
      const missingCnpjCount = clients?.length || 0
      details.clients_missing_cnpj = missingCnpjCount
      
      if (missingCnpjCount > 0) {
        score -= missingCnpjCount * 5
        recommendations.push('Completar CNPJ para todos os clientes')
      }
    }

    // Check for orphaned records
    const { data: orphanedDocs } = await supabase
      .from('client_documents')
      .select('id')
      .is('client_id', null)

    const orphanedCount = orphanedDocs?.length || 0
    details.orphaned_documents = orphanedCount

    if (orphanedCount > 0) {
      score -= orphanedCount * 2
      recommendations.push('Resolver documentos órfãos')
    }

    // Check data consistency
    const { data: inconsistentData } = await supabase
      .from('balancetes')
      .select('id')
      .filter('periodo_fim', 'lt', 'periodo_inicio')

    const inconsistentCount = inconsistentData?.length || 0
    details.inconsistent_periods = inconsistentCount

    if (inconsistentCount > 0) {
      score -= inconsistentCount * 10
      recommendations.push('Corrigir períodos inconsistentes em balancetes')
    }

    const status = score >= 90 ? 'passed' : score >= 70 ? 'warning' : 'failed'

    return {
      validation_id: validationId,
      type: 'data_integrity',
      status,
      score,
      details,
      recommendations
    }

  } catch (error) {
    return {
      validation_id: validationId,
      type: 'data_integrity',
      status: 'failed',
      score: 0,
      details: { error: error.message },
      recommendations: ['Verificar configuração da base de dados']
    }
  }
}

async function performSecurityAudit(supabase: any): Promise<ValidationResult> {
  const validationId = crypto.randomUUID()
  let score = 100
  const recommendations: string[] = []
  const details: Record<string, any> = {}

  try {
    // Check for admin users
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin')

    const adminCount = adminUsers?.length || 0
    details.admin_users_count = adminCount

    if (adminCount === 0) {
      score -= 50
      recommendations.push('Configurar pelo menos um usuário administrador')
    } else if (adminCount > 3) {
      score -= 20
      recommendations.push('Revisar necessidade de múltiplos administradores')
    }

    // Check for recent failed login attempts
    const { data: failedLogins } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('process_type', 'authentication')
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const failedLoginCount = failedLogins?.length || 0
    details.failed_logins_24h = failedLoginCount

    if (failedLoginCount > 10) {
      score -= 30
      recommendations.push('Investigar tentativas de login suspeitas')
    } else if (failedLoginCount > 5) {
      score -= 15
      recommendations.push('Monitorar tentativas de login falhadas')
    }

    // Check notification escalation rules
    const { data: escalationRules } = await supabase
      .from('notification_escalation_rules')
      .select('*')
      .eq('is_active', true)

    const activeRulesCount = escalationRules?.length || 0
    details.active_escalation_rules = activeRulesCount

    if (activeRulesCount === 0) {
      score -= 25
      recommendations.push('Configurar regras de escalação de notificações')
    }

    const status = score >= 85 ? 'passed' : score >= 70 ? 'warning' : 'failed'

    return {
      validation_id: validationId,
      type: 'security_audit',
      status,
      score,
      details,
      recommendations
    }

  } catch (error) {
    return {
      validation_id: validationId,
      type: 'security_audit',
      status: 'failed',
      score: 0,
      details: { error: error.message },
      recommendations: ['Verificar configuração de segurança do sistema']
    }
  }
}