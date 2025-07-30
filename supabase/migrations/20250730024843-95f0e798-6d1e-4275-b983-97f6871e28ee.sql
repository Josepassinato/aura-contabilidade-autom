-- ============================================================================
-- OTIMIZAÇÃO E CONSOLIDAÇÃO DE POLÍTICAS RLS PARA TABELAS CRÍTICAS
-- ============================================================================

-- 1. TABELA: system_metrics
-- Remover políticas redundantes e consolidar

DROP POLICY IF EXISTS "Sistema pode gerenciar métricas" ON public.system_metrics;
DROP POLICY IF EXISTS "System can insert metrics" ON public.system_metrics;
DROP POLICY IF EXISTS "System can insert system metrics" ON public.system_metrics;

-- Política consolidada para administradores
CREATE POLICY "Administradores podem gerenciar métricas do sistema"
  ON public.system_metrics
  FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin'::text);

-- Política para sistema inserir métricas (edge functions)
CREATE POLICY "Sistema pode inserir métricas"
  ON public.system_metrics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Política para logs e monitoramento (leitura limitada)
CREATE POLICY "Contadores podem visualizar métricas básicas"
  ON public.system_metrics
  FOR SELECT
  TO authenticated
  USING (
    get_user_role() = ANY(ARRAY['admin'::text, 'accountant'::text])
    AND created_at >= now() - interval '30 days'
  );

-- ============================================================================
-- 2. TABELA: user_invitations  
-- Consolidar políticas de convites

DROP POLICY IF EXISTS "Allow anonymous access to invitations by token" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can view invitations by token" ON public.user_invitations;
DROP POLICY IF EXISTS "Users can accept invitations" ON public.user_invitations;

-- Política consolidada para gerenciamento por admins/contadores
CREATE POLICY "Admins e contadores gerenciam convites"
  ON public.user_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() 
      AND role = ANY(ARRAY['admin'::text, 'accountant'::text])
    )
  );

-- Política para acesso por token (convites específicos)
CREATE POLICY "Acesso a convites por token válido"
  ON public.user_invitations
  FOR SELECT
  TO anon, authenticated
  USING (
    token IS NOT NULL 
    AND expires_at > now()
    AND status = 'pending'
  );

-- Política para aceitar convites
CREATE POLICY "Usuários podem aceitar convites válidos"
  ON public.user_invitations
  FOR UPDATE
  TO anon, authenticated
  USING (
    token IS NOT NULL 
    AND expires_at > now()
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('accepted', 'declined')
  );

-- ============================================================================
-- 3. TABELA: notification_escalation_rules
-- Melhorar controle de acesso

DROP POLICY IF EXISTS "Users can view escalation rules" ON public.notification_escalation_rules;

-- Política melhorada para administradores
CREATE POLICY "Administradores gerenciam regras de escalation"
  ON public.notification_escalation_rules
  FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin'::text);

-- Política para usuários autenticados verem regras ativas
CREATE POLICY "Usuários autenticados veem regras ativas"
  ON public.notification_escalation_rules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================================
-- 4. TABELA: automated_actions_log
-- Consolidar e melhorar políticas de logs

-- Manter política de inserção pelo sistema
-- A política "Sistema pode inserir logs de ações" já está correta

-- Melhorar política para contadores
DROP POLICY IF EXISTS "Contadores podem ver logs de ações" ON public.automated_actions_log;

CREATE POLICY "Contadores veem logs relevantes"
  ON public.automated_actions_log
  FOR SELECT
  TO authenticated
  USING (
    -- Administradores veem tudo
    get_user_role() = 'admin'::text
    OR 
    -- Contadores veem logs de seus clientes
    (
      get_user_role() = 'accountant'::text
      AND (
        client_id IN (
          SELECT id FROM accounting_clients 
          WHERE accountant_id = auth.uid()
        )
        OR client_id IS NULL -- logs do sistema
      )
    )
  );

-- Política melhorada para clientes
DROP POLICY IF EXISTS "Clientes podem ver seus próprios logs" ON public.automated_actions_log;

CREATE POLICY "Clientes veem seus próprios logs"
  ON public.automated_actions_log
  FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'client'::text
    AND client_id::text = (
      SELECT company_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
    AND created_at >= now() - interval '90 days' -- Limitar a 90 dias
  );

-- ============================================================================
-- CRIAÇÃO DE FUNÇÃO AUXILIAR PARA AUDITORIA DE RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_rls_access(
  table_name text,
  operation text,
  user_role text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- ============================================================================
-- TRIGGERS PARA AUDITORIA AUTOMÁTICA DE RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_rls_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log apenas para operações importantes em tabelas críticas
  IF TG_TABLE_NAME IN ('system_metrics', 'user_invitations', 'notification_escalation_rules') THEN
    PERFORM public.audit_rls_access(TG_TABLE_NAME, TG_OP);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers de auditoria
DROP TRIGGER IF EXISTS audit_system_metrics_access ON public.system_metrics;
CREATE TRIGGER audit_system_metrics_access
  AFTER INSERT OR UPDATE OR DELETE ON public.system_metrics
  FOR EACH ROW EXECUTE FUNCTION public.log_rls_access();

DROP TRIGGER IF EXISTS audit_user_invitations_access ON public.user_invitations;
CREATE TRIGGER audit_user_invitations_access
  AFTER INSERT OR UPDATE OR DELETE ON public.user_invitations
  FOR EACH ROW EXECUTE FUNCTION public.log_rls_access();

DROP TRIGGER IF EXISTS audit_notification_escalation_rules_access ON public.notification_escalation_rules;
CREATE TRIGGER audit_notification_escalation_rules_access
  AFTER INSERT OR UPDATE OR DELETE ON public.notification_escalation_rules
  FOR EACH ROW EXECUTE FUNCTION public.log_rls_access();