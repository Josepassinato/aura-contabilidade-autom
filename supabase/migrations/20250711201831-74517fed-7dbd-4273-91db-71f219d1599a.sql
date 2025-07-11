-- Limpar todas as políticas RLS conflitantes da tabela accounting_clients
DROP POLICY IF EXISTS "Accountants and admins can create clients" ON accounting_clients;
DROP POLICY IF EXISTS "Accountants and admins can update clients" ON accounting_clients;
DROP POLICY IF EXISTS "Accountants can manage their clients" ON accounting_clients;
DROP POLICY IF EXISTS "Accountants can view their managed clients" ON accounting_clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON accounting_clients;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os clientes" ON accounting_clients;
DROP POLICY IF EXISTS "Clientes podem ver apenas sua empresa" ON accounting_clients;
DROP POLICY IF EXISTS "Clients can view their own company data" ON accounting_clients;
DROP POLICY IF EXISTS "Contadores podem gerenciar apenas seus clientes" ON accounting_clients;
DROP POLICY IF EXISTS "Contadores podem ver seus clientes" ON accounting_clients;
DROP POLICY IF EXISTS "Demo access for authenticated users" ON accounting_clients;
DROP POLICY IF EXISTS "Users can view clients based on role" ON accounting_clients;

-- Criar políticas simples e claras para accounting_clients
-- Política para SELECT (visualizar clientes)
CREATE POLICY "Select clients policy" 
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
CREATE POLICY "Insert clients policy" 
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
CREATE POLICY "Update clients policy" 
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
CREATE POLICY "Delete clients policy" 
ON accounting_clients 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);