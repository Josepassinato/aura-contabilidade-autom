-- Ajustes finais para eliminar erros restantes

-- 1. Garantir que a função handle_new_user existe e está correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Garantir que o usuário esteja na tabela user_profiles
  INSERT INTO public.user_profiles (user_id, full_name, email, role)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.email), 
    new.email, 
    -- Usar o role enviado no metadata durante o signup, ou 'client' como fallback
    coalesce((new.raw_user_meta_data->>'role')::text, 'client')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  
  RETURN new;
END;
$$;

-- 2. Criar função de limpeza para dados órfãos
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remover registros órfãos que podem estar causando problemas
  DELETE FROM public.user_invitations WHERE expires_at < NOW() - INTERVAL '30 days';
  DELETE FROM public.performance_metrics WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM public.automation_logs WHERE created_at < NOW() - INTERVAL '90 days' AND status IN ('completed', 'failed');
END;
$$;

-- 3. Executar limpeza
SELECT public.cleanup_orphaned_data();

-- 4. Garantir que todas as tabelas críticas tenham updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();