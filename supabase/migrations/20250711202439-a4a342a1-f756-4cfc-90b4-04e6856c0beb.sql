-- Desabilitar RLS temporariamente para diagnosticar
ALTER TABLE accounting_clients DISABLE ROW LEVEL SECURITY;

-- Testar inserção
INSERT INTO accounting_clients (
  name, 
  cnpj, 
  email, 
  phone, 
  address, 
  regime, 
  status, 
  accountant_id, 
  accounting_firm_id
) VALUES (
  'Oxi-3 do brasil Ltda',
  '22.320.176/0001-63',
  'josepassinato@oxi3.com.br',
  '(00) 00000-0000',
  'Camboriú',
  'lucro_real',
  'active',
  '22f431f2-4257-4276-bc7d-f380d5e1e379',
  NULL
);

-- Reabilitar RLS
ALTER TABLE accounting_clients ENABLE ROW LEVEL SECURITY;

-- Recriar políticas mais simples
CREATE POLICY "authenticated_users_can_manage_clients" 
ON accounting_clients 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);