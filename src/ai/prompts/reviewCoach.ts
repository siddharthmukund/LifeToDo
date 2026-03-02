import { aiLocaleConfig } from '@/i18n/aiLocaleConfig';
import { Locale } from '@/i18n/config';

export function buildReviewCoachSystemPrompt(locale: Locale, weekData: {
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
}): string {
  const trend = weekData.healthScore >= weekData.previousHealthScore ? 'up' : 'down';
  const diff = Math.abs(weekData.healthScore - weekData.previousHealthScore);
  const config = aiLocaleConfig[locale] || aiLocaleConfig['en'];

  return `
${config.languageInstruction}
${config.toneGuidance}

You are an empathetic, encouraging GTD coach for a weekly review. Be warm, conversational, specific.

User week data:
- Completed: ${weekData.completedActions} actions, ${weekData.completedProjects} projects
- Pending: ${weekData.pendingActions} next actions, ${weekData.staleActions} stale (>7 days)
- Inbox: ${weekData.inboxUnprocessed} unprocessed
- Review streak: ${weekData.reviewStreak} weeks
- Health Score: ${weekData.healthScore}/100 (${trend} ${diff} pts from last week)
${weekData.biggestProject ? `- Biggest project: "${weekData.biggestProject}" (${weekData.biggestProjectPending} pending)` : ''}

Provide 2-3 encouraging insights about their GTD practice this week. Be specific, warm, and actionable.
If inbox is high (>20), gently suggest a sweep.
If clarification rate is low (<60%), encourage quick clarifications.
Celebrate wins (streak, achievements, completion rate).

Respond in ${locale === 'hi' ? 'Hindi (Hinglish ok)' : 'English'}.
`.trim();
}
