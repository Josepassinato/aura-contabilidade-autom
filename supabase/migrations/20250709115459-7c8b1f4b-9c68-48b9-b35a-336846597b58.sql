-- Corrigir erros restantes no banco de dados

-- 1. Remover constraint duplicada na tabela user_profiles
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- 2. Habilitar RLS nas tabelas que não têm políticas
ALTER TABLE integracoes_estaduais ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracoes_simples_nacional ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_firm_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_monthly_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametros_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultorias_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE atualizacoes_parametros_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_classifications ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS básicas para as tabelas que faltam

-- Integrações estaduais - contadores podem gerenciar
CREATE POLICY "Contadores podem gerenciar integrações estaduais" 
ON integracoes_estaduais 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Escritórios contábeis - admins podem gerenciar
CREATE POLICY "Admins podem gerenciar escritórios" 
ON accounting_firms 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Integrações Simples Nacional - contadores podem gerenciar
CREATE POLICY "Contadores podem gerenciar integrações SN" 
ON integracoes_simples_nacional 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Assinaturas dos escritórios - admins podem gerenciar
CREATE POLICY "Admins podem gerenciar assinaturas" 
ON accounting_firm_subscriptions 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Estatísticas mensais - admins podem gerenciar
CREATE POLICY "Admins podem gerenciar estatísticas" 
ON firm_monthly_statistics 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Parâmetros fiscais - admins podem gerenciar
CREATE POLICY "Admins podem gerenciar parâmetros fiscais" 
ON parametros_fiscais 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Consultorias fiscais - admins podem gerenciar
CREATE POLICY "Admins podem gerenciar consultorias" 
ON consultorias_fiscais 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Log de atualizações de parâmetros - sistema pode gerenciar
CREATE POLICY "Sistema pode gerenciar log de parâmetros" 
ON atualizacoes_parametros_log 
FOR ALL 
TO public 
USING (true);

-- Classificações de documentos - contadores podem gerenciar
CREATE POLICY "Contadores podem gerenciar classificações" 
ON document_classifications 
FOR ALL 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- 4. Corrigir políticas problemáticas existentes
DROP POLICY IF EXISTS "Authenticated users can update procurations" ON procuracoes_eletronicas;
DROP POLICY IF EXISTS "Authenticated users can view procurations" ON procuracoes_eletronicas;

-- 5. Verificar e corrigir problemas de constraint duplicada em atualizacoes_parametros_log
ALTER TABLE atualizacoes_parametros_log DROP CONSTRAINT IF EXISTS fk_atualizacoes_parametros_log_parametro;