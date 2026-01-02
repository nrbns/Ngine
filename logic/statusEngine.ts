// Rules Engine - NO AI, just logic
// This is reliable and fast

export type Status = 'aligned' | 'drifting' | 'broken' | 'recovering';

export interface CheckIn {
  id: string;
  resolution_id: string;
  done: 'yes' | 'partial' | 'no';
  blocker?: string;
  energy: number;
  created_at: string;
}

export function getStatus(checkins: CheckIn[]): Status {
  if (checkins.length === 0) return 'aligned';

  // Get last 5 check-ins (most recent)
  const recent = checkins
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Broken: 3 misses in last 5 days
  const misses = recent.filter(c => c.done === 'no').length;
  if (misses >= 3) return 'broken';

  // Drifting: 2 consecutive fails OR low energy for 2 days
  if (recent.length >= 2) {
    const lastTwo = recent.slice(0, 2);
    const consecutiveFails = lastTwo.every(c => c.done !== 'yes');
    const lowEnergy = lastTwo.every(c => c.energy <= 2);
    
    if (consecutiveFails || lowEnergy) return 'drifting';
  }

  return 'aligned';
}

// Calculate success probability (simple math)
export function calculateSuccessProbability(
  checkins: CheckIn[],
  totalDays: number,
  mddValue: number
): number {
  if (checkins.length === 0) return 100;

  const daysSoFar = Math.min(
    Math.ceil((Date.now() - new Date(checkins[checkins.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)),
    totalDays
  );

  const executedDays = checkins.filter(c => c.done === 'yes').length;
  const executionRate = executedDays / Math.max(1, daysSoFar);

  // Average energy factor
  const avgEnergy = checkins.reduce((sum, c) => sum + c.energy, 0) / checkins.length / 5;

  // Projected success
  const projectedExecuted = executionRate * totalDays;
  const requiredExecuted = (mddValue / 7) * totalDays;

  let probability = (projectedExecuted / requiredExecuted) * 100;
  probability = probability * avgEnergy;
  probability = Math.max(0, Math.min(100, Math.round(probability)));

  return probability;
}

