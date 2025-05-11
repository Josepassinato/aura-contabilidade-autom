
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

// Create a Supabase context to provide the client throughout the app
export const SupabaseContext = createContext<SupabaseClient | null>(null);

// Hook to easily access the Supabase client
export const useSupabaseClient = () => {
  const client = useContext(SupabaseContext);
  return client;
};

// Initialize the Supabase client
export const initializeSupabase = () => {
  // Get environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Validate URLs and keys
  if (!supabaseUrl || !supabaseKey || 
      !supabaseUrl.startsWith('http') || 
      supabaseUrl.includes('your_supabase_url') || 
      supabaseKey.includes('your_supabase_anon_key')) {
    console.error('Supabase credentials are missing or invalid. Please configure your .env file with valid Supabase credentials.');
    // Return null to prevent errors in the app
    return null;
  }
  
  try {
    // Create and return the client
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

// User and authentication types
export type UserRole = 'accountant' | 'client' | 'admin';

export type UserProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  company_id?: string;
  created_at?: string;
  avatar_url?: string;
}

// Define types for database tables
export type AccountingClient = {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  accounting_firm_id: string;
}

export type ClientAccessToken = {
  id: string;
  client_id: string;
  token: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export type ClientFinancialData = {
  id: string;
  client_id: string;
  period: string;
  revenue: number;
  previous_revenue: number;
  expenses?: number;
  profit?: number;
  created_at?: string;
}

export type TaxObligation = {
  id: string;
  client_id: string;
  name: string;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  created_at?: string;
}

export type ClientDocument = {
  id: string;
  client_id: string;
  name: string;
  type: string;
  size: number;
  file_path: string;
  status: 'pendente' | 'processado' | 'rejeitado';
  uploaded_at: string;
  url?: string;
}

export type TaxGuideRecord = {
  id: string;
  client_id: string;
  client_name: string; 
  type: string;
  reference: string;
  due_date: string;
  amount: number;
  status: 'pendente' | 'pago' | 'vencido';
  bar_code?: string;
  file_path?: string; 
  created_at: string;
}

// Payroll types
export type Employee = {
  id: string;
  client_id: string;
  name: string;
  cpf: string;
  position: string;
  department?: string;
  hire_date: string;
  base_salary: number;
  status: 'active' | 'inactive' | 'vacation' | 'leave';
  created_at?: string;
}

export type PayrollEntry = {
  id: string;
  client_id: string;
  employee_id: string;
  period: string; // YYYY-MM format
  base_salary: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: 'draft' | 'processing' | 'approved' | 'paid';
  created_at?: string;
  updated_at?: string;
}

export type PayrollDeduction = {
  id: string;
  payroll_entry_id: string;
  type: 'inss' | 'irrf' | 'fgts' | 'loan' | 'advance' | 'other';
  description: string;
  amount: number;
  created_at?: string;
}

export type PayrollBenefit = {
  id: string;
  payroll_entry_id: string;
  type: 'transport' | 'meal' | 'health' | 'education' | 'other';
  description: string;
  amount: number;
  created_at?: string;
}
