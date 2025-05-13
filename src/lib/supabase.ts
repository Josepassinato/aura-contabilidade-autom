
import { Tables } from '@/integrations/supabase/types';
import { supabase } from './supabaseService';

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
  notes?: string | null;
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

// Usar a instância centralizada do cliente Supabase
export const supabaseClient = supabase;

// Hook para usar o cliente Supabase
export function useSupabaseClient() {
  // Retorna a instância do cliente Supabase já inicializada
  return supabaseClient;
}

// Manter compatibilidade com códigos existentes
export const initializeSupabase = () => {
  // Retorna o cliente já inicializado
  return supabaseClient;
};
