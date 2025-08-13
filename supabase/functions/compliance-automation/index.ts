import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RetentionRule {
  table: string;
  retention_days: number;
  anonymize_fields?: string[];
  delete_after_days?: number;
  conditions?: Record<string, any>;
}

const RETENTION_RULES: RetentionRule[] = [
  {
    table: 'audit_logs',
    retention_days: 2555, // 7 anos para auditoria
    delete_after_days: 3650 // 10 anos para exclusão
  },
  {
    table: 'automation_logs',
    retention_days: 365, // 1 ano
    delete_after_days: 1095 // 3 anos
  },
  {
    table: 'performance_metrics',
    retention_days: 90, // 3 meses
    delete_after_days: 365 // 1 ano
  },
  {
    table: 'client_messages',
    retention_days: 1825, // 5 anos para mensagens
    anonymize_fields: ['sender_name', 'message'],
    delete_after_days: 2555 // 7 anos
  },
  {
    table: 'user_profiles',
    retention_days: 2555, // 7 anos
    anonymize_fields: ['full_name', 'email'], // Anonimizar dados pessoais
    conditions: { status: 'inactive' }
  },
  {
    table: 'generated_reports',
    retention_days: 365, // 1 ano
    delete_after_days: 2190 // 6 anos
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action = 'process', dryRun = false } = await req.json();

    console.log(`Iniciando compliance automático - action: ${action}, dryRun: ${dryRun}`);

    let totalProcessed = 0;
    let totalAnonymized = 0;
    let totalDeleted = 0;
    const results = [];

    // PROCESSAR CADA REGRA DE RETENÇÃO
    for (const rule of RETENTION_RULES) {
      console.log(`Processando regra para tabela: ${rule.table}`);
      
      try {
        const result = await processRetentionRule(supabase, rule, dryRun);
        results.push(result);
        totalProcessed += result.processed;
        totalAnonymized += result.anonymized;
        totalDeleted += result.deleted;
      } catch (error) {
        console.error(`Erro ao processar ${rule.table}:`, error);
        results.push({
          table: rule.table,
          error: error.message,
          processed: 0,
          anonymized: 0,
          deleted: 0
        });
      }
    }

    // LIMPEZA DE DADOS ÓRFÃOS
    if (action === 'cleanup') {
      const orphanCleanup = await cleanupOrphanedData(supabase, dryRun);
      results.push(orphanCleanup);
      totalDeleted += orphanCleanup.deleted;
    }

    // LOG DE AUDITORIA
    if (!dryRun) {
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'compliance_automation',
          operation: 'DATA_RETENTION_PROCESS',
          new_values: {
            action,
            total_processed: totalProcessed,
            total_anonymized: totalAnonymized,
            total_deleted: totalDeleted
          },
          metadata: {
            rules_processed: RETENTION_RULES.length,
            results: results,
            timestamp: new Date().toISOString()
          },
          severity: 'info',
          source: 'compliance_system'
        });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        dry_run: dryRun,
        total_processed: totalProcessed,
        total_anonymized: totalAnonymized,
        total_deleted: totalDeleted,
        rules_processed: RETENTION_RULES.length,
        results: results
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento de compliance:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processRetentionRule(supabase: any, rule: RetentionRule, dryRun: boolean) {
  let processed = 0;
  let anonymized = 0;
  let deleted = 0;

  // ANONIMIZAÇÃO
  if (rule.anonymize_fields && rule.retention_days) {
    const anonymizeDate = new Date();
    anonymizeDate.setDate(anonymizeDate.getDate() - rule.retention_days);

    const { data: recordsToAnonymize } = await supabase
      .from(rule.table)
      .select('id, created_at')
      .lt('created_at', anonymizeDate.toISOString())
      .limit(1000); // Processar em lotes

    if (recordsToAnonymize && recordsToAnonymize.length > 0) {
      console.log(`Anonimizando ${recordsToAnonymize.length} registros em ${rule.table}`);
      
      if (!dryRun) {
        const anonymizeData: Record<string, string> = {};
        rule.anonymize_fields.forEach(field => {
          anonymizeData[field] = generateAnonymizedValue(field);
        });

        for (const record of recordsToAnonymize) {
          await supabase
            .from(rule.table)
            .update(anonymizeData)
            .eq('id', record.id);
          
          anonymized++;
        }
      } else {
        anonymized = recordsToAnonymize.length;
      }
    }
  }

  // EXCLUSÃO
  if (rule.delete_after_days) {
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() - rule.delete_after_days);

    const { data: recordsToDelete } = await supabase
      .from(rule.table)
      .select('id')
      .lt('created_at', deleteDate.toISOString())
      .limit(1000);

    if (recordsToDelete && recordsToDelete.length > 0) {
      console.log(`Excluindo ${recordsToDelete.length} registros em ${rule.table}`);
      
      if (!dryRun) {
        for (const record of recordsToDelete) {
          await supabase
            .from(rule.table)
            .delete()
            .eq('id', record.id);
          
          deleted++;
        }
      } else {
        deleted = recordsToDelete.length;
      }
    }
  }

  processed = anonymized + deleted;

  return {
    table: rule.table,
    processed,
    anonymized,
    deleted,
    retention_days: rule.retention_days,
    delete_after_days: rule.delete_after_days
  };
}

async function cleanupOrphanedData(supabase: any, dryRun: boolean) {
  let deleted = 0;

  // Limpar relatórios expirados
  const { data: expiredReports } = await supabase
    .from('generated_reports')
    .select('id')
    .lt('expires_at', new Date().toISOString())
    .limit(100);

  if (expiredReports && expiredReports.length > 0 && !dryRun) {
    for (const report of expiredReports) {
      await supabase
        .from('generated_reports')
        .delete()
        .eq('id', report.id);
      deleted++;
    }
  }

  return {
    table: 'orphaned_data_cleanup',
    processed: deleted,
    anonymized: 0,
    deleted: deleted || (expiredReports?.length || 0)
  };
}

function generateAnonymizedValue(fieldName: string): string {
  const randomId = crypto.randomUUID().split('-')[0];
  
  switch (fieldName) {
    case 'email':
      return `anonymized_${randomId}@example.com`;
    case 'full_name':
    case 'sender_name':
      return `Usuario_${randomId}`;
    case 'message':
      return '[MENSAGEM ANONIMIZADA]';
    default:
      return `[ANONIMIZADO_${randomId}]`;
  }
}