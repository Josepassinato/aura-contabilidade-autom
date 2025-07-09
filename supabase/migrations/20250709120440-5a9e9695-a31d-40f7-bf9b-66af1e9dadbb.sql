-- Corrigir erros específicos no banco de dados

-- 1. Remover políticas existentes que podem estar causando conflitos
DROP POLICY IF EXISTS "Contadores podem gerenciar procurações" ON procuracoes_eletronicas;

-- 2. Recriar a política correta
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

-- 3. Verificar tabelas de sistema sem RLS
ALTER TABLE IF EXISTS system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS worker_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS archived_data ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas que podem estar faltando (com IF NOT EXISTS implícito)
DO $$
BEGIN
  -- Política para system_metrics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_metrics' AND policyname = 'Sistema pode gerenciar métricas') THEN
    EXECUTE 'CREATE POLICY "Sistema pode gerenciar métricas" ON system_metrics FOR ALL TO public USING (true)';
  END IF;
  
  -- Política para notifications - SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Usuários podem ver suas notificações') THEN
    EXECUTE 'CREATE POLICY "Usuários podem ver suas notificações" ON notifications FOR SELECT TO public USING (auth.uid() = user_id)';
  END IF;
  
  -- Política para notifications - INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Sistema pode criar notificações') THEN
    EXECUTE 'CREATE POLICY "Sistema pode criar notificações" ON notifications FOR INSERT TO public WITH CHECK (true)';
  END IF;
  
  -- Política para notifications - UPDATE  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'Usuários podem atualizar suas notificações') THEN
    EXECUTE 'CREATE POLICY "Usuários podem atualizar suas notificações" ON notifications FOR UPDATE TO public USING (auth.uid() = user_id)';
  END IF;
END $$;