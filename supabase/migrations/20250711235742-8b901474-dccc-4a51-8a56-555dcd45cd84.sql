-- Criar função para upsert de integrações externas
CREATE OR REPLACE FUNCTION public.upsert_integracao_externa(
  p_client_id UUID,
  p_tipo_integracao TEXT,
  p_credenciais JSONB,
  p_status TEXT DEFAULT 'configurado'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.integracoes_externas (
    client_id,
    tipo_integracao,
    credenciais,
    status,
    updated_at
  )
  VALUES (
    p_client_id,
    p_tipo_integracao,
    p_credenciais,
    p_status,
    now()
  )
  ON CONFLICT (client_id, tipo_integracao)
  DO UPDATE SET
    credenciais = EXCLUDED.credenciais,
    status = EXCLUDED.status,
    updated_at = now();
END;
$$;

-- Adicionar constraint única para client_id + tipo_integracao
ALTER TABLE public.integracoes_externas 
ADD CONSTRAINT integracoes_externas_client_tipo_unique 
UNIQUE (client_id, tipo_integracao);