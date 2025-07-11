-- Corrigir problemas finais de RLS e permissões

-- 1. Garantir que todas as tabelas críticas tenham RLS habilitado
ALTER TABLE public.accounting_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_firms ENABLE ROW LEVEL SECURITY;

-- 2. Corrigir problemas potenciais com user_invitations
-- Permitir que usuários anônimos vejam convites por token
DROP POLICY IF EXISTS "Users can view invitations by token" ON public.user_invitations;
CREATE POLICY "Users can view invitations by token" 
ON public.user_invitations 
FOR SELECT 
USING (true);

-- 3. Permitir que usuários aceitem convites (update)
DROP POLICY IF EXISTS "Users can accept invitations" ON public.user_invitations;
CREATE POLICY "Users can accept invitations" 
ON public.user_invitations 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 4. Corrigir problemas com accounting_clients para admins
DROP POLICY IF EXISTS "Admins podem gerenciar todos os clientes" ON public.accounting_clients;
CREATE POLICY "Admins podem gerenciar todos os clientes" 
ON public.accounting_clients 
FOR ALL 
USING (public.get_user_role() = 'admin') 
WITH CHECK (public.get_user_role() = 'admin');

-- 5. Permitir que contadores vejam seus próprios clientes
DROP POLICY IF EXISTS "Contadores podem ver seus clientes" ON public.accounting_clients;
CREATE POLICY "Contadores podem ver seus clientes" 
ON public.accounting_clients 
FOR SELECT 
USING (accountant_id = auth.uid() OR public.get_user_role() = 'admin');

-- 6. Corrigir problemas com accounting_firms
DROP POLICY IF EXISTS "Admins podem gerenciar escritórios" ON public.accounting_firms;

-- 7. Permitir acesso público de leitura a algumas tabelas para dashboard
CREATE POLICY "Public read access for dashboard" 
ON public.accounting_firms 
FOR SELECT 
USING (true);

-- 8. Corrigir triggers que podem estar faltando
-- Garantir que user_profiles seja atualizado automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();