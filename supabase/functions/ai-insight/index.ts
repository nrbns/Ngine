// Supabase Edge Function: POST /ai/insight
// Generates AI insight for drifting/broken resolutions

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

    const { resolution_id } = await req.json()

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get resolution
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

    // Check if insight already exists
    const { data: existing } = await supabaseClient
      .from('ai_insights')
      .select('*')
      .eq('resolution_id', resolution_id)
      .eq('type', resolution.status === 'broken' ? 'failure' : 'drift')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existing && existing.insight_text) {
      return new Response(
        JSON.stringify({ insight: existing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get last 5 check-ins
    const { data: checkins } = await supabaseClient
      .from('daily_checkins')
      .select('*')
      .eq('resolution_id', resolution_id)
      .order('date', { ascending: false })
      .limit(5)

    // Call OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const insightType = resolution.status === 'broken' ? 'failure' : 'drift'
    const systemPrompt = getSystemPrompt(resolution.support_style)
    const userPrompt = buildUserPrompt(resolution, checkins || [], insightType)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    const aiData = await response.json()
    const insightText = aiData.choices?.[0]?.message?.content?.trim() || 'Unable to generate insight.'

    // Save insight
    const { data: insight, error: insightError } = await supabaseClient
      .from('ai_insights')
      .insert({
        resolution_id,
        insight_text: insightText,
        type: insightType,
      })
      .select()
      .single()

    if (insightError) throw insightError

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getSystemPrompt(supportStyle: string): string {
  const base = `You are a helpful resolution coach. Be honest, non-judgmental, and actionable. 
Provide ONE reason why the resolution is failing and ONE corrective action. 
Keep response under 280 characters.`

  const styles = {
    strict: `${base} Be direct and firm.`,
    logical: `${base} Use data and logic.`,
    gentle: `${base} Be warm and encouraging.`,
  }

  return styles[supportStyle as keyof typeof styles] || base
}

function buildUserPrompt(resolution: any, checkins: any[], type: string): string {
  const checkinSummary = checkins.map(ci => 
    `${ci.date}: ${ci.execution} (energy: ${ci.energy}/5)${ci.blocker ? ` - ${ci.blocker}` : ''}`
  ).join('\n')

  return `Resolution: "${resolution.title}"
Why it matters: ${resolution.why || 'Not specified'}

Status: ${resolution.status}
Last 5 check-ins:
${checkinSummary}

${type === 'failure' 
  ? 'This resolution is broken. Explain why and suggest ONE action to recover.' 
  : 'This resolution is drifting. Explain why and suggest ONE action to get back on track.'}`
}

