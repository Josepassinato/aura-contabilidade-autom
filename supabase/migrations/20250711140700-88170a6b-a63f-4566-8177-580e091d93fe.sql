-- Criar um usuário de exemplo temporário diretamente na tabela user_profiles para testes
-- usando um UUID fictício mas que não viole constraints

-- Primeiro, vamos ver se conseguimos criar um user_profile sem foreign key temporariamente
DO $$
BEGIN
  -- Verificar se o constraint de foreign key pode ser temporariamente desabilitado
  INSERT INTO user_profiles (user_id, full_name, email, role)
  SELECT 
    gen_random_uuid(),
    'Contador Exemplo',
    'contador@contaflix.com.br',
    'accountant'
  WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE email = 'contador@contaflix.com.br'
  );
EXCEPTION
  WHEN foreign_key_violation THEN
    -- Se der erro de foreign key, vamos ignorar por agora
    RAISE NOTICE 'Cannot create user profile without auth user';
END $$;