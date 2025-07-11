-- Fase 1: Reestruturação do Banco de Dados
-- Adicionar coluna accountant_id à tabela accounting_clients
ALTER TABLE public.accounting_clients 
ADD COLUMN accountant_id UUID REFERENCES public.user_profiles(user_id);

-- Criar índice para melhor performance
CREATE INDEX idx_accounting_clients_accountant_id ON public.accounting_clients(accountant_id);

-- Fase 2: Correção das Políticas de Segurança
-- Remover políticas antigas e criar novas mais restritivas

-- Política para accounting_clients
DROP POLICY IF EXISTS "Accountants can manage clients" ON public.accounting_clients;
DROP POLICY IF EXISTS "Contadores podem gerenciar clientes" ON public.accounting_clients;

-- Nova política: Contadores só podem ver/gerenciar seus próprios clientes
CREATE POLICY "Contadores podem gerenciar apenas seus clientes" 
ON public.accounting_clients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant' 
    AND (accountant_id = auth.uid() OR accountant_id IS NULL)
  ) 
  OR EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Política para clientes verem apenas sua própria empresa
CREATE POLICY "Clientes podem ver apenas sua empresa" 
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

-- Atualizar política para client_documents
DROP POLICY IF EXISTS "Accountants can manage client documents" ON public.client_documents;
DROP POLICY IF EXISTS "Clients can view documents of their company" ON public.client_documents;

-- Nova política para documentos - contadores só veem docs de seus clientes
CREATE POLICY "Contadores veem docs de seus clientes" 
ON public.client_documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'accountant'
    AND ac.id = client_documents.client_id
  ) 
  OR EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.id::text = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND ac.id = client_documents.client_id
  )
);

-- Atualizar política para generated_reports
DROP POLICY IF EXISTS "Clients can view reports of their company" ON public.generated_reports;

CREATE POLICY "Acesso restrito a relatórios por contador" 
ON public.generated_reports 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.accountant_id = up.user_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'accountant'
    AND ac.id = generated_reports.client_id
  ) 
  OR EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.accounting_clients ac ON ac.id::text = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND ac.id = generated_reports.client_id
  )
);

-- Criar função para obter clientes do contador atual
CREATE OR REPLACE FUNCTION public.get_accountant_clients(accountant_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
  id UUID,
  name TEXT,
  cnpj TEXT,
  email TEXT,
  status TEXT,
  regime TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT ac.id, ac.name, ac.cnpj, ac.email, ac.status, ac.regime, ac.created_at
  FROM public.accounting_clients ac
  WHERE ac.accountant_id = accountant_user_id
  ORDER BY ac.name;
$$;