export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting_clients: {
        Row: {
          accountant_id: string | null
          accounting_firm_id: string | null
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
          accountant_id?: string | null
          accounting_firm_id?: string | null
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
          accountant_id?: string | null
          accounting_firm_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "accounting_clients_accountant_id_fkey"
            columns: ["accountant_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "accounting_clients_accounting_firm_id_fkey"
            columns: ["accounting_firm_id"]
            isOneToOne: false
            referencedRelation: "accounting_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_firm_subscriptions: {
        Row: {
          accounting_firm_id: string | null
          created_at: string
          end_date: string | null
          id: string
          monthly_fee: number
          plan_type: string
          start_date: string
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          accounting_firm_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_fee: number
          plan_type: string
          start_date?: string
          status: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          accounting_firm_id?: string | null
          created_at?: string
          end_date?: string | null
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
            foreignKeyName: "accounting_firm_subscriptions_accounting_firm_id_fkey"
            columns: ["accounting_firm_id"]
            isOneToOne: false
            referencedRelation: "accounting_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_firms: {
        Row: {
          address: string | null
          cnpj: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
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
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      archived_data: {
        Row: {
          archive_reason: string
          archived_at: string
          archived_data: Json
          id: string
          metadata: Json | null
          original_id: string
          original_table: string
        }
        Insert: {
          archive_reason?: string
          archived_at?: string
          archived_data: Json
          id?: string
          metadata?: Json | null
          original_id: string
          original_table: string
        }
        Update: {
          archive_reason?: string
          archived_at?: string
          archived_data?: Json
          id?: string
          metadata?: Json | null
          original_id?: string
          original_table?: string
        }
        Relationships: []
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
        ]
      }
      automated_actions_log: {
        Row: {
          action_type: string
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          success: boolean
        }
        Insert: {
          action_type: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          success?: boolean
        }
        Update: {
          action_type?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "automated_actions_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          error_details: Json | null
          errors_count: number | null
          id: string
          metadata: Json | null
          process_type: string
          records_processed: number | null
          started_at: string
          status: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_details?: Json | null
          errors_count?: number | null
          id?: string
          metadata?: Json | null
          process_type: string
          records_processed?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_details?: Json | null
          errors_count?: number | null
          id?: string
          metadata?: Json | null
          process_type?: string
          records_processed?: number | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          error_count: number
          id: string
          last_run: string | null
          name: string
          success_count: number
          trigger_conditions: Json
          trigger_type: string
          type: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          error_count?: number
          id?: string
          last_run?: string | null
          name: string
          success_count?: number
          trigger_conditions?: Json
          trigger_type: string
          type?: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          error_count?: number
          id?: string
          last_run?: string | null
          name?: string
          success_count?: number
          trigger_conditions?: Json
          trigger_type?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      balancetes: {
        Row: {
          client_id: string
          created_at: string
          data_geracao: string
          gerado_por: string | null
          id: string
          observacoes: string | null
          periodo_fim: string
          periodo_inicio: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          data_geracao?: string
          gerado_por?: string | null
          id?: string
          observacoes?: string | null
          periodo_fim: string
          periodo_inicio: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          data_geracao?: string
          gerado_por?: string | null
          id?: string
          observacoes?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "balancetes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      balancetes_itens: {
        Row: {
          balancete_id: string
          conta_id: string
          created_at: string
          creditos_periodo: number
          debitos_periodo: number
          id: string
          saldo_anterior: number
          saldo_atual: number
        }
        Insert: {
          balancete_id: string
          conta_id: string
          created_at?: string
          creditos_periodo?: number
          debitos_periodo?: number
          id?: string
          saldo_anterior?: number
          saldo_atual?: number
        }
        Update: {
          balancete_id?: string
          conta_id?: string
          created_at?: string
          creditos_periodo?: number
          debitos_periodo?: number
          id?: string
          saldo_anterior?: number
          saldo_atual?: number
        }
        Relationships: [
          {
            foreignKeyName: "balancetes_itens_balancete_id_fkey"
            columns: ["balancete_id"]
            isOneToOne: false
            referencedRelation: "balancetes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balancetes_itens_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_dashboards: {
        Row: {
          created_at: string
          created_by: string | null
          dashboard_config: Json
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dashboard_config?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dashboard_config?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      centro_custos: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
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
      closing_checklist_items: {
        Row: {
          actual_minutes: number | null
          closing_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          error_message: string | null
          estimated_minutes: number | null
          id: string
          item_name: string
          item_type: string
          metadata: Json | null
          priority: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          actual_minutes?: number | null
          closing_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          estimated_minutes?: number | null
          id?: string
          item_name: string
          item_type: string
          metadata?: Json | null
          priority?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          actual_minutes?: number | null
          closing_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          estimated_minutes?: number | null
          id?: string
          item_name?: string
          item_type?: string
          metadata?: Json | null
          priority?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "closing_checklist_items_closing_id_fkey"
            columns: ["closing_id"]
            isOneToOne: false
            referencedRelation: "monthly_closing_status"
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
      correction_history: {
        Row: {
          action_taken: string
          corrected_by: string | null
          correction_notes: string | null
          created_at: string
          error_classification_id: string | null
          id: string
          metadata: Json | null
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          action_taken: string
          corrected_by?: string | null
          correction_notes?: string | null
          created_at?: string
          error_classification_id?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          action_taken?: string
          corrected_by?: string | null
          correction_notes?: string | null
          created_at?: string
          error_classification_id?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "correction_history_error_classification_id_fkey"
            columns: ["error_classification_id"]
            isOneToOne: false
            referencedRelation: "error_classifications"
            referencedColumns: ["id"]
          },
        ]
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
      error_classifications: {
        Row: {
          confidence_score: number | null
          corrected_classification: string | null
          created_at: string
          document_id: string | null
          error_type: string
          id: string
          metadata: Json | null
          original_classification: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
        }
        Insert: {
          confidence_score?: number | null
          corrected_classification?: string | null
          created_at?: string
          document_id?: string | null
          error_type: string
          id?: string
          metadata?: Json | null
          original_classification: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
        }
        Update: {
          confidence_score?: number | null
          corrected_classification?: string | null
          created_at?: string
          document_id?: string | null
          error_type?: string
          id?: string
          metadata?: Json | null
          original_classification?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_classifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "client_documents"
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
          client_email: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          download_count: number | null
          email_sent: boolean | null
          error_message: string | null
          expires_at: string | null
          file_format: string
          file_path: string | null
          file_size: number | null
          file_url: string | null
          generation_status: string | null
          id: string
          is_public: boolean
          report_type: string
          tags: string[] | null
          template_id: string | null
          title: string
        }
        Insert: {
          client_email?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          email_sent?: boolean | null
          error_message?: string | null
          expires_at?: string | null
          file_format?: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          generation_status?: string | null
          id?: string
          is_public?: boolean
          report_type: string
          tags?: string[] | null
          template_id?: string | null
          title: string
        }
        Update: {
          client_email?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          email_sent?: boolean | null
          error_message?: string | null
          expires_at?: string | null
          file_format?: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          generation_status?: string | null
          id?: string
          is_public?: boolean
          report_type?: string
          tags?: string[] | null
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
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
      integracoes_externas: {
        Row: {
          client_id: string
          configuracoes: Json | null
          created_at: string
          credenciais: Json
          id: string
          proxima_sincronizacao: string | null
          status: string
          tipo_integracao: string
          ultima_sincronizacao: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          configuracoes?: Json | null
          created_at?: string
          credenciais?: Json
          id?: string
          proxima_sincronizacao?: string | null
          status?: string
          tipo_integracao: string
          ultima_sincronizacao?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          configuracoes?: Json | null
          created_at?: string
          credenciais?: Json
          id?: string
          proxima_sincronizacao?: string | null
          status?: string
          tipo_integracao?: string
          ultima_sincronizacao?: string | null
          updated_at?: string
        }
        Relationships: []
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
      lancamentos_contabeis: {
        Row: {
          client_id: string
          created_at: string
          data_competencia: string
          data_lancamento: string
          data_lancamento_sistema: string
          historico: string
          id: string
          numero_documento: string | null
          numero_lancamento: string
          observacoes: string | null
          origem: string
          status: string
          tipo_documento: string | null
          updated_at: string
          usuario_lancamento: string | null
          valor_total: number
        }
        Insert: {
          client_id: string
          created_at?: string
          data_competencia: string
          data_lancamento: string
          data_lancamento_sistema?: string
          historico: string
          id?: string
          numero_documento?: string | null
          numero_lancamento: string
          observacoes?: string | null
          origem?: string
          status?: string
          tipo_documento?: string | null
          updated_at?: string
          usuario_lancamento?: string | null
          valor_total: number
        }
        Update: {
          client_id?: string
          created_at?: string
          data_competencia?: string
          data_lancamento?: string
          data_lancamento_sistema?: string
          historico?: string
          id?: string
          numero_documento?: string | null
          numero_lancamento?: string
          observacoes?: string | null
          origem?: string
          status?: string
          tipo_documento?: string | null
          updated_at?: string
          usuario_lancamento?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_contabeis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos_itens: {
        Row: {
          centro_custo_id: string | null
          conta_id: string
          created_at: string
          historico_complementar: string | null
          id: string
          lancamento_id: string
          tipo_movimento: string
          valor: number
        }
        Insert: {
          centro_custo_id?: string | null
          conta_id: string
          created_at?: string
          historico_complementar?: string | null
          id?: string
          lancamento_id: string
          tipo_movimento: string
          valor: number
        }
        Update: {
          centro_custo_id?: string | null
          conta_id?: string
          created_at?: string
          historico_complementar?: string | null
          id?: string
          lancamento_id?: string
          tipo_movimento?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_itens_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centro_custos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_itens_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "plano_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_itens_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos_contabeis"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_sincronizacao: {
        Row: {
          completed_at: string | null
          created_at: string
          erro_detalhes: Json | null
          id: string
          integracao_id: string
          metadata: Json | null
          registros_processados: number | null
          registros_total: number | null
          started_at: string
          status: string
          tipo_operacao: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          erro_detalhes?: Json | null
          id?: string
          integracao_id: string
          metadata?: Json | null
          registros_processados?: number | null
          registros_total?: number | null
          started_at?: string
          status?: string
          tipo_operacao: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          erro_detalhes?: Json | null
          id?: string
          integracao_id?: string
          metadata?: Json | null
          registros_processados?: number | null
          registros_total?: number | null
          started_at?: string
          status?: string
          tipo_operacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_sincronizacao_integracao_id_fkey"
            columns: ["integracao_id"]
            isOneToOne: false
            referencedRelation: "integracoes_externas"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_closing_status: {
        Row: {
          assigned_to: string | null
          blocking_issues: Json | null
          client_id: string
          completed_at: string | null
          confidence_score: number | null
          created_at: string
          documents_processed: number | null
          documents_total: number | null
          id: string
          last_activity: string | null
          manual_adjustments_count: number | null
          period_month: number
          period_year: number
          started_at: string | null
          status: string
          updated_at: string
          validations_passed: number | null
          validations_total: number | null
        }
        Insert: {
          assigned_to?: string | null
          blocking_issues?: Json | null
          client_id: string
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          documents_processed?: number | null
          documents_total?: number | null
          id?: string
          last_activity?: string | null
          manual_adjustments_count?: number | null
          period_month: number
          period_year: number
          started_at?: string | null
          status?: string
          updated_at?: string
          validations_passed?: number | null
          validations_total?: number | null
        }
        Update: {
          assigned_to?: string | null
          blocking_issues?: Json | null
          client_id?: string
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          documents_processed?: number | null
          documents_total?: number | null
          id?: string
          last_activity?: string | null
          manual_adjustments_count?: number | null
          period_month?: number
          period_year?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          validations_passed?: number | null
          validations_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_closing_status_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_escalation_rules: {
        Row: {
          category: string
          created_at: string
          escalate_after_minutes: number
          escalate_to_role: string | null
          escalate_to_user_id: string | null
          id: string
          is_active: boolean | null
          priority: number
        }
        Insert: {
          category: string
          created_at?: string
          escalate_after_minutes: number
          escalate_to_role?: string | null
          escalate_to_user_id?: string | null
          id?: string
          is_active?: boolean | null
          priority: number
        }
        Update: {
          category?: string
          created_at?: string
          escalate_after_minutes?: number
          escalate_to_role?: string | null
          escalate_to_user_id?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          categories_subscribed: string[] | null
          created_at: string
          email_enabled: boolean | null
          id: string
          priority_threshold: number | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categories_subscribed?: string[] | null
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          priority_threshold?: number | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categories_subscribed?: string[] | null
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          priority_threshold?: number | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          category: string
          created_at: string
          expires_at: string | null
          id: string
          is_acknowledged: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: number
          source_id: string | null
          source_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          category: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: number
          source_id?: string | null
          source_type?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: number
          source_id?: string | null
          source_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      payment_alerts: {
        Row: {
          alert_sent_date: string | null
          alert_type: string
          client_id: string
          created_at: string | null
          email_sent: boolean | null
          id: string
          payment_due_date: string
          updated_at: string | null
        }
        Insert: {
          alert_sent_date?: string | null
          alert_type: string
          client_id: string
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          payment_due_date: string
          updated_at?: string | null
        }
        Update: {
          alert_sent_date?: string | null
          alert_type?: string
          client_id?: string
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          payment_due_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts: {
        Row: {
          alert_type: string
          created_at: string
          current_value: number
          id: string
          is_resolved: boolean
          message: string
          metadata: Json
          metric_name: string
          resolved_at: string | null
          severity: string
          threshold_value: number
          updated_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          current_value: number
          id?: string
          is_resolved?: boolean
          message: string
          metadata?: Json
          metric_name: string
          resolved_at?: string | null
          severity: string
          threshold_value: number
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          current_value?: number
          id?: string
          is_resolved?: boolean
          message?: string
          metadata?: Json
          metric_name?: string
          resolved_at?: string | null
          severity?: string
          threshold_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          cpu_usage_percent: number
          created_at: string
          error_rate: number
          execution_time_ms: number
          function_name: string
          id: string
          memory_usage_mb: number
          metadata: Json | null
          throughput_per_second: number
          timestamp: string
        }
        Insert: {
          cpu_usage_percent?: number
          created_at?: string
          error_rate?: number
          execution_time_ms: number
          function_name: string
          id?: string
          memory_usage_mb?: number
          metadata?: Json | null
          throughput_per_second?: number
          timestamp?: string
        }
        Update: {
          cpu_usage_percent?: number
          created_at?: string
          error_rate?: number
          execution_time_ms?: number
          function_name?: string
          id?: string
          memory_usage_mb?: number
          metadata?: Json | null
          throughput_per_second?: number
          timestamp?: string
        }
        Relationships: []
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
      plano_contas: {
        Row: {
          aceita_lancamento: boolean
          ativo: boolean
          codigo: string
          conta_pai_id: string | null
          created_at: string
          grau: number
          id: string
          natureza: string
          nome: string
          observacoes: string | null
          subtipo: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          aceita_lancamento?: boolean
          ativo?: boolean
          codigo: string
          conta_pai_id?: string | null
          created_at?: string
          grau?: number
          id?: string
          natureza?: string
          nome: string
          observacoes?: string | null
          subtipo?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          aceita_lancamento?: boolean
          ativo?: boolean
          codigo?: string
          conta_pai_id?: string | null
          created_at?: string
          grau?: number
          id?: string
          natureza?: string
          nome?: string
          observacoes?: string | null
          subtipo?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_contas_conta_pai_id_fkey"
            columns: ["conta_pai_id"]
            isOneToOne: false
            referencedRelation: "plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_accounting_data: {
        Row: {
          calculated_taxes: Json
          client_id: string
          created_at: string
          expenses: number
          id: string
          net_income: number
          period: string
          processed_documents: Json
          revenue: number
          taxable_income: number
          updated_at: string
        }
        Insert: {
          calculated_taxes?: Json
          client_id: string
          created_at?: string
          expenses?: number
          id?: string
          net_income?: number
          period: string
          processed_documents?: Json
          revenue?: number
          taxable_income?: number
          updated_at?: string
        }
        Update: {
          calculated_taxes?: Json
          client_id?: string
          created_at?: string
          expenses?: number
          id?: string
          net_income?: number
          period?: string
          processed_documents?: Json
          revenue?: number
          taxable_income?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_accounting_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_queue: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          error_details: Json | null
          id: string
          max_retries: number
          parameters: Json
          priority: number
          process_type: string
          result: Json | null
          retry_count: number
          scheduled_at: string
          started_at: string | null
          status: string
          timeout_at: string | null
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          max_retries?: number
          parameters?: Json
          priority?: number
          process_type: string
          result?: Json | null
          retry_count?: number
          scheduled_at?: string
          started_at?: string | null
          status?: string
          timeout_at?: string | null
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          max_retries?: number
          parameters?: Json
          priority?: number
          process_type?: string
          result?: Json | null
          retry_count?: number
          scheduled_at?: string
          started_at?: string | null
          status?: string
          timeout_at?: string | null
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_queue_client_id_fkey"
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
      report_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          template_config: Json
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          template_config?: Json
          template_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          template_config?: Json
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          cron_expression: string
          description: string | null
          enabled: boolean
          error_count: number
          function_name: string
          id: string
          last_run: string | null
          name: string
          next_run: string | null
          parameters: Json
          success_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cron_expression: string
          description?: string | null
          enabled?: boolean
          error_count?: number
          function_name: string
          id?: string
          last_run?: string | null
          name: string
          next_run?: string | null
          parameters?: Json
          success_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cron_expression?: string
          description?: string | null
          enabled?: boolean
          error_count?: number
          function_name?: string
          id?: string
          last_run?: string | null
          name?: string
          next_run?: string | null
          parameters?: Json
          success_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          client_id: string
          created_at: string
          email_recipients: string[]
          id: string
          is_active: boolean
          last_run: string | null
          next_run: string | null
          schedule_cron: string
          template_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email_recipients?: string[]
          id?: string
          is_active?: boolean
          last_run?: string | null
          next_run?: string | null
          schedule_cron: string
          template_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email_recipients?: string[]
          id?: string
          is_active?: boolean
          last_run?: string | null
          next_run?: string | null
          schedule_cron?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "accounting_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
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
      system_metrics: {
        Row: {
          created_at: string
          id: string
          labels: Json
          metric_name: string
          metric_type: string
          metric_value: number
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          labels?: Json
          metric_name: string
          metric_type: string
          metric_value: number
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          labels?: Json
          metric_name?: string
          metric_type?: string
          metric_value?: number
          timestamp?: string
        }
        Relationships: []
      }
      system_performance_metrics: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
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
      worker_instances: {
        Row: {
          created_at: string
          current_task_count: number
          current_task_id: string | null
          function_name: string
          id: string
          last_heartbeat: string
          max_concurrent_tasks: number
          metadata: Json | null
          started_at: string
          status: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          current_task_count?: number
          current_task_id?: string | null
          function_name: string
          id?: string
          last_heartbeat?: string
          max_concurrent_tasks?: number
          metadata?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          current_task_count?: number
          current_task_id?: string | null
          function_name?: string
          id?: string
          last_heartbeat?: string
          max_concurrent_tasks?: number
          metadata?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_instances_current_task_id_fkey"
            columns: ["current_task_id"]
            isOneToOne: false
            referencedRelation: "processing_queue"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      calculate_next_cron_run: {
        Args: { cron_expression: string; from_time?: string }
        Returns: string
      }
      check_overdue_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_reports: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_offline_workers: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_orphaned_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_queue_task: {
        Args: {
          p_task_id: string
          p_worker_id: string
          p_success: boolean
          p_result?: Json
          p_error_details?: Json
        }
        Returns: boolean
      }
      create_notification_with_escalation: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type: string
          p_priority: number
          p_category: string
          p_source_id?: string
          p_source_type?: string
          p_metadata?: Json
        }
        Returns: string
      }
      get_accountant_clients: {
        Args: { accountant_user_id?: string }
        Returns: {
          id: string
          name: string
          cnpj: string
          email: string
          status: string
          regime: string
          created_at: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_pending_payment_alerts: {
        Args: Record<PropertyKey, never>
        Returns: {
          alert_id: string
          client_id: string
          client_name: string
          client_email: string
          alert_type: string
          payment_due_date: string
          days_until_due: number
          alert_sent_date: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      process_queue_item: {
        Args: { p_worker_id: string }
        Returns: Json
      }
      upsert_integracao_externa: {
        Args: {
          p_client_id: string
          p_tipo_integracao: string
          p_credenciais: Json
          p_status?: string
        }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
