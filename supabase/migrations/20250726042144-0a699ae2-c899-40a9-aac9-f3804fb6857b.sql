-- CRITICAL SECURITY FIXES

-- 1. Fix privilege escalation vulnerability in user_profiles table
-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Create a secure update policy that prevents role escalation
CREATE POLICY "Users can update own profile (secure)" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Prevent role changes entirely OR only allow same role
    OLD.role = NEW.role
  )
);

-- 2. Create admin-only policy for role updates
CREATE POLICY "Admins can update user roles" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 3. Fix function search paths for security
-- Update existing functions to use explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user is in the user_profiles table
  INSERT INTO public.user_profiles (user_id, full_name, email, role)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.email), 
    new.email, 
    coalesce((new.raw_user_meta_data->>'role')::text, 'client')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = CASE 
      -- Only allow role updates if the new user is being created by an admin
      WHEN EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
      ) THEN EXCLUDED.role
      ELSE user_profiles.role -- Keep existing role
    END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 4. Update get_user_role function with explicit search path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 5. Create secure role checking function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- 6. Add constraint to prevent invalid roles
ALTER TABLE public.user_profiles 
ADD CONSTRAINT valid_user_roles 
CHECK (role IN ('admin', 'accountant', 'client'));

-- 7. Add audit logging for role changes
CREATE TABLE IF NOT EXISTS public.user_role_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role TEXT,
  new_role TEXT,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.user_role_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role audit" 
ON public.user_role_audit 
FOR SELECT 
USING (public.is_admin());

-- Create audit trigger
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log actual role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.user_role_audit (
      user_id, old_role, new_role, changed_by, reason
    ) VALUES (
      NEW.user_id, OLD.role, NEW.role, auth.uid(), 
      'Role updated via application'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create the audit trigger
DROP TRIGGER IF EXISTS user_role_audit_trigger ON public.user_profiles;
CREATE TRIGGER user_role_audit_trigger
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();