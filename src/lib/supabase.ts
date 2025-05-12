
// Este é um arquivo falso para supabase apenas para efeitos de demonstração
// Em um projeto real, este arquivo teria uma conexão real com o Supabase

import { createClient } from '@supabase/supabase-js';

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

// Um hook falso para usar como mock
export function useSupabaseClient() {
  // Este é um cliente falso - substitua pela implementação real conforme necessário
  const mockClient = {
    from: (tableName: string) => {
      // Implementação simulada - retorna funções que simulam o comportamento do Supabase
      return {
        select: (columns: string) => ({
          eq: (column: string, value: any) => ({
            eq: (column: string, value: any) => ({
              order: (column: string, { ascending = false } = {}) => ({
                then: (callback: () => void) => callback()
              })
            }),
            order: (column: string, { ascending = false } = {}) => ({
              then: (callback: () => void) => callback()
            })
          }),
          order: (column: string, { ascending = false } = {}) => ({
            then: (callback: () => void) => callback()
          })
        }),
        insert: (data: any[]) => ({
          select: () => ({
            then: (callback: () => void) => callback()
          })
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            then: (callback: () => void) => callback()
          })
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            then: (callback: () => void) => callback()
          })
        })
      };
    },
    auth: {
      signOut: () => Promise.resolve({})
    }
  };

  // Fingindo que estamos retornando um cliente Supabase
  return mockClient as any;
}
