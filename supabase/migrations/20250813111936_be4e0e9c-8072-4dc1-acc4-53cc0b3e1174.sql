-- Adicionar agendamento para geração de relatórios
SELECT cron.schedule(
  'monthly-reports-generation',
  '0 8 1 * *',
  $$
  select
    net.http_post(
        url:='https://watophocqlcyimirzrpe.supabase.co/functions/v1/generate-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg"}'::jsonb,
        body:='{"clientId": "all", "reportType": "performance", "format": "pdf", "period": {"start": "2024-01-01", "end": "2024-12-31"}}'::jsonb
    ) as request_id;
  $$
);