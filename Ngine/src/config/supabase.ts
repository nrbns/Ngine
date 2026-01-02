// Supabase client configuration
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Helper to call edge functions
export const callEdgeFunction = async (functionName: string, body: unknown) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(body as Record<string, unknown>),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.error || 'Request failed')
  }

  return response.json()
}

