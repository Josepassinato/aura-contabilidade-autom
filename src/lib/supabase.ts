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

// Criar uma instância do cliente Supabase para uso global
const SUPABASE_URL = "https://watophocqlcyimirzrpe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdG9waG9jcWxjeWltaXJ6cnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTUyNjQsImV4cCI6MjA2MjU3MTI2NH0.aTF2XWWUhxtrrp4V08BvM5WAGQULlppgkIhXnCSLXrg";

// Criando o cliente que será utilizado em toda a aplicação
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export const initializeSupabase = () => {
  // Retorna o cliente já inicializado
  return supabaseClient;
};

// Hook para usar o cliente Supabase
export function useSupabaseClient() {
  // Retorna a instância do cliente Supabase já inicializado
  return supabaseClient;
}
