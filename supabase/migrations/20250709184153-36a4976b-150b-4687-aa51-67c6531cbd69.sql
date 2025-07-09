-- Criar uma política temporária mais permissiva para demonstração
-- que permite que usuários autenticados vejam todos os clientes

DROP POLICY IF EXISTS "Demo access for authenticated users" ON public.accounting_clients;

CREATE POLICY "Demo access for authenticated users" 
ON public.accounting_clients 
FOR SELECT 
TO authenticated 
USING (true);