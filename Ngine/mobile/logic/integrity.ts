// Execution Integrity Meter
// Calculates overall alignment score (0-100)
import { CheckIn } from './statusEngine';

export interface ResolutionData {
  id: string;
  status: string;
  checkins: CheckIn[];
  mdd_value: number;
  duration: number;
  start_date: string;
}

export function calculateIntegrityScore(resolutions: ResolutionData[]): number {
  if (resolutions.length === 0) return 100;

  let totalScore = 0;
  let resolutionCount = 0;

  resolutions.forEach((resolution) => {
    if (resolution.checkins.length === 0) {
      totalScore += 100; // New resolution, full score
      resolutionCount++;
      return;
    }

    // Calculate execution rate
    const executedDays = resolution.checkins.filter(c => c.done === 'yes').length;
    const totalDays = resolution.checkins.length;
    const executionRate = executedDays / totalDays;

    // Calculate MDD compliance
    const daysSoFar = totalDays;
    const requiredDays = Math.ceil((resolution.mdd_value / 7) * daysSoFar);
    const mddCompliance = Math.min(1, executedDays / Math.max(1, requiredDays));

    // Status factor
    const statusFactors = {
      aligned: 1.0,
      drifting: 0.7,
      broken: 0.4,
      recovering: 0.8,
    };
    const statusFactor = statusFactors[resolution.status as keyof typeof statusFactors] || 0.5;

    // Energy factor
    const avgEnergy = resolution.checkins.reduce((sum, c) => sum + c.energy, 0) / resolution.checkins.length / 5;

    // Calculate resolution score
    const resolutionScore = (executionRate * 0.4 + mddCompliance * 0.4 + statusFactor * 0.2) * avgEnergy * 100;
    totalScore += Math.max(0, Math.min(100, resolutionScore));
    resolutionCount++;
  });

  return Math.round(totalScore / Math.max(1, resolutionCount));
}

export function getIntegrityLabel(score: number): string {
  if (score >= 80) return 'Strong Integrity';
  if (score >= 60) return 'Good Integrity';
  if (score >= 40) return 'Needs Attention';
  return 'Low Integrity';
}

export function getIntegrityColor(score: number): string {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#f59e0b'; // Amber
  if (score >= 40) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

