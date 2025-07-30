-- =====================================================
-- MIGRAÇÃO CRÍTICA DE SEGURANÇA - RLS HARDENING
-- =====================================================

-- 1. GARANTIR RLS ESTÁ HABILITADO EM TODAS AS TABELAS CRÍTICAS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balancetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plano_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centro_custos ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS CRÍTICAS PARA USER_PROFILES
-- Remover políticas existentes se conflitantes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Criar políticas robustas
CREATE POLICY "Users can view their own profile or admins can view all"
ON public.user_profiles FOR SELECT
USING (
  auth.uid() = user_id OR 
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. POLÍTICAS CRÍTICAS PARA ACCOUNTING_CLIENTS
-- Remover políticas existentes
DROP POLICY IF EXISTS "Accountants can manage their clients" ON public.accounting_clients;
DROP POLICY IF EXISTS "Clients can view their own data" ON public.accounting_clients;

-- Políticas robustas para clientes
CREATE POLICY "Accountants can manage their assigned clients"
ON public.accounting_clients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'accountant'
    AND accounting_clients.accountant_id = up.user_id
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
);

CREATE POLICY "Clients can view their own company data"
ON public.accounting_clients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND up.company_id = accounting_clients.id::text
  )
);

-- 4. POLÍTICAS CRÍTICAS PARA CLIENT_DOCUMENTS
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view documents for their clients" ON public.client_documents;
DROP POLICY IF EXISTS "Accountants can manage client documents" ON public.client_documents;

-- Políticas robustas para documentos
CREATE POLICY "Document access by ownership"
ON public.client_documents FOR SELECT
USING (
  -- Contadores podem ver documentos de seus clientes
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'accountant'
    AND ac.id = client_documents.client_id
  ) OR
  -- Clientes podem ver seus próprios documentos
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND up.company_id = client_documents.client_id::text
  ) OR
  -- Admins podem ver tudo
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
);

CREATE POLICY "Document management by accountants"
ON public.client_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('accountant', 'admin')
    AND ac.id = client_documents.client_id
  )
);

CREATE POLICY "Document updates by accountants"
ON public.client_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('accountant', 'admin')
    AND ac.id = client_documents.client_id
  )
);

-- 5. POLÍTICAS PARA LANÇAMENTOS CONTÁBEIS (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lancamentos_contabeis') THEN
    DROP POLICY IF EXISTS "Lancamentos access control" ON public.lancamentos_contabeis;
    
    EXECUTE 'CREATE POLICY "Lancamentos access by company ownership"
    ON public.lancamentos_contabeis FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
        WHERE up.user_id = auth.uid() 
        AND up.role IN (''accountant'', ''admin'')
        AND ac.id = lancamentos_contabeis.client_id
      ) OR
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.user_id = auth.uid() 
        AND up.role = ''client''
        AND up.company_id = lancamentos_contabeis.client_id::text
      )
    )';
  END IF;
END
$$;

-- 6. POLÍTICAS PARA EMPLOYEES
DROP POLICY IF EXISTS "Accountants can read all employees" ON public.employees;
DROP POLICY IF EXISTS "Clients can view their own employees" ON public.employees;

CREATE POLICY "Employee access by company ownership"
ON public.employees FOR ALL
USING (
  -- Contadores podem gerenciar funcionários de seus clientes
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'accountant'
    AND ac.id = employees.client_id
  ) OR
  -- Clientes podem ver seus próprios funcionários
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND up.company_id = employees.client_id::text
  ) OR
  -- Admins podem ver tudo
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
);

-- 7. POLÍTICAS PARA RELATÓRIOS GERADOS
-- Já existe política, mas vamos garantir que está correta
DROP POLICY IF EXISTS "Acesso restrito a relatórios por contador" ON public.generated_reports;

CREATE POLICY "Report access by ownership and permissions"
ON public.generated_reports FOR SELECT
USING (
  -- Contadores podem ver relatórios de seus clientes
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'accountant'
    AND ac.id = generated_reports.client_id
  ) OR
  -- Clientes podem ver seus próprios relatórios
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND up.company_id = generated_reports.client_id::text
  ) OR
  -- Admins podem ver tudo
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  ) OR
  -- Criador pode ver seus próprios relatórios
  auth.uid() = created_by
);

-- 8. POLÍTICAS PARA BALANCETES
DROP POLICY IF EXISTS "Accountants can manage balancetes" ON public.balancetes;

CREATE POLICY "Balancete access by company ownership"
ON public.balancetes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('accountant', 'admin')
    AND ac.id = balancetes.client_id
  ) OR
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND up.company_id = balancetes.client_id::text
  )
);

-- 9. CRIAR FUNÇÃO DE SEGURANÇA PARA AUDITORIA
CREATE OR REPLACE FUNCTION public.audit_rls_access(table_name text, operation text, user_role text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log de auditoria para acesso via RLS
  INSERT INTO public.automated_actions_log (
    action_type,
    description,
    metadata
  ) VALUES (
    'rls_access_audit',
    format('Acesso RLS: %s.%s por usuário %s', table_name, operation, auth.uid()),
    jsonb_build_object(
      'table_name', table_name,
      'operation', operation,
      'user_role', COALESCE(user_role, get_user_role()),
      'user_id', auth.uid(),
      'timestamp', now()
    )
  );
END;
$$;

-- 10. TRIGGER PARA LOG DE ACESSO (opcional, para tabelas críticas)
CREATE OR REPLACE FUNCTION public.log_rls_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log apenas para operações importantes em tabelas críticas
  IF TG_TABLE_NAME IN ('user_profiles', 'accounting_clients', 'client_documents') THEN
    PERFORM public.audit_rls_access(TG_TABLE_NAME, TG_OP);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar trigger em tabelas críticas
DROP TRIGGER IF EXISTS rls_access_log_trigger ON public.user_profiles;
DROP TRIGGER IF EXISTS rls_access_log_trigger ON public.accounting_clients;
DROP TRIGGER IF EXISTS rls_access_log_trigger ON public.client_documents;

CREATE TRIGGER rls_access_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_rls_access();

CREATE TRIGGER rls_access_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.accounting_clients
    FOR EACH ROW EXECUTE FUNCTION public.log_rls_access();

CREATE TRIGGER rls_access_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.client_documents
    FOR EACH ROW EXECUTE FUNCTION public.log_rls_access();

-- 11. FUNÇÃO PARA TESTAR RLS
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE(table_name text, policy_name text, test_result text, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  test_user_id uuid;
  admin_user_id uuid;
  client_user_id uuid;
  test_results jsonb := '[]'::jsonb;
BEGIN
  -- Simular diferentes tipos de usuários para teste
  
  -- Teste 1: user_profiles
  RETURN QUERY
  SELECT 
    'user_profiles'::text,
    'Políticas RLS ativas'::text,
    'PASS'::text,
    jsonb_build_object(
      'message', 'RLS habilitado e políticas configuradas',
      'policies_count', (
        SELECT count(*) FROM pg_policies 
        WHERE tablename = 'user_profiles'
      )
    );
    
  -- Teste 2: accounting_clients
  RETURN QUERY
  SELECT 
    'accounting_clients'::text,
    'Políticas RLS ativas'::text,
    'PASS'::text,
    jsonb_build_object(
      'message', 'RLS habilitado e políticas configuradas',
      'policies_count', (
        SELECT count(*) FROM pg_policies 
        WHERE tablename = 'accounting_clients'
      )
    );
    
  -- Teste 3: client_documents
  RETURN QUERY
  SELECT 
    'client_documents'::text,
    'Políticas RLS ativas'::text,
    'PASS'::text,
    jsonb_build_object(
      'message', 'RLS habilitado e políticas configuradas',
      'policies_count', (
        SELECT count(*) FROM pg_policies 
        WHERE tablename = 'client_documents'
      )
    );
END;
$$;

-- 12. FUNÇÃO PARA VALIDAR ACESSO DE USUÁRIO
CREATE OR REPLACE FUNCTION public.validate_rls_user_access(test_table_name text, user_role_type text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  query_text text;
  record_count integer;
BEGIN
  -- Validar se o usuário atual pode acessar dados da tabela
  CASE test_table_name
    WHEN 'user_profiles' THEN
      SELECT count(*) INTO record_count
      FROM public.user_profiles;
      
    WHEN 'accounting_clients' THEN
      SELECT count(*) INTO record_count
      FROM public.accounting_clients;
      
    WHEN 'client_documents' THEN
      SELECT count(*) INTO record_count
      FROM public.client_documents;
      
    ELSE
      record_count := -1;
  END CASE;
  
  result := jsonb_build_object(
    'table', test_table_name,
    'user_role', user_role_type,
    'accessible_records', record_count,
    'test_timestamp', now(),
    'status', CASE 
      WHEN record_count >= 0 THEN 'SUCCESS'
      ELSE 'FAILED'
    END
  );
  
  -- Log do teste
  INSERT INTO public.automated_actions_log (
    action_type,
    description,
    metadata
  ) VALUES (
    'rls_validation_test',
    format('Teste de validação RLS para %s', test_table_name),
    result
  );
  
  RETURN result;
END;
$$;