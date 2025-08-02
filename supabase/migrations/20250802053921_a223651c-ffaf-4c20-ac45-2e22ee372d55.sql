-- Criar usuários de teste com credenciais funcionais
-- Primeiro, vamos garantir que existem perfis para os usuários de teste

-- Inserir perfis de usuário para as contas de teste (se não existirem)
INSERT INTO public.user_profiles (
  user_id, 
  full_name, 
  email, 
  role
) VALUES 
  -- Admin de teste
  ('00000000-0000-0000-0000-000000000001', 'Admin Test', 'admin@test.com', 'admin'),
  -- Contador de teste  
  ('00000000-0000-0000-0000-000000000002', 'Office Test', 'office@test.com', 'accountant')
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Inserir escritório contábil para o contador de teste
INSERT INTO public.accounting_firms (
  id,
  name,
  email,
  cnpj,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Escritório Teste',
  'office@test.com',
  '12.345.678/0001-90',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Inserir alguns clientes de teste para ter dados
INSERT INTO public.accounting_clients (
  id,
  name,
  cnpj,
  email,
  accountant_id,
  status,
  regime
) VALUES 
  ('00000000-0000-0000-0000-000000000004', 'Cliente Teste 1', '11.222.333/0001-44', 'cliente1@test.com', '00000000-0000-0000-0000-000000000002', 'active', 'simples_nacional'),
  ('00000000-0000-0000-0000-000000000005', 'Cliente Teste 2', '55.666.777/0001-88', 'cliente2@test.com', '00000000-0000-0000-0000-000000000002', 'active', 'lucro_presumido')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;