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
          status: string
          notes: string | null
          configuration: Json | null
          quote_amount: number | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          consent_marketing: boolean
          consent_timestamp: string | null
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
          status?: string
          notes?: string | null
          configuration?: Json | null
          quote_amount?: number | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          consent_marketing?: boolean
          consent_timestamp?: string | null
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
          status?: string
          notes?: string | null
          configuration?: Json | null
          quote_amount?: number | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          consent_marketing?: boolean
          consent_timestamp?: string | null
        }
      }
      blog_posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          published_at: string | null
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          meta_title: string | null
          meta_description: string | null
          keywords: string[] | null
          author_id: string | null
          status: string
          featured: boolean
          category: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          meta_title?: string | null
          meta_description?: string | null
          keywords?: string[] | null
          author_id?: string | null
          status?: string
          featured?: boolean
          category?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          meta_title?: string | null
          meta_description?: string | null
          keywords?: string[] | null
          author_id?: string | null
          status?: string
          featured?: boolean
          category?: string | null
          tags?: string[] | null
        }
      }
      pricing_options: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          model: string
          category: string
          subcategory: string | null
          name: string
          description: string | null
          sku: string | null
          price: number
          vat_rate: number
          is_default: boolean
          is_available: boolean
          dependencies: Json | null
          incompatible_with: Json | null
          display_order: number
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          model: string
          category: string
          subcategory?: string | null
          name: string
          description?: string | null
          sku?: string | null
          price: number
          vat_rate?: number
          is_default?: boolean
          is_available?: boolean
          dependencies?: Json | null
          incompatible_with?: Json | null
          display_order?: number
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          model?: string
          category?: string
          subcategory?: string | null
          name?: string
          description?: string | null
          sku?: string | null
          price?: number
          vat_rate?: number
          is_default?: boolean
          is_available?: boolean
          dependencies?: Json | null
          incompatible_with?: Json | null
          display_order?: number
          image_url?: string | null
        }
      }
      knowledge_base: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          category: string | null
          tags: string[] | null
          source: string | null
          source_url: string | null
          embedding: number[] | null
          is_published: boolean
          search_keywords: string | null
          relevance_score: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          category?: string | null
          tags?: string[] | null
          source?: string | null
          source_url?: string | null
          embedding?: number[] | null
          is_published?: boolean
          search_keywords?: string | null
          relevance_score?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          category?: string | null
          tags?: string[] | null
          source?: string | null
          source_url?: string | null
          embedding?: number[] | null
          is_published?: boolean
          search_keywords?: string | null
          relevance_score?: number
        }
      }
      saved_configurations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          session_id: string | null
          name: string | null
          model: string
          configuration: Json
          total_price: number | null
          share_token: string | null
          is_public: boolean
          views_count: number
          expires_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          session_id?: string | null
          name?: string | null
          model: string
          configuration: Json
          total_price?: number | null
          share_token?: string | null
          is_public?: boolean
          views_count?: number
          expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          session_id?: string | null
          name?: string | null
          model?: string
          configuration?: Json
          total_price?: number | null
          share_token?: string | null
          is_public?: boolean
          views_count?: number
          expires_at?: string | null
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
      admin_audit_log: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          action?: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      email_templates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          subject: string
          html_content: string
          text_content: string | null
          variables: Json | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          subject: string
          html_content: string
          text_content?: string | null
          variables?: Json | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          subject?: string
          html_content?: string
          text_content?: string | null
          variables?: Json | null
          is_active?: boolean
        }
      }
      quotes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          quote_number: string
          lead_id: string | null
          configuration_id: string | null
          total_amount: number
          vat_amount: number | null
          valid_until: string | null
          status: string
          pdf_url: string | null
          sent_at: string | null
          viewed_at: string | null
          accepted_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          quote_number: string
          lead_id?: string | null
          configuration_id?: string | null
          total_amount: number
          vat_amount?: number | null
          valid_until?: string | null
          status?: string
          pdf_url?: string | null
          sent_at?: string | null
          viewed_at?: string | null
          accepted_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          quote_number?: string
          lead_id?: string | null
          configuration_id?: string | null
          total_amount?: number
          vat_amount?: number | null
          valid_until?: string | null
          status?: string
          pdf_url?: string | null
          sent_at?: string | null
          viewed_at?: string | null
          accepted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      search_knowledge: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          content: string
          category: string | null
          tags: string[] | null
          similarity: number
        }[]
      }
      hybrid_search_knowledge: {
        Args: {
          query_embedding: number[]
          search_query?: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          content: string
          category: string | null
          tags: string[] | null
          similarity: number
          relevance: number
        }[]
      }
      get_lead_stats: {
        Args: {
          date_from?: string
          date_to?: string
        }
        Returns: {
          total_leads: number
          new_leads: number
          qualified_leads: number
          converted_leads: number
          avg_quote_amount: number
          conversion_rate: number
        }
      }
      cleanup_expired_configurations: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_search_vector: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      lead_status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'converted' | 'lost'
      blog_status: 'draft' | 'review' | 'published' | 'archived'
      quote_status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
      activity_type: 'email_sent' | 'email_received' | 'call_made' | 'call_received' | 'meeting' | 'quote_sent' | 'quote_viewed' | 'note_added' | 'status_changed'
      knowledge_source: 'manual' | 'faq' | 'documentation' | 'product' | 'blog'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for easier use
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']

export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

export type PricingOption = Database['public']['Tables']['pricing_options']['Row']
export type PricingOptionInsert = Database['public']['Tables']['pricing_options']['Insert']
export type PricingOptionUpdate = Database['public']['Tables']['pricing_options']['Update']

export type KnowledgeBase = Database['public']['Tables']['knowledge_base']['Row']
export type KnowledgeBaseInsert = Database['public']['Tables']['knowledge_base']['Insert']
export type KnowledgeBaseUpdate = Database['public']['Tables']['knowledge_base']['Update']

export type SavedConfiguration = Database['public']['Tables']['saved_configurations']['Row']
export type SavedConfigurationInsert = Database['public']['Tables']['saved_configurations']['Insert']
export type SavedConfigurationUpdate = Database['public']['Tables']['saved_configurations']['Update']

export type LeadActivity = Database['public']['Tables']['lead_activities']['Row']
export type LeadActivityInsert = Database['public']['Tables']['lead_activities']['Insert']

export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update']

export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']

export type AdminAuditLog = Database['public']['Tables']['admin_audit_log']['Row']
export type AdminAuditLogInsert = Database['public']['Tables']['admin_audit_log']['Insert']

// Enum types
export type LeadStatus = Database['public']['Enums']['lead_status']
export type BlogStatus = Database['public']['Enums']['blog_status']
export type QuoteStatus = Database['public']['Enums']['quote_status']
export type ActivityType = Database['public']['Enums']['activity_type']
export type KnowledgeSource = Database['public']['Enums']['knowledge_source']