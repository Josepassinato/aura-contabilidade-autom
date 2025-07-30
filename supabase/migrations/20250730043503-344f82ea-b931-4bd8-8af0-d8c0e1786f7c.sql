-- Fix security issues identified by the linter

-- 1. Move extensions from public schema to dedicated schema (if any exist)
-- This will be handled in Supabase dashboard, but we can prepare the structure

-- 2. Create a function to clean up any potential auth issues
CREATE OR REPLACE FUNCTION public.reset_user_password_secure(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  reset_result json;
BEGIN
  -- This will be called from the client side using supabase.auth.resetPasswordForEmail
  -- This function just logs the reset attempt for audit purposes
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_values,
    metadata,
    severity,
    source
  ) VALUES (
    'auth_password_reset',
    'PASSWORD_RESET_REQUEST',
    jsonb_build_object('email', user_email),
    jsonb_build_object('timestamp', now(), 'source', 'client_portal'),
    'info',
    'password_reset'
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password reset request logged'
  );
END;
$$;

-- 3. Create function to handle secure logout across all sessions
CREATE OR REPLACE FUNCTION public.secure_global_logout()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log the global logout for audit purposes
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    new_values,
    metadata,
    severity,
    source,
    user_id
  ) VALUES (
    'auth_logout',
    'GLOBAL_LOGOUT',
    jsonb_build_object('user_id', auth.uid()),
    jsonb_build_object('timestamp', now(), 'type', 'security_cleanup'),
    'info',
    'security',
    auth.uid()
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Global logout logged'
  );
END;
$$;