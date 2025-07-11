-- Primeiro, vamos verificar se já existe um usuário no auth.users com esse email
-- Se não existir, vamos criar o perfil com um user_id genérico para teste

INSERT INTO user_profiles (user_id, full_name, email, role)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid, 
  'Contador Exemplo', 
  'contador@contaflix.com.br', 
  'accountant'
);