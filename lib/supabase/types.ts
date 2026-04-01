export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          org_id: string
          user_id: string
          role: 'owner' | 'member'
        }
        Insert: {
          org_id: string
          user_id: string
          role: 'owner' | 'member'
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: 'owner' | 'member'
        }
        Relationships: []
      }
      cc_card_families: {
        Row: {
          id: string
          org_id: string
          cardholder_name: string
          bank: string
          shared_limit: number
          annual_cap: number
          created_at: string
        }
        Insert: {
          id: string
          org_id: string
          cardholder_name: string
          bank: string
          shared_limit: number
          annual_cap?: number
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          cardholder_name?: string
          bank?: string
          shared_limit?: number
          annual_cap?: number
          created_at?: string
        }
        Relationships: []
      }
      cc_cards: {
        Row: {
          id: string
          family_id: string
          org_id: string
          card_name: string
          last_four: string
          registered_mobile: string | null
          registered_email: string | null
          customer_care_phone: string | null
          customer_care_emails: string | null
          annual_fees: number
          benefits: string | null
          bill_generate_day: number
          buffer_days: number
          color: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          family_id: string
          org_id: string
          card_name: string
          last_four: string
          registered_mobile?: string | null
          registered_email?: string | null
          customer_care_phone?: string | null
          customer_care_emails?: string | null
          annual_fees?: number
          benefits?: string | null
          bill_generate_day: number
          buffer_days?: number
          color?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          org_id?: string
          card_name?: string
          last_four?: string
          registered_mobile?: string | null
          registered_email?: string | null
          customer_care_phone?: string | null
          customer_care_emails?: string | null
          annual_fees?: number
          benefits?: string | null
          bill_generate_day?: number
          buffer_days?: number
          color?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      cc_statements: {
        Row: {
          id: string
          card_id: string
          family_id: string
          org_id: string
          cycle_start: string
          cycle_end: string
          due_date: string
          is_zero_due: boolean
          total_due: number
          status: 'unpaid' | 'partial' | 'paid' | 'zero_due'
          created_at: string
        }
        Insert: {
          id: string
          card_id: string
          family_id: string
          org_id: string
          cycle_start: string
          cycle_end: string
          due_date: string
          is_zero_due?: boolean
          total_due?: number
          status?: 'unpaid' | 'partial' | 'paid' | 'zero_due'
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          family_id?: string
          org_id?: string
          cycle_start?: string
          cycle_end?: string
          due_date?: string
          is_zero_due?: boolean
          total_due?: number
          status?: 'unpaid' | 'partial' | 'paid' | 'zero_due'
          created_at?: string
        }
        Relationships: []
      }
      cc_transactions: {
        Row: {
          id: string
          statement_id: string
          card_id: string
          family_id: string
          org_id: string
          merchant: string
          amount: number
          date: string
          category: 'travel' | 'food' | 'utilities' | 'office' | 'misc' | 'others' | 'reward' | null
          milestone_tags: string | null
          exclude_from_9l: boolean
          notes: string | null
          logged_by: string | null
          created_at: string
        }
        Insert: {
          id: string
          statement_id: string
          card_id: string
          family_id: string
          org_id: string
          merchant: string
          amount: number
          date: string
          category?: 'travel' | 'food' | 'utilities' | 'office' | 'misc' | 'others' | 'reward' | null
          milestone_tags?: string | null
          exclude_from_9l?: boolean
          notes?: string | null
          logged_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          statement_id?: string
          card_id?: string
          family_id?: string
          org_id?: string
          merchant?: string
          amount?: number
          date?: string
          category?: 'travel' | 'food' | 'utilities' | 'office' | 'misc' | 'others' | 'reward' | null
          milestone_tags?: string | null
          exclude_from_9l?: boolean
          notes?: string | null
          logged_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cc_milestones: {
        Row: {
          id: string
          card_id: string
          org_id: string
          title: string
          source: 'bank_defined' | 'self_defined' | null
          start_date: string
          end_date: string
          target_amount: number
          status: 'active' | 'achieved' | 'expired' | 'missed'
          created_at: string
        }
        Insert: {
          id: string
          card_id: string
          org_id: string
          title: string
          source?: 'bank_defined' | 'self_defined' | null
          start_date: string
          end_date: string
          target_amount?: number
          status?: 'active' | 'achieved' | 'expired' | 'missed'
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          org_id?: string
          title?: string
          source?: 'bank_defined' | 'self_defined' | null
          start_date?: string
          end_date?: string
          target_amount?: number
          status?: 'active' | 'achieved' | 'expired' | 'missed'
          created_at?: string
        }
        Relationships: []
      }
      cc_transaction_milestones: {
        Row: {
          transaction_id: string
          milestone_id: string
        }
        Insert: {
          transaction_id: string
          milestone_id: string
        }
        Update: {
          transaction_id?: string
          milestone_id?: string
        }
        Relationships: []
      }
      cc_card_payments: {
        Row: {
          id: string
          card_id: string
          family_id: string
          statement_id: string
          org_id: string
          amount: number
          payment_date: string
          payment_mode: 'upi' | 'neft' | 'auto_debit' | 'cheque' | 'reward' | null
          tagged_to_9l: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id: string
          card_id: string
          family_id: string
          statement_id: string
          org_id: string
          amount: number
          payment_date: string
          payment_mode?: 'upi' | 'neft' | 'auto_debit' | 'cheque' | 'reward' | null
          tagged_to_9l?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          family_id?: string
          statement_id?: string
          org_id?: string
          amount?: number
          payment_date?: string
          payment_mode?: 'upi' | 'neft' | 'auto_debit' | 'cheque' | 'reward' | null
          tagged_to_9l?: boolean
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cc_milestone_rewards: {
        Row: {
          id: string
          milestone_id: string
          reward_type: 'bonus_points' | 'cashback' | 'fee_waiver' | 'voucher' | 'lounge' | 'custom' | null
          reward_value: number | null
          reward_description: string | null
          is_credited: boolean
          created_at: string
        }
        Insert: {
          id: string
          milestone_id: string
          reward_type?: 'bonus_points' | 'cashback' | 'fee_waiver' | 'voucher' | 'lounge' | 'custom' | null
          reward_value?: number | null
          reward_description?: string | null
          is_credited?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          milestone_id?: string
          reward_type?: 'bonus_points' | 'cashback' | 'fee_waiver' | 'voucher' | 'lounge' | 'custom' | null
          reward_value?: number | null
          reward_description?: string | null
          is_credited?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type Organisation = Database['public']['Tables']['organisations']['Row']
export type OrgMember = Database['public']['Tables']['org_members']['Row']
export type CCCardFamily = Database['public']['Tables']['cc_card_families']['Row']
export type CCCard = Database['public']['Tables']['cc_cards']['Row']
export type CCStatement = Database['public']['Tables']['cc_statements']['Row']
export type CCTransaction = Database['public']['Tables']['cc_transactions']['Row']
export type CCMilestone = Database['public']['Tables']['cc_milestones']['Row']
export type CCTransactionMilestone = Database['public']['Tables']['cc_transaction_milestones']['Row']
export type CCCardPayment = Database['public']['Tables']['cc_card_payments']['Row']
export type CCMilestoneReward = Database['public']['Tables']['cc_milestone_rewards']['Row']
