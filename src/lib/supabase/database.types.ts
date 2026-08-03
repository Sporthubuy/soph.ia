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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          entity_id: string
          entity_title: string
          entity_type: string
          id: string
          organization_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          entity_id: string
          entity_title: string
          entity_type: string
          id?: string
          organization_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_title?: string
          entity_type?: string
          id?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_ratings: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          rating: number
          review: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_ratings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          cloned_from: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invocations: number
          last_invoked_at: string | null
          model: string
          name: string
          organization_id: string
          provider: string
          rating: number
          ratings_count: number
          selected_ku_ids: string[]
          status: string
          system_prompt: string | null
          tags: string[]
          temperature: number
          updated_at: string
          visibility: string
        }
        Insert: {
          cloned_from?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invocations?: number
          last_invoked_at?: string | null
          model?: string
          name: string
          organization_id: string
          provider?: string
          rating?: number
          ratings_count?: number
          selected_ku_ids?: string[]
          status?: string
          system_prompt?: string | null
          tags?: string[]
          temperature?: number
          updated_at?: string
          visibility?: string
        }
        Update: {
          cloned_from?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invocations?: number
          last_invoked_at?: string | null
          model?: string
          name?: string
          organization_id?: string
          provider?: string
          rating?: number
          ratings_count?: number
          selected_ku_ids?: string[]
          status?: string
          system_prompt?: string | null
          tags?: string[]
          temperature?: number
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_cloned_from_fkey"
            columns: ["cloned_from"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          owner_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          owner_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          owner_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["member_role"]
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_units: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: string
          created_at: string
          domain_id: string
          embedding: string | null
          hash: string
          id: string
          organization_id: string
          owner_id: string
          status: Database["public"]["Enums"]["ku_status"]
          title: string
          trust_score: number
          updated_at: string
          version: number
          visibility: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string
          domain_id: string
          embedding?: string | null
          hash: string
          id?: string
          organization_id: string
          owner_id: string
          status?: Database["public"]["Enums"]["ku_status"]
          title: string
          trust_score?: number
          updated_at?: string
          version?: number
          visibility?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string
          domain_id?: string
          embedding?: string | null
          hash?: string
          id?: string
          organization_id?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["ku_status"]
          title?: string
          trust_score?: number
          updated_at?: string
          version?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_units_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_units_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_units_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ku_comments: {
        Row: {
          author_id: string
          body: string
          context: string
          created_at: string
          id: string
          ku_id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          context?: string
          created_at?: string
          id?: string
          ku_id: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          context?: string
          created_at?: string
          id?: string
          ku_id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ku_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ku_comments_ku_id_fkey"
            columns: ["ku_id"]
            isOneToOne: false
            referencedRelation: "knowledge_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ku_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ku_dependencies: {
        Row: {
          created_at: string
          id: string
          source_ku_id: string
          target_ku_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_ku_id: string
          target_ku_id: string
        }
        Update: {
          created_at?: string
          id?: string
          source_ku_id?: string
          target_ku_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ku_dependencies_source_ku_id_fkey"
            columns: ["source_ku_id"]
            isOneToOne: false
            referencedRelation: "knowledge_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ku_dependencies_target_ku_id_fkey"
            columns: ["target_ku_id"]
            isOneToOne: false
            referencedRelation: "knowledge_units"
            referencedColumns: ["id"]
          },
        ]
      }
      ku_versions: {
        Row: {
          change_message: string | null
          changed_by: string
          content: string
          created_at: string
          hash: string
          id: string
          ku_id: string
          title: string
          version: number
        }
        Insert: {
          change_message?: string | null
          changed_by: string
          content: string
          created_at?: string
          hash: string
          id?: string
          ku_id: string
          title: string
          version: number
        }
        Update: {
          change_message?: string | null
          changed_by?: string
          content?: string
          created_at?: string
          hash?: string
          id?: string
          ku_id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ku_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ku_versions_ku_id_fkey"
            columns: ["ku_id"]
            isOneToOne: false
            referencedRelation: "knowledge_units"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_agents: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          project_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          project_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invitations: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_knowledge_units: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          ku_id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          ku_id: string
          project_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          ku_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_knowledge_units_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "project_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_knowledge_units_ku_id_fkey"
            columns: ["ku_id"]
            isOneToOne: false
            referencedRelation: "knowledge_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_knowledge_units_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          organization_id: string
          owner_id: string
          status: string
          updated_at: string
          visibility: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name: string
          organization_id: string
          owner_id: string
          status?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          organization_id?: string
          owner_id?: string
          status?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ai_providers: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          model_name: string | null
          organization_id: string
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string | null
          organization_id: string
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string | null
          organization_id?: string
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_providers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_project: { Args: { p_id: string }; Returns: boolean }
      can_view_project: { Args: { p_id: string }; Returns: boolean }
      increment_agent_invocations: {
        Args: { agent_id: string }
        Returns: undefined
      }
      invite_to_project: {
        Args: {
          p_email: string
          p_project_id: string
          p_role: Database["public"]["Enums"]["project_role"]
        }
        Returns: Json
      }
      is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      match_kus:
        | {
            Args: {
              filter_status?: Database["public"]["Enums"]["ku_status"]
              match_count?: number
              query_embedding: string
              query_organization_id: string
            }
            Returns: {
              content: string
              domain_id: string
              id: string
              organization_id: string
              similarity: number
              status: Database["public"]["Enums"]["ku_status"]
              title: string
            }[]
          }
        | {
            Args: {
              filter_status?: Database["public"]["Enums"]["ku_status"]
              include_public?: boolean
              match_count?: number
              query_embedding: string
              query_organization_id: string
            }
            Returns: {
              content: string
              domain_id: string
              id: string
              organization_id: string
              similarity: number
              status: Database["public"]["Enums"]["ku_status"]
              title: string
              visibility: string
            }[]
          }
      recalc_agent_rating: { Args: { agent_id: string }; Returns: undefined }
    }
    Enums: {
      ku_status: "draft" | "proposed" | "approved" | "archived"
      member_role: "owner" | "admin" | "editor" | "viewer"
      project_role: "admin" | "editor" | "viewer"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ku_status: ["draft", "proposed", "approved", "archived"],
      member_role: ["owner", "admin", "editor", "viewer"],
      project_role: ["admin", "editor", "viewer"],
    },
  },
} as const
