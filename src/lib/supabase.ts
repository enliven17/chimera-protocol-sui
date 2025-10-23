import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug logging
console.log('Supabase Config Debug:', {
  url: supabaseUrl,
  keyExists: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  keyStart: supabaseAnonKey?.substring(0, 20) + '...'
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface BetActivity {
  id: string
  market_id: string
  user_address: string
  option: number
  amount: string
  shares: string
  tx_hash: string
  created_at: string
  market_title?: string
  option_a?: string
  option_b?: string
}

export interface Comment {
  id: string
  market_id: string
  user_address: string
  content: string
  created_at: string
  updated_at: string
}