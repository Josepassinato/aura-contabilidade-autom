-- Corrigir políticas RLS problemáticas

-- 1. Remover políticas duplicadas/conflitantes
DROP POLICY IF EXISTS "Authenticated users can insert procurations" ON procuracoes_eletronicas;
DROP POLICY IF EXISTS "Anyone can insert procuracoes_eletronicas" ON procuracoes_eletronicas;
DROP POLICY IF EXISTS "Users can update their own procuracoes" ON procuracoes_eletronicas;
DROP POLICY IF EXISTS "Users can view their own procuracoes" ON procuracoes_eletronicas;

-- 2. Corrigir políticas de pix_payments com SELECT vazio
DROP POLICY IF EXISTS "Users can view pix payments" ON pix_payments;

-- 3. Recrear políticas corretas
CREATE POLICY "Contadores podem gerenciar procurações" 
ON procuracoes_eletronicas 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Clientes podem ver suas procurações" 
ON procuracoes_eletronicas 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = procuracoes_eletronicas.client_id::text
  )
);

-- 4. Corrigir política de pix_payments
CREATE POLICY "Authenticated users can view pix payments" 
ON pix_payments 
FOR SELECT 
TO authenticated 
USING (true);

-- 5. Corrigir inconsistências na tabela user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 6. Criar política UPDATE faltante para user_profiles
CREATE POLICY "Users can update their own profile" 
ON user_profiles 
FOR UPDATE 
TO public 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 7. Corrigir políticas de certificados_digitais que usam auth.jwt()
DROP POLICY IF EXISTS "Contadores podem inserir certificados" ON certificados_digitais;
DROP POLICY IF EXISTS "Contadores podem ver certificados" ON certificados_digitais;
DROP POLICY IF EXISTS "Contadores podem atualizar certificados" ON certificados_digitais;

CREATE POLICY "Contadores podem gerenciar certificados" 
ON certificados_digitais 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- 8. Corrigir políticas de serpro_api_credentials
DROP POLICY IF EXISTS "Apenas administradores podem inserir credenciais" ON serpro_api_credentials;
DROP POLICY IF EXISTS "Apenas administradores podem ver credenciais" ON serpro_api_credentials;
DROP POLICY IF EXISTS "Apenas administradores podem atualizar credenciais" ON serpro_api_credentials;

CREATE POLICY "Apenas administradores podem gerenciar credenciais SERPRO" 
ON serpro_api_credentials 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 9. Corrigir política problemática de declaracoes_simples_nacional
DROP POLICY IF EXISTS "Contadores e clientes podem ver suas declarações" ON declaracoes_simples_nacional;

CREATE POLICY "Contadores podem gerenciar declarações" 
ON declaracoes_simples_nacional 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Clientes podem ver suas declarações" 
ON declaracoes_simples_nacional 
FOR SELECT 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = declaracoes_simples_nacional.client_id::text
  )
);

-- 10. Adicionar foreign keys faltantes que podem estar causando erros
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 11. Criar função para verificar role sem recursão
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;