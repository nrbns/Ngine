// AI-Powered Motivation Support System
// Generates personalized motivational content based on user context

import { Resolution, Checkin } from '../api/supabase'
import { TodayStatus, IntegrityStatus } from './realtime'

export interface MotivationContext {
  status: IntegrityStatus
  hasCheckedIn: boolean
  lastExecution?: 'yes' | 'partial' | 'no'
  streak: number
  totalDays: number
  goalTitle?: string
  goalWhy?: string
  energy?: number | null
  blocker?: string | null
  recentCheckins?: Checkin[]
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek?: string
}

/**
 * Get time of day context
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

/**
 * Get day of week
 */
function getDayOfWeek(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Generate AI-powered identity message based on context
 */
export function generateIdentityMessage(context: MotivationContext): string {
  const {
    status,
    hasCheckedIn,
    lastExecution,
    streak,
    totalDays,
    goalTitle,
    goalWhy,
    energy,
    blocker,
    timeOfDay = getTimeOfDay(),
  } = context

  // If no check-in today
  if (!hasCheckedIn) {
    const morningMessages = [
      'Today is your canvas. Paint it with action.',
      'Morning decisions shape evening outcomes.',
      'Each sunrise brings a new chance to align.',
      'Your future self is counting on today\'s choices.',
    ]
    const afternoonMessages = [
      'The day is still yours. Make it count.',
      'Midday momentum builds evening success.',
      'Your consistency compound interest compounds now.',
      'Small actions now, big results later.',
    ]
    const eveningMessages = [
      'There\'s still time to show up today.',
      'Evening check-ins reinforce morning intentions.',
      'End strong. Tomorrow starts now.',
      'Your consistency is becoming your identity.',
    ]

    const messages = timeOfDay === 'morning' ? morningMessages 
      : timeOfDay === 'afternoon' ? afternoonMessages 
      : eveningMessages

    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Context-aware messages based on status and execution
  if (status === 'ALIGNED') {
    if (lastExecution === 'yes') {
      const alignedYesMessages = [
        `Day ${streak} complete. Consistency is compounding.`,
        `Streak ${streak}: You're building something real.`,
        `Another aligned day. Your discipline is strengthening.`,
        streak >= 7 ? `Week ${Math.floor(streak / 7)} complete. You're unstoppable.` : 
        `Streak ${streak} active. Momentum is building.`,
        goalTitle ? `You showed up for "${goalTitle}". That's who you are.` :
        'Every "yes" reinforces your identity.',
      ]
      return alignedYesMessages[Math.floor(Math.random() * alignedYesMessages.length)]
    }
    
    if (lastExecution === 'partial') {
      return 'Partial progress is still progress. Tomorrow, aim for full.'
    }
  }

  if (status === 'DRIFTING') {
    if (lastExecution === 'no') {
      const driftingNoMessages = [
        'One missed day doesn\'t define you. Reset starts now.',
        'Momentum paused, not stopped. Tomorrow is a fresh start.',
        'Integrity means showing up after you\'ve fallen off.',
        blocker ? `"${blocker}" was today's challenge. Tomorrow you adapt.` :
        'Recovery is part of the process. Get back on track.',
        'The path isn\'t linear. What matters is you return.',
      ]
      return driftingNoMessages[Math.floor(Math.random() * driftingNoMessages.length)]
    }

    if (lastExecution === 'partial') {
      return 'Partial completion shows effort. Tomorrow, aim for full alignment.'
    }
  }

  // Default encouraging message
  return 'You are becoming consistent.'
}

/**
 * Generate motivational quote/encouragement for check-in completion
 */
export function generateCheckinMotivation(
  execution: 'yes' | 'partial' | 'no',
  streak: number,
  goalTitle?: string,
  energy?: number | null
): string {
  if (execution === 'yes') {
    const successMessages = [
      streak >= 7 ? `🔥 ${streak}-day streak! You're in the flow state.` :
      streak >= 3 ? `✨ Day ${streak}! The habit is forming.` :
      '✅ Check-in complete. Small actions, big transformation.',
      energy && energy >= 4 ? 'High energy + Action = Momentum. Keep going!' :
      goalTitle ? `"${goalTitle}" - One more day closer to your goal.` :
      'Today, you chose discipline over comfort.',
      'Another brick in the foundation of your future self.',
      'Consistency compounds. You\'re investing in yourself.',
    ]
    return successMessages[Math.floor(Math.random() * successMessages.length)]
  }

  if (execution === 'partial') {
    const partialMessages = [
      'Partial effort acknowledged. Tomorrow, aim for complete.',
      'You showed up partially. Next time, show up fully.',
      'Half-way is better than not at all. Build from here.',
      energy && energy <= 2 ? 'Low energy day, but you still showed up. That counts.' :
      'Progress over perfection. You\'re learning and growing.',
    ]
    return partialMessages[Math.floor(Math.random() * partialMessages.length)]
  }

  // execution === 'no'
  const missedMessages = [
    'Missed today. Tomorrow is a fresh start. No judgment, just action.',
    'Reset moment. What matters is what you do next.',
    'One missed day doesn\'t erase your progress. Return stronger.',
    'Integrity isn\'t perfection. It\'s returning after you\'ve fallen.',
    'Tomorrow is Day 1 of your comeback. You\'ve got this.',
  ]
  return missedMessages[Math.floor(Math.random() * missedMessages.length)]
}

/**
 * Generate daily motivation message based on progress
 */
export function generateDailyMotivation(context: MotivationContext): string {
  const {
    streak,
    totalDays,
    status,
    goalTitle,
    goalWhy,
    timeOfDay = getTimeOfDay(),
    dayOfWeek = getDayOfWeek(),
  } = context

  // Weekday-specific motivation
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday'
  const weekendBoost = isWeekend ? 'Weekend discipline builds weekday momentum. ' : ''

  // Streak-based messages
  if (streak >= 30) {
    return `${weekendBoost}30+ day streak! You're not just consistent—you're transformed.`
  }
  if (streak >= 21) {
    return `${weekendBoost}21-day milestone reached. The habit has taken root.`
  }
  if (streak >= 14) {
    return `${weekendBoost}Two weeks strong! Your consistency is becoming automatic.`
  }
  if (streak >= 7) {
    return `${weekendBoost}Week one complete! The hardest part is behind you.`
  }

  // Early streak encouragement
  if (streak >= 3) {
    return `${weekendBoost}Day ${streak}! Early momentum is building. Keep the streak alive.`
  }

  // Goal-specific motivation
  if (goalWhy && timeOfDay === 'morning') {
    const whyParts = goalWhy.split('.')[0] // Get first sentence
    return `Remember: ${whyParts}. Let that "why" fuel your today.`
  }

  // Status-based daily motivation
  if (status === 'ALIGNED' && context.hasCheckedIn) {
    return `${weekendBoost}Aligned and active. Today builds on yesterday's momentum.`
  }

  if (status === 'DRIFTING' && context.hasCheckedIn) {
    return `${weekendBoost}Recovery mode. Today is your opportunity to realign.`
  }

  // Time-of-day specific motivation
  if (timeOfDay === 'morning') {
    return 'Morning intention sets the day. What will you commit to today?'
  }
  if (timeOfDay === 'afternoon') {
    return 'Afternoon check-in: How are you aligning with your goal today?'
  }
  if (timeOfDay === 'evening') {
    return 'Evening reflection: Did today move you closer to who you want to become?'
  }

  return 'Each day is a chance to reinforce who you\'re becoming.'
}

/**
 * Generate blocker-specific support message
 */
export function generateBlockerSupport(blocker: string, goalTitle?: string): string {
  const blockerLower = blocker.toLowerCase()
  
  if (blockerLower.includes('time') || blockerLower.includes('busy')) {
    return 'Time is made, not found. Tomorrow, protect 15 minutes for your goal.'
  }
  if (blockerLower.includes('energy') || blockerLower.includes('tired')) {
    return 'Low energy days are normal. Scale down, but still show up.'
  }
  if (blockerLower.includes('motivation') || blockerLower.includes('feel')) {
    return 'Motivation is unreliable. Discipline is reliable. Tomorrow, show up anyway.'
  }
  if (blockerLower.includes('forgot') || blockerLower.includes('remember')) {
    return 'Set a reminder. Make it visible. Your future self will thank you.'
  }
  if (blockerLower.includes('hard') || blockerLower.includes('difficult')) {
    return 'It\'s hard because it matters. Hard things build strong people.'
  }

  // Default blocker response
  return `"${blocker}" was today's challenge. Tomorrow, you adapt and overcome.`
}

/**
 * Generate recovery/comeback message after missed day(s)
 */
export function generateRecoveryMessage(
  daysMissed: number,
  previousStreak: number,
  goalTitle?: string
): string {
  if (daysMissed === 1) {
    return previousStreak >= 7
      ? `One day missed after a ${previousStreak}-day streak. That's okay. Comeback starts now.`
      : 'One missed day. Reset and return. Your consistency story continues today.'
  }

  if (daysMissed <= 3) {
    return `${daysMissed} days off. No judgment. What matters is today's action.`
  }

  return `Back after ${daysMissed} days. The best time to restart was yesterday. The second best time is now.`
}

/**
 * Generate completion celebration message
 */
export function generateCompletionMessage(
  goalTitle: string,
  goalWhy: string,
  totalDays: number,
  completionRate: number
): string {
  const percentage = Math.round(completionRate * 100)
  
  const messages = [
    `🎉 "${goalTitle}" COMPLETE! ${totalDays} days of showing up.`,
    `✅ Resolution complete! ${percentage}% completion rate. You did it.`,
    goalWhy ? `You completed "${goalTitle}" because ${goalWhy.split('.')[0]}. Mission accomplished.` :
    `"${goalTitle}" - ${totalDays} days. The journey is complete.`,
    percentage >= 80 ? `Excellent completion rate (${percentage}%). You stayed consistent.` :
    `Completion rate: ${percentage}%. Every day counted.`,
  ]
  
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Main AI motivation generator - context-aware, intelligent message selection
 */
export function generateMotivationMessage(
  context: MotivationContext,
  type: 'identity' | 'daily' | 'checkin' | 'blocker' | 'recovery' | 'completion' = 'identity'
): string {
  // Enrich context with time/date
  const enrichedContext: MotivationContext = {
    ...context,
    timeOfDay: context.timeOfDay || getTimeOfDay(),
    dayOfWeek: context.dayOfWeek || getDayOfWeek(),
  }

  switch (type) {
    case 'identity':
      return generateIdentityMessage(enrichedContext)
    case 'daily':
      return generateDailyMotivation(enrichedContext)
    case 'checkin':
      return generateCheckinMotivation(
        context.lastExecution || 'yes',
        context.streak,
        context.goalTitle,
        context.energy
      )
    case 'blocker':
      return context.blocker 
        ? generateBlockerSupport(context.blocker, context.goalTitle)
        : 'No blocker today. Keep the momentum going!'
    case 'recovery':
      return generateRecoveryMessage(
        context.streak === 0 ? 1 : 0, // Approximate days missed
        context.streak,
        context.goalTitle
      )
    case 'completion':
      if (!context.goalTitle) return 'Resolution complete! Well done!'
      // Calculate completion rate (would need full context from DB)
      return generateCompletionMessage(
        context.goalTitle,
        context.goalWhy || '',
        context.totalDays,
        0.85 // Would be calculated from actual data
      )
    default:
      return generateIdentityMessage(enrichedContext)
  }
}

/**
 * Convert TodayStatus to MotivationContext
 */
export function statusToMotivationContext(
  todayStatus: TodayStatus | null,
  goal: Resolution | null,
  recentCheckins: Checkin[] = []
): MotivationContext {
  if (!todayStatus) {
    return {
      status: 'NONE',
      hasCheckedIn: false,
      streak: 0,
      totalDays: 0,
      goalTitle: goal?.title,
      goalWhy: goal?.why,
      recentCheckins,
    }
  }

  return {
    status: todayStatus.status,
    hasCheckedIn: todayStatus.hasCheckedIn,
    lastExecution: todayStatus.lastCheckin?.execution,
    streak: todayStatus.streak,
    totalDays: todayStatus.streak + 7, // Approximate
    goalTitle: goal?.title,
    goalWhy: goal?.why,
    energy: todayStatus.lastCheckin?.energy || null,
    blocker: todayStatus.lastCheckin?.blocker || null,
    recentCheckins,
  }
}
