
import { supabase } from './client';
import { UserProfile } from '../supabase';

interface DbUserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id?: string;
  avatar_url?: string;
  user_id: string;
  updated_at?: string;
  created_at?: string;
}

/**
 * Service to retrieve user profile
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Map DB user profile to application UserProfile type
    if (data) {
      const profile: UserProfile = {
        id: data.id,
        email: data.email,
        name: data.full_name, // Map full_name to name
        full_name: data.full_name,
        role: data.role,
        company_id: data.company_id
      };
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
