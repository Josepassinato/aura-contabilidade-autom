
import { createClient } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

export type { Tables };

// Tipos que serão utilizados no sistema
export interface Employee {
  id: string;
  client_id: string;
  name: string;
  position: string;
  department: string | null;
  hire_date: string;
  base_salary: number;
  status: string;
  created_at?: string;
  cpf?: string;
}

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
  created_at?: string;
}

export interface PayrollDeduction {
  id: string;
  payroll_entry_id: string;
  type: string;
  description: string;
  amount: number;
  created_at?: string;
}

// Added missing exports for build errors
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  full_name?: string;
  company_id?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  CLIENT = 'client',
  USER = 'user'
}

export interface AccountingClient extends Tables<"accounting_clients"> {
  // Campos adicionais que não estão na tabela do Supabase
}

export const initializeSupabase = () => {
  // Este é um mock - em produção usará o cliente real do Supabase
  return createClient;
};

// Um hook falso para usar como mock
export function useSupabaseClient() {
  // Aqui retornamos o cliente do Supabase da integração oficial
  return createClient;
}
