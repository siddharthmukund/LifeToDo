import { callAIProxyStream } from '../aiProxy';
import { buildReviewCoachSystemPrompt } from '../prompts/reviewCoach';
import type { Locale } from '@/i18n/config';

export interface ReviewWeekData {
  completedActions: number;
  completedProjects: number;
  pendingActions: number;
  staleActions: number;
  inboxUnprocessed: number;
  reviewStreak: number;
  healthScore: number;
  previousHealthScore: number;
  biggestProject?: string;
  biggestProjectPending?: number;
}

export interface ConversationMessage {
  role: 'coach' | 'user';
  content: string;
  timestamp: number;
}

export async function* streamReviewCoachResponse(
  locale: Locale,
  weekData: ReviewWeekData,
  conversationHistory: ConversationMessage[],
  userMessage: string,
): AsyncGenerator<string> {
  const history = conversationHistory
    .map((m) => `${m.role === 'coach' ? 'Coach' : 'User'}: ${m.content}`)
    .join('\n');

  const userMessageWithHistory = history
    ? `Previous conversation:\n${history}\n\nUser: ${userMessage}`
    : `User: ${userMessage}`;

  for await (const chunk of callAIProxyStream({
    feature: 'review_coach',
    systemPrompt: buildReviewCoachSystemPrompt(locale, weekData),
    userMessage: userMessageWithHistory,
    stream: true,
    temperature: 0.7,
    maxTokens: 256,
  })) {
    if (chunk.delta) yield chunk.delta;
    if (chunk.done) break;
  }
}
