-- Criar tabela para templates de relatórios
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'balancete', 'dre', 'obrigacoes', 'resumo_fiscal'
  template_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Política para contadores gerenciarem templates
CREATE POLICY "Contadores podem gerenciar templates" 
ON public.report_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

-- Atualizar tabela de relatórios gerados para incluir mais metadados
ALTER TABLE public.generated_reports 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.report_templates(id),
ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_generated_reports_status ON public.generated_reports(generation_status);
CREATE INDEX IF NOT EXISTS idx_generated_reports_expires ON public.generated_reports(expires_at);
CREATE INDEX IF NOT EXISTS idx_generated_reports_client ON public.generated_reports(client_id);

-- Função para limpeza de relatórios expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_reports()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cleaned_count INTEGER := 0;
BEGIN
  -- Marcar relatórios expirados como inativos
  UPDATE public.generated_reports
  SET is_public = false
  WHERE expires_at < now()
  AND is_public = true;

  GET DIAGNOSTICS v_cleaned_count = ROW_COUNT;

  RETURN v_cleaned_count;
END;
$$;

-- Inserir templates padrão
INSERT INTO public.report_templates (name, description, template_type, template_config) VALUES
('Balancete Mensal', 'Relatório de balancete patrimonial mensal', 'balancete', '{
  "include_opening_balance": true,
  "include_period_movements": true,
  "include_closing_balance": true,
  "group_by_account_type": true
}'),
('DRE Simplificada', 'Demonstração do Resultado do Exercício', 'dre', '{
  "include_cost_breakdown": true,
  "include_percentages": true,
  "comparison_periods": 2
}'),
('Resumo de Obrigações', 'Lista de obrigações fiscais por período', 'obrigacoes', '{
  "include_completed": false,
  "include_pending": true,
  "include_overdue": true,
  "sort_by": "due_date"
}'),
('Resumo Fiscal Mensal', 'Resumo completo da situação fiscal', 'resumo_fiscal', '{
  "include_taxes_due": true,
  "include_obligations": true,
  "include_compliance_status": true,
  "include_next_steps": true
}');