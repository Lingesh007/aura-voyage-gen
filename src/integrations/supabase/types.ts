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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      approval_actions: {
        Row: {
          action: string
          action_by: string
          comment: string | null
          created_at: string
          id: string
          request_id: string
        }
        Insert: {
          action: string
          action_by: string
          comment?: string | null
          created_at?: string
          id?: string
          request_id: string
        }
        Update: {
          action?: string
          action_by?: string
          comment?: string | null
          created_at?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_actions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_details: Json | null
          booking_id: string
          booking_type: string
          created_at: string
          destination: string | null
          id: string
          price: number | null
          status: string | null
          traveler_details: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_details?: Json | null
          booking_id: string
          booking_type: string
          created_at?: string
          destination?: string | null
          id?: string
          price?: number | null
          status?: string | null
          traveler_details?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_details?: Json | null
          booking_id?: string
          booking_type?: string
          created_at?: string
          destination?: string | null
          id?: string
          price?: number | null
          status?: string | null
          traveler_details?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      expense_reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["expense_status"]
          submitted_at: string | null
          title: string
          total_amount: number
          travel_request_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          submitted_at?: string | null
          title: string
          total_amount?: number
          travel_request_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          submitted_at?: string | null
          title?: string
          total_amount?: number
          travel_request_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_reports_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          booking_id: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          currency: string
          description: string | null
          expense_date: string
          id: string
          merchant_name: string | null
          ocr_data: Json | null
          receipt_url: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["expense_status"]
          travel_request_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          description?: string | null
          expense_date?: string
          id?: string
          merchant_name?: string | null
          ocr_data?: Json | null
          receipt_url?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          travel_request_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          description?: string | null
          expense_date?: string
          id?: string
          merchant_name?: string | null
          ocr_data?: Json | null
          receipt_url?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["expense_status"]
          travel_request_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_travel_request_id_fkey"
            columns: ["travel_request_id"]
            isOneToOne: false
            referencedRelation: "travel_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          created_at: string
          current_tier: Database["public"]["Enums"]["loyalty_tier"]
          id: string
          lifetime_points: number
          points_this_year: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_tier?: Database["public"]["Enums"]["loyalty_tier"]
          id?: string
          lifetime_points?: number
          points_this_year?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_tier?: Database["public"]["Enums"]["loyalty_tier"]
          id?: string
          lifetime_points?: number
          points_this_year?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          booking_id: string | null
          created_at: string
          description: string | null
          id: string
          points: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points: number
          transaction_type: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_audit_log: {
        Row: {
          action: string
          changed_by: string
          changes: Json | null
          created_at: string
          id: string
          policy_id: string | null
        }
        Insert: {
          action: string
          changed_by: string
          changes?: Json | null
          created_at?: string
          id?: string
          policy_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string
          changes?: Json | null
          created_at?: string
          id?: string
          policy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_audit_log_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "travel_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_rules: {
        Row: {
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          policy_id: string
          rule_type: Database["public"]["Enums"]["rule_type"]
          updated_at: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          policy_id: string
          rule_type: Database["public"]["Enums"]["rule_type"]
          updated_at?: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          policy_id?: string
          rule_type?: Database["public"]["Enums"]["rule_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_rules_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "travel_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      preferred_vendors: {
        Row: {
          contract_end: string | null
          contract_rate: number | null
          contract_start: string | null
          created_at: string
          created_by: string
          discount_percentage: number | null
          id: string
          is_active: boolean
          notes: string | null
          policy_id: string | null
          updated_at: string
          vendor_name: string
          vendor_type: string
        }
        Insert: {
          contract_end?: string | null
          contract_rate?: number | null
          contract_start?: string | null
          created_at?: string
          created_by: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          notes?: string | null
          policy_id?: string | null
          updated_at?: string
          vendor_name: string
          vendor_type: string
        }
        Update: {
          contract_end?: string | null
          contract_rate?: number | null
          contract_start?: string | null
          created_at?: string
          created_by?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          notes?: string | null
          policy_id?: string | null
          updated_at?: string
          vendor_name?: string
          vendor_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferred_vendors_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "travel_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_saved: boolean | null
          query: string
          search_count: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_saved?: boolean | null
          query: string
          search_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_saved?: boolean | null
          query?: string
          search_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      travel_policies: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      travel_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          departure_date: string
          destination: string
          estimated_budget: number
          id: string
          notes: string | null
          purpose: string
          rejection_reason: string | null
          return_date: string
          status: Database["public"]["Enums"]["request_status"]
          trip_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          departure_date: string
          destination: string
          estimated_budget: number
          id?: string
          notes?: string | null
          purpose: string
          rejection_reason?: string | null
          return_date: string
          status?: Database["public"]["Enums"]["request_status"]
          trip_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          departure_date?: string
          destination?: string
          estimated_budget?: number
          id?: string
          notes?: string | null
          purpose?: string
          rejection_reason?: string | null
          return_date?: string
          status?: Database["public"]["Enums"]["request_status"]
          trip_type?: string | null
          updated_at?: string
          user_id?: string
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
      vendor_spend_summary: {
        Row: {
          avg_transaction: number
          booking_count: number
          created_at: string
          id: string
          period_end: string
          period_start: string
          total_spend: number
          vendor_name: string
          vendor_type: string
        }
        Insert: {
          avg_transaction?: number
          booking_count?: number
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          total_spend?: number
          vendor_name: string
          vendor_type: string
        }
        Update: {
          avg_transaction?: number
          booking_count?: number
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          total_spend?: number
          vendor_name?: string
          vendor_type?: string
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
      is_approver: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "employee"
      expense_category:
        | "flights"
        | "hotels"
        | "meals"
        | "transport"
        | "communication"
        | "entertainment"
        | "office_supplies"
        | "other"
      expense_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "reimbursed"
      loyalty_tier: "bronze" | "silver" | "gold" | "platinum"
      request_status: "pending" | "approved" | "rejected" | "cancelled"
      rule_type:
        | "spend_limit"
        | "approval_required"
        | "preferred_vendor"
        | "advance_booking"
        | "cabin_class"
        | "custom"
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
      app_role: ["admin", "manager", "employee"],
      expense_category: [
        "flights",
        "hotels",
        "meals",
        "transport",
        "communication",
        "entertainment",
        "office_supplies",
        "other",
      ],
      expense_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "reimbursed",
      ],
      loyalty_tier: ["bronze", "silver", "gold", "platinum"],
      request_status: ["pending", "approved", "rejected", "cancelled"],
      rule_type: [
        "spend_limit",
        "approval_required",
        "preferred_vendor",
        "advance_booking",
        "cabin_class",
        "custom",
      ],
    },
  },
} as const
