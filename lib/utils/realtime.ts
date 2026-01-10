// Real-time state management for NGINE
import { supabase, Checkin, Resolution } from '../api/supabase'

export type IntegrityStatus = 'ALIGNED' | 'DRIFTING' | 'NONE'

export interface TodayStatus {
  hasCheckedIn: boolean
  status: IntegrityStatus
  lastCheckin: Checkin | null
  streak: number
}

export interface IntegrityDot {
  date: string
  status: 'yes' | 'partial' | 'no' | null
}

/**
 * Calculate integrity status from recent check-ins
 */
export async function getTodayStatus(
  goalId: string,
  userId: string
): Promise<TodayStatus> {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Get today's check-in
    const { data: todayCheckin, error: checkinError } = await supabase
      .from('checkins')
      .select('*')
      .eq('resolution_id', goalId)
      .eq('date', today)
      .maybeSingle()

    if (checkinError && checkinError.code !== 'PGRST116') {
      console.error('Error fetching today check-in:', checkinError)
    }

    // Get last 7 days of check-ins
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]

    const { data: recentCheckins, error: recentError } = await supabase
      .from('checkins')
      .select('*')
      .eq('resolution_id', goalId)
      .gte('date', startDate)
      .order('date', { ascending: false })

    if (recentError) {
      console.error('Error fetching recent check-ins:', recentError)
    }

    // Calculate status
    let status: IntegrityStatus = 'NONE'
    let streak = 0

    if (todayCheckin) {
      // Check last 3 days
      const last3Days = recentCheckins?.slice(0, 3) || []
      const allYes = last3Days.every(c => c.execution === 'yes')
      const hasMiss = last3Days.some(c => c.execution === 'no')

      if (todayCheckin.execution === 'yes' && allYes) {
        status = 'ALIGNED'
      } else if (hasMiss || todayCheckin.execution === 'no') {
        status = 'DRIFTING'
      } else {
        status = 'ALIGNED'
      }

      // Calculate streak
      for (const checkin of recentCheckins || []) {
        if (checkin.execution === 'yes') {
          streak++
        } else {
          break
        }
      }
    }

    return {
      hasCheckedIn: !!todayCheckin,
      status,
      lastCheckin: todayCheckin || null,
      streak,
    }
  } catch (error) {
    console.error('Error in getTodayStatus:', error)
    // Return default status on error
    return {
      hasCheckedIn: false,
      status: 'NONE',
      lastCheckin: null,
      streak: 0,
    }
  }
}

/**
 * Get last 5 days for integrity dots
 */
export async function getIntegrityDots(
  goalId: string
): Promise<IntegrityDot[]> {
  const today = new Date()
  const dots: IntegrityDot[] = []

  for (let i = 4; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const { data: checkin } = await supabase
      .from('checkins')
      .select('execution')
      .eq('resolution_id', goalId)
      .eq('date', dateStr)
      .maybeSingle()

    dots.push({
      date: dateStr,
      status: (checkin?.execution as 'yes' | 'partial' | 'no') || null,
    })
  }

  return dots
}

/**
 * Get dynamic identity message based on status
 * DEPRECATED: Use generateIdentityMessage from ai-motivation.ts instead
 * Kept for backward compatibility
 */
export function getIdentityMessage(
  status: IntegrityStatus,
  hasCheckedIn: boolean,
  lastExecution?: 'yes' | 'partial' | 'no'
): string {
  // Return default message - AI version is used elsewhere
  if (!hasCheckedIn) {
    return 'Today is your canvas. Paint it with action.'
  }
  
  if (status === 'ALIGNED' && lastExecution === 'yes') {
    return 'Consistency reinforced today.'
  }
  
  if (status === 'DRIFTING' && lastExecution === 'no') {
    return 'One missed day doesn\'t define you. Reset starts now.'
  }
  
  return 'You are becoming consistent.'
}

/**
 * Get last action text for Progress screen
 */
export function getLastActionText(checkin: Checkin | null): string {
  if (!checkin) return 'No check-ins yet'

  const date = new Date(checkin.created_at)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let dateText = ''
  if (date.toDateString() === today.toDateString()) {
    dateText = 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    dateText = 'Yesterday'
  } else {
    dateText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const emoji = checkin.execution === 'yes' ? '✔' : checkin.execution === 'partial' ? '🟡' : '❌'
  const action = checkin.execution === 'yes' ? 'Done' : checkin.execution === 'partial' ? 'Partial' : 'Missed'

  return `${emoji} ${dateText} – ${action}`
}

