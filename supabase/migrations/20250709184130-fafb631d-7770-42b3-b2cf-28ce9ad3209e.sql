-- Verificar se existe algum usuário na tabela auth.users com o email contador@contaflix.com.br
-- e criar um perfil para ele se necessário

-- Para desenvolvimento, vamos criar um perfil usando um UUID de exemplo
-- Em produção, isso seria feito automaticamente via trigger quando um usuário se registra

INSERT INTO public.user_profiles (user_id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'contador@contaflix.com.br', 
  'Contador Exemplo', 
  'accountant'
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;