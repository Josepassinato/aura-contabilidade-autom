import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddTaskRequest {
  action: 'add_task';
  processType: string;
  clientId: string;
  priority: number;
  parameters: any;
}

interface ProcessQueueRequest {
  action: 'process_queue';
  workerId?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('Queue Processor request:', requestBody);

    switch (requestBody.action) {
      case 'add_task':
        return await handleAddTask(supabase, requestBody as AddTaskRequest);
      
      case 'process_queue':
        return await handleProcessQueue(supabase, requestBody as ProcessQueueRequest);
      
      default:
        throw new Error(`Unknown action: ${requestBody.action}`);
    }

  } catch (error) {
    console.error('Queue Processor error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});

async function handleAddTask(
  supabase: any, 
  request: AddTaskRequest
): Promise<Response> {
  const { processType, clientId, priority, parameters } = request;

  // Add task to processing queue
  const { data: queueItem, error: queueError } = await supabase
    .from('processing_queue')
    .insert({
      process_type: processType,
      client_id: clientId,
      priority: priority,
      parameters: parameters,
      status: 'pending',
      scheduled_at: new Date().toISOString(),
      retry_count: 0,
      max_retries: 3
    })
    .select()
    .single();

  if (queueError) {
    throw queueError;
  }

  // Create automation log entry
  const { data: logEntry, error: logError } = await supabase
    .from('automation_logs')
    .insert({
      process_type: processType,
      client_id: clientId === 'system' ? null : clientId,
      status: 'running',
      started_at: new Date().toISOString(),
      metadata: {
        queue_id: queueItem.id,
        manual_trigger: parameters.manual_trigger || false,
        rule_id: parameters.rule_id,
        rule_name: parameters.rule_name
      }
    })
    .select()
    .single();

  if (logError) {
    console.error('Error creating automation log:', logError);
  }

  console.log(`Task added to queue: ${queueItem.id} (${processType})`);

  return new Response(
    JSON.stringify({
      success: true,
      queue_id: queueItem.id,
      log_id: logEntry?.id,
      message: 'Task added to processing queue'
    }),
    {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
}

async function handleProcessQueue(
  supabase: any,
  request: ProcessQueueRequest
): Promise<Response> {
  const workerId = request.workerId || `queue-processor-${Date.now()}`;

  // Get next pending task
  const { data: taskData, error: taskError } = await supabase.rpc('process_queue_item', {
    p_worker_id: workerId
  });

  if (taskError) {
    throw taskError;
  }

  if (!taskData || !taskData.success || !taskData.task) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'No tasks available',
        processed: 0
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  const task = JSON.parse(taskData.task);
  console.log(`Processing task ${task.id}: ${task.process_type}`);

  try {
    // Process the task based on its type
    let result: any = {};
    const startTime = Date.now();

    switch (task.process_type) {
      case 'automation_rule_execution':
        result = await executeAutomationRule(task, supabase);
        break;
      
      case 'daily_accounting':
        result = await executeDailyAccounting(task, supabase);
        break;
      
      case 'monthly_reports':
        result = await executeMonthlyReports(task, supabase);
        break;
      
      case 'data_backup':
        result = await executeDataBackup(task, supabase);
        break;
      
      case 'send_emails':
        result = await executeSendEmails(task, supabase);
        break;
      
      default:
        throw new Error(`Unknown process type: ${task.process_type}`);
    }

    const executionTime = Date.now() - startTime;

    // Mark task as completed
    await supabase.rpc('complete_queue_task', {
      p_task_id: task.id,
      p_worker_id: workerId,
      p_success: true,
      p_result: result
    });

    // Update automation log
    if (task.parameters?.log_id) {
      await supabase
        .from('automation_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_seconds: Math.round(executionTime / 1000),
          records_processed: result.records_processed || 1
        })
        .eq('id', task.parameters.log_id);
    }

    console.log(`Task ${task.id} completed in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        task_id: task.id,
        execution_time_ms: executionTime,
        result: result
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error(`Error processing task ${task.id}:`, error);

    // Mark task as failed
    await supabase.rpc('complete_queue_task', {
      p_task_id: task.id,
      p_worker_id: workerId,
      p_success: false,
      p_error_details: { error: error.message, stack: error.stack }
    });

    // Update automation log
    if (task.parameters?.log_id) {
      await supabase
        .from('automation_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          errors_count: 1,
          error_details: { error: error.message }
        })
        .eq('id', task.parameters.log_id);
    }

    throw error;
  }
}

async function executeAutomationRule(task: any, supabase: any): Promise<any> {
  const { rule_id, rule_name, actions } = task.parameters;
  console.log(`Executing automation rule: ${rule_name}`);

  const results = [];
  let totalRecordsProcessed = 0;

  for (const action of actions || []) {
    try {
      let actionResult: any = {};
      
      switch (action.type) {
        case 'daily_accounting':
          actionResult = await executeDailyAccounting(task, supabase);
          break;
        
        case 'monthly_reports':
          actionResult = await executeMonthlyReports(task, supabase);
          break;
        
        case 'data_backup':
          actionResult = await executeDataBackup(task, supabase);
          break;
        
        case 'send_emails':
          actionResult = await executeSendEmails(task, supabase);
          break;
        
        default:
          console.log(`Unknown action type: ${action.type}`);
          actionResult = { 
            success: false, 
            error: `Unknown action type: ${action.type}` 
          };
      }

      results.push({
        action_type: action.type,
        success: actionResult.success !== false,
        records_processed: actionResult.records_processed || 0,
        result: actionResult
      });

      totalRecordsProcessed += actionResult.records_processed || 0;

    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      results.push({
        action_type: action.type,
        success: false,
        error: error.message
      });
    }
  }

  return {
    rule_id,
    rule_name,
    actions_executed: results.length,
    records_processed: totalRecordsProcessed,
    action_results: results,
    success: results.every(r => r.success)
  };
}

async function executeDailyAccounting(task: any, supabase: any): Promise<any> {
  console.log('Executing daily accounting process...');
  
  const today = new Date().toISOString().split('T')[0];
  
  // Get clients to process
  const { data: clients, error: clientsError } = await supabase
    .from('accounting_clients')
    .select('id, name')
    .eq('status', 'active')
    .limit(10);

  if (clientsError) {
    throw new Error(`Error fetching clients: ${clientsError.message}`);
  }

  let processedCount = 0;
  const results = [];

  for (const client of clients || []) {
    try {
      // Simulate processing client data
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Insert processed data record
      const { error: insertError } = await supabase
        .from('processed_accounting_data')
        .insert({
          client_id: client.id,
          period: today,
          revenue: Math.random() * 10000,
          expenses: Math.random() * 5000,
          net_income: Math.random() * 5000,
          taxable_income: Math.random() * 4000,
          calculated_taxes: { icms: Math.random() * 500, iss: Math.random() * 300 },
          processed_documents: { count: Math.floor(Math.random() * 20) }
        });

      if (insertError) {
        console.error(`Error processing client ${client.id}:`, insertError);
        results.push({ client_id: client.id, success: false, error: insertError.message });
      } else {
        results.push({ client_id: client.id, success: true });
        processedCount++;
      }
    } catch (error) {
      console.error(`Error processing client ${client.id}:`, error);
      results.push({ client_id: client.id, success: false, error: error.message });
    }
  }

  return {
    success: true,
    records_processed: processedCount,
    clients_processed: results.length,
    period: today,
    results
  };
}

async function executeMonthlyReports(task: any, supabase: any): Promise<any> {
  console.log('Executing monthly reports generation...');
  
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    records_processed: 1,
    report_period: currentMonth,
    reports_generated: ['balance_sheet', 'income_statement', 'cash_flow']
  };
}

async function executeDataBackup(task: any, supabase: any): Promise<any> {
  console.log('Executing data backup...');
  
  // Simulate backup process
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    records_processed: 1,
    backup_timestamp: new Date().toISOString(),
    backup_size_mb: Math.floor(Math.random() * 100) + 50
  };
}

async function executeSendEmails(task: any, supabase: any): Promise<any> {
  console.log('Executing email sending...');
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    success: true,
    records_processed: Math.floor(Math.random() * 5) + 1,
    emails_sent: Math.floor(Math.random() * 5) + 1
  };
}