import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'placeholder-key'

// Create client with fallback values to prevent crashes
export const supabase = createClient(supabaseUrl, supabaseKey)

// Real-time channel for NGINE
export const ngineChannel = supabase.channel('ngine-live')

// Types
export interface Profile {
  id: string
  identity: string
}

export interface Resolution {
  id: string
  user_id: string
  title: string
  why: string
  duration: string
  mdd: string
  status: string
  created_at: string
  updated_at?: string
}

export interface Checkin {
  id: string
  resolution_id: string
  execution: 'yes' | 'partial' | 'no'
  energy: number | null
  blocker?: string | null
  date: string
  created_at: string
}

export interface GoalProof {
  id: string
  resolution_id: string
  image_url: string
  created_at: string
}
