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
      certificados_digitais: {
        Row: {
          arquivo: string
          client_id: string
          created_at: string
          id: string
          nome: string
          senha: string
          tipo: string
          updated_at: string
          valido_ate: string | null
        }
        Insert: {
          arquivo: string
          client_id: string
          created_at?: string
          id?: string
          nome: string
          senha: string
          tipo?: string
          updated_at?: string
          valido_ate?: string | null
        }
        Update: {
          arquivo?: string
          client_id?: string
          created_at?: string
          id?: string
          nome?: string
          senha?: string
          tipo?: string
          updated_at?: string
          valido_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificados_digitais_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
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
      declaracoes_simples_nacional: {
        Row: {
          ano: number
          client_id: string
          cnpj: string
          created_at: string
          data_consulta: string
          id: string
          impostos: Json | null
          mes: number | null
          receita_bruta: number
          situacao: string | null
          updated_at: string
        }
        Insert: {
          ano: number
          client_id: string
          cnpj: string
          created_at?: string
          data_consulta?: string
          id?: string
          impostos?: Json | null
          mes?: number | null
          receita_bruta: number
          situacao?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number
          client_id?: string
          cnpj?: string
          created_at?: string
          data_consulta?: string
          id?: string
          impostos?: Json | null
          mes?: number | null
          receita_bruta?: number
          situacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "declaracoes_simples_nacional_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      document_classifications: {
        Row: {
          category: string
          classified_at: string
          confidence: number | null
          created_at: string
          document_id: string
          id: string
          metadata: Json | null
        }
        Insert: {
          category: string
          classified_at?: string
          confidence?: number | null
          created_at?: string
          document_id: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          category?: string
          classified_at?: string
          confidence?: number | null
          created_at?: string
          document_id?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_classifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
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
      pix_payments: {
        Row: {
          amount: string
          client_id: string
          completed_at: string | null
          created_at: string
          description: string
          end_to_end_id: string
          error_message: string | null
          id: string
          initiated_at: string
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: string
          client_id: string
          completed_at?: string | null
          created_at?: string
          description: string
          end_to_end_id: string
          error_message?: string | null
          id?: string
          initiated_at: string
          status: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: string
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          end_to_end_id?: string
          error_message?: string | null
          id?: string
          initiated_at?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pix_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      procuracoes_eletronicas: {
        Row: {
          certificado_id: string | null
          client_id: string
          comprovante_url: string | null
          created_at: string | null
          data_emissao: string | null
          data_validade: string
          id: string
          log_processamento: string[] | null
          procuracao_numero: string | null
          procurador_cpf: string
          procurador_nome: string
          servicos_autorizados: string[]
          status: string
          updated_at: string | null
        }
        Insert: {
          certificado_id?: string | null
          client_id: string
          comprovante_url?: string | null
          created_at?: string | null
          data_emissao?: string | null
          data_validade: string
          id?: string
          log_processamento?: string[] | null
          procuracao_numero?: string | null
          procurador_cpf: string
          procurador_nome: string
          servicos_autorizados: string[]
          status: string
          updated_at?: string | null
        }
        Update: {
          certificado_id?: string | null
          client_id?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_emissao?: string | null
          data_validade?: string
          id?: string
          log_processamento?: string[] | null
          procuracao_numero?: string | null
          procurador_cpf?: string
          procurador_nome?: string
          servicos_autorizados?: string[]
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procuracoes_eletronicas_certificado_id_fkey"
            columns: ["certificado_id"]
            isOneToOne: false
            referencedRelation: "certificados_digitais"
            referencedColumns: ["id"]
          },
        ]
      }
      sefaz_sp_scrapes: {
        Row: {
          client_id: string
          competencia: string | null
          created_at: string | null
          data_vencimento: string | null
          id: string
          numero_guia: string | null
          scraped_at: string | null
          status: string | null
          valor: string | null
        }
        Insert: {
          client_id: string
          competencia?: string | null
          created_at?: string | null
          data_vencimento?: string | null
          id?: string
          numero_guia?: string | null
          scraped_at?: string | null
          status?: string | null
          valor?: string | null
        }
        Update: {
          client_id?: string
          competencia?: string | null
          created_at?: string | null
          data_vencimento?: string | null
          id?: string
          numero_guia?: string | null
          scraped_at?: string | null
          status?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sefaz_sp_scrapes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sefaz_xml_uploads: {
        Row: {
          client_id: string
          conteudo_xml: string
          created_at: string
          dados_processados: Json | null
          descricao: string | null
          id: string
          nome_arquivo: string
          status: string
          tamanho_arquivo: number
          tipo_documento: string
          uf: string
          updated_at: string
          upload_manual: boolean
        }
        Insert: {
          client_id: string
          conteudo_xml: string
          created_at?: string
          dados_processados?: Json | null
          descricao?: string | null
          id?: string
          nome_arquivo: string
          status?: string
          tamanho_arquivo: number
          tipo_documento: string
          uf: string
          updated_at?: string
          upload_manual?: boolean
        }
        Update: {
          client_id?: string
          conteudo_xml?: string
          created_at?: string
          dados_processados?: Json | null
          descricao?: string | null
          id?: string
          nome_arquivo?: string
          status?: string
          tamanho_arquivo?: number
          tipo_documento?: string
          uf?: string
          updated_at?: string
          upload_manual?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sefaz_xml_uploads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      serpro_api_credentials: {
        Row: {
          ambiente: string
          client_id: string
          client_secret: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          ambiente?: string
          client_id: string
          client_secret: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          ambiente?: string
          client_id?: string
          client_secret?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          invited_by_name: string
          role: string
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          invited_by_name: string
          role: string
          status?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          invited_by_name?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: []
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
      initiate_pix_payment: {
        Args: {
          p_client_id: string
          p_pix_key: string
          p_amount: string
          p_description: string
        }
        Returns: Json
      }
      invoke_sefaz_scraper: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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
