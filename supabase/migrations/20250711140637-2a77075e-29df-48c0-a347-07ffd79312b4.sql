-- Atualizar a função para criar perfil automaticamente para o contador de exemplo
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Garantir que o usuário esteja na tabela user_profiles
  INSERT INTO public.user_profiles (user_id, full_name, email, role)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.email), 
    new.email, 
    CASE 
      WHEN new.email = 'contador@contaflix.com.br' THEN 'accountant'
      ELSE coalesce((new.raw_user_meta_data->>'role')::text, 'client')
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;