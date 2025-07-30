-- Corrigir recursão infinita em user_profiles
-- Remover políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "Accountants can view all profiles" ON public.user_profiles;

-- Criar política mais segura que evita recursão usando função SECURITY DEFINER
CREATE POLICY "Accountants can view profiles safely" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = auth.uid() 
    AND au.raw_user_meta_data->>'role' = 'accountant'
  )
);

-- Melhorar política para automated_actions_log com melhor controle de acesso
DROP POLICY IF EXISTS "Users can view logs related to their clients" ON public.automated_actions_log;

CREATE POLICY "Contadores podem ver logs de seus clientes" 
ON public.automated_actions_log 
FOR SELECT 
USING (
  client_id IN (
    SELECT id FROM public.accounting_clients 
    WHERE accountant_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = 'admin'
  )
);

-- Adicionar política específica para clientes verem seus próprios logs
CREATE POLICY "Clientes podem ver seus próprios logs" 
ON public.automated_actions_log 
FOR SELECT 
USING (
  client_id::text = (
    SELECT company_id FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client'
  )
);