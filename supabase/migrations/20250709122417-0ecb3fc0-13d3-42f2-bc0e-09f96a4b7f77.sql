-- Implementação do Plano de Segurança - Fase 1: Configurações Iniciais

-- 1. Criar usuário administrador inicial (se não existir)
INSERT INTO public.user_profiles (
  id, 
  user_id, 
  full_name, 
  email, 
  role, 
  company_id,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  gen_random_uuid(), -- Este será substituído por um user_id real quando um admin fizer login
  'Administrador Sistema',
  'admin@contaflix.com.br',
  'admin',
  'contaflix-main',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE role = 'admin' AND email = 'admin@contaflix.com.br'
);

-- 2. Configurar parâmetros fiscais básicos
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
        'anexo_1', array[0.04, 0.045, 0.055, 0.075, 0.09, 0.105, 0.12, 0.135, 0.15, 0.165, 0.18, 0.195, 0.205, 0.23, 0.26, 0.29, 0.32, 0.35, 0.38, 0.4],
        'anexo_2', array[0.045, 0.055, 0.068, 0.08, 0.103, 0.128, 0.158, 0.178, 0.195, 0.215, 0.235, 0.255, 0.275, 0.3, 0.33, 0.36, 0.39, 0.42, 0.45, 0.48]
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

-- 3. Configurar parâmetros de obrigações acessórias
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

-- 4. Configurar centro de custos padrão
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
VALUES 
  (gen_random_uuid(), 'closing', 1, 30, 'admin', true, NOW()),
  (gen_random_uuid(), 'compliance', 1, 60, 'admin', true, NOW()),
  (gen_random_uuid(), 'system', 1, 15, 'admin', true, NOW()),
  (gen_random_uuid(), 'error', 1, 5, 'admin', true, NOW())
ON CONFLICT DO NOTHING;

-- 6. Criar configurações de preferências padrão para o admin
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
SELECT 
  gen_random_uuid(),
  up.user_id,
  true,
  true,
  1, -- Receber todas as notificações
  ARRAY['closing', 'compliance', 'system', 'error', 'security'],
  NOW(),
  NOW()
FROM public.user_profiles up
WHERE up.role = 'admin' 
  AND up.email = 'admin@contaflix.com.br'
  AND NOT EXISTS (
    SELECT 1 FROM public.notification_preferences np 
    WHERE np.user_id = up.user_id
  );

-- 7. Ativar métricas de sistema
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
  (gen_random_uuid(), 'admin_users_configured', 'gauge', 1, 
   jsonb_build_object('component', 'user_management', 'initial_setup', 'complete'), NOW(), NOW());