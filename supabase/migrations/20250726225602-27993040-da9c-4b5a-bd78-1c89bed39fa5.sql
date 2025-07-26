-- Inserir escritório contábil para José Passinato
INSERT INTO public.accounting_firms (
  id,
  name,
  email,
  cnpj,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'José Passinato Contabilidade',
  'josepassinato@hotmail.com',
  '12.345.678/0001-90',
  'active',
  now(),
  now()
);

-- Atualizar o perfil do usuário para associar à empresa criada
UPDATE public.user_profiles 
SET company_id = (
  SELECT id::text FROM public.accounting_firms 
  WHERE email = 'josepassinato@hotmail.com'
)
WHERE email = 'josepassinato@hotmail.com';