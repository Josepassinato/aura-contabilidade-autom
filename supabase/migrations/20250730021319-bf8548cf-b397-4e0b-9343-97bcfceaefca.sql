-- Ativar RLS nas tabelas críticas
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_actions_log ENABLE ROW LEVEL SECURITY;

-- Política para system_metrics - apenas admins podem ver métricas do sistema
CREATE POLICY "Admins can view system metrics" 
ON public.system_metrics 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "System can insert metrics" 
ON public.system_metrics 
FOR INSERT 
WITH CHECK (true);

-- Política para user_invitations - admins e contadores podem gerenciar convites
CREATE POLICY "Admins and accountants can manage invitations" 
ON public.user_invitations 
FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'accountant'));

CREATE POLICY "Users can view their own invitations" 
ON public.user_invitations 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Política para notification_escalation_rules - apenas admins podem configurar
CREATE POLICY "Admins can manage escalation rules" 
ON public.notification_escalation_rules 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Política para automated_actions_log - admins podem ver tudo, outros podem ver seus dados
CREATE POLICY "Admins can view all action logs" 
ON public.automated_actions_log 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "System can insert action logs" 
ON public.automated_actions_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view logs related to their clients" 
ON public.automated_actions_log 
FOR SELECT 
USING (
  client_id IN (
    SELECT id FROM public.accounting_clients 
    WHERE accountant_id = auth.uid()
    OR id::text = (
      SELECT company_id FROM public.user_profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Corrigir política recursiva em user_profiles (baseado no erro dos logs)
-- Primeiro, vamos dropar políticas problemáticas se existirem
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;

-- Criar política correta para user_profiles evitando recursão
CREATE POLICY "Users can view and update own profile" 
ON public.user_profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.user_profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Adicionar política para admins verem todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.raw_user_meta_data->>'role' = 'admin'
  )
);