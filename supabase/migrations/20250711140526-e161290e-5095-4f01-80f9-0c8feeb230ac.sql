-- Criar um usuário contador de exemplo para testes
INSERT INTO user_profiles (user_id, full_name, email, role)
VALUES (
  gen_random_uuid(), 
  'Contador Exemplo', 
  'contador@contaflix.com.br', 
  'accountant'
)
ON CONFLICT (email) DO UPDATE SET 
  role = 'accountant',
  full_name = 'Contador Exemplo';