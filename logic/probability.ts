// Success probability calculations
import { CheckIn } from './statusEngine';

export function getSuccessProbability(
  checkins: CheckIn[],
  totalDays: number,
  mddValue: number
): number {
  if (checkins.length === 0) return 100;

  const executedDays = checkins.filter(c => c.done === 'yes').length;
  const daysSoFar = checkins.length;
  const executionRate = executedDays / Math.max(1, daysSoFar);

  // Energy factor
  const avgEnergy = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + c.energy, 0) / checkins.length / 5
    : 1;

  // Consistency factor (recent performance)
  const recent = checkins.slice(-7);
  const recentRate = recent.length > 0
    ? recent.filter(c => c.done === 'yes').length / recent.length
    : 1;

  // Projected
  const projectedExecuted = executionRate * totalDays;
  const requiredExecuted = (mddValue / 7) * totalDays;

  let probability = (projectedExecuted / requiredExecuted) * 100;
  probability = probability * avgEnergy * recentRate;
  probability = Math.max(0, Math.min(100, Math.round(probability)));

  return probability;
}

