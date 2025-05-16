
// Definições de tipos para o Supabase
import { Database } from '../integrations/supabase/types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// User role type
export type UserRole = 'admin' | 'accountant' | 'client' | 'user';

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  full_name: string;
  role: UserRole;
  company_id?: string;
  avatar_url?: string;
}

// Employee type
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string | null;
  hire_date: string;
  base_salary: number;
  cpf: string;
  status: string;
  client_id: string;
}

// Payroll Entry type
export interface PayrollEntry {
  id: string;
  client_id: string;
  employee_id: string;
  period: string;
  base_salary: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: string;
  created_at: string;
}

// Document type
export interface Document {
  id: string;
  client_id: string;
  title: string;
  name: string;
  type: string;
  file_path?: string;
  size?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const useSupabaseClient = () => {
  // Implementação simplificada
  const supabase = {}; // Mock - esta função será substituída pela implementação real
  return supabase;
};
