-- Criar tabela para agendamento de relatórios
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.accounting_clients(id),
  template_id UUID NOT NULL REFERENCES public.report_templates(id),
  schedule_cron TEXT NOT NULL,
  email_recipients TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Política para contadores gerenciarem agendamentos
CREATE POLICY "Contadores podem gerenciar agendamentos" 
ON public.scheduled_reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_client ON public.scheduled_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_template ON public.scheduled_reports(template_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON public.scheduled_reports(next_run) WHERE is_active = true;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_scheduled_reports_updated_at
BEFORE UPDATE ON public.scheduled_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();