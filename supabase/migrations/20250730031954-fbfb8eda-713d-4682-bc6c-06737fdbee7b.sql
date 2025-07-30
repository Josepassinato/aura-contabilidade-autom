-- Criar tabela de auditoria
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  table_name TEXT NOT NULL,
  record_id UUID,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  source TEXT NOT NULL DEFAULT 'app',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todos os logs
CREATE POLICY "Admins podem ver todos os logs de auditoria" 
ON public.audit_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Política para usuários verem apenas seus próprios logs
CREATE POLICY "Usuários podem ver seus próprios logs" 
ON public.audit_logs 
FOR SELECT 
USING (user_id = auth.uid());

-- Política para sistema inserir logs
CREATE POLICY "Sistema pode inserir logs de auditoria" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_operation ON public.audit_logs(operation);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);

-- Função para auditoria automática
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  old_data JSONB := '{}';
  new_data JSONB := '{}';
  changed_fields TEXT[] := '{}';
  field_name TEXT;
BEGIN
  -- Capturar dados antigos
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    old_data := to_jsonb(OLD);
  END IF;
  
  -- Capturar dados novos
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    new_data := to_jsonb(NEW);
  END IF;
  
  -- Identificar campos alterados para UPDATE
  IF TG_OP = 'UPDATE' THEN
    FOR field_name IN SELECT key FROM jsonb_each_text(old_data) LOOP
      IF old_data->>field_name IS DISTINCT FROM new_data->>field_name THEN
        changed_fields := array_append(changed_fields, field_name);
      END IF;
    END LOOP;
  END IF;
  
  -- Inserir log de auditoria
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    record_id,
    operation,
    old_values,
    new_values,
    changed_fields,
    metadata,
    severity,
    source
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE((CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END)::UUID, null),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN old_data ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN new_data ELSE NULL END,
    changed_fields,
    jsonb_build_object(
      'table_schema', TG_TABLE_SCHEMA,
      'trigger_name', TG_NAME
    ),
    CASE 
      WHEN TG_TABLE_NAME IN ('user_profiles', 'accounting_clients', 'system_metrics') THEN 'warning'
      WHEN TG_TABLE_NAME = 'audit_logs' THEN 'critical'
      ELSE 'info'
    END,
    'trigger'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Função para logs críticos do sistema
CREATE OR REPLACE FUNCTION public.log_critical_event(
  p_event_type TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_user_id UUID DEFAULT NULL,
  p_severity TEXT DEFAULT 'critical'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    operation,
    new_values,
    metadata,
    severity,
    source
  ) VALUES (
    COALESCE(p_user_id, auth.uid()),
    'system_events',
    'SYSTEM_EVENT',
    jsonb_build_object(
      'event_type', p_event_type,
      'message', p_message,
      'timestamp', now()
    ),
    p_metadata,
    p_severity,
    'system'
  ) RETURNING id INTO v_log_id;
  
  -- Se for crítico, criar entrada nas métricas também
  IF p_severity = 'critical' THEN
    INSERT INTO public.system_metrics (
      metric_name,
      metric_value,
      metric_type,
      labels
    ) VALUES (
      'critical_event_count',
      1,
      'counter',
      jsonb_build_object(
        'event_type', p_event_type,
        'source', 'audit_system'
      )
    );
  END IF;
  
  RETURN v_log_id;
END;
$$;