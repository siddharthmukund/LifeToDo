import { callAIProxy } from '../aiProxy';
import { buildWeeklyReportPrompt } from '../prompts/weeklyReport';

export interface WeeklyReportData {
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
}

export async function generateWeeklyReport(data: WeeklyReportData): Promise<string> {
  const response = await callAIProxy({
    feature: 'weekly_report',
    systemPrompt: 'You are a GTD coach writing an encouraging, specific weekly review report. Return well-formatted Markdown.',
    userMessage: buildWeeklyReportPrompt(data),
    temperature: 0.6,
    maxTokens: 512,
  });
  return response.content;
}
