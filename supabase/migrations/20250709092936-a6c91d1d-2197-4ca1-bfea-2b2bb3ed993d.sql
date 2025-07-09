-- Sistema de Monitoramento de Performance e Escalabilidade

-- Tabela para métricas de performance
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  memory_usage_mb NUMERIC NOT NULL DEFAULT 0,
  cpu_usage_percent NUMERIC NOT NULL DEFAULT 0,
  error_rate NUMERIC NOT NULL DEFAULT 0,
  throughput_per_second NUMERIC NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para fila de processamento concorrente
CREATE TABLE public.processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES accounting_clients(id),
  process_type TEXT NOT NULL, -- 'monthly_closing', 'document_processing', etc
  priority INTEGER NOT NULL DEFAULT 5, -- 1=highest, 10=lowest
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  worker_id TEXT, -- ID do worker que está processando
  timeout_at TIMESTAMP WITH TIME ZONE,
  parameters JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para controle de workers e concorrência
CREATE TABLE public.worker_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL UNIQUE,
  function_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle', -- 'idle', 'busy', 'offline'
  current_task_id UUID REFERENCES processing_queue(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  max_concurrent_tasks INTEGER NOT NULL DEFAULT 1,
  current_task_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para arquivamento de dados históricos
CREATE TABLE public.archived_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_table TEXT NOT NULL,
  original_id UUID NOT NULL,
  archived_data JSONB NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archive_reason TEXT NOT NULL DEFAULT 'automatic_retention',
  metadata JSONB DEFAULT '{}'
);

-- Habilitar RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para performance_metrics
CREATE POLICY "Admins can manage performance metrics"
ON public.performance_metrics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "System can insert performance metrics"
ON public.performance_metrics
FOR INSERT
WITH CHECK (true);

-- Políticas RLS para processing_queue
CREATE POLICY "Admins and accountants can view processing queue"
ON public.processing_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'accountant')
  )
);

CREATE POLICY "System can manage processing queue"
ON public.processing_queue
FOR ALL
USING (true);

-- Políticas RLS para worker_instances
CREATE POLICY "Admins can view worker instances"
ON public.worker_instances
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "System can manage worker instances"
ON public.worker_instances
FOR ALL
USING (true);

-- Políticas RLS para archived_data
CREATE POLICY "Admins can view archived data"
ON public.archived_data
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Índices para performance otimizada
CREATE INDEX idx_performance_metrics_function_time ON public.performance_metrics(function_name, timestamp DESC);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp DESC);

CREATE INDEX idx_processing_queue_status_priority ON public.processing_queue(status, priority, scheduled_at);
CREATE INDEX idx_processing_queue_client_type ON public.processing_queue(client_id, process_type, status);
CREATE INDEX idx_processing_queue_worker ON public.processing_queue(worker_id, status);

CREATE INDEX idx_worker_instances_status ON public.worker_instances(status, last_heartbeat);
CREATE INDEX idx_worker_instances_function ON public.worker_instances(function_name, status);

CREATE INDEX idx_archived_data_table_date ON public.archived_data(original_table, archived_at DESC);

-- Índices otimizados para tabelas existentes
CREATE INDEX IF NOT EXISTS idx_automation_logs_performance ON public.automation_logs(process_type, created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_priority ON public.notifications(user_id, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lancamentos_competencia ON public.lancamentos_contabeis(client_id, data_competencia);

-- Triggers para updated_at
CREATE TRIGGER update_processing_queue_updated_at
  BEFORE UPDATE ON public.processing_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_instances_updated_at
  BEFORE UPDATE ON public.worker_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar fila com controle de concorrência
CREATE OR REPLACE FUNCTION public.process_queue_item(p_worker_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_task_record RECORD;
  v_worker_record RECORD;
  v_result JSONB;
BEGIN
  -- Verificar se worker existe e está disponível
  SELECT * INTO v_worker_record
  FROM public.worker_instances
  WHERE worker_id = p_worker_id
  AND status = 'idle'
  AND current_task_count < max_concurrent_tasks;

  IF v_worker_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Worker not available or at capacity'
    );
  END IF;

  -- Buscar próxima tarefa na fila
  SELECT * INTO v_task_record
  FROM public.processing_queue
  WHERE status = 'pending'
  AND scheduled_at <= now()
  AND retry_count < max_retries
  ORDER BY priority ASC, scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_task_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No tasks available'
    );
  END IF;

  -- Atribuir tarefa ao worker
  UPDATE public.processing_queue
  SET 
    status = 'processing',
    worker_id = p_worker_id,
    started_at = now(),
    timeout_at = now() + interval '30 minutes',
    updated_at = now()
  WHERE id = v_task_record.id;

  -- Atualizar worker
  UPDATE public.worker_instances
  SET 
    status = 'busy',
    current_task_id = v_task_record.id,
    current_task_count = current_task_count + 1,
    last_heartbeat = now(),
    updated_at = now()
  WHERE worker_id = p_worker_id;

  -- Retornar tarefa para processamento
  RETURN jsonb_build_object(
    'success', true,
    'task', row_to_json(v_task_record)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para completar tarefa
CREATE OR REPLACE FUNCTION public.complete_queue_task(
  p_task_id UUID,
  p_worker_id TEXT,
  p_success BOOLEAN,
  p_result JSONB DEFAULT '{}',
  p_error_details JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_task_record RECORD;
BEGIN
  -- Buscar tarefa
  SELECT * INTO v_task_record
  FROM public.processing_queue
  WHERE id = p_task_id
  AND worker_id = p_worker_id
  AND status = 'processing';

  IF v_task_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Atualizar tarefa
  UPDATE public.processing_queue
  SET 
    status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
    completed_at = now(),
    result = p_result,
    error_details = p_error_details,
    retry_count = CASE WHEN p_success THEN retry_count ELSE retry_count + 1 END,
    updated_at = now()
  WHERE id = p_task_id;

  -- Se falhou e ainda pode tentar novamente, reagendar
  IF NOT p_success AND v_task_record.retry_count + 1 < v_task_record.max_retries THEN
    UPDATE public.processing_queue
    SET 
      status = 'pending',
      worker_id = NULL,
      started_at = NULL,
      timeout_at = NULL,
      scheduled_at = now() + interval '5 minutes' * (v_task_record.retry_count + 1),
      updated_at = now()
    WHERE id = p_task_id;
  END IF;

  -- Atualizar worker
  UPDATE public.worker_instances
  SET 
    status = CASE WHEN current_task_count <= 1 THEN 'idle' ELSE 'busy' END,
    current_task_id = NULL,
    current_task_count = GREATEST(0, current_task_count - 1),
    last_heartbeat = now(),
    updated_at = now()
  WHERE worker_id = p_worker_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cleanup de workers offline
CREATE OR REPLACE FUNCTION public.cleanup_offline_workers()
RETURNS INTEGER AS $$
DECLARE
  v_cleaned_count INTEGER := 0;
BEGIN
  -- Marcar workers como offline se não enviaram heartbeat há mais de 5 minutos
  UPDATE public.worker_instances
  SET status = 'offline'
  WHERE last_heartbeat < now() - interval '5 minutes'
  AND status != 'offline';

  GET DIAGNOSTICS v_cleaned_count = ROW_COUNT;

  -- Liberar tarefas de workers offline
  UPDATE public.processing_queue
  SET 
    status = 'pending',
    worker_id = NULL,
    started_at = NULL,
    timeout_at = NULL,
    scheduled_at = now(),
    updated_at = now()
  WHERE worker_id IN (
    SELECT worker_id 
    FROM public.worker_instances 
    WHERE status = 'offline'
  )
  AND status = 'processing';

  RETURN v_cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para arquivamento automático de dados antigos
CREATE OR REPLACE FUNCTION public.archive_old_data()
RETURNS JSONB AS $$
DECLARE
  v_archived_count INTEGER := 0;
  v_automation_logs_count INTEGER := 0;
  v_performance_metrics_count INTEGER := 0;
BEGIN
  -- Arquivar automation_logs antigos (>90 dias)
  WITH archived_logs AS (
    DELETE FROM public.automation_logs
    WHERE created_at < now() - interval '90 days'
    AND status IN ('completed', 'failed')
    RETURNING *
  )
  INSERT INTO public.archived_data (original_table, original_id, archived_data, archive_reason)
  SELECT 
    'automation_logs',
    id,
    row_to_json(archived_logs.*),
    'automatic_retention_90_days'
  FROM archived_logs;

  GET DIAGNOSTICS v_automation_logs_count = ROW_COUNT;

  -- Arquivar performance_metrics antigas (>30 dias)
  WITH archived_metrics AS (
    DELETE FROM public.performance_metrics
    WHERE created_at < now() - interval '30 days'
    RETURNING *
  )
  INSERT INTO public.archived_data (original_table, original_id, archived_data, archive_reason)
  SELECT 
    'performance_metrics',
    id,
    row_to_json(archived_metrics.*),
    'automatic_retention_30_days'
  FROM archived_metrics;

  GET DIAGNOSTICS v_performance_metrics_count = ROW_COUNT;

  v_archived_count := v_automation_logs_count + v_performance_metrics_count;

  RETURN jsonb_build_object(
    'total_archived', v_archived_count,
    'automation_logs_archived', v_automation_logs_count,
    'performance_metrics_archived', v_performance_metrics_count,
    'archived_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;