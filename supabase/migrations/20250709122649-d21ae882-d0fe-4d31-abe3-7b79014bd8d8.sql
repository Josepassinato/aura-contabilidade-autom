-- Implementação do Plano de Segurança - Fase 1: Configurações Iniciais (Corrigida)

-- 1. Configurar parâmetros fiscais básicos
INSERT INTO public.parametros_fiscais (
  id,
  tipo,
  versao,
  parametros,
  ativo,
  data_atualizacao,
  created_at
)
SELECT 
  gen_random_uuid(),
  'TRIBUTOS_FEDERAIS',
  '2024.1',
  jsonb_build_object(
    'aliquotas', jsonb_build_object(
      'simples_nacional', jsonb_build_object(
        'anexo_1', array[0.04, 0.045, 0.055, 0.075, 0.09, 0.105, 0.12, 0.135, 0.15, 0.165, 0.18, 0.195, 0.205, 0.23, 0.26, 0.29, 0.32, 0.35, 0.38],
        'anexo_2', array[0.045, 0.055, 0.068, 0.08, 0.103, 0.128, 0.158, 0.178, 0.195, 0.215, 0.235, 0.255, 0.275, 0.3, 0.33, 0.36, 0.39, 0.42, 0.45]
      ),
      'lucro_presumido', jsonb_build_object(
        'irpj', 0.15,
        'csll', 0.09,
        'cofins', 0.03,
        'pis', 0.0065
      )
    ),
    'limites', jsonb_build_object(
      'simples_nacional', 4800000.00,
      'mei', 81000.00
    ),
    'vigencia', jsonb_build_object(
      'inicio', '2024-01-01',
      'fim', '2024-12-31'
    )
  ),
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.parametros_fiscais 
  WHERE tipo = 'TRIBUTOS_FEDERAIS' AND versao = '2024.1' AND ativo = true
);

-- 2. Configurar parâmetros de obrigações acessórias
INSERT INTO public.parametros_fiscais (
  id,
  tipo,
  versao,
  parametros,
  ativo,
  data_atualizacao,
  created_at
)
SELECT 
  gen_random_uuid(),
  'OBRIGACOES_ACESSORIAS',
  '2024.1',
  jsonb_build_object(
    'prazos', jsonb_build_object(
      'das', 20,
      'defis', '31/03',
      'ecf', '31/07',
      'ecd', '31/05',
      'dmpl', '28/02'
    ),
    'penalties', jsonb_build_object(
      'atraso_das', 0.33,
      'atraso_declaracoes', 165.74,
      'nao_entrega', 500.00
    ),
    'regimes_especiais', jsonb_build_object(
      'microempresa', true,
      'empresa_pequeno_porte', true,
      'mei_validacao', true
    )
  ),
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.parametros_fiscais 
  WHERE tipo = 'OBRIGACOES_ACESSORIAS' AND versao = '2024.1' AND ativo = true
);

-- 3. Configurar centro de custos padrão
INSERT INTO public.centro_custos (
  id,
  codigo,
  nome,
  descricao,
  ativo,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  '001',
  'Administrativo',
  'Centro de custo padrão para despesas administrativas',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.centro_custos WHERE codigo = '001'
);

-- 4. Configurar plano de contas básico
INSERT INTO public.plano_contas (
  id,
  codigo,
  nome,
  tipo,
  natureza,
  grau,
  aceita_lancamento,
  ativo,
  created_at,
  updated_at
)
VALUES 
  (gen_random_uuid(), '1', 'ATIVO', 'ATIVO', 'DEVEDORA', 1, false, true, NOW(), NOW()),
  (gen_random_uuid(), '1.1', 'ATIVO CIRCULANTE', 'ATIVO', 'DEVEDORA', 2, false, true, NOW(), NOW()),
  (gen_random_uuid(), '1.1.1', 'DISPONIBILIDADES', 'ATIVO', 'DEVEDORA', 3, false, true, NOW(), NOW()),
  (gen_random_uuid(), '1.1.1.01', 'CAIXA', 'ATIVO', 'DEVEDORA', 4, true, true, NOW(), NOW()),
  (gen_random_uuid(), '1.1.1.02', 'BANCOS', 'ATIVO', 'DEVEDORA', 4, true, true, NOW(), NOW()),
  (gen_random_uuid(), '2', 'PASSIVO', 'PASSIVO', 'CREDORA', 1, false, true, NOW(), NOW()),
  (gen_random_uuid(), '2.1', 'PASSIVO CIRCULANTE', 'PASSIVO', 'CREDORA', 2, false, true, NOW(), NOW()),
  (gen_random_uuid(), '3', 'PATRIMÔNIO LÍQUIDO', 'PATRIMONIO_LIQUIDO', 'CREDORA', 1, false, true, NOW(), NOW()),
  (gen_random_uuid(), '4', 'RECEITAS', 'RECEITA', 'CREDORA', 1, false, true, NOW(), NOW()),
  (gen_random_uuid(), '4.1', 'RECEITAS OPERACIONAIS', 'RECEITA', 'CREDORA', 2, false, true, NOW(), NOW()),
  (gen_random_uuid(), '4.1.1.01', 'VENDAS DE PRODUTOS', 'RECEITA', 'CREDORA', 4, true, true, NOW(), NOW()),
  (gen_random_uuid(), '5', 'DESPESAS', 'DESPESA', 'DEVEDORA', 1, false, true, NOW(), NOW()),
  (gen_random_uuid(), '5.1', 'DESPESAS OPERACIONAIS', 'DESPESA', 'DEVEDORA', 2, false, true, NOW(), NOW()),
  (gen_random_uuid(), '5.1.1.01', 'DESPESAS ADMINISTRATIVAS', 'DESPESA', 'DEVEDORA', 4, true, true, NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- 5. Ativar regras de escalação de notificações
INSERT INTO public.notification_escalation_rules (
  id,
  category,
  priority,
  escalate_after_minutes,
  escalate_to_role,
  is_active,
  created_at
)
SELECT gen_random_uuid(), 'closing', 1, 30, 'admin', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.notification_escalation_rules WHERE category = 'closing');

INSERT INTO public.notification_escalation_rules (
  id,
  category,
  priority,
  escalate_after_minutes,
  escalate_to_role,
  is_active,
  created_at
)
SELECT gen_random_uuid(), 'compliance', 1, 60, 'admin', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.notification_escalation_rules WHERE category = 'compliance');

INSERT INTO public.notification_escalation_rules (
  id,
  category,
  priority,
  escalate_after_minutes,
  escalate_to_role,
  is_active,
  created_at
)
SELECT gen_random_uuid(), 'system', 1, 15, 'admin', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.notification_escalation_rules WHERE category = 'system');

INSERT INTO public.notification_escalation_rules (
  id,
  category,
  priority,
  escalate_after_minutes,
  escalate_to_role,
  is_active,
  created_at
)
SELECT gen_random_uuid(), 'error', 1, 5, 'admin', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.notification_escalation_rules WHERE category = 'error');

-- 6. Ativar métricas de sistema
INSERT INTO public.system_metrics (
  id,
  metric_name,
  metric_type,
  metric_value,
  labels,
  timestamp,
  created_at
)
VALUES 
  (gen_random_uuid(), 'system_initialization', 'gauge', 1, 
   jsonb_build_object('component', 'security_setup', 'status', 'active'), NOW(), NOW()),
  (gen_random_uuid(), 'security_policies_active', 'gauge', 1, 
   jsonb_build_object('component', 'rls_policies', 'count', 25), NOW(), NOW()),
  (gen_random_uuid(), 'fiscal_parameters_configured', 'gauge', 1, 
   jsonb_build_object('component', 'fiscal_management', 'initial_setup', 'complete'), NOW(), NOW());

-- 7. Criar função para setup inicial de admin (será executada quando um admin fizer login)
CREATE OR REPLACE FUNCTION public.setup_initial_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se um usuário com role admin for criado, configurar preferências
  IF NEW.role = 'admin' THEN
    INSERT INTO public.notification_preferences (
      id,
      user_id,
      email_enabled,
      push_enabled,
      priority_threshold,
      categories_subscribed,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      NEW.user_id,
      true,
      true,
      1,
      ARRAY['closing', 'compliance', 'system', 'error', 'security'],
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar trigger para configuração automática de admin
DROP TRIGGER IF EXISTS setup_admin_preferences ON public.user_profiles;
CREATE TRIGGER setup_admin_preferences
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_initial_admin_user();