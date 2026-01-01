// Supabase Edge Function: GET /dashboard
// Returns active resolutions with status and success probability

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get active resolutions
    const today = new Date().toISOString().split('T')[0]
    const { data: resolutions, error } = await supabaseClient
      .from('resolutions')
      .select('*')
      .eq('user_id', user.id)
      .gte('end_date', today)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get check-ins for each resolution and calculate success probability
    const resolutionsWithStats = await Promise.all(
      (resolutions || []).map(async (resolution) => {
        const { data: checkins } = await supabaseClient
          .from('daily_checkins')
          .select('*')
          .eq('resolution_id', resolution.id)
          .order('date', { ascending: true })

        const successProbability = calculateSuccessProbability(resolution, checkins || [])
        const daysRemaining = Math.ceil(
          (new Date(resolution.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )

        return {
          ...resolution,
          success_probability: successProbability,
          days_remaining: Math.max(0, daysRemaining),
          checkins_count: checkins?.length || 0,
        }
      })
    )

    return new Response(
      JSON.stringify({ resolutions: resolutionsWithStats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateSuccessProbability(resolution: any, checkins: any[]): number {
  if (checkins.length === 0) return 100

  const totalDays = Math.ceil(
    (new Date(resolution.end_date).getTime() - new Date(resolution.start_date).getTime()) / 
    (1000 * 60 * 60 * 24)
  )
  const daysSoFar = Math.ceil(
    (new Date().getTime() - new Date(resolution.start_date).getTime()) / 
    (1000 * 60 * 60 * 24)
  )

  const executedDays = checkins.filter(ci => ci.execution === 'yes').length
  const executionRate = executedDays / Math.max(1, daysSoFar)

  // Energy factor (average energy)
  const avgEnergy = checkins.length > 0
    ? checkins.reduce((sum, ci) => sum + ci.energy, 0) / checkins.length / 5
    : 1

  // Consistency factor (recent performance)
  const recentCheckins = checkins.slice(-7)
  const recentExecutionRate = recentCheckins.length > 0
    ? recentCheckins.filter(ci => ci.execution === 'yes').length / recentCheckins.length
    : 1

  // Projected success
  const projectedExecuted = executionRate * totalDays
  const requiredExecuted = (resolution.mdd_value / 7) * totalDays

  let probability = (projectedExecuted / requiredExecuted) * 100
  probability = probability * avgEnergy * recentExecutionRate
  probability = Math.max(0, Math.min(100, probability))

  return Math.round(probability)
}

