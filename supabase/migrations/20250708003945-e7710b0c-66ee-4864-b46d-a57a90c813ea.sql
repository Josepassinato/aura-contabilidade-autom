-- Criar bucket de armazenamento para relatórios
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

-- Criar políticas para o bucket de relatórios
CREATE POLICY "Authenticated users can view reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reports' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reports" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'reports' AND auth.role() = 'authenticated');

-- Criar tabela para dados contábeis processados
CREATE TABLE public.processed_accounting_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES accounting_clients(id),
  period TEXT NOT NULL,
  revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
  expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_income DECIMAL(15,2) NOT NULL DEFAULT 0,
  taxable_income DECIMAL(15,2) NOT NULL DEFAULT 0,
  calculated_taxes JSONB NOT NULL DEFAULT '{}',
  processed_documents JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.processed_accounting_data ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view processed data" 
ON public.processed_accounting_data 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert processed data" 
ON public.processed_accounting_data 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update processed data" 
ON public.processed_accounting_data 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Criar índices para performance
CREATE INDEX idx_processed_accounting_data_client_period ON public.processed_accounting_data(client_id, period);
CREATE INDEX idx_processed_accounting_data_created_at ON public.processed_accounting_data(created_at);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_processed_accounting_data_updated_at
  BEFORE UPDATE ON public.processed_accounting_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();