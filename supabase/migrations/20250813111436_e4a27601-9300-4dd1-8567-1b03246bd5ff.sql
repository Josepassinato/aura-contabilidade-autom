-- Configurar automação bancária e sistema de filas

-- Primeiro, verificar e adicionar a coluna task_type se necessário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'processing_queue' 
    AND column_name = 'task_type'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.processing_queue ADD COLUMN task_type TEXT NOT NULL DEFAULT 'general';
  END IF;
END $$;

-- Criar função para monitoramento de alertas
CREATE OR REPLACE FUNCTION public.check_system_alerts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pending_count INTEGER;
  offline_workers INTEGER;
  failed_ingests INTEGER;
  alerts_triggered jsonb := '[]'::jsonb;
BEGIN
  -- Verificar fila de tarefas pendentes
  SELECT COUNT(*) INTO pending_count
  FROM processing_queue
  WHERE status = 'pending' AND scheduled_at <= now();
  
  IF pending_count > 100 THEN
    alerts_triggered := alerts_triggered || jsonb_build_object(
      'type', 'queue_backlog',
      'severity', 'warning',
      'value', pending_count,
      'message', format('Fila com %s tarefas pendentes', pending_count)
    );
  END IF;
  
  -- Verificar workers offline
  SELECT COUNT(*) INTO offline_workers
  FROM worker_instances
  WHERE status = 'offline' OR last_heartbeat < now() - interval '10 minutes';
  
  IF offline_workers > 0 THEN
    alerts_triggered := alerts_triggered || jsonb_build_object(
      'type', 'worker_offline',
      'severity', 'critical',
      'value', offline_workers,
      'message', format('%s workers offline detectados', offline_workers)
    );
  END IF;
  
  -- Verificar falhas na ingestão bancária
  SELECT COUNT(*) INTO failed_ingests
  FROM automation_logs
  WHERE process_type = 'bank_ingest'
  AND status = 'failed'
  AND created_at > now() - interval '24 hours';
  
  IF failed_ingests > 3 THEN
    alerts_triggered := alerts_triggered || jsonb_build_object(
      'type', 'bank_ingest_failure',
      'severity', 'warning',
      'value', failed_ingests,
      'message', format('%s falhas na ingestão bancária nas últimas 24h', failed_ingests)
    );
  END IF;
  
  -- Inserir alertas na tabela se houver alertas
  IF jsonb_array_length(alerts_triggered) > 0 THEN
    INSERT INTO performance_alerts (
      alert_type,
      severity,
      metric_name,
      message,
      threshold_value,
      current_value,
      metadata
    )
    SELECT 
      alert->>'type',
      alert->>'severity',
      alert->>'type',
      alert->>'message',
      (alert->>'value')::numeric,
      (alert->>'value')::numeric,
      jsonb_build_object('auto_generated', true, 'timestamp', now())
    FROM jsonb_array_elements(alerts_triggered) AS alert;
  END IF;
  
  RETURN jsonb_build_object(
    'alerts_triggered', jsonb_array_length(alerts_triggered),
    'pending_tasks', pending_count,
    'offline_workers', offline_workers,
    'failed_ingests', failed_ingests,
    'status', CASE WHEN jsonb_array_length(alerts_triggered) = 0 THEN 'healthy' ELSE 'alerts' END
  );
END;
$$;

-- Adicionar tarefas de exemplo na fila para teste
INSERT INTO public.processing_queue (
  task_type,
  payload,
  priority,
  max_retries,
  scheduled_at
) VALUES 
(
  'bank_ingest',
  '{"clientId": "test-client-1", "forceSync": false}'::jsonb,
  1,
  3,
  now() + interval '1 minute'
),
(
  'sefaz_scrape',
  '{"clientId": "test-client-1", "uf": "SP"}'::jsonb,
  2,
  3,
  now() + interval '2 minutes'
),
(
  'reconciliation',
  '{"clientId": "test-client-1", "period": "2024-01"}'::jsonb,
  3,
  3,
  now() + interval '3 minutes'
);

-- Agendar verificação de alertas usando pg_cron
SELECT cron.schedule(
  'system-alerts-check',
  '*/5 * * * *',
  'SELECT public.check_system_alerts();'
);

-- Agendar ingestão bancária diária
SELECT cron.schedule(
  'daily-bank-ingest',
  '0 6 * * *',
  $$
  select
    net.http_post(
        url:='https://watophocqlcyimirzrpe.supabase.co/functions/v1/bank-ingest',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg"}'::jsonb,
        body:='{"clientId": "all", "forceSync": false}'::jsonb
    ) as request_id;
  $$
);

-- Agendar processamento de filas a cada 5 minutos
SELECT cron.schedule(
  'queue-processor',
  '*/5 * * * *',
  $$
  select
    net.http_post(
        url:='https://watophocqlcyimirzrpe.supabase.co/functions/v1/queue-worker',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg"}'::jsonb,
        body:='{"action": "process", "maxConcurrentTasks": 3}'::jsonb
    ) as request_id;
  $$
);