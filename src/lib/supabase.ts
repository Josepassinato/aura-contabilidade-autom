
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
  notes?: string; // Added notes field to fix EmployeeFormDialog error
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

// AccountingClient type
export interface AccountingClient {
  id: string;
  name: string;
  email: string;
  cnpj: string;
  regime?: string;
  status: string;
  address?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export const useSupabaseClient = () => {
  // Mock implementation with required methods to fix TypeScript errors
  const supabase = {
    from: (table: string) => ({
      select: (columns: string) => ({ 
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) })
        }),
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) })
      })
    }),
    rpc: <T = any, P = any>(
      fn: string, 
      params?: P
    ) => Promise.resolve({ data: null as T, error: null })
  };
  
  return supabase;
};

