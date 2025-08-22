export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          company: string | null
          source: string | null
          status: string | null
          stage: string | null
          notes: string | null
          configuration: Json | null
          quote_amount: number | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          consent_marketing: boolean | null
          consent_timestamp: string | null
          model_interest: string | null
          assigned_to: string | null
          next_action: string | null
          next_action_date: string | null
          lead_score: number | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          company?: string | null
          source?: string | null
          status?: string | null
          stage?: string | null
          notes?: string | null
          configuration?: Json | null
          quote_amount?: number | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          consent_marketing?: boolean | null
          consent_timestamp?: string | null
          model_interest?: string | null
          assigned_to?: string | null
          next_action?: string | null
          next_action_date?: string | null
          lead_score?: number | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          company?: string | null
          source?: string | null
          status?: string | null
          stage?: string | null
          notes?: string | null
          configuration?: Json | null
          quote_amount?: number | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          consent_marketing?: boolean | null
          consent_timestamp?: string | null
          model_interest?: string | null
          assigned_to?: string | null
          next_action?: string | null
          next_action_date?: string | null
          lead_score?: number | null
          tags?: string[] | null
        }
      }
      production_jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          job_number: string
          order_number: string
          customer_name: string
          customer_id: string | null
          model: string
          chassis_number: string | null
          registration: string | null
          status: string
          current_stage: string | null
          priority: number
          start_date: string
          target_date: string
          completed_stages: string[]
          stage_progress: Json
          assigned_team: string[]
          issues: Json[]
          photos: Json[]
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          job_number: string
          order_number: string
          customer_name: string
          customer_id?: string | null
          model: string
          chassis_number?: string | null
          registration?: string | null
          status?: string
          current_stage?: string | null
          priority?: number
          start_date: string
          target_date: string
          completed_stages?: string[]
          stage_progress?: Json
          assigned_team?: string[]
          issues?: Json[]
          photos?: Json[]
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          job_number?: string
          order_number?: string
          customer_name?: string
          customer_id?: string | null
          model?: string
          chassis_number?: string | null
          registration?: string | null
          status?: string
          current_stage?: string | null
          priority?: number
          start_date?: string
          target_date?: string
          completed_stages?: string[]
          stage_progress?: Json
          assigned_team?: string[]
          issues?: Json[]
          photos?: Json[]
          notes?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          order_number: string
          lead_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          model: string
          configuration: Json
          base_price: number
          options_price: number
          vat_amount: number
          total_price: number
          deposit_amount: number | null
          deposit_paid: boolean
          finance_option: string | null
          status: string
          production_job_id: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          order_number: string
          lead_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          model: string
          configuration: Json
          base_price: number
          options_price: number
          vat_amount: number
          total_price: number
          deposit_amount?: number | null
          deposit_paid?: boolean
          finance_option?: string | null
          status?: string
          production_job_id?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          order_number?: string
          lead_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          model?: string
          configuration?: Json
          base_price?: number
          options_price?: number
          vat_amount?: number
          total_price?: number
          deposit_amount?: number | null
          deposit_paid?: boolean
          finance_option?: string | null
          status?: string
          production_job_id?: string | null
          notes?: string | null
        }
      }
      lead_activities: {
        Row: {
          id: string
          created_at: string
          lead_id: string
          activity_type: string
          description: string | null
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          lead_id: string
          activity_type: string
          description?: string | null
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          lead_id?: string
          activity_type?: string
          description?: string | null
          metadata?: Json | null
          performed_by?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: string | null
          created_at?: string
          updated_at?: string
        }
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