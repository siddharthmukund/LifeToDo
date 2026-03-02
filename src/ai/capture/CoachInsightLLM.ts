// LLM-powered coach insight (extends the existing local CoachBrain.ts)
import { callAIProxy } from '../aiProxy';
import { buildCoachInsightPrompt } from '../prompts/coachInsight';

export interface LLMCoachInsight {
  message: string;
  cachedAt: number;
  inboxHash: string;
}

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
let cache: LLMCoachInsight | null = null;

function hashInbox(inboxCount: number, staleCount: number, healthScore: number): string {
  return `${inboxCount}-${staleCount}-${healthScore}`;
}

export async function getLLMCoachInsight(
  inboxCount: number,
  staleCount: number,
  healthScore: number,
  daysToNextReview: number,
  userRole?: string,
): Promise<string> {
  const hash = hashInbox(inboxCount, staleCount, healthScore);
  const now = Date.now();

  // Return cache if fresh and inbox state unchanged
  if (cache && cache.inboxHash === hash && now - cache.cachedAt < CACHE_DURATION_MS) {
    return cache.message;
  }

  const response = await callAIProxy({
    feature: 'coach_insight',
    systemPrompt: buildCoachInsightPrompt(inboxCount, staleCount, healthScore, daysToNextReview, userRole),
    userMessage: 'Generate insight.',
    temperature: 0.6,
    maxTokens: 64,
  });

  const message = response.content.trim().replace(/^["']|["']$/g, '');
  cache = { message, cachedAt: now, inboxHash: hash };
  return message;
}
