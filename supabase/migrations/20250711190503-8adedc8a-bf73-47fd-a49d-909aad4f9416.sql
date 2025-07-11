-- Criar função para automaticamente criar registro na tabela accounting_firms quando um contador se cadastra
CREATE OR REPLACE FUNCTION public.handle_accountant_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Se o usuário que se cadastrou é um contador, criar entrada na tabela accounting_firms
  IF NEW.role = 'accountant' THEN
    INSERT INTO public.accounting_firms (
      name,
      email,
      cnpj,
      status
    )
    SELECT 
      COALESCE(NEW.raw_user_meta_data->>'company', 'Escritório Contábil'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'cnpj', ''),
      'active'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.accounting_firms 
      WHERE email = NEW.email OR cnpj = COALESCE(NEW.raw_user_meta_data->>'cnpj', '')
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para executar a função após inserir um usuário
DROP TRIGGER IF EXISTS on_accountant_user_created ON public.user_profiles;
CREATE TRIGGER on_accountant_user_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW 
  WHEN (NEW.role = 'accountant')
  EXECUTE FUNCTION public.handle_accountant_signup();