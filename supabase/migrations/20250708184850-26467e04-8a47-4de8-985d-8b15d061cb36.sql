-- Habilitar extensões necessárias para automação
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar tabela para logs de automação
CREATE TABLE public.automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_type TEXT NOT NULL, -- 'daily_processing', 'payment_automation', 'data_ingestion'
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
  client_id UUID REFERENCES accounting_clients(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  records_processed INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_details JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Authenticated users can view automation logs" 
ON public.automation_logs 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert automation logs" 
ON public.automation_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update automation logs" 
ON public.automation_logs 
FOR UPDATE 
USING (true);

-- Criar índices para performance
CREATE INDEX idx_automation_logs_process_type ON public.automation_logs(process_type);
CREATE INDEX idx_automation_logs_status ON public.automation_logs(status);
CREATE INDEX idx_automation_logs_started_at ON public.automation_logs(started_at);
CREATE INDEX idx_automation_logs_client_id ON public.automation_logs(client_id);

-- Criar função para atualizar duração automaticamente
CREATE OR REPLACE FUNCTION public.update_automation_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar duração
CREATE TRIGGER update_automation_duration_trigger
  BEFORE UPDATE ON public.automation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_automation_duration();

-- Configurar cron job para processamento diário automático
SELECT cron.schedule(
  'daily-accounting-processing',
  '0 2 * * *', -- Todo dia às 2h da manhã
  $$
  SELECT net.http_post(
    url:='https://watophocqlcyimirzrpe.supabase.co/functions/v1/process-daily-accounting',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg"}'::jsonb,
    body:='{"trigger": "daily_automation"}'::jsonb
  ) as request_id;
  $$
);

-- Configurar cron job para ingestão de dados a cada 6 horas
SELECT cron.schedule(
  'data-ingestion-automation',
  '0 */6 * * *', -- A cada 6 horas
  $$
  SELECT net.http_post(
    url:='https://watophocqlcyimirzrpe.supabase.co/functions/v1/process-data-ingestion',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg"}'::jsonb,
    body:='{"trigger": "data_ingestion_automation"}'::jsonb
  ) as request_id;
  $$
);

-- Configurar cron job para verificação de pagamentos a cada hora
SELECT cron.schedule(
  'payment-verification-automation',
  '0 * * * *', -- A cada hora
  $$
  SELECT net.http_post(
    url:='https://watophocqlcyimirzrpe.supabase.co/functions/v1/process-scheduled-payments',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg"}'::jsonb,
    body:='{"trigger": "payment_automation"}'::jsonb
  ) as request_id;
  $$
);