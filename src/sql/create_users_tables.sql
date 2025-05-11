
-- Create tables for user authentication and profiles

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('accountant', 'client', 'admin')),
    company_id TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
ON user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow accountants to read all profiles
CREATE POLICY "Accountants can view all profiles" 
ON user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant'
  )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow insert for authenticated users (needed for signup)
CREATE POLICY "Users can insert their profile"
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to trigger on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user is in the user_profiles table
  INSERT INTO public.user_profiles (user_id, full_name, email, role)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email, coalesce(new.raw_user_meta_data->>'role', 'client'))
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
