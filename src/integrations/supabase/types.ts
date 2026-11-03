export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      compras: {
        Row: {
          arquivo_path: string | null
          catalogo_path: string | null
          cpf: string | null
          criado_em: string
          downloads: number
          downloads_catalogo: number
          downloads_manual: number
          email: string
          email_enviado_em: string | null
          expira_em: string
          id: string
          origem: string
          primeiro_utm: Json | null
          produto: string
          session_id: string | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string
          token_download: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          valor_centavos: number
        }
        Insert: {
          arquivo_path?: string | null
          catalogo_path?: string | null
          cpf?: string | null
          criado_em?: string
          downloads?: number
          downloads_catalogo?: number
          downloads_manual?: number
          email: string
          email_enviado_em?: string | null
          expira_em?: string
          id?: string
          origem?: string
          primeiro_utm?: Json | null
          produto?: string
          session_id?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id: string
          token_download?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor_centavos: number
        }
        Update: {
          arquivo_path?: string | null
          catalogo_path?: string | null
          cpf?: string | null
          criado_em?: string
          downloads?: number
          downloads_catalogo?: number
          downloads_manual?: number
          email?: string
          email_enviado_em?: string | null
          expira_em?: string
          id?: string
          origem?: string
          primeiro_utm?: Json | null
          produto?: string
          session_id?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string
          token_download?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor_centavos?: number
        }
        Relationships: []
      }
      eventos_funil: {
        Row: {
          criado_em: string
          dispositivo: string | null
          evento: string
          id: string
          pagina: string | null
          props: Json
          session_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          criado_em?: string
          dispositivo?: string | null
          evento: string
          id?: string
          pagina?: string | null
          props?: Json
          session_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          criado_em?: string
          dispositivo?: string | null
          evento?: string
          id?: string
          pagina?: string | null
          props?: Json
          session_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      investimento_campanhas: {
        Row: {
          atualizado_em: string
          criado_em: string
          dia: string
          id: string
          observacao: string | null
          utm_campaign: string
          valor_centavos: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          dia: string
          id?: string
          observacao?: string | null
          utm_campaign: string
          valor_centavos: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          dia?: string
          id?: string
          observacao?: string | null
          utm_campaign?: string
          valor_centavos?: number
        }
        Relationships: []
      }
      lead_emails: {
        Row: {
          email: string
          enviado_em: string
          etapa: string
        }
        Insert: {
          email: string
          enviado_em?: string
          etapa: string
        }
        Update: {
          email?: string
          enviado_em?: string
          etapa?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          consentimento_em: string
          consentimento_texto: string
          criado_em: string
          descadastrado_em: string | null
          dispositivo: string | null
          email: string
          id: string
          nome: string
          origem: string
          origem_formulario: string | null
          pagina_entrada: string | null
          perfil: string
          primeiro_utm: Json | null
          referrer: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          consentimento_em?: string
          consentimento_texto: string
          criado_em?: string
          descadastrado_em?: string | null
          dispositivo?: string | null
          email: string
          id?: string
          nome: string
          origem?: string
          origem_formulario?: string | null
          pagina_entrada?: string | null
          perfil: string
          primeiro_utm?: Json | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          consentimento_em?: string
          consentimento_texto?: string
          criado_em?: string
          descadastrado_em?: string | null
          dispositivo?: string | null
          email?: string
          id?: string
          nome?: string
          origem?: string
          origem_formulario?: string | null
          pagina_entrada?: string | null
          perfil?: string
          primeiro_utm?: Json | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          criado_em: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin_if_none: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
