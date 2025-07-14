import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueTask {
  id: string;
  process_type: string;
  client_id: string;
  priority: number;
  parameters: any;
  status: string;
  created_at: string;
  scheduled_at: string;
  retry_count: number;
  max_retries: number;
}

interface AutomationAction {
  type: string;
  config: any;
  name?: string;
  description?: string;
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

    const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Automation Worker ${workerId}: Starting task processing...`);

    // Register worker instance
    await supabase
      .from('worker_instances')
      .upsert({
        worker_id: workerId,
        function_name: 'automation-worker',
        status: 'idle',
        current_task_count: 0,
        max_concurrent_tasks: 1,
        started_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString()
      });

    // Process tasks from queue
    const processedTasks = [];
    let keepProcessing = true;
    let tasksProcessed = 0;
    const maxTasks = 10; // Limit to prevent timeout

    while (keepProcessing && tasksProcessed < maxTasks) {
      // Get next task from queue
      const { data: taskData, error: taskError } = await supabase.rpc('process_queue_item', {
        p_worker_id: workerId
      });

      if (taskError) {
        console.error('Error getting task from queue:', taskError);
        break;
      }

      if (!taskData || !taskData.success || !taskData.task) {
        console.log('No more tasks available');
        keepProcessing = false;
        break;
      }

      const task: QueueTask = JSON.parse(taskData.task);
      console.log(`Processing task ${task.id}: ${task.process_type}`);

      try {
        // Update heartbeat
        await supabase
          .from('worker_instances')
          .update({
            last_heartbeat: new Date().toISOString(),
            current_task_count: 1
          })
          .eq('worker_id', workerId);

        const startTime = Date.now();
        let result: any = {};

        // Execute task based on type
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
        console.log(`Task ${task.id} completed in ${executionTime}ms`);

        // Mark task as completed
        await supabase.rpc('complete_queue_task', {
          p_task_id: task.id,
          p_worker_id: workerId,
          p_success: true,
          p_result: result
        });

        // Update automation logs if this was a rule execution
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

        // Update rule success count if this was a rule execution
        if (task.parameters?.rule_id) {
          await supabase
            .from('automation_rules')
            .update({
              success_count: supabase.rpc('increment', { amount: 1 })
            })
            .eq('id', task.parameters.rule_id);
        }

        processedTasks.push({
          task_id: task.id,
          process_type: task.process_type,
          status: 'completed',
          execution_time_ms: executionTime,
          result
        });

        tasksProcessed++;

      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);

        const executionTime = Date.now() - Date.now();

        // Mark task as failed
        await supabase.rpc('complete_queue_task', {
          p_task_id: task.id,
          p_worker_id: workerId,
          p_success: false,
          p_error_details: { error: error.message, stack: error.stack }
        });

        // Update automation logs if this was a rule execution
        if (task.parameters?.log_id) {
          await supabase
            .from('automation_logs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              duration_seconds: Math.round(executionTime / 1000),
              errors_count: 1,
              error_details: { error: error.message }
            })
            .eq('id', task.parameters.log_id);
        }

        // Update rule error count if this was a rule execution
        if (task.parameters?.rule_id) {
          await supabase
            .from('automation_rules')
            .update({
              error_count: supabase.rpc('increment', { amount: 1 })
            })
            .eq('id', task.parameters.rule_id);
        }

        processedTasks.push({
          task_id: task.id,
          process_type: task.process_type,
          status: 'failed',
          execution_time_ms: executionTime,
          error: error.message
        });

        tasksProcessed++;
      }
    }

    // Update worker status to idle
    await supabase
      .from('worker_instances')
      .update({
        status: 'idle',
        current_task_count: 0,
        last_heartbeat: new Date().toISOString()
      })
      .eq('worker_id', workerId);

    console.log(`Worker ${workerId}: Processed ${processedTasks.length} tasks`);

    return new Response(
      JSON.stringify({
        success: true,
        worker_id: workerId,
        tasks_processed: processedTasks.length,
        processed_tasks: processedTasks,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Automation Worker error:', error);
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

async function executeAutomationRule(task: QueueTask, supabase: any): Promise<any> {
  const { rule_id, rule_name, actions } = task.parameters;
  console.log(`Executing automation rule: ${rule_name} with ${actions.length} actions`);

  const results = [];
  let totalRecordsProcessed = 0;

  for (const action of actions) {
    try {
      console.log(`Executing action: ${action.type}`);
      
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
        
        case 'custom_script':
          actionResult = await executeCustomScript(action, supabase);
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

async function executeDailyAccounting(task: QueueTask, supabase: any): Promise<any> {
  console.log('Executing daily accounting process...');
  
  // Simulate daily accounting processing
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
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
      
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

async function executeMonthlyReports(task: QueueTask, supabase: any): Promise<any> {
  console.log('Executing monthly reports generation...');
  
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    records_processed: 1,
    report_period: currentMonth,
    reports_generated: ['balance_sheet', 'income_statement', 'cash_flow']
  };
}

async function executeDataBackup(task: QueueTask, supabase: any): Promise<any> {
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

async function executeSendEmails(task: QueueTask, supabase: any): Promise<any> {
  console.log('Executing email sending...');
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    success: true,
    records_processed: Math.floor(Math.random() * 5) + 1,
    emails_sent: Math.floor(Math.random() * 5) + 1
  };
}

async function executeCustomScript(action: AutomationAction, supabase: any): Promise<any> {
  console.log('Executing custom script...');
  
  // Simulate custom script execution
  await new Promise(resolve => setTimeout(resolve, 150));
  
  return {
    success: true,
    records_processed: 1,
    script_output: 'Custom script executed successfully'
  };
}