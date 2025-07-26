-- Criar tabela para gerenciar modelos de ML
CREATE TABLE IF NOT EXISTS public.ml_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  model_id TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('document_classification', 'expense_prediction', 'anomaly_detection', 'tax_optimization', 'custom_model')),
  model_data JSONB NOT NULL DEFAULT '{}',
  performance_metrics JSONB NOT NULL DEFAULT '{}',
  training_data_size INTEGER DEFAULT 0,
  feature_importance JSONB DEFAULT '{}',
  hyperparameters JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'trained', 'deployed', 'deprecated', 'failed')),
  version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_prediction TIMESTAMP WITH TIME ZONE,
  prediction_count INTEGER DEFAULT 0,
  UNIQUE(client_id, model_id)
);

-- Criar tabela para histórico de predições
CREATE TABLE IF NOT EXISTS public.ml_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.ml_models(id),
  client_id UUID NOT NULL,
  input_data JSONB NOT NULL,
  prediction_result JSONB NOT NULL,
  confidence_score NUMERIC(3,2) NOT NULL,
  processing_time_ms INTEGER,
  feedback TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para métricas de performance ML
CREATE TABLE IF NOT EXISTS public.ml_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.ml_models(id),
  client_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_metadata JSONB DEFAULT '{}',
  measurement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Contadores podem gerenciar modelos ML" 
ON public.ml_models 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

CREATE POLICY "Contadores podem ver predições" 
ON public.ml_predictions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

CREATE POLICY "Sistema pode inserir predições" 
ON public.ml_predictions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Contadores podem ver métricas ML" 
ON public.ml_performance_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

CREATE POLICY "Sistema pode inserir métricas ML" 
ON public.ml_performance_metrics 
FOR INSERT 
WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_ml_models_updated_at
  BEFORE UPDATE ON public.ml_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_ml_models_client_type ON public.ml_models(client_id, model_type);
CREATE INDEX idx_ml_models_status ON public.ml_models(status);
CREATE INDEX idx_ml_predictions_model_id ON public.ml_predictions(model_id);
CREATE INDEX idx_ml_predictions_client_id ON public.ml_predictions(client_id);
CREATE INDEX idx_ml_predictions_created_at ON public.ml_predictions(created_at);
CREATE INDEX idx_ml_performance_metrics_model_id ON public.ml_performance_metrics(model_id);

-- Função para atualizar contadores de predição
CREATE OR REPLACE FUNCTION public.update_ml_prediction_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ml_models 
  SET 
    prediction_count = prediction_count + 1,
    last_prediction = NEW.created_at
  WHERE id = NEW.model_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contadores
CREATE TRIGGER trigger_update_ml_prediction_count
  AFTER INSERT ON public.ml_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ml_prediction_count();