import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationRule {
  id: string;
  name: string;
  type: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: any[];
  enabled: boolean;
  last_run?: string;
  success_count: number;
  error_count: number;
  client_id?: string;
}

interface TriggerEvent {
  type: 'scheduled' | 'database' | 'webhook' | 'manual';
  data?: any;
  timestamp: string;
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

    console.log('Automation Trigger Engine: Starting evaluation...');

    // Get current timestamp for trigger evaluation
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDayOfWeek = now.getDay();
    const currentDayOfMonth = now.getDate();

    // Fetch enabled automation rules
    const { data: rules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('enabled', true);

    if (rulesError) {
      console.error('Error fetching rules:', rulesError);
      throw rulesError;
    }

    console.log(`Found ${rules?.length || 0} enabled automation rules`);

    const triggeredRules: AutomationRule[] = [];
    const results = [];

    // Evaluate each rule for triggering
    for (const rule of rules || []) {
      try {
        let shouldTrigger = false;
        const triggerEvent: TriggerEvent = {
          type: rule.trigger_type,
          timestamp: now.toISOString()
        };

        // Evaluate trigger conditions based on type
        switch (rule.trigger_type) {
          case 'time':
            shouldTrigger = await evaluateTimeTrigger(rule, now);
            break;
          
          case 'database':
            shouldTrigger = await evaluateDatabaseTrigger(rule, supabase);
            break;
          
          case 'webhook':
            // Webhook triggers are handled separately
            shouldTrigger = false;
            break;
          
          case 'interval':
            shouldTrigger = await evaluateIntervalTrigger(rule, now);
            break;
          
          default:
            console.log(`Unknown trigger type: ${rule.trigger_type}`);
            shouldTrigger = false;
        }

        if (shouldTrigger) {
          console.log(`Rule triggered: ${rule.name} (${rule.id})`);
          triggeredRules.push(rule);

          // Execute the rule by adding to processing queue
          const executionResult = await executeAutomationRule(rule, supabase, triggerEvent);
          results.push({
            rule_id: rule.id,
            rule_name: rule.name,
            triggered: true,
            execution_result: executionResult
          });

          // Update rule's last run time
          await supabase
            .from('automation_rules')
            .update({ 
              last_run: now.toISOString(),
            })
            .eq('id', rule.id);
        } else {
          results.push({
            rule_id: rule.id,
            rule_name: rule.name,
            triggered: false,
            reason: 'Conditions not met'
          });
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
        results.push({
          rule_id: rule.id,
          rule_name: rule.name,
          triggered: false,
          error: error.message
        });
      }
    }

    console.log(`Trigger evaluation complete. ${triggeredRules.length} rules triggered.`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        evaluated_rules: rules?.length || 0,
        triggered_rules: triggeredRules.length,
        results
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Automation Trigger Engine error:', error);
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

async function evaluateTimeTrigger(rule: AutomationRule, now: Date): Promise<boolean> {
  const conditions = rule.trigger_conditions;
  if (!conditions || !conditions.schedule) {
    return false;
  }

  // Parse cron-like schedule (simplified version)
  const schedule = conditions.schedule;
  
  // Check if this rule should run now based on its schedule
  const lastRun = rule.last_run ? new Date(rule.last_run) : null;
  
  // Simple schedule patterns
  if (schedule === '0 2 * * *') { // Daily at 2 AM
    if (now.getHours() === 2 && now.getMinutes() === 0) {
      if (!lastRun || lastRun.getDate() !== now.getDate()) {
        return true;
      }
    }
  } else if (schedule === '0 0 * * 0') { // Weekly on Sunday
    if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() === 0) {
      if (!lastRun || (now.getTime() - lastRun.getTime()) > 6 * 24 * 60 * 60 * 1000) {
        return true;
      }
    }
  } else if (schedule === '0 0 1 * *') { // Monthly on 1st
    if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
      if (!lastRun || lastRun.getMonth() !== now.getMonth()) {
        return true;
      }
    }
  }

  return false;
}

async function evaluateIntervalTrigger(rule: AutomationRule, now: Date): Promise<boolean> {
  const conditions = rule.trigger_conditions;
  if (!conditions || !conditions.interval_minutes) {
    return false;
  }

  const lastRun = rule.last_run ? new Date(rule.last_run) : null;
  if (!lastRun) {
    return true; // First run
  }

  const intervalMs = conditions.interval_minutes * 60 * 1000;
  const timeSinceLastRun = now.getTime() - lastRun.getTime();

  return timeSinceLastRun >= intervalMs;
}

async function evaluateDatabaseTrigger(rule: AutomationRule, supabase: any): Promise<boolean> {
  const conditions = rule.trigger_conditions;
  if (!conditions || !conditions.table || !conditions.condition) {
    return false;
  }

  try {
    // Simple database condition evaluation
    const { data, error } = await supabase
      .from(conditions.table)
      .select('count')
      .match(conditions.condition);

    if (error) {
      console.error('Database trigger evaluation error:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Database trigger error:', error);
    return false;
  }
}

async function executeAutomationRule(
  rule: AutomationRule, 
  supabase: any, 
  triggerEvent: TriggerEvent
): Promise<any> {
  try {
    console.log(`Executing automation rule: ${rule.name}`);

    // Create automation log entry
    const { data: logEntry, error: logError } = await supabase
      .from('automation_logs')
      .insert({
        process_type: 'automation_rule_execution',
        client_id: rule.client_id || null,
        started_at: new Date().toISOString(),
        status: 'running',
        metadata: {
          rule_id: rule.id,
          rule_name: rule.name,
          trigger_type: rule.trigger_type,
          trigger_event: triggerEvent,
          actions_count: rule.actions.length
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating automation log:', logError);
    }

    // Add task to processing queue for actual execution
    const { data: queueResult, error: queueError } = await supabase
      .from('processing_queue')
      .insert({
        process_type: 'automation_rule_execution',
        client_id: rule.client_id || 'system',
        priority: 2,
        parameters: {
          automated: true,
          rule_id: rule.id,
          rule_name: rule.name,
          trigger_event: triggerEvent,
          actions: rule.actions,
          log_id: logEntry?.id
        }
      })
      .select()
      .single();

    if (queueError) {
      console.error('Error adding to processing queue:', queueError);
      throw queueError;
    }

    console.log(`Rule ${rule.name} added to processing queue with ID: ${queueResult.id}`);

    return {
      queue_id: queueResult.id,
      log_id: logEntry?.id,
      status: 'queued'
    };

  } catch (error) {
    console.error(`Error executing rule ${rule.id}:`, error);
    
    // Update error count
    await supabase
      .from('automation_rules')
      .update({ 
        error_count: rule.error_count + 1
      })
      .eq('id', rule.id);

    throw error;
  }
}