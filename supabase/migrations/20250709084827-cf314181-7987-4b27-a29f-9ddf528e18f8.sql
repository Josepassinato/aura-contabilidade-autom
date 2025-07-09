-- Criar tabela para log de ações automatizadas
CREATE TABLE public.automated_actions_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.accounting_clients(id),
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Criar tabela para classificações de erro
CREATE TABLE public.error_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.client_documents(id),
  original_classification TEXT NOT NULL,
  corrected_classification TEXT,
  confidence_score DECIMAL(3,2),
  error_type TEXT NOT NULL, -- 'misclassification', 'low_confidence', 'processing_error'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'corrected'
  reviewer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Criar tabela para histórico de correções
CREATE TABLE public.correction_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_classification_id UUID REFERENCES public.error_classifications(id),
  action_taken TEXT NOT NULL, -- 'manual_correction', 'reclassification', 'process_override'
  old_value TEXT,
  new_value TEXT,
  corrected_by UUID REFERENCES auth.users(id),
  correction_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Criar tabela para métricas de performance do sistema
CREATE TABLE public.system_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL, -- 'classification_accuracy', 'processing_time', 'error_rate'
  metric_value DECIMAL(10,4) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  context JSONB DEFAULT '{}', -- client_id, document_type, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.automated_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para automated_actions_log
CREATE POLICY "Contadores podem ver logs de ações"
ON public.automated_actions_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Sistema pode inserir logs de ações"
ON public.automated_actions_log
FOR INSERT
WITH CHECK (true);

-- Políticas RLS para error_classifications
CREATE POLICY "Contadores podem gerenciar classificações de erro"
ON public.error_classifications
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('accountant', 'admin')
  )
);

-- Políticas RLS para correction_history
CREATE POLICY "Contadores podem ver histórico de correções"
ON public.correction_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Contadores podem inserir correções"
ON public.correction_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('accountant', 'admin')
  )
);

-- Políticas RLS para system_performance_metrics
CREATE POLICY "Contadores podem ver métricas de performance"
ON public.system_performance_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Sistema pode inserir métricas"
ON public.system_performance_metrics
FOR INSERT
WITH CHECK (true);

-- Criar índices para melhorar performance
CREATE INDEX idx_automated_actions_log_client_id ON public.automated_actions_log(client_id);
CREATE INDEX idx_automated_actions_log_created_at ON public.automated_actions_log(created_at);
CREATE INDEX idx_automated_actions_log_action_type ON public.automated_actions_log(action_type);

CREATE INDEX idx_error_classifications_document_id ON public.error_classifications(document_id);
CREATE INDEX idx_error_classifications_status ON public.error_classifications(status);
CREATE INDEX idx_error_classifications_error_type ON public.error_classifications(error_type);

CREATE INDEX idx_correction_history_error_classification_id ON public.correction_history(error_classification_id);
CREATE INDEX idx_correction_history_corrected_by ON public.correction_history(corrected_by);

CREATE INDEX idx_system_performance_metrics_metric_type ON public.system_performance_metrics(metric_type);
CREATE INDEX idx_system_performance_metrics_period ON public.system_performance_metrics(period_start, period_end);

-- Triggers para atualizar timestamps
CREATE TRIGGER update_automated_actions_log_updated_at
  BEFORE UPDATE ON public.automated_actions_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_error_classifications_updated_at
  BEFORE UPDATE ON public.error_classifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();