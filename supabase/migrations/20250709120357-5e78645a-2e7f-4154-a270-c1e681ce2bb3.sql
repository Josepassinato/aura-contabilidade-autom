-- Verificar e corrigir problemas restantes no banco de dados

-- 1. Verificar se há políticas RLS em conflito e remover duplicadas
DROP POLICY IF EXISTS "Authenticated users can update procurations" ON procuracoes_eletronicas;
DROP POLICY IF EXISTS "Authenticated users can view procurations" ON procuracoes_eletronicas;

-- 2. Criar políticas corretas para procurações eletrônicas
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

-- 3. Verificar e corrigir problemas nas tabelas de sistema
DROP POLICY IF EXISTS "Sistema pode gerenciar métricas" ON system_metrics;
CREATE POLICY "Sistema pode gerenciar métricas" 
ON system_metrics 
FOR ALL 
TO public 
USING (true);

-- 4. Habilitar RLS em tabelas que podem estar faltando
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_data ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas para tabelas de sistema que faltam
CREATE POLICY "Sistema pode gerenciar performance" 
ON system_performance_metrics 
FOR ALL 
TO public 
USING (true);

CREATE POLICY "Sistema pode gerenciar escalation" 
ON notification_escalation_rules 
FOR ALL 
TO public 
USING (true);

CREATE POLICY "Sistema pode gerenciar workers" 
ON worker_instances 
FOR ALL 
TO public 
USING (true);

CREATE POLICY "Sistema pode gerenciar arquivos" 
ON archived_data 
FOR ALL 
TO public 
USING (true);

-- 6. Verificar e corrigir problemas de notifications
DROP POLICY IF EXISTS "Usuários podem ver suas notificações" ON notifications;
CREATE POLICY "Usuários podem ver suas notificações" 
ON notifications 
FOR SELECT 
TO public 
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar notificações" 
ON notifications 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas notificações" 
ON notifications 
FOR UPDATE 
TO public 
USING (auth.uid() = user_id);