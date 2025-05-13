
import { supabase } from './client';
import { UserProfile } from '../supabase';

/**
 * Serviço para recuperar perfil de usuário
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
};
