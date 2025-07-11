-- Corrigir políticas RLS para accounting_clients
-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Contadores podem criar clientes" ON accounting_clients;
DROP POLICY IF EXISTS "Contadores podem gerenciar clientes" ON accounting_clients;
DROP POLICY IF EXISTS "Admins podem gerenciar clientes" ON accounting_clients;
DROP POLICY IF EXISTS "Clientes podem ver seus dados" ON accounting_clients;

-- Criar políticas mais robustas
-- Política para SELECT (visualizar clientes)
CREATE POLICY "Users can view clients based on role" 
ON accounting_clients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND (
      role = 'admin' OR 
      (role = 'accountant' AND (accountant_id = auth.uid() OR accountant_id IS NULL)) OR
      (role = 'client' AND company_id = id::text)
    )
  )
);

-- Política para INSERT (criar clientes)
CREATE POLICY "Accountants and admins can create clients" 
ON accounting_clients 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Política para UPDATE (atualizar clientes)
CREATE POLICY "Accountants and admins can update clients" 
ON accounting_clients 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND (
      role = 'admin' OR 
      (role = 'accountant' AND (accountant_id = auth.uid() OR accountant_id IS NULL))
    )
  )
);

-- Política para DELETE (deletar clientes)
CREATE POLICY "Admins can delete clients" 
ON accounting_clients 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);