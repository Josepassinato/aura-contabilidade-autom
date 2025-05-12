export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounting_clients: {
        Row: {
          address: string | null
          cnpj: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          regime: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnpj: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          regime: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnpj?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          regime?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string | null
          file_path: string | null
          id: string
          name: string
          size: number | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          file_path?: string | null
          id?: string
          name: string
          size?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          file_path?: string | null
          id?: string
          name?: string
          size?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          base_salary: number
          client_id: string
          cpf: string
          created_at: string | null
          department: string | null
          hire_date: string
          id: string
          name: string
          notes: string | null
          position: string
          status: string
          updated_at: string | null
        }
        Insert: {
          base_salary: number
          client_id: string
          cpf: string
          created_at?: string | null
          department?: string | null
          hire_date: string
          id?: string
          name: string
          notes?: string | null
          position: string
          status: string
          updated_at?: string | null
        }
        Update: {
          base_salary?: number
          client_id?: string
          cpf?: string
          created_at?: string | null
          department?: string | null
          hire_date?: string
          id?: string
          name?: string
          notes?: string | null
          position?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      integracoes_estaduais: {
        Row: {
          certificado_info: Json | null
          client_id: string
          created_at: string | null
          id: string
          mensagem_erro: string | null
          nome: string
          proxima_renovacao: string | null
          status: string
          uf: string
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          certificado_info?: Json | null
          client_id: string
          created_at?: string | null
          id?: string
          mensagem_erro?: string | null
          nome: string
          proxima_renovacao?: string | null
          status?: string
          uf: string
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          certificado_info?: Json | null
          client_id?: string
          created_at?: string | null
          id?: string
          mensagem_erro?: string | null
          nome?: string
          proxima_renovacao?: string | null
          status?: string
          uf?: string
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integracoes_estaduais_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      integracoes_simples_nacional: {
        Row: {
          certificado_digital: string | null
          client_id: string
          cnpj: string
          codigo_acesso: string | null
          created_at: string | null
          id: string
          proxima_renovacao: string | null
          status: string
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          certificado_digital?: string | null
          client_id: string
          cnpj: string
          codigo_acesso?: string | null
          created_at?: string | null
          id?: string
          proxima_renovacao?: string | null
          status?: string
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          certificado_digital?: string | null
          client_id?: string
          cnpj?: string
          codigo_acesso?: string | null
          created_at?: string | null
          id?: string
          proxima_renovacao?: string | null
          status?: string
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integracoes_simples_nacional_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      obrigacoes_fiscais: {
        Row: {
          client_id: string | null
          created_at: string | null
          empresa: string
          id: string
          nome: string
          prazo: string
          prioridade: string
          status: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          empresa: string
          id?: string
          nome: string
          prazo: string
          prioridade: string
          status: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          empresa?: string
          id?: string
          nome?: string
          prazo?: string
          prioridade?: string
          status?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obrigacoes_fiscais_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
