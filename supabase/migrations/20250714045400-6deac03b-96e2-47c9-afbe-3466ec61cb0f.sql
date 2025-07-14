-- Criar tabela automation_rules
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'workflow',
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  enabled BOOLEAN NOT NULL DEFAULT true,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  client_id UUID
);

-- Enable Row Level Security
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for automation rules
CREATE POLICY "Accountants and admins can manage automation rules" 
ON public.automation_rules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_automation_rules_updated_at
BEFORE UPDATE ON public.automation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_automation_rules_updated_at();

-- Add some initial automation rules
INSERT INTO public.automation_rules (name, description, type, trigger_type, trigger_conditions, actions) VALUES
('Processamento Automático de NFe', 'Processa automaticamente notas fiscais eletrônicas recebidas', 'document_processing', 'document_received', '{"document_type": "nfe", "client_status": "active"}', '[{"type": "extract_data", "config": {"fields": ["value", "date", "supplier"]}}, {"type": "validate_data"}, {"type": "create_accounting_entry"}]'),
('Conciliação Bancária Diária', 'Executa conciliação bancária automaticamente todos os dias', 'reconciliation', 'scheduled', '{"schedule": "0 8 * * *", "account_types": ["checking", "savings"]}', '[{"type": "fetch_bank_statements"}, {"type": "match_transactions"}, {"type": "generate_report"}]'),
('Alerta de Vencimento', 'Envia alertas de documentos próximos ao vencimento', 'notification', 'scheduled', '{"schedule": "0 9 * * *", "days_before": 5}', '[{"type": "check_due_dates"}, {"type": "send_notification", "config": {"channels": ["email", "system"]}}]'),
('Backup de Documentos', 'Cria backup automático de documentos importantes', 'maintenance', 'scheduled', '{"schedule": "0 2 * * 0"}', '[{"type": "export_documents"}, {"type": "upload_to_storage"}, {"type": "verify_backup"}]');