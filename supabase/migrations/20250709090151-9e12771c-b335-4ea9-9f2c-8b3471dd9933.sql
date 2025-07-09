-- Criar tabela para controle de fechamento mensal
CREATE TABLE public.monthly_closing_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.accounting_clients(id) NOT NULL,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'review', 'completed', 'blocked'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Progresso detalhado
  documents_processed INTEGER DEFAULT 0,
  documents_total INTEGER DEFAULT 0,
  validations_passed INTEGER DEFAULT 0,
  validations_total INTEGER DEFAULT 5, -- DRE, Balancete, Conciliação, etc.
  
  -- Informações de bloqueio/problemas
  blocking_issues JSONB DEFAULT '[]',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Métricas de qualidade
  confidence_score DECIMAL(3,2) DEFAULT 0.95,
  manual_adjustments_count INTEGER DEFAULT 0,
  
  UNIQUE(client_id, period_month, period_year)
);

-- Criar tabela para checklist de fechamento
CREATE TABLE public.closing_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  closing_id UUID REFERENCES public.monthly_closing_status(id) NOT NULL,
  item_type TEXT NOT NULL, -- 'document_validation', 'reconciliation', 'report_generation', 'compliance_check'
  item_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'skipped'
  priority INTEGER DEFAULT 1, -- 1 = alta, 2 = média, 3 = baixa
  estimated_minutes INTEGER DEFAULT 5,
  actual_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.monthly_closing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closing_checklist_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para monthly_closing_status
CREATE POLICY "Contadores podem gerenciar fechamentos"
ON public.monthly_closing_status
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('accountant', 'admin')
  )
);

-- Políticas RLS para closing_checklist_items
CREATE POLICY "Contadores podem gerenciar checklist"
ON public.closing_checklist_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('accountant', 'admin')
  )
);

-- Índices para performance
CREATE INDEX idx_monthly_closing_status_period ON public.monthly_closing_status(period_year, period_month);
CREATE INDEX idx_monthly_closing_status_client ON public.monthly_closing_status(client_id);
CREATE INDEX idx_monthly_closing_status_status ON public.monthly_closing_status(status);
CREATE INDEX idx_closing_checklist_closing_id ON public.closing_checklist_items(closing_id);

-- Trigger para atualizar timestamps
CREATE TRIGGER update_monthly_closing_status_updated_at
  BEFORE UPDATE ON public.monthly_closing_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular progresso automaticamente
CREATE OR REPLACE FUNCTION public.update_closing_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores baseado nos itens do checklist
  UPDATE public.monthly_closing_status
  SET 
    validations_passed = (
      SELECT COUNT(*) 
      FROM public.closing_checklist_items 
      WHERE closing_id = NEW.closing_id 
      AND status = 'completed'
    ),
    validations_total = (
      SELECT COUNT(*) 
      FROM public.closing_checklist_items 
      WHERE closing_id = NEW.closing_id
    ),
    last_activity = now(),
    status = CASE 
      WHEN (SELECT COUNT(*) FROM public.closing_checklist_items WHERE closing_id = NEW.closing_id AND status = 'failed') > 0 THEN 'blocked'
      WHEN (SELECT COUNT(*) FROM public.closing_checklist_items WHERE closing_id = NEW.closing_id AND status = 'completed') = 
           (SELECT COUNT(*) FROM public.closing_checklist_items WHERE closing_id = NEW.closing_id) THEN 'completed'
      WHEN (SELECT COUNT(*) FROM public.closing_checklist_items WHERE closing_id = NEW.closing_id AND status IN ('in_progress', 'completed')) > 0 THEN 'in_progress'
      ELSE 'pending'
    END
  WHERE id = NEW.closing_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar progresso automaticamente
CREATE TRIGGER update_closing_progress_trigger
  AFTER INSERT OR UPDATE ON public.closing_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_closing_progress();