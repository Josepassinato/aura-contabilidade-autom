-- Desabilitar confirmação de email para permitir login imediato
-- Esta configuração será aplicada através do painel do Supabase

-- Como alternativa, vamos criar uma função que confirma emails automaticamente para contadores
CREATE OR REPLACE FUNCTION public.auto_confirm_accountant_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Se o usuário é um contador, confirmar email automaticamente
  IF NEW.raw_user_meta_data->>'role' = 'accountant' THEN
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar o trigger no momento do cadastro
DROP TRIGGER IF EXISTS on_accountant_email_confirm ON auth.users;
CREATE TRIGGER on_accountant_email_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.auto_confirm_accountant_email();