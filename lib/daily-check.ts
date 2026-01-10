// Daily resolution checking service
import { supabase } from './supabase'
import { Resolution } from './supabase'

/**
 * Check if a resolution has completed based on its duration
 */
export async function checkResolutionCompletion(
  resolution: Resolution
): Promise<boolean> {
  try {
    const createdDate = new Date(resolution.created_at)
    const now = new Date()
    const daysSinceCreation = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Parse duration (e.g., "14 Days", "30 Days")
    const durationMatch = resolution.duration.match(/(\d+)\s*Days?/i)
    const targetDays = durationMatch ? parseInt(durationMatch[1], 10) : 30

    return daysSinceCreation >= targetDays
  } catch (error) {
    console.error('Error checking resolution completion:', error)
    return false
  }
}

/**
 * Mark resolution as completed in database
 */
export async function markResolutionCompleted(
  resolutionId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('resolutions')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', resolutionId)

    if (error) {
      console.error('Error marking resolution as completed:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to mark resolution as completed:', error)
  }
}

/**
 * Check if user missed check-in today (hasn't checked in and day has passed threshold)
 * Returns true if missed, false otherwise
 */
export async function checkMissedCheckinToday(
  resolutionId: string,
  userId: string
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    const currentHour = now.getHours()

    // Only consider it missed if it's past 9 PM (21:00) and no check-in exists
    if (currentHour < 21) {
      return false // Still time to check in
    }

    const { data: todayCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('resolution_id', resolutionId)
      .eq('date', today)
      .maybeSingle()

    return !todayCheckin // Missed if no check-in exists
  } catch (error) {
    console.error('Error checking missed check-in:', error)
    return false
  }
}

/**
 * Automatically create missed check-in if user hasn't checked in by 9 PM
 * This runs as a background check
 */
export async function autoCheckMissedDays(
  resolution: Resolution,
  userId: string
): Promise<void> {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentHour = today.getHours()

    // Only auto-mark as missed if it's past 9 PM
    if (currentHour < 21) {
      return // Still time to check in
    }

    // Check if today's check-in exists
    const { data: todayCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('resolution_id', resolution.id)
      .eq('date', todayStr)
      .maybeSingle()

    // If no check-in exists, auto-create a missed check-in
    if (!todayCheckin) {
      const { error } = await supabase
        .from('checkins')
        .insert({
          resolution_id: resolution.id,
          date: todayStr,
          execution: 'no',
          energy: null, // null for auto-missed (allows 0-5 constraint)
          blocker: 'Auto-marked as missed (no check-in by 9 PM)',
        })

      if (error) {
        console.error('Error auto-creating missed check-in:', error)
      } else {
        console.log('Auto-created missed check-in for', todayStr)
      }
    }
  } catch (error) {
    console.error('Error in auto-check missed days:', error)
  }
}

/**
 * Main daily check service - runs on app start/foreground
 * Checks resolution completion and missed days
 */
export async function performDailyChecks(
  resolution: Resolution | null,
  userId: string | null
): Promise<{ completed: boolean; markedMissed: boolean }> {
  if (!resolution || !userId) {
    return { completed: false, markedMissed: false }
  }

  try {
    // Check if resolution is completed
    const isCompleted = await checkResolutionCompletion(resolution)
    let markedMissed = false

    if (isCompleted && resolution.status === 'active') {
      await markResolutionCompleted(resolution.id)
      console.log('Resolution marked as completed:', resolution.id)
    }

    // Check for missed days (only if still active)
    if (resolution.status === 'active') {
      await autoCheckMissedDays(resolution, userId)
      markedMissed = true
    }

    return {
      completed: isCompleted && resolution.status === 'active',
      markedMissed,
    }
  } catch (error) {
    console.error('Error in daily checks:', error)
    return { completed: false, markedMissed: false }
  }
}
