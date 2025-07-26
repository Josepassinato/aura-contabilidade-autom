-- Criar tabela para gerenciar certificados digitais
CREATE TABLE public.certificados_digitais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  tipo_certificado TEXT NOT NULL CHECK (tipo_certificado IN ('A1', 'A3')),
  nome_certificado TEXT NOT NULL,
  numero_serie TEXT NOT NULL,
  emissor TEXT NOT NULL,
  titular_nome TEXT NOT NULL,
  titular_cnpj TEXT NOT NULL,
  data_validade TIMESTAMP WITH TIME ZONE NOT NULL,
  arquivo_certificado TEXT, -- Para A1 (base64)
  senha_certificado TEXT, -- Criptografada
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'expirado', 'revogado', 'inativo')),
  uso_esocial BOOLEAN DEFAULT false,
  uso_efd BOOLEAN DEFAULT false,
  uso_sped BOOLEAN DEFAULT false,
  uso_nfe BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para integrações governamentais específicas
CREATE TABLE public.integracoes_gov (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  certificado_id UUID REFERENCES public.certificados_digitais(id),
  tipo_integracao TEXT NOT NULL CHECK (tipo_integracao IN ('esocial', 'efd_contribuicoes', 'sped_fiscal', 'nfe', 'nfce')),
  ambiente TEXT NOT NULL DEFAULT 'homologacao' CHECK (ambiente IN ('producao', 'homologacao')),
  status_conexao TEXT NOT NULL DEFAULT 'desconectado' CHECK (status_conexao IN ('conectado', 'desconectado', 'erro', 'manutencao')),
  ultima_conexao TIMESTAMP WITH TIME ZONE,
  proximo_envio TIMESTAMP WITH TIME ZONE,
  configuracoes JSONB DEFAULT '{}',
  estatisticas JSONB DEFAULT '{}',
  logs_erro JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, tipo_integracao)
);

-- Criar tabela para transmissões governamentais
CREATE TABLE public.transmissoes_gov (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integracao_id UUID NOT NULL REFERENCES public.integracoes_gov(id),
  client_id UUID NOT NULL,
  tipo_transmissao TEXT NOT NULL,
  numero_recibo TEXT,
  protocolo_envio TEXT,
  competencia TEXT NOT NULL, -- YYYY-MM
  arquivo_enviado JSONB,
  resposta_governo JSONB,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'processado', 'rejeitado', 'aceito')),
  data_envio TIMESTAMP WITH TIME ZONE,
  data_processamento TIMESTAMP WITH TIME ZONE,
  erros JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.certificados_digitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integracoes_gov ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmissoes_gov ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Contadores podem gerenciar certificados" 
ON public.certificados_digitais 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

CREATE POLICY "Contadores podem gerenciar integrações gov" 
ON public.integracoes_gov 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

CREATE POLICY "Contadores podem ver transmissões" 
ON public.transmissoes_gov 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('accountant', 'admin')
));

CREATE POLICY "Sistema pode inserir transmissões" 
ON public.transmissoes_gov 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar transmissões" 
ON public.transmissoes_gov 
FOR UPDATE 
USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_certificados_digitais_updated_at
  BEFORE UPDATE ON public.certificados_digitais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integracoes_gov_updated_at
  BEFORE UPDATE ON public.integracoes_gov
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transmissoes_gov_updated_at
  BEFORE UPDATE ON public.transmissoes_gov
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_certificados_digitais_client_id ON public.certificados_digitais(client_id);
CREATE INDEX idx_certificados_digitais_validade ON public.certificados_digitais(data_validade);
CREATE INDEX idx_integracoes_gov_client_tipo ON public.integracoes_gov(client_id, tipo_integracao);
CREATE INDEX idx_transmissoes_gov_competencia ON public.transmissoes_gov(competencia);
CREATE INDEX idx_transmissoes_gov_status ON public.transmissoes_gov(status);