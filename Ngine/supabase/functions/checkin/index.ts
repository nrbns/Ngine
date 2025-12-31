// Supabase Edge Function: POST /checkin
// Saves daily check-in and updates resolution status via rules engine

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { resolution_id, date, execution, blocker, energy } = await req.json()

    // Get user from auth
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify resolution belongs to user
    const { data: resolution, error: resError } = await supabaseClient
      .from('resolutions')
      .select('*')
      .eq('id', resolution_id)
      .eq('user_id', user.id)
      .single()

    if (resError || !resolution) {
      return new Response(
        JSON.stringify({ error: 'Resolution not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Upsert check-in
    const { data: checkin, error: checkinError } = await supabaseClient
      .from('daily_checkins')
      .upsert({
        resolution_id,
        date,
        execution,
        blocker,
        energy,
      }, {
        onConflict: 'resolution_id,date'
      })
      .select()
      .single()

    if (checkinError) {
      throw checkinError
    }

    // Get last 5 check-ins for rules engine
    const { data: recentCheckins } = await supabaseClient
      .from('daily_checkins')
      .select('*')
      .eq('resolution_id', resolution_id)
      .order('date', { ascending: false })
      .limit(5)

    // Rules Engine: Update status
    const newStatus = calculateStatus(resolution, recentCheckins || [])

    if (newStatus !== resolution.status) {
      await supabaseClient
        .from('resolutions')
        .update({ status: newStatus })
        .eq('id', resolution_id)
    }

    // Trigger AI if status is drifting or broken
    let aiInsight = null
    if (newStatus === 'drifting' || newStatus === 'broken') {
      // AI will be called separately via /ai/insight endpoint
      // This just marks that AI should be generated
    }

    return new Response(
      JSON.stringify({ 
        checkin, 
        status: newStatus,
        ai_triggered: (newStatus === 'drifting' || newStatus === 'broken')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Rules Engine (NO AI)
function calculateStatus(resolution: any, checkins: any[]): string {
  if (resolution.status === 'recovering') {
    // Check if recovery period ended
    if (resolution.recovery_end_date && new Date() > new Date(resolution.recovery_end_date)) {
      return 'aligned'
    }
    return 'recovering'
  }

  if (checkins.length === 0) return 'aligned'

  // Sort checkins by date (oldest first)
  const sorted = [...checkins].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Drift Detection: 2 consecutive "no" or "partial"
  if (sorted.length >= 2) {
    const lastTwo = sorted.slice(-2)
    const allNoOrPartial = lastTwo.every(ci => 
      ci.execution === 'no' || ci.execution === 'partial'
    )
    if (allNoOrPartial) {
      return 'drifting'
    }
  }

  // Drift Detection: Energy ≤ 2 for 2 days
  if (sorted.length >= 2) {
    const lastTwo = sorted.slice(-2)
    const allLowEnergy = lastTwo.every(ci => ci.energy <= 2)
    if (allLowEnergy) {
      return 'drifting'
    }
  }

  // Broken: 3 misses in last 5 days
  if (sorted.length >= 3) {
    const lastFive = sorted.slice(-5)
    const misses = lastFive.filter(ci => ci.execution === 'no').length
    if (misses >= 3) {
      return 'broken'
    }
  }

  // If was drifting/broken but conditions no longer met, return to aligned
  if (resolution.status === 'drifting' || resolution.status === 'broken') {
    return 'aligned'
  }

  return resolution.status || 'aligned'
}

