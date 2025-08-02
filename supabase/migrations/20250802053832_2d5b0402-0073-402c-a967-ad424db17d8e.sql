-- Primeiro, vamos diagnosticar e corrigir o problema de recursão infinita na tabela user_profiles
-- O problema está na política que referencia a própria tabela user_profiles

-- Remover políticas problemáticas da tabela user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Criar função segura para obter o role do usuário (sem recursão)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Recriar políticas sem recursão
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Corrigir problema na tabela accounting_clients que está causando erro de RLS
-- Verificar se existe a política correta
DROP POLICY IF EXISTS "Contadores podem gerenciar clientes" ON public.accounting_clients;
DROP POLICY IF EXISTS "Clientes podem ver próprios dados" ON public.accounting_clients;

-- Recriar políticas para accounting_clients
CREATE POLICY "Contadores podem gerenciar clientes" 
ON public.accounting_clients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Clientes podem ver próprios dados" 
ON public.accounting_clients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = accounting_clients.id::text
  )
);

-- Adicionar política para inserção de clientes
CREATE POLICY "Contadores podem criar clientes" 
ON public.accounting_clients 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Corrigir tabela client_documents se necessário
DROP POLICY IF EXISTS "Contadores podem gerenciar documentos" ON public.client_documents;
DROP POLICY IF EXISTS "Clientes podem ver próprios documentos" ON public.client_documents;

CREATE POLICY "Contadores podem gerenciar documentos" 
ON public.client_documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Clientes podem ver próprios documentos" 
ON public.client_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON up.company_id = ac.id::text
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND ac.id = client_documents.client_id
  )
);