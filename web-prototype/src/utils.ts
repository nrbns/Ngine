import { Resolution, ResolutionStatus, CheckIn } from './types';

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

export function getCheckInForDate(resolution: Resolution, date: string): CheckIn | null {
  return resolution.checkIns.find(ci => ci.date === date) || null;
}

export function calculateStatus(resolution: Resolution): ResolutionStatus {
  const weekDates = getCurrentWeekDates();
  const today = getTodayDate();
  
  // Count completed days this week (up to today)
  const completedDays = weekDates
    .filter(date => date <= today)
    .filter(date => {
      const checkIn = getCheckInForDate(resolution, date);
      return checkIn && checkIn.status === 'done';
    }).length;
  
  // Calculate how many days we've had so far this week
  const daysSoFar = weekDates.filter(date => date <= today).length;
  
  // Calculate required days based on MDD (proportional to week progress)
  const requiredDays = Math.ceil((resolution.mdd / 7) * daysSoFar);
  
  // If we're behind, we're off-track
  if (completedDays < requiredDays) {
    return 'off-track';
  }
  
  return 'on-track';
}

export function getStatusColor(status: ResolutionStatus): string {
  return status === 'on-track' ? '#10b981' : '#ef4444';
}

export function getStatusLabel(status: ResolutionStatus): string {
  return status === 'on-track' ? 'On Track' : 'Off Track';
}

