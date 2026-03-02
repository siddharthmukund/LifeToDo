import { callAIProxy } from '../aiProxy';
import { buildContentDrafterPrompt } from '../prompts/contentDrafter';
import { draftResultSchema } from '../schemas/draftResult';
import type { DraftResult } from '../schemas/draftResult';

export async function draftContent(taskTitle: string, userRole = 'professional'): Promise<DraftResult> {
  const response = await callAIProxy({
    feature: 'content_drafter',
    systemPrompt: buildContentDrafterPrompt(taskTitle, userRole),
    userMessage: `Generate a starter draft for: "${taskTitle}"`,
    schema: draftResultSchema,
    temperature: 0.7,
    maxTokens: 512,
  });
  return response.parsed as DraftResult;
}
