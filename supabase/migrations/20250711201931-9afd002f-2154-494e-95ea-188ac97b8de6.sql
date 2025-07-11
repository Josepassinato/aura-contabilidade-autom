-- Criar perfil para o contador se não existir
INSERT INTO user_profiles (user_id, full_name, email, role)
VALUES (
  '22f431f2-4257-4276-bc7d-f380d5e1e379',
  'Central Globo de Contabilidade',
  'centralglobodecontabilidade@yahoo.com',
  'accountant'
)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;