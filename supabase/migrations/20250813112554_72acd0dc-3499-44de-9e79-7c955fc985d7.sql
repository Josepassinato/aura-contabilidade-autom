-- Agendar automação de compliance mensal
SELECT cron.schedule(
  'monthly-compliance-automation',
  '0 2 1 * *',
  $$
  select
    net.http_post(
        url:='https://watophocqlcyimirzrpe.supabase.co/functions/v1/compliance-automation',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg"}'::jsonb,
        body:='{"action": "process", "dryRun": false}'::jsonb
    ) as request_id;
  $$
);

-- Criar função para verificação de compliance LGPD
CREATE OR REPLACE FUNCTION public.check_lgpd_compliance()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pii_tables jsonb := '[]'::jsonb;
  retention_violations jsonb := '[]'::jsonb;
  anonymization_needed jsonb := '[]'::jsonb;
  compliance_score numeric := 100;
BEGIN
  -- Mapear tabelas com PII
  pii_tables := jsonb_build_array(
    jsonb_build_object(
      'table', 'user_profiles',
      'pii_fields', jsonb_build_array('full_name', 'email'),
      'classification', 'personal',
      'retention_days', 2555
    ),
    jsonb_build_object(
      'table', 'accounting_clients',
      'pii_fields', jsonb_build_array('name', 'email', 'cnpj'),
      'classification', 'sensitive',
      'retention_days', 3650
    ),
    jsonb_build_object(
      'table', 'client_messages',
      'pii_fields', jsonb_build_array('sender_name', 'message'),
      'classification', 'personal',
      'retention_days', 1825
    ),
    jsonb_build_object(
      'table', 'employees',
      'pii_fields', jsonb_build_array('name', 'cpf'),
      'classification', 'sensitive',
      'retention_days', 3650
    )
  );
  
  -- Verificar dados que precisam ser anonimizados
  -- user_profiles older than 7 years and inactive
  IF EXISTS(
    SELECT 1 FROM user_profiles 
    WHERE created_at < now() - interval '2555 days'
    AND full_name NOT LIKE 'Usuario_%'
    LIMIT 1
  ) THEN
    anonymization_needed := anonymization_needed || jsonb_build_object(
      'table', 'user_profiles',
      'issue', 'Dados pessoais não anonimizados após período de retenção'
    );
    compliance_score := compliance_score - 20;
  END IF;
  
  -- client_messages older than 5 years
  IF EXISTS(
    SELECT 1 FROM client_messages 
    WHERE created_at < now() - interval '1825 days'
    AND message NOT LIKE '[MENSAGEM ANONIMIZADA]'
    LIMIT 1
  ) THEN
    anonymization_needed := anonymization_needed || jsonb_build_object(
      'table', 'client_messages',
      'issue', 'Mensagens não anonimizadas após período de retenção'
    );
    compliance_score := compliance_score - 15;
  END IF;
  
  RETURN jsonb_build_object(
    'compliance_score', compliance_score,
    'pii_mapping', pii_tables,
    'retention_violations', retention_violations,
    'anonymization_needed', anonymization_needed,
    'status', CASE 
      WHEN compliance_score >= 95 THEN 'compliant'
      WHEN compliance_score >= 80 THEN 'warning'
      ELSE 'non_compliant'
    END,
    'last_check', now(),
    'recommendations', CASE
      WHEN jsonb_array_length(anonymization_needed) > 0 
      THEN jsonb_build_array('Execute processo de anonimização automática')
      ELSE jsonb_build_array('Sistema em conformidade')
    END
  );
END;
$$;