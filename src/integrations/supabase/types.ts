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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          diagram_id: string | null
          id: string
          messages: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          diagram_id?: string | null
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          diagram_id?: string | null
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_diagram_id_fkey"
            columns: ["diagram_id"]
            isOneToOne: false
            referencedRelation: "diagrams"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_estimates: {
        Row: {
          hourly_cost: number
          id: string
          instance_type: string | null
          last_updated: string
          monthly_cost: number
          region: string
          resource_type: Database["public"]["Enums"]["aws_resource_type"]
        }
        Insert: {
          hourly_cost?: number
          id?: string
          instance_type?: string | null
          last_updated?: string
          monthly_cost?: number
          region?: string
          resource_type: Database["public"]["Enums"]["aws_resource_type"]
        }
        Update: {
          hourly_cost?: number
          id?: string
          instance_type?: string | null
          last_updated?: string
          monthly_cost?: number
          region?: string
          resource_type?: Database["public"]["Enums"]["aws_resource_type"]
        }
        Relationships: []
      }
      diagram_presence: {
        Row: {
          color: string | null
          cursor_x: number | null
          cursor_y: number | null
          diagram_id: string
          id: string
          last_seen: string
          user_id: string
        }
        Insert: {
          color?: string | null
          cursor_x?: number | null
          cursor_y?: number | null
          diagram_id: string
          id?: string
          last_seen?: string
          user_id: string
        }
        Update: {
          color?: string | null
          cursor_x?: number | null
          cursor_y?: number | null
          diagram_id?: string
          id?: string
          last_seen?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagram_presence_diagram_id_fkey"
            columns: ["diagram_id"]
            isOneToOne: false
            referencedRelation: "diagrams"
            referencedColumns: ["id"]
          },
        ]
      }
      diagrams: {
        Row: {
          created_at: string
          description: string | null
          edges: Json
          estimated_monthly_cost: number | null
          iac_code: string | null
          iac_framework: Database["public"]["Enums"]["iac_framework"]
          id: string
          is_public: boolean
          name: string
          nodes: Json
          team_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          edges?: Json
          estimated_monthly_cost?: number | null
          iac_code?: string | null
          iac_framework?: Database["public"]["Enums"]["iac_framework"]
          id?: string
          is_public?: boolean
          name?: string
          nodes?: Json
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          edges?: Json
          estimated_monthly_cost?: number | null
          iac_code?: string | null
          iac_framework?: Database["public"]["Enums"]["iac_framework"]
          id?: string
          is_public?: boolean
          name?: string
          nodes?: Json
          team_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagrams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resource_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          edges: Json
          id: string
          is_builtin: boolean
          name: string
          nodes: Json
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          is_builtin?: boolean
          name: string
          nodes?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          is_builtin?: boolean
          name?: string
          nodes?: Json
        }
        Relationships: []
      }
      security_reports: {
        Row: {
          compliance_status: Json
          diagram_id: string
          id: string
          issues: Json
          scanned_at: string
        }
        Insert: {
          compliance_status?: Json
          diagram_id: string
          id?: string
          issues?: Json
          scanned_at?: string
        }
        Update: {
          compliance_status?: Json
          diagram_id?: string
          id?: string
          issues?: Json
          scanned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_reports_diagram_id_fkey"
            columns: ["diagram_id"]
            isOneToOne: false
            referencedRelation: "diagrams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["app_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member" | "viewer"
      aws_resource_type:
        | "vpc"
        | "subnet"
        | "internet_gateway"
        | "nat_gateway"
        | "route_table"
        | "ec2"
        | "load_balancer"
        | "auto_scaling_group"
        | "launch_template"
        | "rds"
        | "s3"
        | "lambda"
        | "api_gateway"
        | "dynamodb"
        | "security_group"
        | "iam_role"
        | "iam_policy"
        | "cloudfront"
        | "elastic_ip"
        | "efs"
      iac_framework: "terraform" | "cloudformation" | "pulumi"
      security_severity: "info" | "low" | "medium" | "high" | "critical"
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
    Enums: {
      app_role: ["admin", "member", "viewer"],
      aws_resource_type: [
        "vpc",
        "subnet",
        "internet_gateway",
        "nat_gateway",
        "route_table",
        "ec2",
        "load_balancer",
        "auto_scaling_group",
        "launch_template",
        "rds",
        "s3",
        "lambda",
        "api_gateway",
        "dynamodb",
        "security_group",
        "iam_role",
        "iam_policy",
        "cloudfront",
        "elastic_ip",
        "efs",
      ],
      iac_framework: ["terraform", "cloudformation", "pulumi"],
      security_severity: ["info", "low", "medium", "high", "critical"],
    },
  },
} as const
