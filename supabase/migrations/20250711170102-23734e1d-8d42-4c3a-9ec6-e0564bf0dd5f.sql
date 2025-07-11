-- Corrigir problemas de recursão em políticas RLS

-- 1. Criar função segura para verificar role do usuário (evitar recursão)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 2. Recriar políticas usando a função segura para evitar recursão
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all user profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view system metrics" ON public.system_metrics;
CREATE POLICY "Admins can view system metrics" 
ON public.system_metrics 
FOR SELECT 
USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view worker instances" ON public.worker_instances;
CREATE POLICY "Admins can view worker instances" 
ON public.worker_instances 
FOR SELECT 
USING (public.get_user_role() = 'admin');

-- 3. Corrigir problemas com tabelas que não têm políticas apropriadas
-- Habilitar RLS em tabelas que podem estar sem
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_instances ENABLE ROW LEVEL SECURITY;

-- 4. Adicionar política para user_profiles permitir inserção própria
CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Corrigir acesso a archived_data para admins
CREATE POLICY "Admins can view archived data" 
ON public.archived_data 
FOR SELECT 
USING (public.get_user_role() = 'admin');

-- 6. Permitir sistema acessar archived_data
CREATE POLICY "System can manage archived data" 
ON public.archived_data 
FOR ALL 
USING (true) 
WITH CHECK (true);