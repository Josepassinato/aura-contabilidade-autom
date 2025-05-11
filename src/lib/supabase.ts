
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
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials are missing. Please check your environment variables.');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

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
  url?: string;
  created_at: string;
}
