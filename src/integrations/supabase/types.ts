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
      accounting_firm_subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          firm_id: string | null
          id: string
          monthly_fee: number
          plan_type: string
          start_date: string
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          firm_id?: string | null
          id?: string
          monthly_fee: number
          plan_type: string
          start_date?: string
          status: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          firm_id?: string | null
          id?: string
          monthly_fee?: number
          plan_type?: string
          start_date?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_firm_subscriptions_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      atualizacoes_parametros_log: {
        Row: {
          data_atualizacao: string | null
          detalhes: Json | null
          id: string
          parametro_id: string
          tipo_operacao: string
          usuario_id: string | null
        }
        Insert: {
          data_atualizacao?: string | null
          detalhes?: Json | null
          id?: string
          parametro_id: string
          tipo_operacao: string
          usuario_id?: string | null
        }
        Update: {
          data_atualizacao?: string | null
          detalhes?: Json | null
          id?: string
          parametro_id?: string
          tipo_operacao?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atualizacoes_parametros_log_parametro_id_fkey"
            columns: ["parametro_id"]
            isOneToOne: false
            referencedRelation: "parametros_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_atualizacoes_parametros_log_parametro"
            columns: ["parametro_id"]
            isOneToOne: false
            referencedRelation: "parametros_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      client_access_tokens: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          token: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          token: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_access_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
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
      consultorias_fiscais: {
        Row: {
          api_key: string
          ativo: boolean | null
          atualizacao_automatica: boolean | null
          contato: string | null
          data_integracao: string | null
          email: string | null
          id: string
          nome: string
          notificar_mudancas: boolean | null
          periodo_atualizacao: string
          salvar_historico: boolean | null
          telefone: string | null
          tipos_atualizacao: string[]
          url: string
        }
        Insert: {
          api_key: string
          ativo?: boolean | null
          atualizacao_automatica?: boolean | null
          contato?: string | null
          data_integracao?: string | null
          email?: string | null
          id?: string
          nome: string
          notificar_mudancas?: boolean | null
          periodo_atualizacao: string
          salvar_historico?: boolean | null
          telefone?: string | null
          tipos_atualizacao: string[]
          url: string
        }
        Update: {
          api_key?: string
          ativo?: boolean | null
          atualizacao_automatica?: boolean | null
          contato?: string | null
          data_integracao?: string | null
          email?: string | null
          id?: string
          nome?: string
          notificar_mudancas?: boolean | null
          periodo_atualizacao?: string
          salvar_historico?: boolean | null
          telefone?: string | null
          tipos_atualizacao?: string[]
          url?: string
        }
        Relationships: []
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
      firm_monthly_statistics: {
        Row: {
          active_clients: number
          ai_queries_count: number
          created_at: string
          documents_processed: number
          firm_id: string | null
          id: string
          month: string
          revenue_amount: number
          updated_at: string
        }
        Insert: {
          active_clients?: number
          ai_queries_count?: number
          created_at?: string
          documents_processed?: number
          firm_id?: string | null
          id?: string
          month: string
          revenue_amount?: number
          updated_at?: string
        }
        Update: {
          active_clients?: number
          ai_queries_count?: number
          created_at?: string
          documents_processed?: number
          firm_id?: string | null
          id?: string
          month?: string
          revenue_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "firm_monthly_statistics_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_format: string
          file_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_public: boolean
          report_type: string
          tags: string[] | null
          title: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_format?: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean
          report_type: string
          tags?: string[] | null
          title: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_format?: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean
          report_type?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
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
      parametros_fiscais: {
        Row: {
          aplicado_em: string | null
          ativo: boolean | null
          consultoria_id: string | null
          created_at: string | null
          data_atualizacao: string | null
          id: string
          parametros: Json
          tipo: string
          versao: string
        }
        Insert: {
          aplicado_em?: string | null
          ativo?: boolean | null
          consultoria_id?: string | null
          created_at?: string | null
          data_atualizacao?: string | null
          id?: string
          parametros: Json
          tipo: string
          versao: string
        }
        Update: {
          aplicado_em?: string | null
          ativo?: boolean | null
          consultoria_id?: string | null
          created_at?: string | null
          data_atualizacao?: string | null
          id?: string
          parametros?: Json
          tipo?: string
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_parametros_consultoria"
            columns: ["consultoria_id"]
            isOneToOne: false
            referencedRelation: "consultorias_fiscais"
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
