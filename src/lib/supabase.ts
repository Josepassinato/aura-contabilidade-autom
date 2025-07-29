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
  notes?: string;
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
  updated_at: string;
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
  date?: string; // Added for compatibility
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

// Type definition for Supabase User
export interface SupabaseUser {
  id: string;
  aud: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: any;
  user_metadata: any;
  identities?: any[];
  created_at: string;
  updated_at: string;
}

// Type definition for Supabase Session
export interface SupabaseSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: SupabaseUser;
}

export const useSupabaseClient = () => {
  // Enhanced mock implementation with improved method chaining
  const supabase = {
    from: (table: string) => ({
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: () => Promise.resolve({ data: null, error: null }),
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
              order: (column: string, { ascending = true } = {}) => ({
                limit: (limit: number = 10) => Promise.resolve({ data: [], error: null })
              }),
              limit: (limit: number = 10) => Promise.resolve({ data: [], error: null }),
              data: null,
              error: null
            };
          },
          order: (column: string, { ascending = true } = {}) => ({
            limit: (limit: number = 10) => Promise.resolve({ data: [], error: null }),
            data: [],
            error: null
          }),
          limit: (limit: number = 10) => Promise.resolve({ data: [], error: null }),
          data: [],
          error: null
        };
      },
      insert: (values: any) => ({
        select: (columns: string = '*') => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        data: null,
        error: null
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
        match: (criteria: any) => Promise.resolve({ data: null, error: null }),
        data: null,
        error: null
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
        match: (criteria: any) => Promise.resolve({ data: null, error: null }),
        data: null,
        error: null
      }),
      upsert: (values: any) => Promise.resolve({ data: null, error: null })
    }),
    rpc: <T = any, P = any>(
      fn: string, 
      params?: P
    ) => Promise.resolve({ data: null as T, error: null })
  };
  
  return supabase;
};
