
import { UserProfile } from '@/lib/supabase';

export const signInWithCredentials = async (supabase: any, email: string, password: string, toast: any) => {
  if (!supabase) return { error: new Error('Supabase client not initialized') };
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    toast({
      title: "Login realizado com sucesso",
      description: "Bem-vindo de volta!",
    });
    
    return { error: null };
  } catch (error: any) {
    toast({
      title: "Erro ao fazer login",
      description: error.message || "Ocorreu um erro inesperado",
      variant: "destructive",
    });
    return { error };
  }
};

export const signUpWithCredentials = async (
  supabase: any,
  email: string, 
  password: string, 
  userData: Partial<UserProfile>,
  toast: any
) => {
  if (!supabase) return { error: new Error('Supabase client not initialized') };
  
  try {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: data.user.id,
          email,
          full_name: userData.full_name || '',
          role: userData.role || 'client',
          company_id: userData.company_id,
        }]);
        
      if (profileError) {
        toast({
          title: "Erro ao criar perfil",
          description: profileError.message,
          variant: "destructive",
        });
        return { error: profileError };
      }
    }
    
    toast({
      title: "Conta criada com sucesso",
      description: "Você já pode fazer login",
    });
    
    return { error: null };
  } catch (error: any) {
    toast({
      title: "Erro ao criar conta",
      description: error.message || "Ocorreu um erro inesperado",
      variant: "destructive",
    });
    return { error };
  }
};

export const handleSignOut = async (supabase: any, toast: any) => {
  if (!supabase) return;
  
  try {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado com sucesso",
    });
  } catch (error: any) {
    toast({
      title: "Erro ao fazer logout",
      description: error.message || "Ocorreu um erro inesperado",
      variant: "destructive",
    });
  }
};
