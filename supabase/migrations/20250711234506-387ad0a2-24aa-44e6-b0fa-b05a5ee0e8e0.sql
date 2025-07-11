-- Criar tabela para integrações externas
CREATE TABLE public.integracoes_externas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  tipo_integracao TEXT NOT NULL,
  credenciais JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'configurado',
  ultima_sincronizacao TIMESTAMP WITH TIME ZONE,
  proxima_sincronizacao TIMESTAMP WITH TIME ZONE,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.integracoes_externas ENABLE ROW LEVEL SECURITY;

-- Criar política para contadores gerenciarem integrações de seus clientes
CREATE POLICY "Contadores podem gerenciar integrações de seus clientes"
ON public.integracoes_externas
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid()
    AND up.role IN ('accountant', 'admin')
    AND ac.id = integracoes_externas.client_id
  )
);

-- Criar tabela para logs de sincronização
CREATE TABLE public.logs_sincronizacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integracao_id UUID NOT NULL REFERENCES public.integracoes_externas(id) ON DELETE CASCADE,
  tipo_operacao TEXT NOT NULL, -- 'produtos', 'clientes', 'pedidos', 'completa'
  status TEXT NOT NULL DEFAULT 'em_progresso', -- 'em_progresso', 'sucesso', 'erro'
  registros_processados INTEGER DEFAULT 0,
  registros_total INTEGER DEFAULT 0,
  erro_detalhes JSONB,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para logs
ALTER TABLE public.logs_sincronizacao ENABLE ROW LEVEL SECURITY;

-- Política para logs de sincronização
CREATE POLICY "Contadores podem ver logs de sincronização"
ON public.logs_sincronizacao
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN accounting_clients ac ON ac.accountant_id = up.user_id
    JOIN public.integracoes_externas ie ON ie.client_id = ac.id
    WHERE up.user_id = auth.uid()
    AND up.role IN ('accountant', 'admin')
    AND ie.id = logs_sincronizacao.integracao_id
  )
);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_integracoes_externas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER update_integracoes_externas_updated_at
  BEFORE UPDATE ON public.integracoes_externas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integracoes_externas_updated_at();