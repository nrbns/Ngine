// AI Integration - Controlled and safe
export async function getAIInsight(data: any): Promise<string> {
  const openaiKey = process.env.EXPO_PUBLIC_OPENAI_KEY;
  
  if (!openaiKey) {
    return 'AI insights not configured. Check your environment variables.';
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an execution coach. Be brief, honest, and actionable. One reason, one action. Max 80 words.',
          },
          {
            role: 'user',
            content: JSON.stringify(data),
          },
        ],
        max_tokens: 80,
        temperature: 0.7,
      }),
    });

    const result = await res.json();
    return result.choices[0]?.message?.content || 'Unable to generate insight.';
  } catch (error: any) {
    console.error('AI Error:', error);
    return 'AI service temporarily unavailable.';
  }
}

// Trigger AI ONLY if status is drifting or broken
export function shouldTriggerAI(status: string): boolean {
  return status === 'drifting' || status === 'broken';
}

