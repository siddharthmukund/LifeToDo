export function buildWeeklyReportPrompt(weekData: {
  weekRange: string;
  completedActions: number;
  previousWeekCompleted: number;
  completedProjects: string[];
  capturedItems: number;
  clarifiedItems: number;
  pendingActions: number;
  staleActions: number;
  healthScore: number;
  previousHealthScore: number;
  reviewStreak: number;
  inboxZeroCount: number;
}): string {
  const pct = weekData.previousWeekCompleted > 0
    ? Math.round(((weekData.completedActions - weekData.previousWeekCompleted) / weekData.previousWeekCompleted) * 100)
    : 0;
  const trend = pct >= 0 ? `up ${pct}%` : `down ${Math.abs(pct)}%`;
  return `Generate an encouraging, specific weekly GTD review report.

Week: ${weekData.weekRange}
Completed: ${weekData.completedActions} actions (${trend} from last week)
Projects completed: ${weekData.completedProjects.join(', ') || 'none'}
Captured: ${weekData.capturedItems}, clarified: ${weekData.clarifiedItems}
Pending: ${weekData.pendingActions} actions, ${weekData.staleActions} stale
Health Score: ${weekData.healthScore}/100 (was ${weekData.previousHealthScore})
Review streak: ${weekData.reviewStreak} weeks
Inbox zero: ${weekData.inboxZeroCount} times this week

Write a brief report with:
1. Headline summary (1 sentence, positive framing)
2. Key wins (2-3 bullets, specific)
3. One actionable tip for next week (specific to their data)
4. Motivational closer referencing their streak

Tone: warm, specific, forward-looking. Never preachy. Max 150 words. Markdown format.`;
}
