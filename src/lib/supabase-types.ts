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
      users: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string
          email_verified: string | null
          id: string
          name: string | null
          password: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email: string
          email_verified?: string | null
          id?: string
          name?: string | null
          password?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string
          email_verified?: string | null
          id?: string
          name?: string | null
          password?: string | null
          phone?: string | null
          updated_at?: string | null
        }
      }
      credit_packages: {
        Row: {
          created_at: string | null
          credits: number
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          original_price: number
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits: number
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          original_price: number
          price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          original_price?: number
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
      }
      user_credit_accounts: {
        Row: {
          available_credits: number | null
          created_at: string | null
          expires_at: string | null
          frozen_credits: number | null
          id: string
          total_credits: number | null
          updated_at: string | null
          used_credits: number | null
          user_id: string
        }
        Insert: {
          available_credits?: number | null
          created_at?: string | null
          expires_at?: string | null
          frozen_credits?: number | null
          id?: string
          total_credits?: number | null
          updated_at?: string | null
          used_credits?: number | null
          user_id: string
        }
        Update: {
          available_credits?: number | null
          created_at?: string | null
          expires_at?: string | null
          frozen_credits?: number | null
          id?: string
          total_credits?: number | null
          updated_at?: string | null
          used_credits?: number | null
          user_id?: string
        }
      }
      // ... 其他表类型
    }
    Enums: {
      transaction_type: "PURCHASE" | "CONSUME" | "REFUND" | "EXPIRE" | "BONUS"
      payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED"
      video_generation_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
    }
  }
}



