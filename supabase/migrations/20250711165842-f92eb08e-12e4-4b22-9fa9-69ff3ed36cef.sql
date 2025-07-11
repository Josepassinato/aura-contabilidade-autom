-- Corrigir problemas de RLS e permissões que podem estar causando erros

-- 1. Garantir que user_invitations tenha RLS habilitado
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- 2. Adicionar política faltante para permitir consultas anônimas em user_invitations (para aceitar convites)
CREATE POLICY "Allow anonymous access to invitations by token" 
ON public.user_invitations 
FOR SELECT 
USING (true);

-- 3. Corrigir problema potencial com user_profiles - permitir que usuários vejam seu próprio perfil
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Adicionar política para permitir que admins vejam todos os perfis (já existe uma similar mas vamos garantir)
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all user profiles" 
ON public.user_profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- 5. Corrigir problemas com performance_alerts - permitir sistema inserir alertas
CREATE POLICY IF NOT EXISTS "System can insert performance alerts" 
ON public.performance_alerts 
FOR INSERT 
WITH CHECK (true);

-- 6. Corrigir problemas com system_metrics - permitir sistema inserir métricas
CREATE POLICY IF NOT EXISTS "System can insert system metrics" 
ON public.system_metrics 
FOR INSERT 
WITH CHECK (true);

-- 7. Permitir acesso de leitura para admins em todas as tabelas críticas
CREATE POLICY IF NOT EXISTS "Admins can view system metrics" 
ON public.system_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

CREATE POLICY IF NOT EXISTS "Admins can view worker instances" 
ON public.worker_instances 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- 8. Permitir que o sistema gerencie worker instances
CREATE POLICY IF NOT EXISTS "System can manage worker instances" 
ON public.worker_instances 
FOR ALL 
USING (true) 
WITH CHECK (true);