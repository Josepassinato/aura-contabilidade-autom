-- Inserir perfis para os usuários existentes no auth
INSERT INTO user_profiles (user_id, full_name, email, role)
VALUES 
  ('4bf3a9ec-57bb-4e13-8d7d-0b7f4ddd0134', 'Contador Exemplo', 'contador@contaflix.com.br', 'accountant'),
  ('a23bd07c-2113-4657-8cab-bf5b3c0a4785', 'Jose Passinato', 'josepassinato@hotmail.com', 'admin')
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;