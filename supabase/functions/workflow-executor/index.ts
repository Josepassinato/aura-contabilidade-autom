import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'branch';
  description: string;
  config: any;
  connections: string[];
  enabled: boolean;
  timeout?: number;
  retry_count?: number;
  on_error?: 'stop' | 'continue' | 'retry' | 'goto_step';
  error_step_id?: string;
}

interface WorkflowData {
  id: string;
  name: string;
  steps: WorkflowStep[];
  variables: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflow, execution_id, variables = {} } = await req.json();
    
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting workflow execution: ${workflow.name}`);

    // Executar workflow passo a passo
    const executionResult = await executeWorkflow(workflow, variables, supabase);

    return new Response(JSON.stringify({
      success: true,
      execution_id,
      result: executionResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in workflow-executor function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeWorkflow(
  workflow: WorkflowData, 
  variables: Record<string, any>,
  supabase: any
): Promise<any> {
  const executionLog: any[] = [];
  let currentVariables = { ...variables };
  
  // Encontrar step de trigger
  const triggerSteps = workflow.steps.filter(step => step.type === 'trigger');
  
  if (triggerSteps.length === 0) {
    throw new Error('Workflow deve ter pelo menos um trigger');
  }

  // Executar steps em sequência
  let currentStepIds = triggerSteps.map(step => step.id);
  const executedSteps = new Set<string>();

  while (currentStepIds.length > 0) {
    const stepId = currentStepIds.shift()!;
    
    // Evitar loops infinitos
    if (executedSteps.has(stepId)) {
      continue;
    }
    
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step || !step.enabled) {
      continue;
    }

    console.log(`Executing step: ${step.name} (${step.type})`);
    
    const stepStartTime = Date.now();
    
    try {
      // Executar step baseado no tipo
      const stepResult = await executeStep(step, currentVariables, supabase);
      
      const stepEndTime = Date.now();
      const duration = (stepEndTime - stepStartTime) / 1000;
      
      // Log do step executado
      executionLog.push({
        step_id: step.id,
        step_name: step.name,
        type: step.type,
        status: 'completed',
        duration,
        input: currentVariables,
        output: stepResult,
        timestamp: new Date().toISOString()
      });

      // Atualizar variáveis com resultado
      if (stepResult && typeof stepResult === 'object') {
        currentVariables = { ...currentVariables, ...stepResult };
      }

      // Adicionar próximos steps à fila
      if (step.connections) {
        currentStepIds.push(...step.connections);
      }

      executedSteps.add(stepId);
      
    } catch (error) {
      console.error(`Error executing step ${step.name}:`, error);
      
      // Log do erro
      executionLog.push({
        step_id: step.id,
        step_name: step.name,
        type: step.type,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      // Tratar erro baseado na configuração
      if (step.on_error === 'stop') {
        throw error;
      } else if (step.on_error === 'retry' && step.retry_count! > 0) {
        // Reagendar step para retry
        currentStepIds.unshift(stepId);
        step.retry_count = (step.retry_count || 0) - 1;
      } else if (step.on_error === 'goto_step' && step.error_step_id) {
        currentStepIds.push(step.error_step_id);
      }
      // Se for 'continue', apenas continua para o próximo step
    }
  }

  return {
    status: 'completed',
    variables: currentVariables,
    execution_log: executionLog,
    total_steps: executedSteps.size,
    timestamp: new Date().toISOString()
  };
}

async function executeStep(
  step: WorkflowStep, 
  variables: Record<string, any>,
  supabase: any
): Promise<any> {
  
  switch (step.type) {
    case 'trigger':
      return executeTriggerStep(step, variables, supabase);
    
    case 'condition':
      return executeConditionStep(step, variables, supabase);
    
    case 'action':
      return executeActionStep(step, variables, supabase);
    
    case 'delay':
      return executeDelayStep(step, variables);
    
    case 'branch':
      return executeBranchStep(step, variables, supabase);
    
    default:
      throw new Error(`Tipo de step não suportado: ${step.type}`);
  }
}

async function executeTriggerStep(step: WorkflowStep, variables: any, supabase: any) {
  console.log(`Executing trigger: ${step.config.trigger_type}`);
  
  // Simular diferentes tipos de triggers
  switch (step.config.trigger_type) {
    case 'document_upload':
      return { 
        triggered: true, 
        document_id: variables.document_id || 'doc_' + Date.now(),
        trigger_time: new Date().toISOString()
      };
    
    case 'scheduled':
      return { 
        triggered: true, 
        schedule_time: new Date().toISOString()
      };
    
    case 'manual':
      return { 
        triggered: true, 
        manual_trigger: true,
        user_id: variables.user_id
      };
    
    default:
      return { triggered: true };
  }
}

async function executeConditionStep(step: WorkflowStep, variables: any, supabase: any) {
  console.log(`Executing condition: ${step.config.condition_type}`);
  
  // Simular avaliação de condições
  switch (step.config.condition_type) {
    case 'field_comparison':
      const fieldValue = variables[step.config.field];
      const compareValue = step.config.value;
      let conditionMet = false;
      
      switch (step.config.operator) {
        case 'equals':
          conditionMet = fieldValue === compareValue;
          break;
        case 'greater_than':
          conditionMet = parseFloat(fieldValue) > parseFloat(compareValue);
          break;
        case 'contains':
          conditionMet = String(fieldValue).includes(String(compareValue));
          break;
        default:
          conditionMet = true;
      }
      
      return { 
        condition_met: conditionMet,
        field: step.config.field,
        operator: step.config.operator,
        expected: compareValue,
        actual: fieldValue
      };
    
    case 'document_validation':
      // Simular validação de documento
      const isValid = variables.document_id && variables.document_id.length > 0;
      return { 
        condition_met: isValid,
        validation_type: 'document_exists'
      };
    
    default:
      return { condition_met: true };
  }
}

async function executeActionStep(step: WorkflowStep, variables: any, supabase: any) {
  console.log(`Executing action: ${step.config.action_type}`);
  
  // Simular diferentes tipos de ações
  switch (step.config.action_type) {
    case 'send_notification':
      // Registrar notificação
      await supabase
        .from('automated_actions_log')
        .insert({
          action_type: 'notification_sent',
          description: `Workflow notification: ${step.name}`,
          metadata: {
            workflow_step: step.id,
            recipient: step.config.recipient || 'admin',
            message: step.config.message || 'Workflow step completed'
          }
        });
      
      return { 
        notification_sent: true,
        recipient: step.config.recipient || 'admin'
      };
    
    case 'classify_and_register':
      // Simular classificação e registro
      return {
        classified: true,
        category: step.config.category || 'automated_classification',
        registered_at: new Date().toISOString()
      };
    
    case 'update_database':
      // Simular atualização no banco
      return {
        database_updated: true,
        table: step.config.table || 'workflow_data',
        records_affected: 1
      };
    
    case 'send_email':
      return {
        email_sent: true,
        to: step.config.email || 'admin@example.com'
      };
    
    default:
      return { action_completed: true };
  }
}

async function executeDelayStep(step: WorkflowStep, variables: any) {
  const duration = step.config.duration || 1;
  const unit = step.config.unit || 'seconds';
  
  let delayMs = duration * 1000; // default to seconds
  
  if (unit === 'minutes') {
    delayMs = duration * 60 * 1000;
  } else if (unit === 'hours') {
    delayMs = duration * 60 * 60 * 1000;
  }
  
  console.log(`Delaying for ${duration} ${unit}`);
  
  // Em produção, isso seria implementado com uma fila de jobs
  // Por enquanto, simular delay mínimo
  await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 1000)));
  
  return {
    delayed: true,
    duration,
    unit,
    completed_at: new Date().toISOString()
  };
}

async function executeBranchStep(step: WorkflowStep, variables: any, supabase: any) {
  console.log(`Executing branch logic`);
  
  // Simular lógica de ramificação
  const branches = step.config.branches || [];
  
  for (const branch of branches) {
    // Avaliar condição da ramificação
    if (evaluateBranchCondition(branch.condition, variables)) {
      return {
        branch_taken: true,
        branch_condition: branch.condition,
        target_step: branch.target_step
      };
    }
  }
  
  return {
    branch_taken: false,
    default_path: true
  };
}

function evaluateBranchCondition(condition: string, variables: any): boolean {
  // Simular avaliação de condição
  // Em produção, isso seria um parser de expressões mais robusto
  if (!condition) return true;
  
  // Exemplo simples: "field > 100"
  if (condition.includes('>')) {
    const [field, value] = condition.split('>').map(s => s.trim());
    return parseFloat(variables[field]) > parseFloat(value);
  }
  
  if (condition.includes('==')) {
    const [field, value] = condition.split('==').map(s => s.trim());
    return variables[field] === value;
  }
  
  return true; // Default: condição sempre verdadeira
}