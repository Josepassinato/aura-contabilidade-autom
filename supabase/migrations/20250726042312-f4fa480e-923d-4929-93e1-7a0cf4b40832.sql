-- CRITICAL SECURITY FIXES (Fixed Syntax v2)

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
  AND role = (SELECT role FROM public.user_profiles WHERE user_id = auth.uid())
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
    email = EXCLUDED.email;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 4. Create secure role checking function
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

-- 5. Add constraint to prevent invalid roles (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_user_roles'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT valid_user_roles 
    CHECK (role IN ('admin', 'accountant', 'client'));
  END IF;
END $$;

-- 6. Add audit logging for role changes
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