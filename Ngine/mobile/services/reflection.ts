// Daily Reflection Insight
// One short truth per day (AI or rules-based)
import { supabase } from './supabase';
import { getAIInsight } from './ai';
import { ResolutionData, calculateIntegrityScore } from '../logic/integrity';

export async function getDailyReflection(userId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  // Check if reflection already exists for today
  const { data: existing } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (existing && existing.insight_text) {
    return existing.insight_text;
  }

  // Generate new reflection
  const { data: resolutions } = await supabase
    .from('resolutions')
    .select('*, checkins(*)')
    .eq('user_id', userId)
    .gte('end_date', today);

  if (!resolutions || resolutions.length === 0) {
    return 'Start your first resolution to begin building execution integrity.';
  }

  // Calculate integrity score
  const resolutionData = resolutions.map(r => ({
    id: r.id,
    status: r.status,
    checkins: r.checkins || [],
    mdd_value: parseInt(r.mdd) || 5,
    duration: r.duration,
    start_date: r.start_date,
  }));

  const integrityScore = calculateIntegrityScore(resolutionData);

  // Generate insight (AI or rules-based)
  let insight = '';

  try {
    // Try AI first (if configured)
    if (process.env.EXPO_PUBLIC_OPENAI_KEY) {
      insight = await getAIInsight({
        type: 'reflection',
        integrity_score: integrityScore,
        active_resolutions: resolutions.length,
        recent_performance: resolutionData.slice(0, 3),
      });
    } else {
      // Rules-based reflection
      insight = generateRulesBasedReflection(integrityScore, resolutions.length);
    }
  } catch (error) {
    // Fallback to rules-based
    insight = generateRulesBasedReflection(integrityScore, resolutions.length);
  }

  // Save reflection
  await supabase
    .from('daily_reflections')
    .insert({
      user_id: userId,
      date: today,
      insight_text: insight,
      integrity_score: integrityScore,
    });

  return insight;
}

function generateRulesBasedReflection(score: number, resolutionCount: number): string {
  if (score >= 80) {
    return `You're maintaining strong execution integrity. ${resolutionCount} active resolution${resolutionCount > 1 ? 's' : ''} on track. Keep going.`;
  }
  if (score >= 60) {
    return `Good progress. You're executing well on most fronts. Small adjustments can improve your integrity score.`;
  }
  if (score >= 40) {
    return `Your execution needs attention. Focus on consistency over perfection. Recovery mode can help reset.`;
  }
  return `Low integrity detected. Consider reducing active resolutions or adjusting your MDD. Small wins matter.`;
}

