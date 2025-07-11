-- Corrigir a função para criar accounting_firms quando contador se cadastra
DROP TRIGGER IF EXISTS on_accountant_user_created ON public.user_profiles;
DROP FUNCTION IF EXISTS public.handle_accountant_signup();

-- Criar função corrigida que funciona com user_profiles
CREATE OR REPLACE FUNCTION public.handle_accountant_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_auth_data jsonb;
BEGIN
  -- Se o usuário que se cadastrou é um contador, criar entrada na tabela accounting_firms
  IF NEW.role = 'accountant' THEN
    -- Buscar dados do auth.users para obter metadata
    SELECT raw_user_meta_data INTO user_auth_data
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- Inserir na tabela accounting_firms se não existir
    INSERT INTO public.accounting_firms (
      name,
      email,
      cnpj,
      status
    )
    SELECT 
      COALESCE(user_auth_data->>'company', NEW.full_name || ' - Escritório Contábil'),
      NEW.email,
      COALESCE(user_auth_data->>'cnpj', ''),
      'active'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.accounting_firms 
      WHERE email = NEW.email 
      OR (cnpj != '' AND cnpj = COALESCE(user_auth_data->>'cnpj', ''))
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para executar a função após inserir um usuário
CREATE TRIGGER on_accountant_user_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW 
  WHEN (NEW.role = 'accountant')
  EXECUTE FUNCTION public.handle_accountant_signup();