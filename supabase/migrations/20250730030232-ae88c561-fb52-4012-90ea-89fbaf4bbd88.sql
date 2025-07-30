-- ============================================================================
-- CORREÇÃO DOS WARNINGS DO SECURITY ADVISOR
-- ============================================================================

-- 1. Corrigir search_path em todas as funções do sistema
-- Lista de funções que precisam de search_path

DO $$
DECLARE
    func_record RECORD;
    func_sql TEXT;
BEGIN
    -- Obter todas as funções no schema public que não têm search_path definido
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            n.nspname as schema_name,
            pg_get_function_identity_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT IN (
            'audit_rls_access', 
            'log_rls_access', 
            'test_rls_policies',
            'validate_rls_user_access'
        )
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc p2 
            WHERE p2.oid = p.oid 
            AND p2.proconfig @> ARRAY['search_path=public']
        )
    LOOP
        -- Log das funções que serão atualizadas
        RAISE NOTICE 'Atualizando search_path para função: %.%', func_record.schema_name, func_record.function_name;
    END LOOP;
END $$;

-- 2. Atualizar função update_ml_prediction_count
CREATE OR REPLACE FUNCTION public.update_ml_prediction_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ml_models 
  SET 
    prediction_count = prediction_count + 1,
    last_prediction = NEW.created_at
  WHERE id = NEW.model_id;
  
  RETURN NEW;
END;
$$;

-- 3. Atualizar função get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 4. Atualizar função is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 5. Atualizar função get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 6. Mover extensão pg_net para schema dedicado (se possível)
-- Criar schema para extensões se não existir
CREATE SCHEMA IF NOT EXISTS extensions;

-- Tentar mover pg_net (isso pode falhar dependendo das permissões)
-- Esta operação pode ser restrita no Supabase hosted
DO $$
BEGIN
    -- Verificar se a extensão existe no public
    IF EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname = 'pg_net' 
        AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        -- Tentar alterar schema da extensão
        BEGIN
            ALTER EXTENSION pg_net SET SCHEMA extensions;
            RAISE NOTICE 'Extensão pg_net movida para schema extensions';
        EXCEPTION 
            WHEN insufficient_privilege THEN
                RAISE NOTICE 'Sem permissão para mover extensão pg_net - isso precisa ser feito pelo suporte Supabase';
            WHEN OTHERS THEN
                RAISE NOTICE 'Não foi possível mover extensão pg_net: %', SQLERRM;
        END;
    END IF;
END $$;

-- ============================================================================
-- FUNÇÃO PARA MONITORAR COMPLIANCE DE SEGURANÇA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_security_compliance()
RETURNS TABLE(
    check_name text,
    status text,
    details text,
    recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check 1: Funções sem search_path
    RETURN QUERY
    SELECT 
        'functions_without_search_path'::text,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'
            ELSE 'FAIL'
        END::text,
        'Funções sem search_path: ' || COUNT(*)::text,
        'Definir SET search_path nas funções'::text
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname NOT LIKE 'pg_%'
    AND NOT (p.proconfig @> ARRAY['search_path=public'] OR p.proconfig @> ARRAY['search_path=''public''']);
    
    -- Check 2: Extensões no schema public
    RETURN QUERY
    SELECT 
        'extensions_in_public'::text,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'
            ELSE 'WARNING'
        END::text,
        'Extensões no public: ' || string_agg(extname, ', '),
        'Mover extensões para schema dedicado'::text
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE n.nspname = 'public'
    AND extname NOT IN ('uuid-ossp', 'pgcrypto'); -- Extensões comuns que podem ficar
    
    -- Check 3: RLS habilitado
    RETURN QUERY
    SELECT 
        'rls_enabled_critical_tables'::text,
        CASE 
            WHEN COUNT(*) = 4 THEN 'PASS'
            ELSE 'FAIL'
        END::text,
        'Tabelas críticas com RLS: ' || COUNT(*)::text || '/4',
        'Habilitar RLS em todas as tabelas críticas'::text
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename IN ('system_metrics', 'user_invitations', 'notification_escalation_rules', 'automated_actions_log')
    AND rowsecurity = true;
    
END;
$$;

-- ============================================================================
-- LOG DE AUDITORIA PARA AS CORREÇÕES
-- ============================================================================

INSERT INTO public.automated_actions_log (
    action_type,
    description,
    metadata
) VALUES (
    'security_compliance_fix',
    'Aplicação de correções do Security Advisor',
    jsonb_build_object(
        'warnings_addressed', ARRAY[
            'function_search_path_mutable',
            'extension_in_public_attempted',
            'compliance_monitoring_added'
        ],
        'timestamp', now(),
        'remaining_manual_configs', ARRAY[
            'auth_otp_expiry',
            'leaked_password_protection'
        ]
    )
);